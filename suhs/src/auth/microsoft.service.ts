import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, createHmac, randomBytes, randomUUID } from 'node:crypto';
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
import { AuthService } from './auth.service.js';

const guid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const keys = createRemoteJWKSet(new URL('https://login.microsoftonline.com/common/discovery/v2.0/keys'));
type State = { state: string; nonce: string; verifier: string };

export async function verifyMicrosoftIdentity(token: string, clientId: string, tenant: string, nonce: string, key: JWTVerifyGetKey = keys) {
  const { payload } = await jwtVerify(token, key, {
    audience: clientId, issuer: `https://login.microsoftonline.com/${tenant}/v2.0`, algorithms: ['RS256'],
    requiredClaims: ['exp', 'iat', 'sub', 'oid', 'tid', 'nonce'],
  });
  if (typeof payload.tid !== 'string' || payload.tid.toLowerCase() !== tenant.toLowerCase() ||
      typeof payload.oid !== 'string' || !guid.test(payload.oid) || payload.nonce !== nonce) {
    throw new UnauthorizedException('Invalid Microsoft identity');
  }
  const email = payload.email ?? payload.preferred_username;
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new UnauthorizedException('Microsoft did not provide an email address');
  }
  return { id: `${tenant.toLowerCase()}:${payload.oid.toLowerCase()}`, email,
    name: typeof payload.name === 'string' && payload.name.trim() ? payload.name.trim() : email };
}

@Injectable()
export class MicrosoftService {
  private readonly jwt = new JwtService();
  private readonly consumed = new Map<string, number>();
  constructor(private readonly config: ConfigService, private readonly auth: AuthService) {}

  origin() {
    const url = new URL(this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3001');
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) {
      throw new ServiceUnavailableException('FRONTEND_URL must use HTTPS outside localhost');
    }
    return url.origin;
  }
  cookieOptions() {
    return { httpOnly: true, secure: this.origin().startsWith('https:'), sameSite: 'lax' as const,
      path: '/api/auth/microsoft', maxAge: 10 * 60 * 1000 };
  }
  private settings() {
    const clientId = this.config.get<string>('MICROSOFT_CLIENT_ID')?.trim();
    const clientSecret = this.config.get<string>('MICROSOFT_CLIENT_SECRET')?.trim();
    const tenant = this.config.get<string>('MICROSOFT_TENANT_ID')?.trim().toLowerCase();
    if (!clientId || !guid.test(clientId) || !clientSecret || !tenant || !guid.test(tenant)) {
      throw new ServiceUnavailableException('Microsoft sign-in is not configured');
    }
    return { clientId, clientSecret, tenant, redirectUri: `${this.origin()}/api/auth/microsoft/callback` };
  }
  private signingKey(purpose: string) {
    // OAuth cookies cannot be used as application JWTs or as another cookie type.
    return createHmac('sha256', this.config.getOrThrow<string>('JWT_SECRET')).update(`microsoft:${purpose}`).digest('hex');
  }
  async start() {
    const settings = this.settings();
    const state = randomBytes(32).toString('base64url');
    const nonce = randomBytes(32).toString('base64url');
    const verifier = randomBytes(48).toString('base64url');
    const cookie = await this.jwt.signAsync({ state, nonce, verifier }, {
      secret: this.signingKey('state'), audience: 'microsoft-state', expiresIn: '10m',
    });
    const url = new URL(`https://login.microsoftonline.com/${settings.tenant}/oauth2/v2.0/authorize`);
    url.search = new URLSearchParams({ client_id: settings.clientId, response_type: 'code',
      redirect_uri: settings.redirectUri, response_mode: 'query', scope: 'openid profile email', state, nonce,
      code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256' }).toString();
    return { url: url.toString(), cookie };
  }
  async validateState(cookie: string | undefined, state: unknown): Promise<State> {
    if (!cookie || typeof state !== 'string') throw new UnauthorizedException('Invalid sign-in state');
    const saved = await this.jwt.verifyAsync<State>(cookie, {
      secret: this.signingKey('state'), audience: 'microsoft-state', algorithms: ['HS256'],
    });
    if (saved.state !== state || typeof saved.nonce !== 'string' || typeof saved.verifier !== 'string') {
      throw new UnauthorizedException('Invalid sign-in state');
    }
    return saved;
  }
  async finish(code: string, state: State) {
    const settings = this.settings();
    const response = await fetch(`https://login.microsoftonline.com/${settings.tenant}/oauth2/v2.0/token`, {
      method: 'POST', signal: AbortSignal.timeout(15000),
      body: new URLSearchParams({ client_id: settings.clientId, client_secret: settings.clientSecret,
        grant_type: 'authorization_code', code, redirect_uri: settings.redirectUri, code_verifier: state.verifier }),
    });
    const tokens = await response.json() as { id_token?: string };
    if (!response.ok || !tokens.id_token) throw new UnauthorizedException('Microsoft token exchange failed');
    const identity = await verifyMicrosoftIdentity(tokens.id_token, settings.clientId, settings.tenant, state.nonce);
    const user = await this.auth.microsoftLogin(identity);
    return this.jwt.signAsync({ sub: user.id, tokenVersion: user.tokenVersion }, {
      secret: this.signingKey('session'), audience: 'microsoft-session', jwtid: randomUUID(), expiresIn: '1m',
    });
  }
  async session(cookie: string | undefined) {
    if (!cookie) throw new UnauthorizedException('Microsoft session expired');
    const ticket = await this.jwt.verifyAsync<{ sub: number; tokenVersion: number; jti: string; exp: number }>(cookie, {
      secret: this.signingKey('session'), audience: 'microsoft-session', algorithms: ['HS256'],
    });
    for (const [id, expires] of this.consumed) if (expires <= Date.now()) this.consumed.delete(id);
    if (!ticket.jti || this.consumed.has(ticket.jti)) throw new UnauthorizedException('Session already used');
    this.consumed.set(ticket.jti, ticket.exp * 1000);
    return this.auth.microsoftSession(ticket.sub, ticket.tokenVersion);
  }
}

import 'reflect-metadata';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHmac } from 'node:crypto';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import { MicrosoftService, verifyMicrosoftIdentity } from './microsoft.service.js';
import { AuthService } from './auth.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

const tenant = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const oid = '11111111-2222-3333-4444-555555555555';
const clientId = '99999999-2222-3333-4444-555555555555';
const secret = 'test-only-secret';
const identity = { tid: tenant, oid, nonce: 'nonce', email: 'student@school.edu', name: 'Student' };
const settings = { JWT_SECRET: secret, MICROSOFT_TENANT_ID: tenant, MICROSOFT_CLIENT_ID: clientId, MICROSOFT_CLIENT_SECRET: 'test-secret' };

describe('Microsoft signed identity validation', () => {
  let pair: Awaited<ReturnType<typeof generateKeyPair>>;
  let keys: ReturnType<typeof createLocalJWKSet>;
  beforeAll(async () => {
    pair = await generateKeyPair('RS256');
    keys = createLocalJWKSet({ keys: [{ ...await exportJWK(pair.publicKey), kid: 'test', alg: 'RS256' }] });
  });
  async function token(claims: Record<string, unknown> = {}, audience = clientId, expiry = '5m') {
    return new SignJWT({ ...identity, ...claims }).setProtectedHeader({ alg: 'RS256', kid: 'test' })
      .setSubject('subject').setIssuer(`https://login.microsoftonline.com/${tenant}/v2.0`)
      .setAudience(audience).setIssuedAt().setExpirationTime(expiry).sign(pair.privateKey);
  }
  it('accepts a correctly signed identity using immutable tenant and object IDs', async () => {
    expect(await verifyMicrosoftIdentity(await token(), clientId, tenant, 'nonce', keys))
      .toMatchObject({ id: `${tenant}:${oid}`, email: identity.email });
  });
  it.each([{ nonce: 'wrong' }, { tid: oid }, { oid: 'invalid' }])('rejects invalid identity claims %j', async (changed) => {
    await expect(verifyMicrosoftIdentity(await token(changed), clientId, tenant, 'nonce', keys)).rejects.toThrow();
  });
  it('rejects wrong audience, expired token, wrong issuer, and modified signature', async () => {
    for (const invalid of [await token({}, oid), await token({}, clientId, '-1s'), `${await token()}x`]) {
      await expect(verifyMicrosoftIdentity(invalid, clientId, tenant, 'nonce', keys)).rejects.toThrow();
    }
    await expect(verifyMicrosoftIdentity(await token(), clientId, oid, 'nonce', keys)).rejects.toThrow();
  });
});

describe('Microsoft OAuth cookie protections', () => {
  const service = new MicrosoftService(new ConfigService(settings), {} as AuthService);
  it('uses PKCE, a signed state cookie, and the exact Web callback', async () => {
    const start = await service.start();
    const url = new URL(start.url);
    expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:3001/api/auth/microsoft/callback');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('client_secret')).toBeNull();
    expect((await service.validateState(start.cookie, url.searchParams.get('state'))).nonce).toBe(url.searchParams.get('nonce'));
    await expect(service.validateState(start.cookie, 'wrong')).rejects.toThrow();
    await expect(service.validateState(undefined, 'wrong')).rejects.toThrow();
    await expect(service.validateState(`${start.cookie}x`, url.searchParams.get('state'))).rejects.toThrow();
  });
  it('does not accept OAuth cookies as app JWTs or session tickets', async () => {
    const start = await service.start();
    await expect(new JwtService({ secret }).verifyAsync(start.cookie)).rejects.toThrow();
    await expect(service.session(start.cookie)).rejects.toThrow();
  });
  it('consumes the handoff once and checks the current token version', async () => {
    const auth = { microsoftSession: vi.fn().mockResolvedValue({ accessToken: 'app-token' }) };
    const test = new MicrosoftService(new ConfigService(settings), auth as unknown as AuthService);
    const ticket = await new JwtService().signAsync({ sub: 42, tokenVersion: 3 }, {
      secret: createHmac('sha256', secret).update('microsoft:session').digest('hex'),
      audience: 'microsoft-session', jwtid: 'one-time-ticket', expiresIn: '1m',
    });
    await expect(test.session(ticket)).resolves.toEqual({ accessToken: 'app-token' });
    expect(auth.microsoftSession).toHaveBeenCalledWith(42, 3);
    await expect(test.session(ticket)).rejects.toThrow('already used');
  });
  it('rejects missing or non-specific tenant configuration', async () => {
    await expect(new MicrosoftService(new ConfigService({ ...settings, MICROSOFT_TENANT_ID: 'common' }), {} as AuthService).start()).rejects.toThrow('not configured');
  });
});

describe('Microsoft account provisioning', () => {
  it('does not link a password account using email', async () => {
    const create = vi.fn();
    const db = { user: { findUnique: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 1 }), create } };
    const auth = new AuthService(db as unknown as PrismaService, new JwtService());
    await expect(auth.microsoftLogin({ id: `${tenant}:${oid}`, email: identity.email, name: 'Student' })).rejects.toThrow('Use your password');
    expect(create).not.toHaveBeenCalled();
  });
  it('provisions new accounts as STUDENT without a known password', async () => {
    const create = vi.fn().mockImplementation(async ({ data }) => ({ ...data, id: 42, tokenVersion: 0 }));
    const db = { user: { findUnique: vi.fn().mockResolvedValue(null), create } };
    const auth = new AuthService(db as unknown as PrismaService, new JwtService());
    const user = await auth.microsoftLogin({ id: `${tenant}:${oid}`, email: 'Student@school.edu', name: 'Student' });
    expect(user.role).toBe('STUDENT');
    expect(user.email).toBe('student@school.edu');
    expect(user.passwordHash).toMatch(/^\$2[aby]\$/);
  });
  it('preserves an existing Microsoft user and their role', async () => {
    const user = { id: 1, role: 'TEACHER', tokenVersion: 0 };
    const db = { user: { findUnique: vi.fn().mockResolvedValue(user) } };
    const auth = new AuthService(db as unknown as PrismaService, new JwtService());
    expect(await auth.microsoftLogin({ id: `${tenant}:${oid}`, email: identity.email, name: 'Student' })).toBe(user);
  });
  it('rejects a session handoff invalidated by logout', async () => {
    const db = { user: { findUnique: vi.fn().mockResolvedValue({ id: 1, tokenVersion: 2 }) } };
    const auth = new AuthService(db as unknown as PrismaService, new JwtService());
    await expect(auth.microsoftSession(1, 1)).rejects.toThrow('expired');
  });
});

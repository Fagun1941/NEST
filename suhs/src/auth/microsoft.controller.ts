import { ConflictException, Controller, Get, Post, Req, Res, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { MicrosoftService } from './microsoft.service.js';

function cookie(req: Request, name: string) {
  return req.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
}

@Controller('auth/microsoft')
export class MicrosoftController {
  constructor(private readonly microsoft: MicrosoftService) {}

  @Get()
  async start(@Res() res: Response) {
    res.setHeader('Cache-Control', 'no-store');
    try {
      const result = await this.microsoft.start();
      res.cookie('ms_state', result.cookie, this.microsoft.cookieOptions());
      res.redirect(result.url);
    } catch (error) {
      const reason = error instanceof ServiceUnavailableException ? 'not-configured' : 'failed';
      res.redirect(`${this.microsoft.origin()}/auth/login?microsoft=${reason}`);
    }
  }
  @Get('callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.clearCookie('ms_state', this.microsoft.cookieOptions());
    try {
      const state = await this.microsoft.validateState(cookie(req, 'ms_state'), req.query.state);
      if (req.query.error || typeof req.query.code !== 'string') {
        res.redirect(`${this.microsoft.origin()}/auth/login?microsoft=cancelled`); return;
      }
      const ticket = await this.microsoft.finish(req.query.code, state);
      res.cookie('ms_session', ticket, { ...this.microsoft.cookieOptions(), maxAge: 60000 });
      res.redirect(`${this.microsoft.origin()}/auth/microsoft`);
    } catch (error) {
      const reason = error instanceof ConflictException ? 'account-exists' : 'failed';
      res.redirect(`${this.microsoft.origin()}/auth/login?microsoft=${reason}`);
    }
  }
  @Post('session')
  async session(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (req.headers.origin !== this.microsoft.origin()) throw new UnauthorizedException('Invalid origin');
    res.setHeader('Cache-Control', 'no-store');
    res.clearCookie('ms_session', this.microsoft.cookieOptions());
    return this.microsoft.session(cookie(req, 'ms_session'));
  }
}

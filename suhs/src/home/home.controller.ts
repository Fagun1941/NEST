
import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

type AuthenticatedRequest = Request & {
  user: {
    id: number;
    name: string;
    email: string;
  };
};

@Controller('home')
export class HomeController {
  @UseGuards(JwtAuthGuard)
  @Get()
  getHome(@Req() req: AuthenticatedRequest) {
    return {
      message: `Welcome to Home, ${req.user.name}!`,
      user: req.user,
    };
  }
}
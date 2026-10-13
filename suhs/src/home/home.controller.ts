import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

type AuthenticatedRequest = Request & {
  user: {
    id: number;
    name: string;
    email: string;
    role: Role;
  };
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('home')
export class HomeController {
  // Accessible to all authenticated users (default)
  @Get()
  getHome(@Req() req: AuthenticatedRequest) {
    return {
      message: `Welcome to Home, ${req.user.name}!`,
      user: req.user,
    };
  }

  // Accessible only to ADMIN
  @Get('admin')
  @Roles(Role.ADMIN)
  getAdminArea(@Req() req: AuthenticatedRequest) {
    return {
      message: `Welcome to the Admin Portal, ${req.user.name}!`,
      user: req.user,
    };
  }

  // Accessible to TEACHER and ADMIN
  @Get('teacher')
  @Roles(Role.TEACHER, Role.ADMIN)
  getTeacherArea(@Req() req: AuthenticatedRequest) {
    return {
      message: `Welcome to the Teacher Lounge, ${req.user.name}!`,
      user: req.user,
    };
  }

  // Accessible to STUDENT (and TEACHER / ADMIN)
  @Get('student')
  @Roles(Role.STUDENT, Role.TEACHER, Role.ADMIN)
  getStudentArea(@Req() req: AuthenticatedRequest) {
    return {
      message: `Welcome to the Student Dashboard, ${req.user.name}!`,
      user: req.user,
    };
  }
}

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import { Role, type User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name.trim(),
          email,
          passwordHash,
          className: dto.className.trim(),
          rollNumber: dto.rollNumber.trim(),
          division: dto.division.trim(),
          studentGroup: dto.studentGroup.trim(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      return {
        message: 'Registration successful',
        user,
      };
    } catch (error: unknown) {
      // Handle a concurrent registration using the same email.
      const prismaError = error as { code?: string };
      if (prismaError.code === 'P2002') {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (
      !user ||
      !(await bcrypt.compare(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createSession(user);
  }

  async microsoftLogin(identity: { id: string; email: string; name: string }) {
    const existing = await this.prisma.user.findUnique({ where: { microsoftId: identity.id } });
    if (existing) return existing;
    const email = identity.email.trim().toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new ConflictException('An account with this email exists. Use your password to sign in.');
    }
    try {
      return await this.prisma.user.create({ data: {
        microsoftId: identity.id, email, name: identity.name, role: Role.STUDENT,
        passwordHash: await bcrypt.hash(randomBytes(48).toString('base64url'), 12),
      } });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        const concurrent = await this.prisma.user.findUnique({ where: { microsoftId: identity.id } });
        if (concurrent) return concurrent;
        throw new ConflictException('An account with this email exists. Use your password to sign in.');
      }
      throw error;
    }
  }

  async microsoftSession(id: number, tokenVersion: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.tokenVersion !== tokenVersion) throw new UnauthorizedException('Session expired. Please sign in again.');
    return this.createSession(user);
  }

  private async createSession(user: User) {
    const payload = {
      sub: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',
      accessToken,
      tokenType: 'Bearer',
      expiresIn: '1h',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        tokenVersion: { increment: 1 },
      },
    });

    return {
      message: 'Logout successful',
    };
  }
}

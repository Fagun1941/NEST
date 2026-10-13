import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role } from '@prisma/client';
import { UpdateRoleDto } from './dto/update-role.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findTeachers() {
    return this.prisma.user.findMany({
      where: { role: Role.TEACHER },
      select: { id: true, name: true, email: true, subject: true },
      orderBy: { name: 'asc' },
    });
  }

  async findStudents() {
    return this.prisma.user.findMany({
      where: { role: Role.STUDENT },
      select: {
        id: true,
        name: true,
        email: true,
        className: true,
        rollNumber: true,
        division: true,
        studentGroup: true,
      },
      orderBy: [{ className: 'asc' }, { rollNumber: 'asc' }, { name: 'asc' }],
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateRole(id: number, dto: UpdateRoleDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...dto,
        // Invalidate current JWT sessions so user logs in with refreshed claims
        tokenVersion: { increment: 1 },
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
      message: `School details for ${updatedUser.name} updated`,
      user: updatedUser,
    };
  }
}

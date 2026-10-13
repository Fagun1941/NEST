import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('teachers')
  findTeachers() {
    return this.usersService.findTeachers();
  }

  @Get('students')
  findStudents() {
    return this.usersService.findStudents();
  }

  // List all users (ADMIN only)
  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  // Get single user by ID (ADMIN only)
  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // Update a user's role (ADMIN only)
  @Patch(':id/role')
  @Roles(Role.ADMIN)
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.usersService.updateRole(id, dto);
  }
}

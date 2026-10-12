
import { Module } from '@nestjs/common';
import { HomeController } from './home.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [HomeController],
})
export class HomeModule {}
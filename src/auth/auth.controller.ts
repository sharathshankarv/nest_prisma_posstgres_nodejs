import {
  Controller,
  Post,
  Get,
  Body,
  UnauthorizedException,
  NotFoundException,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from './current-user.decorator';
import { Roles } from './roles.decorator';
import { RolesGuard } from './gaurds/auth.gaurds';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { email?: string; phone?: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.login(
      body.password,
      body?.email,
      body?.phone,
    );

    if (!user.success) {
      switch (user.error.code) {
        case 'INVALID_PASSWORD':
          throw new UnauthorizedException('Unauthorized');
        case 'USER_NOT_FOUND':
          throw new NotFoundException('User not found');
        case 'MISSING_CREDENTIALS':
        case 'MISSING_IDENTIFIER':
          throw new UnauthorizedException('Email or phone must be provided');
        default:
          throw new UnauthorizedException('Unauthorized');
      }
    }

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('auth_token', user.data?.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: 3600000, // 1 hour
    });

    return { success: true, message: 'Login successful' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@CurrentUser() user) {
    return user;
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('admin-only')
  @Roles('ADMIN')
  adminOnly(@Req() req) {
    return { message: 'Welcome Admin', user: req.user };
  }
}

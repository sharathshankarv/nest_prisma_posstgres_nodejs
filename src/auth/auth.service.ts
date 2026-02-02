import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { serviceOpResult } from 'src/common/types';
import type { AuthError, commonErrorType } from 'src/common/types';
import { GetUserDto } from '../user/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    pass: string,
    email?: string,
    phone?: string,
  ): Promise<serviceOpResult<GetUserDto, commonErrorType>> {
    if (!email && !phone)
      return {
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Email or phone must be provided',
        },
      };

    const orCondition: Prisma.UserWhereInput[] = [];
    if (email) {
      orCondition.push({ email });
    }

    if (phone) {
      orCondition.push({ phone });
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: orCondition,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImage: true,
        passwordHash: true,
        role: {
          select: { id: true, name: true },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      };
    }

    const validPassword = await bcrypt.compare(pass, user.passwordHash);
    if (validPassword) {
      const { passwordHash, ...safeUser } = user;
      return {
        success: true,
        message: 'Login successful',
        data: safeUser,
      };
    }

    return {
      success: false,
      error: { code: 'INVALID_PASSWORD', message: 'Invalid password' },
    };
  }

  async login(
    password: string,
    email?: string,
    phone?: string,
  ): Promise<serviceOpResult<{ token: string }, commonErrorType>> {
    const result = await this.validateUser(password, email, phone);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    const data = result.data!;

    const payload = {
      sub: data.id,
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      },
      role: data.role,
    };

    const token = this.jwtService.sign(payload, {
      header: {
        alg: 'HS256',
        typ: 'JWT',
      },
    });

    return {
      success: true,
      message: 'Login successful',
      data: { token },
    };
  }
}

import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/user-response.dto';
import { paginatedResponseDto } from './dto/paginated-response.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { sortOrder } from 'src/common/types';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          phone: dto.phone,
          passwordHash: hashedPassword,
          profileImage: dto.profileImage,
          dob: dto.dob,
          roleId: dto.role,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already exists');
        }
      }

      throw error;
    }
  }

  async getAllUsers() {
    const users = this.prisma.user.findMany();

    if (!users) {
      throw new NotFoundException('No users found');
    }

    return users;
  }

  async findUser(filter: { email?: string; phone?: string }) {
    if (!filter.email && !filter.phone) {
      throw new BadRequestException('At least email or phone must be provided');
    }

    const conditions: Prisma.UserWhereInput[] = [];
    if (filter.email) {
      conditions.push({ email: filter.email });
    }

    if (filter.phone) {
      conditions.push({ phone: filter.phone });
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [...conditions].filter(Boolean),
      },
    });

    return user;
  }

  async getUsers(params: {
    offset?: number;
    limit?: number;
    orderBy: sortOrder;
  }): Promise<paginatedResponseDto<GetUserDto>> {
    const _orderBy = params.orderBy === 'desc' ? 'desc' : 'asc';
    const recordNumStart = Math.max(0, params.offset ?? 0);
    const recordNumEnd = Math.min(Math.max(params.limit ?? 10, 1), 100);

    const [data, count] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip: recordNumStart,
        take: recordNumEnd - recordNumStart,
        orderBy: {
          firstName: _orderBy,
        },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: data as GetUserDto[],
      totalCount: count,
      recordNumStart: recordNumStart,
      recordNumEnd: recordNumEnd,
    };
  }
}

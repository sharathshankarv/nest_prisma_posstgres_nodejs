import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import type { sortOrder } from '../common/types';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // Create user endpoint
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  // Get user information
  @Get()
  async getAllUser() {
    return this.userService.getAllUsers();
  }

  @Get('search')
  async findUserByEmailOrPhone(
    @Query('email') email?: string,
    @Query('phone') phone?: string,
  ) {
    return this.userService.findUser({ email, phone });
  }

  @Get('list')
  async getUsers(
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
    @Query('orderBy') orderBy: sortOrder = 'asc',
  ) {
    const end = offset + limit;
    return this.userService.getUsers({ offset, limit, orderBy });
  }
}

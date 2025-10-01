import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('username') username: string,
  ) {
    return this.userService.create(email, password, username);
  }
}
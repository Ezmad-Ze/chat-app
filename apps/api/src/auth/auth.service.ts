import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  private validateEmail(email: string): void {
    if (!email || typeof email !== 'string') {
      throw new BadRequestException('Email is required and must be a string');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }
  }

  private validatePassword(password: string): void {
    if (!password || typeof password !== 'string') {
      throw new BadRequestException('Password is required and must be a string');
    }
    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }
  }

  private validateUsername(username: string): void {
    if (!username || typeof username !== 'string') {
      throw new BadRequestException('Username is required and must be a string');
    }
    if (username.length < 3) {
      throw new BadRequestException('Username must be at least 3 characters long');
    }
    if (username.length > 30) {
      throw new BadRequestException('Username must not exceed 30 characters');
    }
  }

  async login(email: string, password: string) {
    this.validateEmail(email);
    this.validatePassword(password);

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  } 

  async register(email: string, password: string, username: string) {
    this.validateEmail(email);
    this.validatePassword(password);
    this.validateUsername(username);

    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const existingUsername = await this.userService.findByUsername(username);
    if (existingUsername) {
      throw new BadRequestException('Username is already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.create(email, hashedPassword, username);

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
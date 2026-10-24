import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { Role } from '../common/enums/roles.enum';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();

    const existing = await this.usersService.findByEmailWithHash(email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // bootstrap: the very first account becomes the admin
    const role = (await this.usersService.count()) === 0 ? Role.ADMIN : Role.USER;

    const user = await this.usersService.create(email, passwordHash, role);
    return { id: user.id, email: user.email, role: user.role };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithHash(
      dto.email.toLowerCase(),
    );

    // same message for "no such user" and "wrong password": never reveal which
    const valid = user && (await bcrypt.compare(dto.password, user.passwordHash));
    if (!user || !valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { sub: user.id, role: user.role };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }
}
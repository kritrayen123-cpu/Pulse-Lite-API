import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { Role } from '../common/enums/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  // passwordHash has select:false, so we ask for it explicitly (login only)
  findByEmailWithHash(email: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: { email },
      select: { id: true, email: true, passwordHash: true, role: true },
    });
  }

  async getByIdOrFail(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  findAll(): Promise<User[]> {
    return this.usersRepo.find({ order: { createdAt: 'DESC' } });
  }

  count(): Promise<number> {
    return this.usersRepo.count();
  }

  create(email: string, passwordHash: string, role: Role): Promise<User> {
    const user = this.usersRepo.create({ email, passwordHash, role });
    return this.usersRepo.save(user);
  }

  async updateRole(
    id: string,
    role: Role,
    currentUserId: string,
  ): Promise<User> {
    if (id === currentUserId) {
      throw new BadRequestException('You cannot change your own role');
    }
    const user = await this.getByIdOrFail(id);
    user.role = role;
    return this.usersRepo.save(user);
  }

  async remove(id: string, currentUserId: string): Promise<void> {
    if (id === currentUserId) {
      throw new BadRequestException('You cannot delete yourself');
    }
    const result = await this.usersRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }
}
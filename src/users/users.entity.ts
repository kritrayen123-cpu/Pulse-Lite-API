import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Role } from '../common/enums/roles.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  // select: false -> never returned by a query unless asked explicitly
  @Column({ select: false })
  passwordHash: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;
}
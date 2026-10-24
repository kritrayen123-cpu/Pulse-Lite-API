import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { SourceType } from './source-type.enum';

@Entity('sources')
export class Source {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: SourceType, default: SourceType.SERVER })
  type: SourceType;

  // only the hash is stored; unique + indexed so ingest can find the source fast
  @Column({ select: false, unique: true })
  apiKeyHash: string;

  @CreateDateColumn()
  createdAt: Date;
}
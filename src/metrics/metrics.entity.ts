import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Source } from '../sources/sources.entity';

// "last readings of this source" will be our most frequent query
@Index(['sourceId', 'recordedAt'])
@Entity('metrics')
export class Metric {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sourceId: string;

  // deleting a source deletes its metrics too
  @ManyToOne(() => Source, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sourceId' })
  source: Source;

  @Column()
  name: string; // "cpu", "memory", "temperature"...

  @Column({ type: 'double precision' })
  value: number;

  @CreateDateColumn()
  recordedAt: Date;
}
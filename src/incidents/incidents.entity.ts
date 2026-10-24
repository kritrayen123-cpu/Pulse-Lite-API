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
import { Rule } from '../rules/rules.entity';
import { IncidentStatus } from './incident-status.enum';

// at most ONE unresolved incident per rule, enforced by the database itself
@Index(['ruleId'], { unique: true, where: `"status" <> 'resolved'` })
@Index(['sourceId', 'status'])
@Entity('incidents')
export class Incident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sourceId: string;

  @ManyToOne(() => Source, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sourceId' })
  source: Source;

  @Column()
  ruleId: string;

  @ManyToOne(() => Rule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ruleId' })
  rule: Rule;

  @Column({
    type: 'enum',
    enum: IncidentStatus,
    default: IncidentStatus.OPEN,
  })
  status: IncidentStatus;

  @CreateDateColumn()
  openedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date | null;
}
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
import { AiStatus } from './ai-status.enum';

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

  // the readings that broke the rule, newest first
  @Column({ type: 'double precision', array: true, nullable: true })
  triggerValues: number[] | null;

  // AI explanation, filled in later by the queue worker
  @Column({ type: 'text', nullable: true })
  aiSummary: string | null;

  @Column({
    type: 'enum',
    enum: AiStatus,
    default: AiStatus.PENDING,
  })
  aiStatus: AiStatus;

  // which engine wrote the summary: 'ollama' or 'template'
  @Column({ type: 'varchar', length: 20, nullable: true })
  aiEngine: string | null;
}
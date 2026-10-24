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
import { RuleOperator } from './rule-operator.enum';
import { Severity } from './severity.enum';

// step 3 will ask "rules of this source for this metric" after every ingest
@Index(['sourceId', 'metricName'])
@Entity('rules')
export class Rule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sourceId: string;

  // deleting a source deletes its rules too
  @ManyToOne(() => Source, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sourceId' })
  source: Source;

  @Column()
  metricName: string; // which metric to watch, e.g. "cpu"

  @Column({ type: 'enum', enum: RuleOperator })
  operator: RuleOperator;

  @Column({ type: 'double precision' })
  threshold: number; // e.g. 90

  @Column({ type: 'int', default: 3 })
  consecutiveReadings: number; // how many bad readings in a row

  @Column({ type: 'enum', enum: Severity, default: Severity.MEDIUM })
  severity: Severity;

  @CreateDateColumn()
  createdAt: Date;
}
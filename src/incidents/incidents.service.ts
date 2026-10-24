import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Incident } from './incidents.entity';
import { IncidentStatus } from './incident-status.enum';
import { QueryIncidentsDto } from './dto/query-incidents.dto';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private readonly incidentsRepo: Repository<Incident>,
  ) {}

  findAll(query: QueryIncidentsDto): Promise<Incident[]> {
    return this.incidentsRepo.find({
      where: {
        ...(query.sourceId ? { sourceId: query.sourceId } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
      order: { openedAt: 'DESC' },
      take: 100,
    });
  }

  async getByIdOrFail(id: string): Promise<Incident> {
    const incident = await this.incidentsRepo.findOne({ where: { id } });
    if (!incident) throw new NotFoundException('Incident not found');
    return incident;
  }

  async acknowledge(id: string): Promise<Incident> {
    const incident = await this.getByIdOrFail(id);
    if (incident.status !== IncidentStatus.OPEN) {
      throw new ConflictException('Only an open incident can be acknowledged');
    }
    incident.status = IncidentStatus.ACKNOWLEDGED;
    incident.acknowledgedAt = new Date();
    return this.incidentsRepo.save(incident);
  }

  async resolve(id: string): Promise<Incident> {
    const incident = await this.getByIdOrFail(id);
    if (incident.status === IncidentStatus.RESOLVED) {
      throw new ConflictException('Incident is already resolved');
    }
    incident.status = IncidentStatus.RESOLVED;
    incident.resolvedAt = new Date();
    return this.incidentsRepo.save(incident);
  }

  // used by the rule engine: opens an incident unless this rule already has one
  async openIfNone(
    sourceId: string,
    ruleId: string,
  ): Promise<Incident | null> {
    const existing = await this.incidentsRepo.findOne({
      where: { ruleId, status: Not(IncidentStatus.RESOLVED) },
    });
    if (existing) return null;

    try {
      return await this.incidentsRepo.save(
        this.incidentsRepo.create({ sourceId, ruleId }),
      );
    } catch (err) {
      // two requests raced: the database unique index let only one through
      if (isUniqueViolation(err)) return null;
      throw err;
    }
  }

  // used by the rule engine: the problem is over, close what is still unresolved
  async resolveByRule(ruleId: string): Promise<number> {
    const result = await this.incidentsRepo.update(
      { ruleId, status: Not(IncidentStatus.RESOLVED) },
      { status: IncidentStatus.RESOLVED, resolvedAt: new Date() },
    );
    return result.affected ?? 0;
  }
}

// 23505 = PostgreSQL's code for "unique constraint violated"
function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; driverError?: { code?: string } };
  return e?.code === '23505' || e?.driverError?.code === '23505';
}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Metric } from './metrics.entity';
import { QueryMetricsDto } from './dto/query-metrics.dto';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Metric) private readonly metricsRepo: Repository<Metric>,
  ) {}

  findLatest(query: QueryMetricsDto): Promise<Metric[]> {
    return this.metricsRepo.find({
      where: {
        sourceId: query.sourceId,
        ...(query.name ? { name: query.name } : {}),
      },
      order: { recordedAt: 'DESC', id: 'DESC' }, // newest first
      take: query.limit ?? 20,
    });
  }

  async findLatestValues(
    sourceId: string,
    name: string,
    limit: number,
  ): Promise<number[]> {
    const rows = await this.metricsRepo.find({
      where: { sourceId, name },
      order: { recordedAt: 'DESC', id: 'DESC' },
      take: limit,
      select: { value: true },
    });
    return rows.map((r) => r.value);
  }

}
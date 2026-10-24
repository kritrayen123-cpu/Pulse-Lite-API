import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Metric } from '../metrics/metrics.entity';
import { Source } from '../sources/sources.entity';
import { IngestMetricsDto } from './dto/ingest-metrics.dto';

@Injectable()
export class IngestService {
  constructor(
    @InjectRepository(Metric) private readonly metricsRepo: Repository<Metric>,
  ) {}

  async save(source: Source, dto: IngestMetricsDto) {
    const rows = dto.metrics.map((m) => ({
      sourceId: source.id, // from the API key, never from the body
      name: m.name,
      value: m.value,
    }));

    // one INSERT for all rows
    await this.metricsRepo.insert(rows);
    return { received: rows.length };
  }
}
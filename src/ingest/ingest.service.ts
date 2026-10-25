import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Metric } from '../metrics/metrics.entity';
import { Source } from '../sources/sources.entity';
import { RuleEngineService } from '../engine/rule-engine.service';
import { IngestMetricsDto } from './dto/ingest-metrics.dto';

@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);

  constructor(
    @InjectRepository(Metric) private readonly metricsRepo: Repository<Metric>,
    private readonly ruleEngine: RuleEngineService,
  ) {}

  async save(source: Source, dto: IngestMetricsDto) {
    const rows = dto.metrics.map((m) => ({
      sourceId: source.id, // from the API key, never from the body
      name: m.name,
      value: m.value,
    }));

    // 1. one INSERT for all rows
    await this.metricsRepo.insert(rows);

    // 2. check the rules. A failure here must never make the ingest fail:
    //    the metrics are already saved
    try {
      await this.ruleEngine.evaluate(
        source.id,
        rows.map((r) => r.name),
      );
    } catch (err) {
      this.logger.error(`Rule engine failed for source ${source.id}`, err);
    }

    return { received: rows.length };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { RulesService } from '../rules/rules.service';
import { MetricsService } from '../metrics/metrics.service';
import { IncidentsService } from '../incidents/incidents.service';
import { isBreached } from './rule-check.util';

@Injectable()
export class RuleEngineService {
  private readonly logger = new Logger(RuleEngineService.name);

  constructor(
    private readonly rulesService: RulesService,
    private readonly metricsService: MetricsService,
    private readonly incidentsService: IncidentsService,
  ) {}

  async evaluate(sourceId: string, metricNames: string[]): Promise<void> {
    const names = [...new Set(metricNames)]; // each metric looked up once
    const rules = await this.rulesService.findForSourceMetrics(sourceId, names);

    for (const rule of rules) {
      const values = await this.metricsService.findLatestValues(
        sourceId,
        rule.metricName,
        rule.consecutiveReadings,
      );

      // not enough readings yet to judge "N in a row"
      if (values.length < rule.consecutiveReadings) continue;

      if (isBreached(rule.operator, rule.threshold, values)) {
        const incident = await this.incidentsService.openIfNone(
          sourceId,
          rule.id,
        );
        if (incident) {
          this.logger.warn(
            `Incident opened: source ${sourceId}, rule ${rule.id} (${rule.metricName})`,
          );
        }
      } else {
        await this.incidentsService.resolveByRule(rule.id);
      }
    }
  }
}
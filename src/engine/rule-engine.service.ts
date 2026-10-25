import { Injectable, Logger } from '@nestjs/common';
import { RulesService } from '../rules/rules.service';
import { MetricsService } from '../metrics/metrics.service';
import { IncidentsService } from '../incidents/incidents.service';
import { AiProducer } from '../ai/ai.producer';
import { isBreached } from './rule-check.util';

@Injectable()
export class RuleEngineService {
  private readonly logger = new Logger(RuleEngineService.name);

  constructor(
    private readonly rulesService: RulesService,
    private readonly metricsService: MetricsService,
    private readonly incidentsService: IncidentsService,
    private readonly aiProducer: AiProducer,
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
          await this.enqueueExplanation(incident.id);
        }
      } else {
        await this.incidentsService.resolveByRule(rule.id);
      }
    }
  }

  // a broken queue (Redis down) must not stop the other rules from being checked
  private async enqueueExplanation(incidentId: string): Promise<void> {
    try {
      await this.aiProducer.enqueueExplain(incidentId);
    } catch (err) {
      this.logger.error(`Could not enqueue AI job for incident ${incidentId}`, err);
    }
  }
}
import { Logger } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AI_QUEUE, ExplainJobData } from './ai.constants';
import { IncidentsService } from '../incidents/incidents.service';
import { OllamaClient } from './ollama.client';

// concurrency 1: one job at a time, because the local model is the bottleneck
@Processor(AI_QUEUE, { concurrency: 1 })
export class AiProcessor extends WorkerHost {
  private readonly logger = new Logger(AiProcessor.name);

  constructor(
    private readonly incidentsService: IncidentsService,
    private readonly ollama: OllamaClient,
  ) {
    super();
  }

  async process(job: Job<ExplainJobData>): Promise<void> {
    const { incidentId } = job.data;
    const incident = await this.incidentsService.getByIdOrFail(incidentId);

    const { summary, engine } = await this.ollama.explain({
      source: incident.source.name,
      metric: incident.rule.metricName,
      operator: incident.rule.operator as 'gt' | 'lt',
      threshold: incident.rule.threshold,
      consecutiveReadings: incident.rule.consecutiveReadings,
      severity: incident.rule.severity,
      values: incident.triggerValues ?? [],
    });

    await this.incidentsService.saveAiSummary(incidentId, summary, engine);
    this.logger.log(`Job ${job.id}: incident ${incidentId} explained by ${engine}`);
  }

  // runs after EVERY failed attempt; only the last one marks the incident as failed
  @OnWorkerEvent('failed')
  async onFailed(job: Job<ExplainJobData> | undefined, err: Error): Promise<void> {
    if (!job) return;
    const maxAttempts = job.opts.attempts ?? 1;
    this.logger.error(
      `Job ${job.id} failed (attempt ${job.attemptsMade}/${maxAttempts}): ${err.message}`,
    );
    if (job.attemptsMade >= maxAttempts) {
      await this.incidentsService.markAiFailed(job.data.incidentId);
    }
  }
}
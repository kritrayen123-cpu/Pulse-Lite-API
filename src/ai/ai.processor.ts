import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AI_QUEUE, ExplainJobData } from './ai.constants';

// concurrency 1: one job at a time, because the local model is the bottleneck
@Processor(AI_QUEUE, { concurrency: 1 })
export class AiProcessor extends WorkerHost {
  private readonly logger = new Logger(AiProcessor.name);

  async process(job: Job<ExplainJobData>): Promise<void> {
    const { incidentId } = job.data;
    this.logger.log(`Job ${job.id}: explaining incident ${incidentId} (fake, 3s)`);

    // STEP A: pretend to be the AI. Step C replaces this with a call to FastAPI
    await new Promise((resolve) => setTimeout(resolve, 3000));

    this.logger.log(`Job ${job.id}: done`);
  }
}
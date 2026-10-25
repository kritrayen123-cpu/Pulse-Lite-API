import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AI_QUEUE, EXPLAIN_JOB, ExplainJobData } from './ai.constants';

@Injectable()
export class AiProducer {
  constructor(
    @InjectQueue(AI_QUEUE) private readonly queue: Queue<ExplainJobData>,
  ) {}

  async enqueueExplain(incidentId: string): Promise<void> {
    await this.queue.add(
      EXPLAIN_JOB,
      { incidentId },
      {
        jobId: `explain-${incidentId}`, // one job per incident, never duplicated
        attempts: 3, // if it fails, try again...
        backoff: { type: 'exponential', delay: 5000 }, // ...after 5s, then 10s
        removeOnComplete: 100, // keep the last 100 finished jobs, then clean up
        removeOnFail: 500,
      },
    );
  }
}
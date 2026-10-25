import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AI_QUEUE } from './ai.constants';
import { AiProducer } from './ai.producer';
import { AiProcessor } from './ai.processor';

@Module({
  imports: [BullModule.registerQueue({ name: AI_QUEUE })],
  providers: [AiProducer, AiProcessor],
  exports: [AiProducer],
})
export class AiModule {}
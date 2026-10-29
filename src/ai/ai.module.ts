import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AI_QUEUE } from './ai.constants';
import { AiProducer } from './ai.producer';
import { AiProcessor } from './ai.processor';
import { OllamaClient } from './ollama.client';
import { IncidentsModule } from '../incidents/incidents.module';

@Module({
  imports: [BullModule.registerQueue({ name: AI_QUEUE }), IncidentsModule],
  providers: [AiProducer, AiProcessor, OllamaClient],
  exports: [AiProducer],
})
export class AiModule {}
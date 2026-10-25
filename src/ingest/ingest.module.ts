import { Module } from '@nestjs/common';
import { SourcesModule } from '../sources/sources.module';
import { MetricsModule } from '../metrics/metrics.module';
import { EngineModule } from '../engine/engine.module';
import { IngestController } from './ingest.controller';
import { IngestService } from './ingest.service';

@Module({
  imports: [SourcesModule, MetricsModule, EngineModule],
  controllers: [IngestController],
  providers: [IngestService],
})
export class IngestModule {}

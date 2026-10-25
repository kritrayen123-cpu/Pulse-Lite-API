import { Module } from '@nestjs/common';
import { RulesModule } from '../rules/rules.module';
import { MetricsModule } from '../metrics/metrics.module';
import { IncidentsModule } from '../incidents/incidents.module';
import { AiModule } from '../ai/ai.module';
import { RuleEngineService } from './rule-engine.service';

@Module({
  imports: [RulesModule, MetricsModule, IncidentsModule, AiModule],
  providers: [RuleEngineService],
  exports: [RuleEngineService],
})
export class EngineModule {}
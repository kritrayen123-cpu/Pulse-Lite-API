import { Module } from '@nestjs/common';
import { RulesModule } from '../rules/rules.module';
import { MetricsModule } from '../metrics/metrics.module';
import { IncidentsModule } from '../incidents/incidents.module';
import { RuleEngineService } from './rule-engine.service';

@Module({
  imports: [RulesModule, MetricsModule, IncidentsModule],
  providers: [RuleEngineService],
  exports: [RuleEngineService],
})
export class EngineModule {}
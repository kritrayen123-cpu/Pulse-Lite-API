import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { QueryMetricsDto } from './dto/query-metrics.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('metrics')
@UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  findLatest(@Query() query: QueryMetricsDto) {
    return this.metricsService.findLatest(query);
  }
}
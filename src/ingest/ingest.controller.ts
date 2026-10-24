import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard';
import { IngestService } from './ingest.service';
import { IngestMetricsDto } from './dto/ingest-metrics.dto';
import type { SourceRequest } from './source-request.interface';

@Controller('ingest')
@UseGuards(ApiKeyGuard)
export class IngestController {
  constructor(private readonly ingestService: IngestService) {}

  // lets an agent check that its key works
  @Get('ping')
  ping(@Req() req: SourceRequest) {
    return { source: req.source.name };
  }

  @Post()
  ingest(@Req() req: SourceRequest, @Body() dto: IngestMetricsDto) {
    return this.ingestService.save(req.source, dto);
  }
}
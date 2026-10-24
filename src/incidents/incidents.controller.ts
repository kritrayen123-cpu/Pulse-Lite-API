import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { QueryIncidentsDto } from './dto/query-incidents.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('incidents')
@UseGuards(JwtAuthGuard)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  findAll(@Query() query: QueryIncidentsDto) {
    return this.incidentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.incidentsService.getByIdOrFail(id);
  }

  @Patch(':id/acknowledge')
  acknowledge(@Param('id', ParseUUIDPipe) id: string) {
    return this.incidentsService.acknowledge(id);
  }

  @Patch(':id/resolve')
  resolve(@Param('id', ParseUUIDPipe) id: string) {
    return this.incidentsService.resolve(id);
  }
}
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SourcesService } from './sources.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/roles.enum';

@Controller('sources')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateSourceDto) {
    return this.sourcesService.create(dto);
  }

  @Get()
  findAll() {
    return this.sourcesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sourcesService.getByIdOrFail(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.sourcesService.remove(id);
  }
}
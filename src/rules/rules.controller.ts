import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RulesService } from './rules.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { QueryRulesDto } from './dto/query-rules.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/roles.enum';

@Controller('rules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateRuleDto) {
    return this.rulesService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryRulesDto) {
    return this.rulesService.findAll(query.sourceId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rulesService.remove(id);
  }
}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcesModule } from '../sources/sources.module';
import { Rule } from './rules.entity';
import { RulesService } from './rules.service';
import { RulesController } from './rules.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Rule]), SourcesModule],
  controllers: [RulesController],
  providers: [RulesService],
  exports: [RulesService, TypeOrmModule],
})
export class RulesModule {}
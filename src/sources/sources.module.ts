import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Source } from './sources.entity';
import { SourcesService } from './sources.service';
import { SourcesController } from './sources.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Source])],
  controllers: [SourcesController],
  providers: [SourcesService],
  exports: [SourcesService, TypeOrmModule],
})
export class SourcesModule {}
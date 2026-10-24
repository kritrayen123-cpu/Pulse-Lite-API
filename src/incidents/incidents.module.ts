import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Incident } from './incidents.entity';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Incident])],
  controllers: [IncidentsController],
  providers: [IncidentsService],
  exports: [IncidentsService, TypeOrmModule],
})
export class IncidentsModule {}
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { IncidentStatus } from '../incident-status.enum';

export class QueryIncidentsDto {
  @IsOptional()
  @IsUUID()
  sourceId?: string;

  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;
}
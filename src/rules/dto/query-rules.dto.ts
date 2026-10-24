import { IsOptional, IsUUID } from 'class-validator';

export class QueryRulesDto {
  @IsOptional()
  @IsUUID()
  sourceId?: string;
}
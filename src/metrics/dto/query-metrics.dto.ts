import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryMetricsDto {
  @IsUUID()
  sourceId: string;

  @IsOptional()
  @IsString()
  name?: string; // "cpu", "memory"... leave empty for all

  @IsOptional()
  @Type(() => Number) // URL values are strings, so convert first
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}
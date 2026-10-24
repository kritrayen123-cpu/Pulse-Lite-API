import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MetricItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  // rejects "97" (a string), NaN and Infinity
  @IsNumber({ allowNaN: false, allowInfinity: false })
  value: number;
}

export class IngestMetricsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => MetricItemDto)
  metrics: MetricItemDto[];
}
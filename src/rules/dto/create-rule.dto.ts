import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { RuleOperator } from '../rule-operator.enum';
import { Severity } from '../severity.enum';

export class CreateRuleDto {
  @IsUUID()
  sourceId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  metricName: string;

  @IsEnum(RuleOperator)
  operator: RuleOperator;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  threshold: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  consecutiveReadings?: number; // default 3

  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity; // default medium
}
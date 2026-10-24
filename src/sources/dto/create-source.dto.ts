import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { SourceType } from '../source-type.enum';

export class CreateSourceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsEnum(SourceType)
  type?: SourceType;
}
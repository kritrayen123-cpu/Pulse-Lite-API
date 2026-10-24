import { Request } from 'express';
import { Source } from '../sources/sources.entity';

export interface SourceRequest extends Request {
  source: Source;
}
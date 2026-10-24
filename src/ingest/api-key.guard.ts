import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SourcesService } from '../sources/sources.service';
import type { SourceRequest } from './source-request.interface';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly sourcesService: SourcesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<SourceRequest>();

    const apiKey = request.headers['x-api-key'];
    if (typeof apiKey !== 'string' || apiKey.length === 0) {
      throw new UnauthorizedException('Missing API key');
    }

    const source = await this.sourcesService.findByApiKey(apiKey);
    if (!source) {
      throw new UnauthorizedException('Invalid API key');
    }

    request.source = source; // the controller now knows who is sending
    return true;
  }
}
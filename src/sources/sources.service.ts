import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Source } from './sources.entity';
import { SourceType } from './source-type.enum';
import { CreateSourceDto } from './dto/create-source.dto';
import { generateApiKey, hashApiKey } from './api-key.util';

@Injectable()
export class SourcesService {
  constructor(
    @InjectRepository(Source) private readonly sourcesRepo: Repository<Source>,
  ) {}

  async create(dto: CreateSourceDto) {
    const apiKey = generateApiKey();

    const source = this.sourcesRepo.create({
      name: dto.name,
      type: dto.type ?? SourceType.SERVER,
      apiKeyHash: hashApiKey(apiKey),
    });
    const saved = await this.sourcesRepo.save(source);

    // built by hand so the hash can never leak; apiKey is returned this once
    return {
      id: saved.id,
      name: saved.name,
      type: saved.type,
      createdAt: saved.createdAt,
      apiKey,
    };
  }

  findAll(): Promise<Source[]> {
    return this.sourcesRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getByIdOrFail(id: string): Promise<Source> {
    const source = await this.sourcesRepo.findOne({ where: { id } });
    if (!source) throw new NotFoundException('Source not found');
    return source;
  }

  // used by ingest: the key is hashed, then looked up (the hash column is unique + indexed)
  findByApiKey(apiKey: string): Promise<Source | null> {
    return this.sourcesRepo.findOne({
      where: { apiKeyHash: hashApiKey(apiKey) },
    });
  }

  async remove(id: string): Promise<void> {
    const result = await this.sourcesRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Source not found');
    }
  }
}
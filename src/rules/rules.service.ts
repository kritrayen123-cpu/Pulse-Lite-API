import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Rule } from './rules.entity';
import { CreateRuleDto } from './dto/create-rule.dto';
import { SourcesService } from '../sources/sources.service';

@Injectable()
export class RulesService {
  constructor(
    @InjectRepository(Rule) private readonly rulesRepo: Repository<Rule>,
    private readonly sourcesService: SourcesService,
  ) {}

  async create(dto: CreateRuleDto): Promise<Rule> {
    // 404 if the source doesn't exist, instead of a raw database error
    await this.sourcesService.getByIdOrFail(dto.sourceId);

    const rule = this.rulesRepo.create(dto);
    return this.rulesRepo.save(rule);
  }

  findAll(sourceId?: string): Promise<Rule[]> {
    return this.rulesRepo.find({
      where: sourceId ? { sourceId } : {},
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string): Promise<void> {
    const result = await this.rulesRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Rule not found');
    }
  }

  findForSourceMetrics(
    sourceId: string,
    metricNames: string[],
  ): Promise<Rule[]> {
    if (metricNames.length === 0) return Promise.resolve([]);
    return this.rulesRepo.find({
      where: { sourceId, metricName: In(metricNames) },
    });
  }
}

import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IngestService } from './ingest.service';
import { Metric } from '../metrics/metrics.entity';
import { Source } from '../sources/sources.entity';
import { RuleEngineService } from '../engine/rule-engine.service';

describe('IngestService', () => {
  let service: IngestService;
  const repo = { insert: jest.fn() };
  const ruleEngine = { evaluate: jest.fn() };
  const source = { id: 's1' } as Source;
  const dto = {
    metrics: [
      { name: 'cpu', value: 97 },
      { name: 'memory', value: 81 },
    ],
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const moduleRef = await Test.createTestingModule({
      providers: [
        IngestService,
        { provide: getRepositoryToken(Metric), useValue: repo },
        { provide: RuleEngineService, useValue: ruleEngine },
      ],
    }).compile();
    service = moduleRef.get(IngestService);
  });

  it('saves every metric tagged with the source id, then runs the rules', async () => {
    const result = await service.save(source, dto);

    expect(repo.insert).toHaveBeenCalledWith([
      { sourceId: 's1', name: 'cpu', value: 97 },
      { sourceId: 's1', name: 'memory', value: 81 },
    ]);
    expect(ruleEngine.evaluate).toHaveBeenCalledWith('s1', ['cpu', 'memory']);
    expect(result).toEqual({ received: 2 });
  });

  it('still succeeds when the rule engine fails', async () => {
    ruleEngine.evaluate.mockRejectedValue(new Error('boom'));
    await expect(service.save(source, dto)).resolves.toEqual({ received: 2 });
  });
});

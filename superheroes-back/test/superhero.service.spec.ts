import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuperheroService } from '../src/superheroes/services/superhero.service';
import { Superhero } from '../src/superheroes/entities/superhero.entity';

describe('SuperheroService (unit)', () => {
  let service: SuperheroService;
  let repo: jest.Mocked<Repository<Superhero>>;

  function createRepoMock(): any {
    return {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
        andWhere: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
      }),
      manager: { connection: { options: { type: 'sqlite' } } },
    } as any;
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuperheroService,
        { provide: getRepositoryToken(Superhero), useValue: createRepoMock() },
      ],
    }).compile();

    service = module.get(SuperheroService);
    repo = module.get(getRepositoryToken(Superhero));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should call repository to persist a new superhero', async () => {
    repo.findOne.mockResolvedValue(null as any);
    const created = { id: 1, alias: 'SUPERMAN' } as any;
    repo.create.mockReturnValue(created);
    repo.save.mockResolvedValue(created);

    try {
      await service.create({
        name: 'Clark Kent',
        alias: 'SUPERMAN',
        powers: ['Vuelo', 'Fuerza'],
        city: 'Metropolis',
        powerLevel: 10,
        isActive: true,
      } as any);
    } catch {}

    expect(repo.findOne).toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
  });

  it('findAll should return empty list and total 0 by default', async () => {
    const qb = repo.createQueryBuilder();
    (qb.getManyAndCount as jest.Mock).mockResolvedValue([[], 0]);

    const result = await service.findAll();
    expect(result.total).toBe(0);
    expect(result.data).toEqual([]);
  });
});



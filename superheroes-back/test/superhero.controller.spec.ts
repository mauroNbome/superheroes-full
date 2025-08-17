import { Test, TestingModule } from '@nestjs/testing';
import { SuperheroController } from '../src/superheroes/controllers/superhero.controller';
import { SuperheroService } from '../src/superheroes/services/superhero.service';

describe('SuperheroController (unit)', () => {
  let controller: SuperheroController;
  const serviceMock = {
    findAll: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    findOne: jest.fn().mockResolvedValue({ id: 1 } as any),
    create: jest.fn().mockResolvedValue({ id: 1 } as any),
    update: jest.fn().mockResolvedValue({ id: 1 } as any),
    hardDelete: jest.fn().mockResolvedValue({ message: 'ok' }),
    getStats: jest.fn().mockResolvedValue({ total: 0, active: 0, inactive: 0, byPowerLevel: {}, byCities: {} }),
    findByAlias: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuperheroController],
      providers: [
        { provide: SuperheroService, useValue: serviceMock },
      ],
    }).compile();

    controller = module.get(SuperheroController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('GET /superheroes should return paginated list', async () => {
    const res = await controller.findAll();
    expect(res.total).toBe(0);
    expect(Array.isArray(res.data)).toBe(true);
  });
});



import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PuntosService } from './puntos.service';
import { Punto } from './entities/punto.entity';
import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

// Local mock factory to solve import issues in some tests
export type MockRepository<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createLocalMockRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  merge: jest.fn(),
  preload: jest.fn(),
  count: jest.fn(),
  query: jest.fn(),
});

describe('PuntosService', () => {
  let service: PuntosService;
  let repository: MockRepository<Punto>;
  let dataSource: Partial<Record<keyof DataSource, jest.Mock>>;

  beforeEach(async () => {
    dataSource = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PuntosService,
        {
          provide: getRepositoryToken(Punto),
          useValue: createLocalMockRepository(),
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<PuntosService>(PuntosService);
    repository = module.get<MockRepository<Punto>>(getRepositoryToken(Punto));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new punto', async () => {
      const dto = { nombre: 'P1', tipo: 'PARADA', latitud: 1, longitud: 2 };
      (repository.create as jest.Mock).mockReturnValue(dto);
      (repository.save as jest.Mock).mockReturnValue({ id: 1, ...dto });

      const result = await service.create(dto as any);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 1, ...dto });
    });
  });

  describe('distancia_entre_puntos', () => {
    it('should calculate distance correctly (Haversine)', () => {
      const p1 = { latitud: -16.500, longitud: -68.150 };
      const p2 = { latitud: -16.510, longitud: -68.160 };
      
      const distance = service.distancia_entre_puntos(p1 as any, p2 as any);
      
      expect(distance).toBeGreaterThan(0);
      expect(typeof distance).toBe('number');
    });
  });

  describe('findAll', () => {
    it('should return all puntos', async () => {
      const puntos = [{ id: 1, nombre: 'P1' }];
      (repository.find as jest.Mock).mockReturnValue(puntos);

      const result = await service.findAll();

      expect(result).toEqual(puntos);
    });

    it('should throw NotFoundException if no puntos found', async () => {
      (repository.find as jest.Mock).mockReturnValue([]);

      await expect(service.findAll()).rejects.toThrow(NotFoundException);
    });
  });

  describe('tresPuntosMasCercanos', () => {
    it('should return 3 nearest points via raw query', async () => {
      const ref = { nombre: 'REF', latitud: 1, longitud: 2 };
      const mockResult = [
        { nombre: 'P1', tipo: 'T1', latitud: '1.1', longitud: '2.1', distancia_al_siguiente: '0.5', id_user_create: 1 },
      ];
      (dataSource.query as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.tresPuntosMasCercanos(ref as any);

      expect(dataSource.query).toHaveBeenCalled();
      expect(result.length).toBe(1);
      expect(result[0].nombre).toBe('P1');
      expect(typeof result[0].latitud).toBe('number');
    });
  });

  describe('buscarCercano', () => {
    it('should return the single closest point', async () => {
      const mockResult = [{ id: 1, nombre: 'Cercano' }];
      (repository.query as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.buscarCercano(-16.5, -68.1);

      expect(repository.query).toHaveBeenCalled();
      expect(result).toEqual(mockResult[0]);
    });
  });
});

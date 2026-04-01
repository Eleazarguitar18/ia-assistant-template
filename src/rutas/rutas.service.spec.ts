import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RutasService } from './rutas.service';
import { Ruta } from './entities/ruta.entity';
import { RutaPunto } from './entities/ruta_puntos.entity';
import { LineasService } from 'src/lineas/lineas.service';
import { PuntosService } from 'src/puntos/puntos.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DirectedGraph } from 'graphology';

// Local mock factory to solve import issues in some tests
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

describe('RutasService', () => {
  let service: RutasService;
  let rutaRepository: any;
  let cacheManager: any;

  beforeEach(async () => {
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      clear: jest.fn(),
      reset: jest.fn(),
      store: { keys: jest.fn().mockResolvedValue([]) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RutasService,
        {
          provide: getRepositoryToken(Ruta),
          useValue: createLocalMockRepository(),
        },
        {
          provide: getRepositoryToken(RutaPunto),
          useValue: createLocalMockRepository(),
        },
        {
          provide: LineasService,
          useValue: { create: jest.fn(), update: jest.fn() },
        },
        {
          provide: PuntosService,
          useValue: { create: jest.fn() },
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile();

    service = module.get<RutasService>(RutasService);
    rutaRepository = module.get(getRepositoryToken(Ruta));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buscarRutaOptima', () => {
    it('should return cached result if available', async () => {
      const cached = { mensaje: 'cached' };
      cacheManager.get.mockResolvedValue(cached);

      const result = await service.buscarRutaOptima(0, 0, 1, 1);

      expect(cacheManager.get).toHaveBeenCalled();
      expect(result).toEqual(cached);
    });

    it('should throw "no paradas cercanas" error if points not found in graph', async () => {
      cacheManager.get.mockResolvedValue(null);
      await expect(service.buscarRutaOptima(0, 0, 1, 1)).rejects.toThrow(/no se encontraron paradas cercanas/i);
    });
  });

  describe('refreshAll', () => {
    it('should rebuild graph and clear cache', async () => {
      rutaRepository.find.mockResolvedValue([]);
      rutaRepository.create.mockReturnValue({});
      rutaRepository.save.mockResolvedValue({ id: 1 });

      await service.create({} as any);

      const manager = cacheManager as any;
      const called = (manager.clear as jest.Mock).mock.calls.length > 0 || (manager.reset as jest.Mock).mock.calls.length > 0;
      expect(called).toBe(true);
    });
  });

  describe('Atomic Swap in construirGrafo', () => {
    it('should replace the old graph instance', async () => {
      const oldGraph = (service as any).grafo;
      rutaRepository.find.mockResolvedValue([]);
      
      await (service as any).construirGrafo();
      
      const newGraph = (service as any).grafo;
      expect(newGraph).toBeInstanceOf(DirectedGraph);
      expect(newGraph).not.toBe(oldGraph);
    });
  });
});

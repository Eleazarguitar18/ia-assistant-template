import { Test, TestingModule } from '@nestjs/testing';
import { createMockRepository, MockRepository } from 'src/common/test/test-utils';
import { RutasController } from './rutas.controller';
import { RutasService } from './rutas.service';

describe('RutasController', () => {
  let controller: RutasController;
  let service: RutasService;

  const mockRutasService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    create_general: jest.fn(),
    update_general: jest.fn(),
    buscarRutaOptima: jest.fn(),
    buscarRutasAlternativas: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RutasController],
      providers: [
        {
          provide: RutasService,
          useValue: mockRutasService,
        },
      ],
    }).compile();

    controller = module.get<RutasController>(RutasController);
    service = module.get<RutasService>(RutasService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create_general', () => {
    it('should call service.create_general', async () => {
      const dto = { linea: {}, ruta: {}, puntos: [] };
      await controller.create_general(dto as any);
      expect(service.create_general).toHaveBeenCalledWith(dto);
    });
  });

  describe('buscarRuta', () => {
    it('should call service.buscarRutaOptima with correct coords', async () => {
      const dto = { latOrigen: 1, lonOrigen: 2, latDestino: 3, lonDestino: 4 };
      await controller.buscarRuta(dto);
      expect(service.buscarRutaOptima).toHaveBeenCalledWith(1, 2, 3, 4);
    });
  });
});

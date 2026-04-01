import { Test, TestingModule } from '@nestjs/testing';
import { PuntosController } from './puntos.controller';
import { PuntosService } from './puntos.service';

describe('PuntosController', () => {
  let controller: PuntosController;
  let service: PuntosService;

  const mockPuntosService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    distancia_entre_puntos: jest.fn(),
    tresPuntosMasCercanos: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PuntosController],
      providers: [
        {
          provide: PuntosService,
          useValue: mockPuntosService,
        },
      ],
    }).compile();

    controller = module.get<PuntosController>(PuntosController);
    service = module.get<PuntosService>(PuntosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto = { nombre: 'P1' };
      await controller.create(dto as any);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('tresPuntosMasCercanos', () => {
    it('should call service.tresPuntosMasCercanos', async () => {
      const dto = { nombre: 'P1' };
      await controller.tresPuntosMasCercanos(dto as any);
      expect(service.tresPuntosMasCercanos).toHaveBeenCalledWith(dto);
    });
  });
});

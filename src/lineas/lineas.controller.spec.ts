import { Test, TestingModule } from '@nestjs/testing';
import { LineasController } from './lineas.controller';
import { LineasService } from './lineas.service';

describe('LineasController', () => {
  let controller: LineasController;
  let service: LineasService;

  const mockLineasService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LineasController],
      providers: [
        {
          provide: LineasService,
          useValue: mockLineasService,
        },
      ],
    }).compile();

    controller = module.get<LineasController>(LineasController);
    service = module.get<LineasService>(LineasService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service create', async () => {
      const dto = { numero: '1', color: '#ff0000', descripcion: 'test' };
      mockLineasService.create.mockReturnValue(dto);

      await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call service findAll', async () => {
      await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call service findOne', async () => {
      await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should call service update', async () => {
      const dto = { numero: '1-updated' };
      await controller.update('1', dto as any);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should call service remove', async () => {
      await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});

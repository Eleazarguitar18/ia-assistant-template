import { Test, TestingModule } from '@nestjs/testing';
import { PersonaController } from './persona.controller';
import { PersonaService } from './persona.service';
import { AuthGuard } from '../auth/guards/auth.guard';

describe('PersonaController', () => {
  let controller: PersonaController;
  let service: PersonaService;

  const mockPersonaService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonaController],
      providers: [
        {
          provide: PersonaService,
          useValue: mockPersonaService,
        },
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<PersonaController>(PersonaController);
    service = module.get<PersonaService>(PersonaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto = { nombre: 'Juan' };
      mockPersonaService.create.mockResolvedValue(dto);
      
      const result = await controller.create(dto as any);
      
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result.data).toEqual(dto);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      mockPersonaService.findAll.mockResolvedValue([]);
      await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should call service.update with extra user id from DTO', async () => {
      const dto = { id: 1, nombre: 'Juan', id_user_update: 10 };
      await controller.update(dto as any);
      expect(service.update).toHaveBeenCalledWith(1, dto, 10);
    });
  });
});

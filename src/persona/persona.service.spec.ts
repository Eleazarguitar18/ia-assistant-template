import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PersonaService } from './persona.service';
import { Persona } from './entities/persona.entity';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { createMockRepository, MockRepository } from '../common/test/test-utils';

describe('PersonaService', () => {
  let service: PersonaService;
  let repository: MockRepository<Persona>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonaService,
        {
          provide: getRepositoryToken(Persona),
          useValue: createMockRepository<Persona>(),
        },
      ],
    }).compile();

    service = module.get<PersonaService>(PersonaService);
    repository = module.get<MockRepository<Persona>>(getRepositoryToken(Persona));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new persona', async () => {
      const dto = { nombre: 'Juan', apellido: 'Perez', ci: '1234567' };
      repository.create.mockReturnValue(dto);
      repository.save.mockReturnValue({ id: 1, ...dto });

      const result = await service.create(dto as any);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 1, ...dto });
    });
  });

  describe('findAll', () => {
    it('should return personas with estado true', async () => {
      const data = [{ id: 1, nombre: 'Juan', estado: true }];
      repository.find.mockReturnValue(data);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({ where: { estado: true } });
      expect(result).toEqual(data);
    });

    it('should throw NotFoundException if no personas found', async () => {
      repository.find.mockReturnValue([]);

      await expect(service.findAll()).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a persona by id', async () => {
      const persona = { id: 1, nombre: 'Juan' };
      repository.findOneBy.mockReturnValue(persona);

      const result = await service.findOne(1);

      expect(result).toEqual(persona);
    });

    it('should throw NotFoundException if persona not found', async () => {
      repository.findOneBy.mockReturnValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update persona successfully', async () => {
      const existing = { id: 1, nombre: 'Juan' };
      const dto = { nombre: 'Juan Carlos' };
      const merged = { ...existing, ...dto };
      
      repository.findOneBy.mockReturnValue(existing);
      repository.merge.mockReturnValue(merged);
      repository.save.mockReturnValue(merged);

      const result = await service.update(1, dto as any, 99);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repository.merge).toHaveBeenCalledWith(existing, dto);
      expect(result.id_user_update).toBe(99);
      expect(result.nombre).toBe('Juan Carlos');
    });

    it('should throw InternalServerErrorException on save error', async () => {
      repository.findOneBy.mockReturnValue({ id: 1 });
      repository.merge.mockReturnValue({});
      repository.save.mockRejectedValue(new Error('DB Error'));

      await expect(service.update(1, {} as any, 1)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('should mark persona as inactive', async () => {
      const persona = { id: 1, estado: true };
      repository.findOneBy.mockReturnValue(persona);
      repository.save.mockReturnValue({ ...persona, estado: false });

      const result = await service.remove(1);

      expect(persona.estado).toBe(false);
      expect(result.estado).toBe(false);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LineasService } from './lineas.service';
import { Linea } from './entities/linea.entity';
import { NotFoundException } from '@nestjs/common';
import { createMockRepository, MockRepository } from '../common/test/test-utils';

describe('LineasService', () => {
  let service: LineasService;
  let repository: MockRepository<Linea>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LineasService,
        {
          provide: getRepositoryToken(Linea),
          useValue: createMockRepository<Linea>(),
        },
      ],
    }).compile();

    service = module.get<LineasService>(LineasService);
    repository = module.get<MockRepository<Linea>>(getRepositoryToken(Linea));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new linea', async () => {
      const dto = { numero: '1', color: '#ff0000', descripcion: 'test' };
      repository.create.mockReturnValue(dto);
      repository.save.mockReturnValue({ id: 1, ...dto });

      const result = await service.create(dto as any);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual({ id: 1, ...dto });
    });
  });

  describe('findAll', () => {
    it('should return an array of lineas', async () => {
      const lineas = [{ id: 1, numero: '1' }];
      repository.find.mockReturnValue(lineas);

      const result = await service.findAll();

      expect(result).toEqual(lineas);
    });

    it('should throw NotFoundException if no lineas are found', async () => {
      repository.find.mockReturnValue([]);

      await expect(service.findAll()).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a single linea', async () => {
      const linea = { id: 1, numero: '1' };
      repository.findOneBy.mockReturnValue(linea);

      const result = await service.findOne(1);

      expect(result).toEqual(linea);
    });

    it('should throw NotFoundException if linea is not found', async () => {
      repository.findOneBy.mockReturnValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the linea', async () => {
      const dto = { numero: '1-updated' };
      const updatedLinea = { id: 1, ...dto };
      repository.preload.mockReturnValue(updatedLinea);
      repository.save.mockReturnValue(updatedLinea);

      const result = await service.update(1, dto as any);

      expect(repository.preload).toHaveBeenCalledWith({ id: 1, ...dto });
      expect(result).toEqual(updatedLinea);
    });

    it('should throw NotFoundException if linea to update is not found', async () => {
      repository.preload.mockReturnValue(null);

      await expect(service.update(1, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete by setting estado to false', async () => {
      const linea = { id: 1, numero: '1', estado: true };
      repository.findOneBy.mockReturnValue(linea);
      repository.save.mockReturnValue({ ...linea, estado: false });

      const result = await service.remove(1);

      expect(linea.estado).toBe(false);
      expect(repository.save).toHaveBeenCalledWith(linea);
      expect(result.estado).toBe(false);
    });

    it('should throw NotFoundException if linea to remove is not found', async () => {
      repository.findOneBy.mockReturnValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});

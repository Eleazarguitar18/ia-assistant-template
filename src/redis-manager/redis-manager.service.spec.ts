import { Test, TestingModule } from '@nestjs/testing';
import { RedisManagerService } from './redis-manager.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Logger } from '@nestjs/common';

describe('RedisManagerService', () => {
  let service: RedisManagerService;
  let cacheManager: any;

  beforeEach(async () => {
    cacheManager = {
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisManagerService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile();

    service = module.get<RedisManagerService>(RedisManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should set a startup_check key in redis', async () => {
      await service.onModuleInit();
      expect(cacheManager.set).toHaveBeenCalledWith('startup_check', 'ok', 10);
    });

    it('should log an error if redis fails', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');
      cacheManager.set.mockRejectedValue(new Error('Redis Down'));

      await service.onModuleInit();

      expect(loggerSpy).toHaveBeenCalled();
    });
  });
});

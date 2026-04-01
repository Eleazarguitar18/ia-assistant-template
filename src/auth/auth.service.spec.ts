import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Role } from './entities/role.entity';
import { PersonaService } from 'src/persona/persona.service';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { createMockRepository, MockRepository } from '../common/test/test-utils';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: MockRepository<Usuario>;
  let roleRepository: MockRepository<Role>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;
  let cacheManager: any;

  beforeEach(async () => {
    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: createMockRepository<Usuario>(),
        },
        {
          provide: getRepositoryToken(Role),
          useValue: createMockRepository<Role>(),
        },
        {
          provide: PersonaService,
          useValue: { create: jest.fn() },
        },
        {
          provide: MailService,
          useValue: { sendCode: jest.fn(), sendEmailChangePassword: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<MockRepository<Usuario>>(getRepositoryToken(Usuario));
    roleRepository = module.get<MockRepository<Role>>(getRepositoryToken(Role));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return tokens on valid credentials', async () => {
      const user = { id: 1, email: 't@t.com', password: 'hash', name: 'User' };
      userRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('token');

      const result = await service.login('t@t.com', '123');

      expect(result).toHaveProperty('access_token');
      expect(result.user).toEqual(user);
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      userRepository.findOne.mockResolvedValue({ password: 'hash' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('t', 'p')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('requestPasswordChange', () => {
    it('should generate a code and store it in redis', async () => {
      const email = 'test@test.com';
      userRepository.findOne.mockResolvedValue({ name: 'Test' });
      
      const result = await service.requestPasswordChange(email);

      expect(cacheManager.set).toHaveBeenCalled();
      expect(result.message).toContain('enviado');
    });
  });

  describe('confirmCode', () => {
    it('should confirm valid code and delete it from redis', async () => {
      cacheManager.get.mockResolvedValue('123456');
      
      const result = await service.confirmCode('email', '123456');

      expect(cacheManager.del).toHaveBeenCalled();
      expect(result.message).toContain('correcto');
    });

    it('should throw UnauthorizedException on invalid code', async () => {
      cacheManager.get.mockResolvedValue('123456');
      
      await expect(service.confirmCode('email', 'wrong')).rejects.toThrow(UnauthorizedException);
    });
  });
});

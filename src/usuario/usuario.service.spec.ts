import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsuarioService } from './usuario.service';
import { Usuario } from './entities/usuario.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { PersonaService } from 'src/persona/persona.service';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException } from '@nestjs/common';
import { createMockRepository, MockRepository } from '../common/test/test-utils';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsuarioService', () => {
  let service: UsuarioService;
  let userRepository: MockRepository<Usuario>;
  let personaService: Partial<Record<keyof PersonaService, jest.Mock>>;
  let mailService: Partial<Record<keyof MailService, jest.Mock>>;

  beforeEach(async () => {
    personaService = {
      create: jest.fn(),
    };
    mailService = {
      sendWelcome: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: createMockRepository<Usuario>(),
        },
        {
          provide: getRepositoryToken(Persona),
          useValue: createMockRepository<Persona>(),
        },
        {
          provide: PersonaService,
          useValue: personaService,
        },
        {
          provide: MailService,
          useValue: mailService,
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('10') },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
    userRepository = module.get<MockRepository<Usuario>>(getRepositoryToken(Usuario));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a persona, hash password, save user and send email', async () => {
      const dto = { 
        email: 'test@test.com', 
        password: '123', 
        nombres: 'A', 
        p_apellido: 'B', 
        s_apellido: 'C' 
      };
      const mockPersona = { id: 1 };
      const mockUser = { id: 1, email: dto.email };
      
      personaService.create.mockResolvedValue(mockPersona);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(dto as any);

      expect(personaService.create).toHaveBeenCalledWith(dto);
      expect(bcrypt.hash).toHaveBeenCalledWith('123', 10);
      expect(userRepository.save).toHaveBeenCalled();
      expect(mailService.sendWelcome).toHaveBeenCalledWith(dto.email, 'A B C');
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      userRepository.find.mockResolvedValue([{ id: 1 }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });

    it('should throw NotFoundException if no users', async () => {
      userRepository.find.mockResolvedValue([]);
      await expect(service.findAll()).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete user', async () => {
      const user = { id: 1, estado: true };
      userRepository.findOneBy.mockResolvedValue(user);
      userRepository.save.mockResolvedValue({ ...user, estado: false });

      const result = await service.remove(1);

      expect(user.estado).toBe(false);
      expect(result.estado).toBe(false);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    create: jest.fn(),
    refresh_token: jest.fn(),
    requestPasswordChange: jest.fn(),
    confirmCode: jest.fn(),
    confirmPasswordChange: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call service.login', async () => {
      const dto = { email: 't@t.com', password: '123' };
      mockAuthService.login.mockResolvedValue({ access_token: 'abc' });
      
      const result = await controller.login(dto as any);
      
      expect(service.login).toHaveBeenCalledWith(dto.email, dto.password);
      expect(result).toHaveProperty('access_token');
    });
  });

  describe('requestPasswordChange', () => {
    it('should call service.requestPasswordChange', async () => {
      const dto = { email: 'test@test.com' };
      await controller.requestPasswordChange(dto);
      expect(service.requestPasswordChange).toHaveBeenCalledWith(dto.email);
    });
  });
});

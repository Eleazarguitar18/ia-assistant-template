import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as fs from 'fs';
import handlebars from 'handlebars';

jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: { send: jest.fn().mockResolvedValue({ data: { id: '123' } }) },
    })),
  };
});

jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue('<html>{{name}}</html>'),
}));

describe('MailService', () => {
  let service: MailService;
  let resendMock: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test_key') },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    resendMock = (service as any).resend;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendWelcome', () => {
    it('should compile template and send email via Resend', async () => {
      await service.sendWelcome('test@test.com', 'User');

      expect(fs.readFileSync).toHaveBeenCalled();
      expect(resendMock.emails.send).toHaveBeenCalledWith(expect.objectContaining({
        to: 'test@test.com',
        subject: expect.stringContaining('¡Bienvenido'),
      }));
    });
  });

  describe('sendCode', () => {
    it('should send verification code', async () => {
      await service.sendCode('test@test.com', 'User', '123456');
      expect(resendMock.emails.send).toHaveBeenCalled();
    });
  });
});

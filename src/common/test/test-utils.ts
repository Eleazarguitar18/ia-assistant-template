import { Repository, ObjectLiteral } from 'typeorm';

export type MockRepository<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

export const createMockRepository = <T extends ObjectLiteral = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  merge: jest.fn(),
  preload: jest.fn(),
  count: jest.fn(),
  query: jest.fn(),
  // Add other methods as needed
});

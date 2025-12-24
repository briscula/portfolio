import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    createOrUpdateFromAuth0: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call createOrUpdateFromAuth0 on usersService', async () => {
    const auth0User = { sub: 'auth0|123', email: 'test@example.com', name: 'Test User' };
    const expectedUser = { id: '1', email: 'test@example.com', name: 'Test User' };

    mockUsersService.createOrUpdateFromAuth0.mockResolvedValue(expectedUser);

    const result = await service.createOrUpdateUserFromAuth0(auth0User);

    expect(mockUsersService.createOrUpdateFromAuth0).toHaveBeenCalledWith(auth0User);
    expect(result).toEqual(expectedUser);
  });
});

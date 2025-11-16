import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async createOrUpdateUserFromAuth0(auth0User: {
    sub: string;
    email: string;
    name?: string;
  }) {
    return this.usersService.createOrUpdateFromAuth0(auth0User);
  }
}

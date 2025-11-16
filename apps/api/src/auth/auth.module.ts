import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Auth0JwtStrategy } from './auth0-jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'auth0-jwt' }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'fallback-secret-for-email-password',
      signOptions: { expiresIn: '24h' }, // 24 hours for email/password tokens
    }),
  ],
  controllers: [],
  providers: [AuthService, Auth0JwtStrategy],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { UsersService } from '../users/users.service';

@Injectable()
export class Auth0JwtStrategy extends PassportStrategy(Strategy, 'auth0-jwt') {
  private readonly logger = new Logger(Auth0JwtStrategy.name);

  constructor(private usersService: UsersService) {
    const domain = process.env.AUTH0_DOMAIN;
    const audience = process.env.AUTH0_AUDIENCE;

    // Call super first to satisfy TypeScript requirements
    super(
      !domain || !audience
        ? {
            secretOrKeyProvider: () => 'placeholder-secret',
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            audience: 'placeholder-audience',
            issuer: 'placeholder-issuer',
            algorithms: ['RS256'],
          }
        : {
            secretOrKeyProvider: passportJwtSecret({
              cache: true,
              rateLimit: true,
              jwksRequestsPerMinute: 5,
              jwksUri: `https://${domain}/.well-known/jwks.json`,
            }),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            audience: audience,
            issuer: `https://${domain}/`,
            algorithms: ['RS256'],
          },
    );

    // Now we can use this.logger
    if (!domain || !audience) {
      this.logger.warn(
        'Auth0 environment variables not configured. Please set AUTH0_DOMAIN and AUTH0_AUDIENCE in your .env file.',
      );
      return;
    }

    this.logger.debug('Auth0 Strategy Config', { domain, audience });
    this.logger.log(
      'Auth0 Strategy initialized with JWKS URL',
      `https://${domain}/.well-known/jwks.json`,
    );
  }

  async validate(payload: any): Promise<any> {
    // this.logger.debug('JWT Validation - Payload received', {
    //   sub: payload.sub,
    //   aud: payload.aud,
    //   iss: payload.iss,
    //   exp: payload.exp,
    //   iat: payload.iat,
    // });

    if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE) {
      this.logger.error(
        'Auth0 environment variables missing during validation',
      );
      throw new UnauthorizedException(
        'Auth0 is not properly configured. Please set AUTH0_DOMAIN and AUTH0_AUDIENCE environment variables.',
      );
    }

    // Find user by Auth0 provider sub
    const user = await this.usersService.findByAuth0ProviderSub(payload.sub);

    if (!user) {
      this.logger.error('User not found for sub', payload.sub);
      throw new UnauthorizedException('User not found');
    }

    // Update last used timestamp
    await this.usersService.updateAuth0LastUsed(payload.sub);

    // this.logger.debug('JWT validation successful for user', {
    //   userId: user.id,
    //   sub: payload.sub,
    //   provider: 'AUTH0'
    // });

    return {
      userId: user.id,
      email: user.email,
      type: 'USER',
      provider: 'AUTH0',
      providerSub: payload.sub,
      scopes: payload.scope?.split(' ') || [],
      ...payload,
    };
  }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var Auth0JwtStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth0JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const jwks_rsa_1 = require("jwks-rsa");
const users_service_1 = require("../users/users.service");
let Auth0JwtStrategy = Auth0JwtStrategy_1 = class Auth0JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'auth0-jwt') {
    constructor(usersService) {
        const domain = process.env.AUTH0_DOMAIN;
        const audience = process.env.AUTH0_AUDIENCE;
        super(!domain || !audience
            ? {
                secretOrKeyProvider: () => 'placeholder-secret',
                jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
                audience: 'placeholder-audience',
                issuer: 'placeholder-issuer',
                algorithms: ['RS256'],
            }
            : {
                secretOrKeyProvider: (0, jwks_rsa_1.passportJwtSecret)({
                    cache: true,
                    rateLimit: true,
                    jwksRequestsPerMinute: 5,
                    jwksUri: `https://${domain}/.well-known/jwks.json`,
                }),
                jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
                audience: audience,
                issuer: `https://${domain}/`,
                algorithms: ['RS256'],
            });
        this.usersService = usersService;
        this.logger = new common_1.Logger(Auth0JwtStrategy_1.name);
        if (!domain || !audience) {
            this.logger.warn('Auth0 environment variables not configured. Please set AUTH0_DOMAIN and AUTH0_AUDIENCE in your .env file.');
            return;
        }
        this.logger.debug('Auth0 Strategy Config', { domain, audience });
        this.logger.log('Auth0 Strategy initialized with JWKS URL', `https://${domain}/.well-known/jwks.json`);
    }
    async validate(payload) {
        if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE) {
            this.logger.error('Auth0 environment variables missing during validation');
            throw new common_1.UnauthorizedException('Auth0 is not properly configured. Please set AUTH0_DOMAIN and AUTH0_AUDIENCE environment variables.');
        }
        const user = await this.usersService.findByAuth0ProviderSub(payload.sub);
        if (!user) {
            this.logger.error('User not found for sub', payload.sub);
            throw new common_1.UnauthorizedException('User not found');
        }
        await this.usersService.updateAuth0LastUsed(payload.sub);
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
};
exports.Auth0JwtStrategy = Auth0JwtStrategy;
exports.Auth0JwtStrategy = Auth0JwtStrategy = Auth0JwtStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], Auth0JwtStrategy);
//# sourceMappingURL=auth0-jwt.strategy.js.map
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOne(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                authAccounts: {
                    where: { isActive: true },
                },
            },
        });
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: {
                authAccounts: {
                    where: { isActive: true },
                },
            },
        });
    }
    async findByAuth0Sub(sub) {
        return this.findByAuth0ProviderSub(sub);
    }
    async findByProviderSub(providerSub) {
        return this.prisma.user.findFirst({
            where: {
                authAccounts: {
                    some: {
                        providerSub: providerSub,
                        isActive: true,
                    },
                },
            },
            include: {
                authAccounts: {
                    where: {
                        providerSub: providerSub,
                        isActive: true,
                    },
                },
            },
        });
    }
    async findByAuth0ProviderSub(providerSub) {
        return this.prisma.user.findFirst({
            where: {
                authAccounts: {
                    some: {
                        provider: 'AUTH0',
                        providerSub: providerSub,
                        isActive: true,
                    },
                },
            },
            include: {
                authAccounts: {
                    where: {
                        provider: 'AUTH0',
                        providerSub: providerSub,
                        isActive: true,
                    },
                },
            },
        });
    }
    async create(userData) {
        const existingUser = await this.findByEmail(userData.email);
        if (existingUser) {
            throw new common_1.ConflictException('User already exists');
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        return this.prisma.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
            },
        });
    }
    async createOrUpdateAuth0Account(userId, providerSub, providerEmail) {
        return this.prisma.userAuthAccount.upsert({
            where: {
                provider_providerSub: {
                    provider: 'AUTH0',
                    providerSub,
                },
            },
            update: {
                userId,
                providerEmail,
                isActive: true,
                updatedAt: new Date(),
            },
            create: {
                userId,
                provider: 'AUTH0',
                providerSub,
                providerEmail,
                isActive: true,
            },
        });
    }
    async updateAuth0LastUsed(providerSub) {
        await this.prisma.userAuthAccount.updateMany({
            where: {
                provider: 'AUTH0',
                providerSub,
            },
            data: {
                lastUsedAt: new Date(),
            },
        });
    }
    async createOrUpdateFromAuth0(auth0User) {
        const existingUser = await this.findByAuth0ProviderSub(auth0User.sub);
        if (existingUser) {
            const updatedUser = await this.prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    email: auth0User.email,
                    name: auth0User.name || auth0User.email.split('@')[0],
                },
            });
            await this.createOrUpdateAuth0Account(existingUser.id, auth0User.sub, auth0User.email);
            return updatedUser;
        }
        else {
            const userByEmail = await this.findByEmail(auth0User.email);
            if (userByEmail) {
                await this.createOrUpdateAuth0Account(userByEmail.id, auth0User.sub, auth0User.email);
                return userByEmail;
            }
            else {
                const newUser = await this.prisma.user.create({
                    data: {
                        email: auth0User.email,
                        name: auth0User.name || auth0User.email.split('@')[0],
                        password: '',
                    },
                });
                await this.createOrUpdateAuth0Account(newUser.id, auth0User.sub, auth0User.email);
                return newUser;
            }
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map
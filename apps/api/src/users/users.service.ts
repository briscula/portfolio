import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthProvider, User } from '@repo/database';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        authAccounts: {
          where: { isActive: true },
        },
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        authAccounts: {
          where: { isActive: true },
        },
      },
    });
  }

  // Legacy method for backward compatibility - now uses auth accounts
  async findByAuth0Sub(sub: string) {
    return this.findByAuth0ProviderSub(sub);
  }

  // New generic method to find user by any provider sub
  async findByProviderSub(providerSub: string) {
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

  // Find user by Auth0 sub
  async findByAuth0ProviderSub(providerSub: string) {
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

  // Create new user with email/password
  async create(userData: { name: string; email: string; password: string }): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    return this.prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      },
    });
  }

  // Create or update Auth0 account
  async createOrUpdateAuth0Account(
    userId: string,
    providerSub: string,
    providerEmail?: string,
  ) {
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

  // Update last used timestamp for Auth0
  async updateAuth0LastUsed(providerSub: string) {
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

  // Create or update user from Auth0
  async createOrUpdateFromAuth0(auth0User: {
    sub: string;
    email: string;
    name?: string;
  }) {
    // First try to find existing user by Auth0 sub
    const existingUser = await this.findByAuth0ProviderSub(auth0User.sub);

    if (existingUser) {
      // Update existing user
      const updatedUser = await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          email: auth0User.email,
          name: auth0User.name || auth0User.email.split('@')[0],
        },
      });

      // Update auth account
      await this.createOrUpdateAuth0Account(
        existingUser.id,
        auth0User.sub,
        auth0User.email,
      );

      return updatedUser;
    } else {
      // Check if user exists by email
      const userByEmail = await this.findByEmail(auth0User.email);

      if (userByEmail) {
        // Link Auth0 account to existing user
        await this.createOrUpdateAuth0Account(
          userByEmail.id,
          auth0User.sub,
          auth0User.email,
        );
        return userByEmail;
      } else {
        // Create new user
        const newUser = await this.prisma.user.create({
          data: {
            email: auth0User.email,
            name: auth0User.name || auth0User.email.split('@')[0],
            password: '', // Auth0 handles authentication
          },
        });

        // Create auth account
        await this.createOrUpdateAuth0Account(
          newUser.id,
          auth0User.sub,
          auth0User.email,
        );

        return newUser;
      }
    }
  }
}

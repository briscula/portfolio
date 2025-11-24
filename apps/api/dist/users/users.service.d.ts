import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(id: string): Promise<{
        authAccounts: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            provider: import("@repo/database").$Enums.AuthProvider;
            providerSub: string;
            providerEmail: string | null;
            isActive: boolean;
            lastUsedAt: Date | null;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
    }>;
    findByEmail(email: string): Promise<{
        authAccounts: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            provider: import("@repo/database").$Enums.AuthProvider;
            providerSub: string;
            providerEmail: string | null;
            isActive: boolean;
            lastUsedAt: Date | null;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
    }>;
    findByAuth0Sub(sub: string): Promise<{
        authAccounts: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            provider: import("@repo/database").$Enums.AuthProvider;
            providerSub: string;
            providerEmail: string | null;
            isActive: boolean;
            lastUsedAt: Date | null;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
    }>;
    findByProviderSub(providerSub: string): Promise<{
        authAccounts: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            provider: import("@repo/database").$Enums.AuthProvider;
            providerSub: string;
            providerEmail: string | null;
            isActive: boolean;
            lastUsedAt: Date | null;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
    }>;
    findByAuth0ProviderSub(providerSub: string): Promise<{
        authAccounts: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            provider: import("@repo/database").$Enums.AuthProvider;
            providerSub: string;
            providerEmail: string | null;
            isActive: boolean;
            lastUsedAt: Date | null;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
    }>;
    create(userData: {
        name: string;
        email: string;
        password: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
    }>;
    createOrUpdateAuth0Account(userId: string, providerSub: string, providerEmail?: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        provider: import("@repo/database").$Enums.AuthProvider;
        providerSub: string;
        providerEmail: string | null;
        isActive: boolean;
        lastUsedAt: Date | null;
    }>;
    updateAuth0LastUsed(providerSub: string): Promise<void>;
    createOrUpdateFromAuth0(auth0User: {
        sub: string;
        email: string;
        name?: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
    }>;
}

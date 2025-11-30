# Authentication Architecture Documentation

## Overview

This document describes the multi-provider authentication system implemented in the Portfolio API. The system supports both traditional email/password authentication and Auth0 OAuth authentication through a unified authentication guard.

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│                 │    │                 │    │                 │
│ Auth0 Login ────┼────┼─► Auth0 JWT ────┼────┼─► UserAuthAccount│
│                 │    │                 │    │                 │
│ Email/Password ─┼────┼─► Local JWT ────┼────┼─► User Table    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ UnifiedAuthGuard│
                    │                 │
                    │ • Auth0 JWT     │
                    │ • Local JWT     │
                    │ • User Lookup   │
                    └─────────────────┘
```

## Authentication Methods

### 1. Email/Password Authentication (Traditional)

**Flow:**
```
User → [email/password] → Your Backend → [validate] → [create JWT] → User
```

**Endpoints:**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

**Process:**
1. User provides email and password
2. Backend validates credentials against database
3. Backend creates and signs JWT token
4. JWT token returned to user
5. User includes JWT in Authorization header for protected routes

**Example Request:**
```json
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Example Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Auth0 OAuth Authentication

**Flow:**
```
User → Auth0 → [OAuth] → Auth0 → [JWT] → Your Backend → [validate JWT] → User
```

**Endpoints:**
- `POST /auth/auth0/callback` - Auth0 user creation/update

**Process:**
1. Frontend redirects user to Auth0 login page
2. User authenticates with Auth0
3. Auth0 returns JWT token to frontend
4. Frontend sends JWT to backend
5. Backend validates JWT using Auth0's public keys (JWKS)
6. Backend creates/updates user in database

**Example Request:**
```json
POST /auth/auth0/callback
{
  "sub": "auth0|user123",
  "email": "user@example.com",
  "name": "John Doe"
}
```

## Database Schema

### User Table
```sql
CREATE TABLE "user" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255),
  "email" VARCHAR(255) UNIQUE,
  "password" VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP
);
```

### UserAuthAccount Table
```sql
CREATE TABLE "user_auth_account" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES "user"("id"),
  "provider" "AuthProvider", -- AUTH0 or EMAIL_PASSWORD
  "providerSub" VARCHAR(255),
  "providerEmail" VARCHAR(255),
  "isActive" BOOLEAN DEFAULT true,
  "lastUsedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP,
  UNIQUE("provider", "providerSub")
);
```

### AuthProvider Enum
```sql
CREATE TYPE "AuthProvider" AS ENUM ('AUTH0', 'EMAIL_PASSWORD');
```

## Unified Authentication Guard

The `UnifiedAuthGuard` handles both authentication methods seamlessly:

### Implementation
```typescript
@Injectable()
export class UnifiedAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const token = this.extractTokenFromHeader(request);
    
    try {
      // First try Auth0 validation
      const auth0Guard = new (AuthGuard('auth0-jwt'))();
      const result = await auth0Guard.canActivate(context);
      return result === true;
    } catch (auth0Error) {
      // Fallback to local JWT validation
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET
      });
      
      request['user'] = {
        userId: parseInt(payload.sub),
        email: payload.email,
        type: 'USER',
        provider: 'EMAIL_PASSWORD',
        providerSub: payload.sub,
        scopes: [],
        ...payload,
      };
      
      return true;
    }
  }
}
```

### User Object Structure
Both authentication methods return a consistent user object:

```typescript
interface User {
  userId: number;
  email: string;
  type: 'USER';
  provider: 'AUTH0' | 'EMAIL_PASSWORD';
  providerSub: string;
  scopes: string[];
  // Additional JWT payload fields
}
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/auth/register` | User registration | None |
| POST | `/auth/login` | Email/password login | None |
| POST | `/auth/auth0/callback` | Auth0 user creation | None |
| GET | `/auth/profile` | Get user profile | Required |
| POST | `/auth/logout` | User logout | Required |

### Protected Endpoints

All endpoints below require authentication via `Authorization: Bearer <token>` header:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/portfolios` | Get user portfolios |
| POST | `/portfolios` | Create portfolio |
| GET | `/portfolios/:id` | Get specific portfolio |
| PATCH | `/portfolios/:id` | Update portfolio |
| DELETE | `/portfolios/:id` | Delete portfolio |
| GET | `/transactions` | Get user transactions |
| POST | `/transactions` | Create transaction |
| GET | `/transactions/:id` | Get specific transaction |
| PATCH | `/transactions/:id` | Update transaction |
| DELETE | `/transactions/:id` | Delete transaction |
| GET | `/dividend-analytics/company-summaries` | Get dividend summaries |
| GET | `/dividend-analytics/monthly-overview` | Get monthly overview |

## Security Features

### JWT Token Validation
- **Auth0 Tokens**: Validated using JWKS (JSON Web Key Set) from Auth0
- **Local Tokens**: Validated using application secret
- **Expiration**: Tokens have configurable expiration times

### Password Security
- **Hashing**: Passwords are hashed using bcrypt
- **Salt Rounds**: 10 rounds for secure hashing

### User Data Protection
- **Email Uniqueness**: Enforced at database level
- **Provider Isolation**: Each auth provider has separate sub identifiers
- **Account Linking**: Same email can be linked across providers

## Environment Variables

Required environment variables:

```bash
# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://your-api.com

# JWT Configuration
JWT_SECRET=your-jwt-secret-key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio
```

## Error Handling

### Authentication Errors
- **401 Unauthorized**: Invalid or missing token
- **409 Conflict**: User already exists during registration
- **400 Bad Request**: Invalid request data

### Common Error Responses
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

```json
{
  "message": "User already exists",
  "error": "Conflict",
  "statusCode": 409
}
```

## Testing

### Test Authentication Flow
```bash
# 1. Register user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "password123"}'

# 2. Login user
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# 3. Use token for protected endpoint
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer <token>"
```

## Future Enhancements

### Planned Features
- [ ] Rate limiting for authentication endpoints
- [ ] Token refresh mechanism
- [ ] Admin/user role system
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Account linking UI
- [ ] Additional OAuth providers (Google, GitHub, etc.)

### Security Improvements
- [ ] Two-factor authentication
- [ ] Session management
- [ ] Audit logging
- [ ] IP-based restrictions

## Troubleshooting

### Common Issues

1. **"Unauthorized" errors**
   - Check if token is included in Authorization header
   - Verify token format: `Bearer <token>`
   - Ensure token hasn't expired

2. **Auth0 validation failures**
   - Verify AUTH0_DOMAIN and AUTH0_AUDIENCE environment variables
   - Check Auth0 application configuration
   - Ensure JWKS endpoint is accessible

3. **Database connection issues**
   - Verify DATABASE_URL environment variable
   - Check database server status
   - Ensure Prisma migrations are applied

### Debug Mode
Enable debug logging by setting log level to debug in your environment configuration.

## Contributing

When adding new authentication features:

1. Update this documentation
2. Add appropriate tests
3. Update the UnifiedAuthGuard if needed
4. Consider backward compatibility
5. Update environment variable documentation

---

*Last updated: September 6, 2025*

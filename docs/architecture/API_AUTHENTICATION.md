# Authentication Architecture

Multi-provider authentication supporting Auth0 OAuth and email/password.

## Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Frontend   │    │   Backend   │    │  Database   │
│             │    │             │    │             │
│ Auth0 ──────┼────┼─► Auth0 JWT─┼────┼─► UserAuth  │
│ Email/Pass ─┼────┼─► Local JWT─┼────┼─► User      │
└─────────────┘    └─────────────┘    └─────────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ UnifiedAuthGuard│
                 │ • Auth0 JWT     │
                 │ • Local JWT     │
                 └─────────────────┘
```

## Authentication Methods

### Auth0 (Primary)

1. Frontend redirects to Auth0 login
2. Auth0 returns JWT to frontend
3. Frontend includes JWT in `Authorization: Bearer <token>` header
4. Backend validates JWT using Auth0's JWKS

### Email/Password (Fallback)

1. User registers via `POST /auth/register`
2. User logs in via `POST /auth/login`
3. Backend returns signed JWT
4. Same header format: `Authorization: Bearer <token>`

## UnifiedAuthGuard

Handles both auth methods seamlessly:

```typescript
@Injectable()
export class UnifiedAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const token = this.extractTokenFromHeader(request);

    try {
      // Try Auth0 first
      const auth0Guard = new (AuthGuard("auth0-jwt"))();
      return (await auth0Guard.canActivate(context)) === true;
    } catch {
      // Fallback to local JWT
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      request["user"] = { userId: payload.sub, ...payload };
      return true;
    }
  }
}
```

## User Object

Both methods return consistent user object:

```typescript
interface User {
  userId: string; // UUID
  email: string;
  provider: "AUTH0" | "EMAIL_PASSWORD";
  providerSub: string;
}
```

## Environment Variables

```bash
# Auth0
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://your-api.com

# Local JWT
JWT_SECRET=your-jwt-secret-key
```

## Endpoints

| Method | Endpoint               | Auth Required |
| ------ | ---------------------- | ------------- |
| POST   | `/auth/register`       | No            |
| POST   | `/auth/login`          | No            |
| POST   | `/auth/auth0/callback` | No            |
| GET    | `/auth/profile`        | Yes           |

All other endpoints require authentication. See Swagger at `/api`.

## Database

Uses `UserAuthAccount` table to link providers to users. See [database-schema.md](./database-schema.md) for details.

---

**Last Updated**: 2025-12-26

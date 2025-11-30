# Project Structure

## Directory Organization

```
dividend-portfolio/
├── src/app/                    # Next.js App Router directory
│   ├── api/auth/[...auth0]/   # Auth0 API route handler
│   ├── login/                 # Login page route
│   ├── layout.tsx             # Root layout with UserProvider
│   ├── page.tsx               # Home page with auth status
│   ├── globals.css            # Global styles
│   └── favicon.ico            # App icon
├── public/                    # Static assets
├── .kiro/                     # Kiro configuration and steering
└── [config files]            # Root configuration files
```

## Key Architectural Patterns

### Authentication Flow
- **Root Layout**: Wraps entire app with Auth0 `UserProvider`
- **API Routes**: Auth0 handler at `/api/auth/[...auth0]`
- **Client Components**: Use `'use client'` directive for Auth0 hooks
- **Protected Routes**: Check user state with `useUser()` hook

### Component Patterns
- **Client-side Auth**: All auth-related components use `'use client'`
- **Loading States**: Consistent spinner pattern for auth loading
- **Conditional Rendering**: Show different UI based on auth status
- **Navigation**: Auth-aware navigation with login/logout buttons

### Styling Conventions
- **Tailwind Classes**: Utility-first approach with consistent spacing
- **Color Palette**: Indigo primary, gray neutrals, red for logout
- **Responsive Design**: Mobile-first with `sm:`, `lg:` breakpoints
- **Component Structure**: Container → Content → Actions pattern

### File Naming
- **Pages**: `page.tsx` for route components
- **Layouts**: `layout.tsx` for layout components
- **API Routes**: `route.ts` for API handlers
- **Client Components**: Use `'use client'` directive when needed

### Environment Configuration
- **Auth0 Variables**: Prefixed with `AUTH0_`
- **Local Development**: `.env.local` for sensitive credentials
- **Port Consistency**: All Auth0 URLs must match port 3001

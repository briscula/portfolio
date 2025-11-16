# Technology Stack

## Framework & Runtime
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Node.js** - Runtime environment

## Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **Geist Fonts** - Sans and mono font families
- **PostCSS** - CSS processing

## Authentication
- **Auth0** - Identity and access management
- **@auth0/nextjs-auth0** - Auth0 SDK for Next.js

## Development Tools
- **ESLint 9** - Code linting with Next.js config
- **Turbopack** - Fast bundler for development

## Common Commands

### Development
```bash
npm run dev          # Start development server on port 3001 with Turbopack
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Run ESLint
```

### Package Management
```bash
npm install            # Install dependencies
```

### Environment Setup
- Copy `.env.local` and configure Auth0 credentials
- Generate AUTH0_SECRET: `openssl rand -hex 32`
- Set AUTH0_BASE_URL to match development port (3001)

## Port Configuration
- Development server runs on port **3001** (not default 3000)
- Auth0 callbacks configured for localhost:3001

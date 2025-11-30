# Dividend Portfolio

A Next.js application for tracking dividend investments with Auth0 authentication.

## Features

- 🔐 Auth0 authentication
- 📊 Dividend portfolio tracking
- 🎨 Tailwind CSS styling
- ⚡ Next.js 15 with TypeScript

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Auth0

1. Create an Auth0 account at [auth0.com](https://auth0.com)
2. Create a new application (Regular Web Application)
3. Configure the following settings in your Auth0 dashboard:
   - **Allowed Callback URLs**: `http://localhost:4000/api/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:4000`
   - **Allowed Web Origins**: `http://localhost:4000`

### 3. Environment Variables

Copy the `.env.local` file and update with your Auth0 credentials:

```bash
# Generate a secret key
openssl rand -hex 32
```

Update `.env.local`:
```env
AUTH0_SECRET='your-generated-secret'
AUTH0_BASE_URL='http://localhost:4000'
AUTH0_ISSUER_BASE_URL='https://YOUR_DOMAIN.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:4000](http://localhost:4000) to see the application.

## Authentication Flow

- **Home Page**: Shows login button for unauthenticated users, dashboard for authenticated users
- **Login Page**: `/login` - Auth0 login interface
- **Protected Routes**: Automatically redirect to login if not authenticated
- **Logout**: Available in the navigation bar

## Project Structure

```
src/
├── app/
│   ├── api/auth/[...auth0]/     # Auth0 API routes
│   ├── login/                   # Login page
│   ├── layout.tsx              # Root layout with UserProvider
│   └── page.tsx                # Home page with auth status
├── middleware.ts               # Route protection
└── ...
```

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Auth0
- **Deployment**: Vercel (recommended)

## Deploy on Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Update Auth0 URLs to use your production domain

For more details, check the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
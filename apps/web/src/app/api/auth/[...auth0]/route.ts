import { handleAuth, handleLogin, handleLogout } from '@auth0/nextjs-auth0';

export const GET = async (req: Request, context: { params: Promise<{ auth0: string[] }> }) => {
  const params = await context.params;
  return handleAuth({
    login: handleLogin({
      authorizationParams: {
        response_type: 'code',
        audience: process.env.AUTH0_AUDIENCE,
        scope: 'openid profile email offline_access'
      }
    }),
    logout: handleLogout({
      returnTo: process.env.AUTH0_BASE_URL,
      logoutParams: {
        federated: ''
      }
    })
  })(req, { ...context, params });
};

export const POST = async (req: Request, context: { params: Promise<{ auth0: string[] }> }) => {
  const params = await context.params;
  return handleAuth({
    login: handleLogin({
      authorizationParams: {
        response_type: 'code',
        audience: process.env.AUTH0_AUDIENCE,
        scope: 'openid profile email offline_access'
      }
    }),
    logout: handleLogout({
      returnTo: process.env.AUTH0_BASE_URL,
      logoutParams: {
        federated: ''
      }
    })
  })(req, { ...context, params });
};
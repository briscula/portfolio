// jest.setup.js
process.env.JWT_SECRET = 'a_super_secret_jwt_secret_for_testing_purposes_only';
process.env.AUTH0_DOMAIN = 'test.auth0.com';
process.env.AUTH0_AUDIENCE = 'test-audience';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.FMP_API_KEY = 'test_fmp_api_key';

// Dummy env vars for webEnv schema to pass
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
process.env.AUTH0_SECRET =
  'a_super_secret_auth0_secret_for_testing_purposes_only';
process.env.AUTH0_BASE_URL = 'http://localhost:3001';
process.env.AUTH0_ISSUER_BASE_URL = 'https://test.auth0.com';
process.env.AUTH0_CLIENT_ID = 'test-client-id';
process.env.AUTH0_CLIENT_SECRET = 'test-client-secret';

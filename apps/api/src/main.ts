// Load environment variables first (before any other imports)
import * as dotenv from 'dotenv';
import * as path from 'path';

// Try to load .env from multiple locations (monorepo-friendly)
const envPaths = [
  path.resolve(__dirname, '../.env'), // apps/api/.env
  path.resolve(__dirname, '../../.env'), // apps/.env
  path.resolve(__dirname, '../../../.env'), // monorepo root
  path.resolve(__dirname, '../../../packages/database/.env'), // packages/database/.env
];

for (const envPath of envPaths) {
  dotenv.config({ path: envPath });
}

import { NestFactory, HttpAdapterHost, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  Logger,
  LogLevel,
} from '@nestjs/common';
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: getLogLevels(),
  });

  // Log all incoming requests for debugging
  app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.headers}`, {
      origin: req.headers.origin,
      userAgent: req.headers['user-agent'],
      contentType: req.headers['content-type'],
      authorization: req.headers.authorization ? 'Bearer ***' : 'None',
    });
    next();
  });

  // Helper function to check if origin is allowed
  const isOriginAllowed = (origin: string | undefined): boolean => {
    if (!origin) return true; // Allow requests with no origin

    // Exact matches (local development and production)
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:4200',
      'https://portfolio.mcebox.com',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      return true;
    }

    // Pattern matches for preview/staging deployments
    const allowedPatterns = [
      /^https:\/\/.*\.mcebox\.com$/, // Any subdomain of mcebox.com
      /^https:\/\/.*\.vercel\.app$/, // Vercel preview deployments
    ];

    return allowedPatterns.some((pattern) => pattern.test(origin));
  };

  // Handle CORS preflight requests FIRST
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      console.log('🚀 CORS preflight request detected:', {
        origin: req.headers.origin,
        method: req.method,
        url: req.url,
        headers: {
          'access-control-request-method':
            req.headers['access-control-request-method'],
          'access-control-request-headers':
            req.headers['access-control-request-headers'],
        },
      });

      const origin = req.headers.origin;

      if (isOriginAllowed(origin)) {
        console.log(`✅ CORS preflight allowed for origin: ${origin}`);
        res.header('Access-Control-Allow-Origin', origin);
        res.header(
          'Access-Control-Allow-Methods',
          'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        );
        res.header(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization, Accept',
        );
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Max-Age', '86400'); // 24 hours
        res.status(200).end();
        return;
      } else {
        console.log(`❌ CORS preflight rejected for origin: ${origin}`);
      }
    }
    next();
  });

  // Enable CORS for regular requests
  app.enableCors({
    origin: (origin, callback) => {
      console.log(`🌐 CORS origin check: ${origin}`);

      if (isOriginAllowed(origin)) {
        console.log(`✅ CORS: Origin ${origin} is allowed`);
        return callback(null, true);
      } else {
        console.log(`❌ CORS: Origin ${origin} is not allowed`);
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle('Portfolio API')
    .setDescription(
      'A secure portfolio management API with Auth0 authentication for tracking investments and transactions',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter Auth0 JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching the one in the controller
    )
    .addServer('http://localhost:3000', 'Local development server')
    .addServer('https://portfolio.mcebox.com', 'Production server')
    .addTag('portfolio', 'Portfolio management')
    .addTag('transactions', 'Transaction management')
    .addTag('auth', 'Authentication endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Keep auth token when refreshing
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  const port = process.env.PORT || 3000;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`🚀 Portfolio API is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger UI available at: http://localhost:${port}/api`);
  logger.debug(`🔧 Log level: ${process.env.LOG_LEVEL || 'log'}`);
  logger.debug(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`✨ Monorepo deployment ready`);
}

function getLogLevels(): LogLevel[] {
  const logLevel = process.env.LOG_LEVEL?.toLowerCase() || 'log';
  const environment = process.env.NODE_ENV || 'development';

  // Define log level hierarchy
  const levels: Record<string, LogLevel[]> = {
    error: ['error'],
    warn: ['error', 'warn'],
    log: ['error', 'warn', 'log'],
    debug: ['error', 'warn', 'log', 'debug'],
    verbose: ['error', 'warn', 'log', 'debug', 'verbose'],
  };

  // Default levels based on environment
  if (environment === 'production') {
    return levels[logLevel] || levels.warn;
  } else if (environment === 'test') {
    return levels[logLevel] || levels.error;
  } else {
    // development
    return levels[logLevel] || levels.debug;
  }
}

bootstrap();

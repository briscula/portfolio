"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const path = require("path");
const envPaths = [
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../../../.env'),
    path.resolve(__dirname, '../../../packages/database/.env'),
];
for (const envPath of envPaths) {
    dotenv.config({ path: envPath });
}
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const prisma_client_exception_filter_1 = require("./prisma-client-exception/prisma-client-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: getLogLevels(),
    });
    app.use((req, res, next) => {
        console.log(`Incoming request: ${req.method} ${req.headers}`, {
            origin: req.headers.origin,
            userAgent: req.headers['user-agent'],
            contentType: req.headers['content-type'],
            authorization: req.headers.authorization ? 'Bearer ***' : 'None',
        });
        next();
    });
    const isOriginAllowed = (origin) => {
        if (!origin)
            return true;
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
        const allowedPatterns = [
            /^https:\/\/.*\.mcebox\.com$/,
            /^https:\/\/.*\.vercel\.app$/,
        ];
        return allowedPatterns.some((pattern) => pattern.test(origin));
    };
    app.use((req, res, next) => {
        if (req.method === 'OPTIONS') {
            console.log('🚀 CORS preflight request detected:', {
                origin: req.headers.origin,
                method: req.method,
                url: req.url,
                headers: {
                    'access-control-request-method': req.headers['access-control-request-method'],
                    'access-control-request-headers': req.headers['access-control-request-headers'],
                },
            });
            const origin = req.headers.origin;
            if (isOriginAllowed(origin)) {
                console.log(`✅ CORS preflight allowed for origin: ${origin}`);
                res.header('Access-Control-Allow-Origin', origin);
                res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
                res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
                res.header('Access-Control-Allow-Credentials', 'true');
                res.header('Access-Control-Max-Age', '86400');
                res.status(200).end();
                return;
            }
            else {
                console.log(`❌ CORS preflight rejected for origin: ${origin}`);
            }
        }
        next();
    });
    app.enableCors({
        origin: (origin, callback) => {
            console.log(`🌐 CORS origin check: ${origin}`);
            if (isOriginAllowed(origin)) {
                console.log(`✅ CORS: Origin ${origin} is allowed`);
                return callback(null, true);
            }
            else {
                console.log(`❌ CORS: Origin ${origin} is not allowed`);
                return callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(app.get(core_1.Reflector)));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Portfolio API')
        .setDescription('A secure portfolio management API with Auth0 authentication for tracking investments and transactions')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter Auth0 JWT token',
        in: 'header',
    }, 'JWT-auth')
        .addServer('http://localhost:3000', 'Local development server')
        .addServer('https://portfolio.mcebox.com', 'Production server')
        .addTag('portfolio', 'Portfolio management')
        .addTag('transactions', 'Transaction management')
        .addTag('auth', 'Authentication endpoints')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
    });
    const { httpAdapter } = app.get(core_1.HttpAdapterHost);
    app.useGlobalFilters(new prisma_client_exception_filter_1.PrismaClientExceptionFilter(httpAdapter));
    await app.init();
    const port = process.env.PORT || 3000;
    await app.listen(port);
    const logger = new common_1.Logger('Bootstrap');
    logger.log(`🚀 Portfolio API is running on: http://localhost:${port}`);
    logger.log(`📚 Swagger UI available at: http://localhost:${port}/api`);
    logger.debug(`🔧 Log level: ${process.env.LOG_LEVEL || 'log'}`);
    logger.debug(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`✨ Monorepo deployment ready`);
    return app;
}
function getLogLevels() {
    const logLevel = process.env.LOG_LEVEL?.toLowerCase() || 'log';
    const environment = process.env.NODE_ENV || 'development';
    const levels = {
        error: ['error'],
        warn: ['error', 'warn'],
        log: ['error', 'warn', 'log'],
        debug: ['error', 'warn', 'log', 'debug'],
        verbose: ['error', 'warn', 'log', 'debug', 'verbose'],
    };
    if (environment === 'production') {
        return levels[logLevel] || levels.warn;
    }
    else if (environment === 'test') {
        return levels[logLevel] || levels.error;
    }
    else {
        return levels[logLevel] || levels.debug;
    }
}
if (require.main === module) {
    bootstrap();
}
exports.default = bootstrap;
//# sourceMappingURL=main.js.map
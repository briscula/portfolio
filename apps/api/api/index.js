// Vercel serverless function wrapper for compiled NestJS app
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');

let app;

async function createApp() {
  if (!app) {
    app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    await app.init();
  }
  return app;
}

module.exports = async (req, res) => {
  const nestApp = await createApp();
  const instance = nestApp.getHttpAdapter().getInstance();
  return instance(req, res);
};

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import tracker from 'node-tracker/express';

import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  app.use(
    tracker({
      url: process.env.TRACKER_URL ?? 'https://example.com',
      key: process.env.TRACKER_KEY,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

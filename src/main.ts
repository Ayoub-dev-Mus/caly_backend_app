import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TokenExpiredFilter } from './common/guards/tokenExpireFilter.guard';
import * as admin from 'firebase-admin';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
    exposedHeaders: '*',
  });

  app.useGlobalFilters(new TokenExpiredFilter());

  admin.initializeApp(
    {
      credential: admin.credential.cert('src/config/mykey.json'),
    },
    'caly',
  );

  // app.useWebSocketAdapter(new WsAdapter(app));
  const config = new DocumentBuilder()
    .setTitle('Caly')
    .setDescription('DEV API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('caly', app, document);

  await app.listen(8079);
}
bootstrap();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // makes body payload to be instance of dto object
      whitelist: true, // removes not existing properties
      forbidNonWhitelisted: true, // option to stop from being processed if any non white listed properties are present
    }),
  ); // npm i class-validator class-transformer
  await app.listen(3000);
}
bootstrap();

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger, ValidationPipe } from "@nestjs/common";
import { requestLogger } from "./utils/middlewares/logger.middleware";
import { requestTimer } from "./utils/middlewares/performance.middleware";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;

  app.enableCors();

  app.useLogger(new Logger());

  app.use(requestLogger);
  app.use(requestTimer);

  app.enableShutdownHooks();
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(port);

  console.log(`Listening at http://localhost:${port}`);
}

bootstrap();

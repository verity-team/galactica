import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = 8000;

  app.enableShutdownHooks();

  await app.listen(port);

  console.log(`Listening at http://localhost:${port}`);
}
bootstrap();

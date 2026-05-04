import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Crea la aplicacion principal de NestJS usando AppModule como modulo raiz.
  const app = await NestFactory.create(AppModule);

  // Permite conexiones desde cualquier origen para que el cliente pueda consumir la API y WebSocket.
  app.enableCors({ origin: '*' });

  console.log('🚀 Servidor Connect 4 corriendo en http://localhost:3000');

  // Usa el puerto configurado en variables de entorno o 3000 como valor por defecto.
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

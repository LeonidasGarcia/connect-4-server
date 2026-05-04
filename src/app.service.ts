import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // Respuesta simple usada por el controlador raiz como prueba de salud del servidor.
  getHello(): string {
    return 'Hello World!';
  }
}

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Endpoint HTTP de comprobacion para verificar que el servidor responde.
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export class WebSocketValidationPipe implements PipeTransform {
  // Evita validar tipos nativos que no tienen decoradores de class-validator.
  private typeToValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  async transform(
    value: unknown,
    { metatype }: ArgumentMetadata,
  ): Promise<unknown> {
    // Si no hay DTO o el tipo no requiere validacion, se deja pasar el valor original.
    if (!metatype || !this.typeToValidate(metatype)) {
      return value;
    }

    // Convierte el payload recibido en una instancia del DTO para aplicar sus reglas de validacion.
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    // Devuelve al cliente solo las propiedades y restricciones que fallaron.
    if (errors.length > 0) {
      throw new BadRequestException(
        errors.map((err) => ({
          property: err.property,
          constraints: err.constraints,
        })),
      );
    }

    return object;
  }
}

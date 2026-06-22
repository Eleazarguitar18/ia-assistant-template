import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { Persona } from 'src/persona/entities/persona.entity';
export class CreateUsuarioDto {
  @IsString()
  @IsOptional()
  name?: string;
  @IsNotEmpty()
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
  @IsOptional()
  estado: boolean = true;

  @IsOptional()
  persona?: Persona;
  
  @IsOptional()
  id_role?: number;
}

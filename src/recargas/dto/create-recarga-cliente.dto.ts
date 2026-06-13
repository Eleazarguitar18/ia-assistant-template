import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OperadoraNombre } from '../entities/operadora-saldo.entity';

export class CreateRecargaClienteDto {
  @ApiProperty({ enum: OperadoraNombre, example: OperadoraNombre.TIGO })
  @IsEnum(OperadoraNombre)
  @IsNotEmpty()
  operadora: OperadoraNombre;

  @ApiProperty({ example: '78945612' })
  @IsString()
  @IsNotEmpty()
  numero_cliente: string;

  @ApiProperty({ example: 10.50 })
  @IsNumber()
  @Min(0.1)
  @IsNotEmpty()
  monto: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id_caja_sesion: number;
}

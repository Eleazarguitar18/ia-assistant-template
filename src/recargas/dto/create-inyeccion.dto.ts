import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OperadoraNombre } from '../entities/operadora-saldo.entity';

export class CreateInyeccionDto {
  @ApiProperty({ enum: OperadoraNombre, example: OperadoraNombre.TIGO })
  @IsEnum(OperadoraNombre)
  @IsNotEmpty()
  operadora_destino: OperadoraNombre;

  @ApiProperty({ example: 100.00 })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  monto: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id_caja_sesion: number;
}

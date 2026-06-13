import { Controller, Get, Post, Body } from '@nestjs/common';
import { RecargasService } from '../services/recargas.service';
import { CreateRecargaClienteDto } from '../dto/create-recarga-cliente.dto';
import { CreateInyeccionDto } from '../dto/create-inyeccion.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('recargas')
@Controller('recargas')
export class RecargasController {
  constructor(private readonly recargasService: RecargasService) {}

  @Post('cliente')
  recargaCliente(@Body() createDto: CreateRecargaClienteDto) {
    return this.recargasService.recargaCliente(createDto);
  }

  @Post('inyeccion')
  inyeccionOperadora(@Body() createDto: CreateInyeccionDto) {
    return this.recargasService.inyeccionOperadora(createDto);
  }

  @Get('operadoras/saldos')
  findAllSaldos() {
    return this.recargasService.findAllSaldos();
  }

  @Get('historial/clientes')
  findAllRecargasClientes() {
    return this.recargasService.findAllRecargasClientes();
  }

  @Get('historial/inyecciones')
  findAllInyecciones() {
    return this.recargasService.findAllInyecciones();
  }
}

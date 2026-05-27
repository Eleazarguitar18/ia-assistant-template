import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CrearCategoriaDto } from '../dto/crear-categoria.dto';
import { ActualizarCategoriaDto } from '../dto/actualizar-categoria.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('inventario/categorias')
@Controller('inventario/categorias')
export class CategoriasController {
  constructor(private readonly categoriaService: CategoriaService) { }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva categoría' })
  create(@Body() crearCategoriaDto: CrearCategoriaDto) {
    return this.categoriaService.createCategoria(crearCategoriaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las categorías' })
  findAll() {
    return this.categoriaService.findAllCategorias();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  findOne(@Param('id') id: string) {
    return this.categoriaService.findOneCategoria(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una categoría' })
  update(
    @Param('id') id: string,
    @Body() actualizarCategoriaDto: ActualizarCategoriaDto,
  ) {
    console.log(actualizarCategoriaDto);

    return this.categoriaService.updateCategoria(+id, actualizarCategoriaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una categoría' })
  remove(@Param('id') id: string) {
    return this.categoriaService.removeCategoria(+id);
  }
}

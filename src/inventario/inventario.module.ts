import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioService } from './inventario.service';
import { InventarioController } from './inventario.controller';
import { Producto } from './entities/producto.entity';
import { Categoria } from './entities/categoria.entity';
import { CategoriaModule } from './categoria/categoria.module';
import { ProductoModule } from './producto/producto.module';

@Module({
  imports: [
    CategoriaModule,
    TypeOrmModule.forFeature([Producto, Categoria]),
    ProductoModule],
  controllers: [InventarioController],
  providers: [InventarioService],
  exports: [InventarioService, CategoriaModule, ProductoModule],
})
export class InventarioModule { }

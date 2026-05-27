import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from '../entities/producto.entity';
import { ProductoController } from './producto.controller';
import { ProductoService } from './producto.service';
import { Categoria } from '../entities/categoria.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Producto, Categoria])],
    controllers: [ProductoController],
    providers: [ProductoService],
})
export class ProductoModule { }

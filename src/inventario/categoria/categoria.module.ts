import { TypeOrmModule } from "@nestjs/typeorm";
import { Categoria } from "../entities/categoria.entity";
import { CategoriasController } from "./categoria.controller";
import { CategoriaService } from "./categoria.service";
import { Module } from "@nestjs/common";
import { AppGateway } from "src/gateway/app.gateway";

// src/inventario/categorias/categorias.module.ts
@Module({
    imports: [TypeOrmModule.forFeature([Categoria])],
    controllers: [CategoriasController],
    providers: [CategoriaService, AppGateway],
})
export class CategoriaModule { }
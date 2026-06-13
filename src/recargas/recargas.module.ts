import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecargasService } from './services/recargas.service';
import { RecargasController } from './controllers/recargas.controller';
import { OperadoraSaldo } from './entities/operadora-saldo.entity';
import { RecargaCliente } from './entities/recarga-cliente.entity';
import { InyeccionOperadora } from './entities/inyeccion-operadora.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OperadoraSaldo,
      RecargaCliente,
      InyeccionOperadora,
    ])
  ],
  controllers: [RecargasController],
  providers: [RecargasService],
  exports: [RecargasService],
})
export class RecargasModule {}

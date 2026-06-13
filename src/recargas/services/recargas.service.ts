import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OperadoraSaldo } from '../entities/operadora-saldo.entity';
import { RecargaCliente } from '../entities/recarga-cliente.entity';
import { InyeccionOperadora } from '../entities/inyeccion-operadora.entity';
import { CreateRecargaClienteDto } from '../dto/create-recarga-cliente.dto';
import { CreateInyeccionDto } from '../dto/create-inyeccion.dto';
import { SesionCaja } from 'src/cajas/entities/sesion-caja.entity';
import { MovimientoCaja } from 'src/cajas/entities/movimiento-caja.entity';

@Injectable()
export class RecargasService {
  constructor(
    @InjectRepository(OperadoraSaldo)
    private readonly operadoraSaldoRepo: Repository<OperadoraSaldo>,
    @InjectRepository(RecargaCliente)
    private readonly recargaClienteRepo: Repository<RecargaCliente>,
    @InjectRepository(InyeccionOperadora)
    private readonly inyeccionRepo: Repository<InyeccionOperadora>,
    private readonly dataSource: DataSource,
  ) {}

  async findAllSaldos() {
    return this.operadoraSaldoRepo.find({ where: { estado: true } });
  }

  async findAllRecargasClientes() {
    return this.recargaClienteRepo.find({
      where: { estado: true },
      relations: ['caja_sesion'],
      order: { fecha_hora: 'DESC' },
    });
  }

  async findAllInyecciones() {
    return this.inyeccionRepo.find({
      where: { estado: true },
      relations: ['caja_origen'],
      order: { fecha_hora: 'DESC' },
    });
  }

  async recargaCliente(dto: CreateRecargaClienteDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar Sesión Caja
      const sesion = await queryRunner.manager.findOne(SesionCaja, {
        where: { id: dto.id_caja_sesion, estado: true, estado_sesion: 'ABIERTA' }
      });
      if (!sesion) {
        throw new BadRequestException('La sesión de caja no existe o no está ABIERTA.');
      }

      // 2. Validar Saldo de Operadora
      const operadora = await queryRunner.manager.findOne(OperadoraSaldo, {
        where: { nombre_operadora: dto.operadora, estado: true },
        lock: { mode: 'pessimistic_write' }
      });

      if (!operadora) {
        throw new NotFoundException(`La operadora ${dto.operadora} no está registrada.`);
      }

      if (Number(operadora.saldo_actual) < dto.monto) {
        throw new BadRequestException(`Saldo insuficiente para la operadora ${dto.operadora}. Saldo actual: ${operadora.saldo_actual}`);
      }

      // 3. Reducir saldo
      operadora.saldo_actual = Number(operadora.saldo_actual) - dto.monto;
      await queryRunner.manager.save(operadora);

      // 4. Registrar RecargaCliente
      const recarga = this.recargaClienteRepo.create({
        operadora: dto.operadora,
        numero_cliente: dto.numero_cliente,
        monto: dto.monto,
        id_caja_sesion: dto.id_caja_sesion,
        id_user_create: sesion.id_usuario
      });
      const savedRecarga = await queryRunner.manager.save(recarga);

      // 5. Crear Movimiento de Caja INGRESO
      const movimiento = new MovimientoCaja();
      movimiento.tipo = 'INGRESO';
      movimiento.monto = dto.monto;
      movimiento.motivo = `Venta de recarga a cliente ${dto.numero_cliente} (${dto.operadora})`;
      movimiento.id_sesion_caja = dto.id_caja_sesion;
      movimiento.id_user_create = sesion.id_usuario;
      await queryRunner.manager.save(movimiento);

      await queryRunner.commitTransaction();
      return savedRecarga;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async inyeccionOperadora(dto: CreateInyeccionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar Sesión Caja
      const sesion = await queryRunner.manager.findOne(SesionCaja, {
        where: { id: dto.id_caja_sesion, estado: true, estado_sesion: 'ABIERTA' }
      });
      if (!sesion) {
        throw new BadRequestException('La sesión de caja no existe o no está ABIERTA.');
      }

      // 2. Obtener Operadora
      let operadora = await queryRunner.manager.findOne(OperadoraSaldo, {
        where: { nombre_operadora: dto.operadora_destino, estado: true },
        lock: { mode: 'pessimistic_write' }
      });

      if (!operadora) {
        operadora = this.operadoraSaldoRepo.create({
          nombre_operadora: dto.operadora_destino,
          saldo_actual: 0
        });
      }

      // 3. Incrementar saldo
      operadora.saldo_actual = Number(operadora.saldo_actual) + dto.monto;
      await queryRunner.manager.save(operadora);

      // 4. Registrar InyeccionOperadora
      const inyeccion = this.inyeccionRepo.create({
        operadora_destino: dto.operadora_destino,
        monto: dto.monto,
        id_caja_origen: dto.id_caja_sesion,
        id_user_create: sesion.id_usuario
      });
      const savedInyeccion = await queryRunner.manager.save(inyeccion);

      // 5. Crear Movimiento de Caja EGRESO
      const movimiento = new MovimientoCaja();
      movimiento.tipo = 'EGRESO';
      movimiento.monto = dto.monto;
      movimiento.motivo = `Fondeo de saldo a operadora ${dto.operadora_destino}`;
      movimiento.id_sesion_caja = dto.id_caja_sesion;
      movimiento.id_user_create = sesion.id_usuario;
      await queryRunner.manager.save(movimiento);

      await queryRunner.commitTransaction();
      return savedInyeccion;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}

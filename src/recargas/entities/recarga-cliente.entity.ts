import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { BaseEntityAudit } from 'src/common/entities/base-entity.audit';
import { SesionCaja } from 'src/cajas/entities/sesion-caja.entity';
import { OperadoraNombre } from './operadora-saldo.entity';

@Entity('recargas_clientes')
export class RecargaCliente extends BaseEntityAudit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: OperadoraNombre,
  })
  operadora: OperadoraNombre;

  @Column()
  numero_cliente: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto: number;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_hora: Date;

  @ManyToOne(() => SesionCaja)
  @JoinColumn({ name: 'id_caja_sesion' })
  caja_sesion: SesionCaja;

  @Column({ name: 'id_caja_sesion' })
  id_caja_sesion: number;
}

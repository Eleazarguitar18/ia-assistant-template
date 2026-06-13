import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { BaseEntityAudit } from 'src/common/entities/base-entity.audit';
import { SesionCaja } from 'src/cajas/entities/sesion-caja.entity';
import { OperadoraNombre } from './operadora-saldo.entity';

@Entity('inyecciones_operadoras')
export class InyeccionOperadora extends BaseEntityAudit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: OperadoraNombre,
  })
  operadora_destino: OperadoraNombre;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto: number;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_hora: Date;

  @ManyToOne(() => SesionCaja)
  @JoinColumn({ name: 'id_caja_origen' })
  caja_origen: SesionCaja;

  @Column({ name: 'id_caja_origen' })
  id_caja_origen: number;
}

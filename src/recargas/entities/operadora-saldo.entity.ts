import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntityAudit } from 'src/common/entities/base-entity.audit';

export enum OperadoraNombre {
  TIGO = 'Tigo',
  ENTEL = 'Entel',
  VIVA = 'Viva'
}

@Entity('operadoras_saldos')
export class OperadoraSaldo extends BaseEntityAudit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: OperadoraNombre,
    unique: true
  })
  nombre_operadora: OperadoraNombre;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  saldo_actual: number;
}

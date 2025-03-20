import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('dynamic_triggers')
export class DynamicTrigger {
  @PrimaryColumn({ length: 50 })
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ name: 'message_type', length: 50 })
  messageType!: string;

  @Column({ name: 'condition_text', type: 'text' })
  condition!: string;

  @Column({ type: 'text' })
  response!: string;

  @Column({ default: true })
  enabled: boolean = true;

  @CreateDateColumn({ name: 'created_at', type: 'bigint' })
  createdAt!: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'bigint' })
  updatedAt!: number;
} 
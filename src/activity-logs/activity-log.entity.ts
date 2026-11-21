import {
  CreateDateColumn,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'activity_logs' })
@Index('ix_activity_logs_merchant_date', ['merchantOwnerId', 'createdAt'])
@Index('ix_activity_logs_merchant_actor_date', [
  'merchantOwnerId',
  'actorUserId',
  'createdAt',
])
@Index('ix_activity_logs_merchant_action_date', [
  'merchantOwnerId',
  'action',
  'createdAt',
])
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_owner_id', type: 'uuid' })
  merchantOwnerId: string;

  @Column({ name: 'actor_user_id', type: 'uuid' })
  actorUserId: string;

  @Column({ name: 'actor_name', type: 'varchar', length: 100 })
  actorName: string;

  @Column({ name: 'actor_email', type: 'varchar', length: 100 })
  actorEmail: string;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 50 })
  entityType: string;

  @Column({ name: 'entity_id', type: 'varchar', length: 100, nullable: true })
  entityId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  changes: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

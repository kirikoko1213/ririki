import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

/**
 * 消息记录实体
 */
@Entity('message_record')
export class MessageRecord {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id!: number;

  @Column({ type: 'bigint', name: 'user_id' })
  @Index()
  userId!: number;

  @Column({ type: 'bigint', name: 'group_id' })
  @Index()
  groupId!: number;

  @Column({ type: 'text', name: 'message' })
  message!: string;

  @Column({ type: 'tinyint', default: 1, name: 'status'  })
  status!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  /**
   * 创建新的消息记录
   * @param userId 用户ID
   * @param groupId 群组ID
   * @param message 消息内容
   * @returns 消息记录对象
   */
  static create(userId: number, groupId: number, message: string): MessageRecord {
    const record = new MessageRecord();
    record.userId = userId;
    record.groupId = groupId;
    record.message = message;
    return record;
  }
} 
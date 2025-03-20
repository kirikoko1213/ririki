import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { MessageRecord } from '../models/entities/MessageRecord';
import logger from '../utils/logger';

/**
 * 消息记录仓库
 */
class MessageRepository {
  private repository: Repository<MessageRecord>;

  constructor() {
    this.repository = AppDataSource.getRepository(MessageRecord);
  }

  /**
   * 保存消息记录
   * @param userId 用户ID
   * @param groupId 群组ID
   * @param message 消息内容
   * @returns 保存的消息记录
   */
  async save(userId: number, groupId: number, message: string): Promise<MessageRecord> {
    try {
      const record = MessageRecord.create(userId, groupId, message);
      return await this.repository.save(record);
    } catch (error) {
      logger.error('保存消息记录失败:', error);
      throw error;
    }
  }

  /**
   * 获取指定群组的消息记录
   * @param groupId 群组ID
   * @param limit 限制条数
   * @returns 消息记录列表
   */
  async getByGroupId(groupId: number, limit: number = 100): Promise<MessageRecord[]> {
    try {
      return await this.repository.find({
        where: { groupId },
        order: { createdAt: 'DESC' },
        take: limit
      });
    } catch (error) {
      logger.error(`获取群组${groupId}的消息记录失败:`, error);
      throw error;
    }
  }

  /**
   * 获取指定用户在指定群组的消息记录
   * @param userId 用户ID
   * @param groupId 群组ID
   * @param limit 限制条数
   * @returns 消息记录列表
   */
  async getByUserAndGroup(userId: number, groupId: number, limit: number = 100): Promise<MessageRecord[]> {
    try {
      return await this.repository.find({
        where: { userId, groupId },
        order: { createdAt: 'DESC' },
        take: limit
      });
    } catch (error) {
      logger.error(`获取用户${userId}在群组${groupId}的消息记录失败:`, error);
      throw error;
    }
  }

  /**
   * 获取群组消息排名
   * @param groupId 群组ID
   * @param limit 限制条数
   * @returns 消息排名
   */
  async getRankByGroup(groupId: number, limit: number = 10): Promise<{ userId: number, count: number }[]> {
    try {
      const result = await this.repository
        .createQueryBuilder('message')
        .select('message.userId', 'userId')
        .addSelect('COUNT(*)', 'count')
        .where('message.groupId = :groupId', { groupId })
        .groupBy('message.userId')
        .orderBy('count', 'DESC')
        .limit(limit)
        .getRawMany();

      return result.map(item => ({
        userId: Number(item.userId),
        count: Number(item.count)
      }));
    } catch (error) {
      logger.error(`获取群组${groupId}的消息排名失败:`, error);
      throw error;
    }
  }
}

export default new MessageRepository(); 
import { Request, Response } from 'express';
import { getRedisClient } from '../config/redis';
import logger from '../utils/logger';

/**
 * AI API
 */
export const aiAPI = {
  /**
   * 清除AI设置缓存
   */
  clearAISettingCache: async (req: Request, res: Response): Promise<void> => {
    try {
      const redis = getRedisClient();
      const keys = await redis.keys('ai:setting:*');
      
      if (keys.length > 0) {
        const pipeline = redis.pipeline();
        keys.forEach(key => {
          pipeline.del(key);
        });
        
        await pipeline.exec();
        res.json({ success: true, message: `已清除${keys.length}个AI设置缓存` });
      } else {
        res.json({ success: true, message: '没有找到AI设置缓存' });
      }
    } catch (error) {
      logger.error('清除AI设置缓存失败:', error);
      res.status(500).json({ error: '清除AI设置缓存失败' });
    }
  },
  
  /**
   * 获取群组AI设置
   */
  getGroupAISetting: async (groupId: number): Promise<string> => {
    try {
      const redis = getRedisClient();
      const setting = await redis.get(`ai:setting:group:${groupId}`);
      return setting || '';
    } catch (error) {
      logger.error(`获取群组${groupId}的AI设置失败:`, error);
      return '';
    }
  },
  
  /**
   * 设置群组AI设置
   */
  setGroupAISetting: async (groupId: number, setting: string): Promise<boolean> => {
    try {
      const redis = getRedisClient();
      await redis.set(`ai:setting:group:${groupId}`, setting);
      return true;
    } catch (error) {
      logger.error(`设置群组${groupId}的AI设置失败:`, error);
      return false;
    }
  }
}; 
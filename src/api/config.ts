import { Request, Response } from 'express';
import { getRedisClient } from '../config/redis';
import logger from '../utils/logger';

/**
 * 配置API
 */
export const configAPI = {
  /**
   * 获取配置
   */
  get: async (req: Request, res: Response): Promise<void> => {
    try {
      const key = req.query.key as string;
      
      if (!key) {
        res.status(400).json({ error: '缺少key参数' });
        return;
      }
      
      const redis = getRedisClient();
      const value = await redis.get(`config:${key}`);
      
      res.json({ success: true, key, value });
    } catch (error) {
      logger.error('获取配置失败:', error);
      res.status(500).json({ error: '获取配置失败' });
    }
  },
  
  /**
   * 设置配置
   */
  set: async (req: Request, res: Response): Promise<void> => {
    try {
      const { key, value } = req.body;
      
      if (!key) {
        res.status(400).json({ error: '缺少key参数' });
        return;
      }
      
      const redis = getRedisClient();
      await redis.set(`config:${key}`, value);
      
      res.json({ success: true });
    } catch (error) {
      logger.error('设置配置失败:', error);
      res.status(500).json({ error: '设置配置失败' });
    }
  },
  
  /**
   * 列出所有配置
   */
  list: async (req: Request, res: Response): Promise<void> => {
    try {
      const redis = getRedisClient();
      const keys = await redis.keys('config:*');
      
      const configs: Record<string, string> = {};
      
      for (const key of keys) {
        const value = await redis.get(key);
        if (value) {
          configs[key.replace('config:', '')] = value;
        }
      }
      
      res.json({ success: true, configs });
    } catch (error) {
      logger.error('列出配置失败:', error);
      res.status(500).json({ error: '列出配置失败' });
    }
  },
  
  /**
   * 删除配置
   */
  remove: async (req: Request, res: Response): Promise<void> => {
    try {
      const { key } = req.body;
      
      if (!key) {
        res.status(400).json({ error: '缺少key参数' });
        return;
      }
      
      const redis = getRedisClient();
      await redis.del(`config:${key}`);
      
      res.json({ success: true });
    } catch (error) {
      logger.error('删除配置失败:', error);
      res.status(500).json({ error: '删除配置失败' });
    }
  }
}; 
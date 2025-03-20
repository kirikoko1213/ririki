import { Request, Response } from 'express';
import { getRedisClient } from '../config/redis';
import { resetTriggers } from '../trigger/trigger';
import logger from '../utils/logger';

// 定义动态触发器结构
interface DynamicTrigger {
  id: string;
  name: string;
  messageType: string;
  condition: string;
  response: string;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * 动态触发器API
 */
export const dynamicTriggerAPI = {
  /**
   * 列出所有动态触发器
   */
  list: async (req: Request, res: Response): Promise<void> => {
    try {
      const redis = getRedisClient();
      const keys = await redis.keys('trigger:dynamic:*');
      
      const triggers: DynamicTrigger[] = [];
      
      for (const key of keys) {
        const value = await redis.get(key);
        if (value) {
          triggers.push(JSON.parse(value));
        }
      }
      
      res.json({ success: true, triggers });
    } catch (error) {
      logger.error('列出动态触发器失败:', error);
      res.status(500).json({ error: '列出动态触发器失败' });
    }
  },
  
  /**
   * 保存动态触发器
   */
  save: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, name, messageType, condition, response, enabled } = req.body;
      
      if (!name || !messageType || !condition || !response) {
        res.status(400).json({ error: '缺少必要参数' });
        return;
      }
      
      const now = Date.now();
      const triggerId = id || `${now}`;
      
      const trigger: DynamicTrigger = {
        id: triggerId,
        name,
        messageType,
        condition,
        response,
        enabled: enabled !== false,
        createdAt: id ? (req.body.createdAt || now) : now,
        updatedAt: now
      };
      
      const redis = getRedisClient();
      await redis.set(`trigger:dynamic:${triggerId}`, JSON.stringify(trigger));
      
      // 重置触发器
      resetTriggers();
      
      res.json({ success: true, trigger });
    } catch (error) {
      logger.error('保存动态触发器失败:', error);
      res.status(500).json({ error: '保存动态触发器失败' });
    }
  },
  
  /**
   * 删除动态触发器
   */
  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.body;
      
      if (!id) {
        res.status(400).json({ error: '缺少id参数' });
        return;
      }
      
      const redis = getRedisClient();
      await redis.del(`trigger:dynamic:${id}`);
      
      // 重置触发器
      resetTriggers();
      
      res.json({ success: true });
    } catch (error) {
      logger.error('删除动态触发器失败:', error);
      res.status(500).json({ error: '删除动态触发器失败' });
    }
  },
  
  /**
   * 查找动态触发器
   */
  find: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.query.id as string;
      
      if (!id) {
        res.status(400).json({ error: '缺少id参数' });
        return;
      }
      
      const redis = getRedisClient();
      const value = await redis.get(`trigger:dynamic:${id}`);
      
      if (!value) {
        res.status(404).json({ error: '未找到指定的动态触发器' });
        return;
      }
      
      res.json({ success: true, trigger: JSON.parse(value) });
    } catch (error) {
      logger.error('查找动态触发器失败:', error);
      res.status(500).json({ error: '查找动态触发器失败' });
    }
  },
  
  /**
   * 获取可用函数列表
   */
  getFunctions: (req: Request, res: Response): void => {
    // 这里返回一些预定义的函数，供动态触发器使用
    const functions = [
      { name: 'contains', description: '检查消息是否包含指定文本' },
      { name: 'startsWith', description: '检查消息是否以指定文本开头' },
      { name: 'endsWith', description: '检查消息是否以指定文本结尾' },
      { name: 'equals', description: '检查消息是否与指定文本完全相等' },
      { name: 'matches', description: '检查消息是否匹配指定的正则表达式' }
    ];
    
    res.json({ success: true, functions });
  }
}; 
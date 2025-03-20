import { Request, Response } from 'express';
import { getConnection } from '../config/database';
import { DynamicTrigger } from '../models/entities/DynamicTrigger';
import { resetTriggers } from '../trigger/trigger';
import logger from '../utils/logger';

/**
 * 动态触发器API
 */
export const dynamicTriggerAPI = {
  /**
   * 列出所有动态触发器
   */
  list: async (req: Request, res: Response): Promise<void> => {
    try {
      const connection = getConnection();
      const triggers = await connection
        .getRepository(DynamicTrigger)
        .find({
          order: { createdAt: 'DESC' }
        });
      
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
      
      const connection = getConnection();
      const repository = connection.getRepository(DynamicTrigger);
      
      if (id) {
        // 更新现有触发器
        await repository.update(id, {
          name,
          messageType,
          condition,
          response,
          enabled: enabled !== false,
          updatedAt: Date.now()
        });
      } else {
        // 创建新触发器
        const trigger = repository.create({
          id: Date.now().toString(),
          name,
          messageType,
          condition,
          response,
          enabled: enabled !== false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        await repository.save(trigger);
      }
      
      // 重置触发器
      resetTriggers();
      
      res.json({ success: true });
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
      
      const connection = getConnection();
      await connection.getRepository(DynamicTrigger).delete(id);
      
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
      
      const connection = getConnection();
      const trigger = await connection.getRepository(DynamicTrigger).findOneBy({ id });
      
      if (!trigger) {
        res.status(404).json({ error: '未找到指定的动态触发器' });
        return;
      }
      
      res.json({ success: true, trigger });
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
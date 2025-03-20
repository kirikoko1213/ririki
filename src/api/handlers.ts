import { Request, Response } from 'express';
import { Queue } from '../models/queue';
import { Param, TriggerParameter, parseParam } from '../models/param';
import { dynamicTriggers, triggers } from '../trigger/trigger';
import messageRepository from '../services/messageRepository';
import logger from '../utils/logger';
import { handleError, sendToGroup, sendToGroupAt, sendPrivateMessage } from '../utils/qq';

// 创建消息队列，最多保存5条消息
const msgQueue = new Queue<string>(5);

/**
 * Ping处理器
 */
export function pingHandler(req: Request, res: Response): void {
  res.json({ message: 'pong' });
}

/**
 * 机器人消息处理器
 */
export async function botHandler(req: Request, res: Response): Promise<void> {
  try {
    const param: Param = req.body;
    
    // 解析消息参数
    parseParam(param);
    
    // 只处理消息类型的请求
    if (param.post_type === 'message') {
      // 异步保存消息记录到MySQL
      saveMessageRecordAsync(param);
      
      // 记录收到的消息
      logger.info(`接收消息: ${param.raw_message}`);
      
      // 将消息添加到队列
      msgQueue.enqueue(param.raw_message);
      
      // 创建触发器参数
      const triggerParam: TriggerParameter = {
        cqParam: param,
        msgQueue
      };
      
      // 处理触发器
      await handleTriggers(triggerParam);
    }
    
    // 返回成功响应
    res.json({ success: true });
  } catch (error) {
    logger.error('处理消息失败:', error);
    res.status(500).json({ error: '处理消息失败' });
  }
}

/**
 * 异步保存消息记录到MySQL
 */
async function saveMessageRecordAsync(param: Param): Promise<void> {
  try {
    // 使用messageRepository保存到MySQL
    await messageRepository.save(param.user_id, param.group_id, param.raw_message);
    logger.debug(`已保存消息记录 [用户:${param.user_id}, 群组:${param.group_id}]`);
  } catch (error) {
    logger.error('保存消息记录失败:', error);
  }
}

/**
 * 处理所有触发器
 */
async function handleTriggers(param: TriggerParameter): Promise<boolean> {
  // 首先处理动态触发器
  for (const trigger of dynamicTriggers) {
    if (await handleTrigger(trigger, param)) {
      return true;
    }
  }
  
  // 然后处理静态触发器
  for (const trigger of triggers) {
    if (await handleTrigger(trigger, param)) {
      return true;
    }
  }
  
  return false;
}

/**
 * 处理单个触发器
 */
async function handleTrigger(
  trigger: { messageType: string, condition: (param: TriggerParameter) => boolean, callback: (param: TriggerParameter) => Promise<string> },
  param: TriggerParameter
): Promise<boolean> {
  try {
    // 检查消息类型和条件是否匹配
    if (trigger.messageType === param.cqParam.message_type && trigger.condition(param)) {
      // 调用回调函数获取响应消息
      const message = await trigger.callback(param);
      
      // 根据消息类型发送响应
      switch (trigger.messageType) {
        case 'pr': // 私聊
          await sendPrivateMessage(param.cqParam.user_id.toString(), {
            message,
            cq: trigger.messageType
          });
          break;
          
        case 'at': // @某人
          await sendToGroupAt(param.cqParam.group_id, message, param.cqParam.user_id);
          break;
          
        case 'gr': // 群聊
          await sendToGroup(param.cqParam.group_id, message);
          break;
      }
      
      return true;
    }
  } catch (error) {
    if (error instanceof Error) {
      await handleError(
        error,
        param.cqParam.group_id,
        param.cqParam.user_id,
        trigger.messageType
      );
    }
    return true;
  }
  
  return false;
} 
import axios from 'axios';
import { getEnv } from '../config/env';
import { logger } from './logger';

export interface QQMsg {
  message: string;
  cq?: string; // cq类型：pr(私聊), gr(群聊), at(@某人)
}

/**
 * 发送私聊消息
 * @param userId QQ用户ID
 * @param msg 消息内容
 */
export async function sendPrivateMessage(userId: string, msg: QQMsg): Promise<void> {
  try {
    const url = `${getEnv('onebot.http.url')}/send_private_msg`;
    
    await axios.post(url, {
      user_id: userId,
      message: msg.message
    }, {
      timeout: 30000
    });
  } catch (error) {
    logger.error('发送私聊消息失败:', error);
  }
}

/**
 * 发送群消息
 * @param groupId 群ID
 * @param message 消息内容
 */
export async function sendToGroup(groupId: number, message: string): Promise<void> {
  try {
    const url = `${getEnv('onebot.http.url')}/send_group_msg`;
    
    await axios.post(url, {
      group_id: String(groupId),
      message
    }, {
      timeout: 30000
    });
  } catch (error) {
    logger.error('发送群消息失败:', error);
  }
}

/**
 * 发送@特定用户的群消息
 * @param groupId 群ID
 * @param message 消息内容
 * @param userId 要@的用户ID
 */
export async function sendToGroupAt(groupId: number, message: string, userId: number): Promise<void> {
  try {
    const url = `${getEnv('onebot.http.url')}/send_group_msg`;
    
    await axios.post(url, {
      group_id: String(groupId),
      message: `[CQ:at,qq=${userId}] ${message}`
    }, {
      timeout: 30000
    });
  } catch (error) {
    logger.error('发送@群消息失败:', error);
  }
}

/**
 * 错误处理
 * @param error 错误信息
 * @param groupId 群ID
 * @param userId 用户ID
 * @param mode 消息模式 pr(私聊), gr(群聊), at(@某人)
 */
export async function handleError(error: Error, groupId: number, userId: number, mode: string): Promise<void> {
  if (!error) return;
  
  logger.error(`群组 ${groupId} 错误 => 🌸`, error);
  
  // 向管理员发送错误信息
  const masterQQ = getEnv('master.qq_account');
  if (masterQQ) {
    await sendPrivateMessage(masterQQ, {
      message: error.message,
      cq: 'pr'
    });
  }
  
  // 根据模式发送错误信息
  if (mode === 'gr') {
    await sendToGroup(groupId, error.message);
  } else if (mode === 'at') {
    await sendToGroupAt(groupId, error.message, userId);
  } else if (mode === 'pr') {
    await sendPrivateMessage(String(userId), {
      message: error.message,
      cq: 'pr'
    });
  }
} 
import { TriggerParameter } from '../models/param';
import { getEnv } from '../config/env';

/**
 * 帮助条件
 */
export function help(param: TriggerParameter): boolean {
  const message = param.cqParam.krMessage.trim();
  return ['ヘルプ', '帮助', 'help', '?', '？', ''].includes(message);
}

/**
 * AI设置条件
 */
export function aiSetting(param: TriggerParameter): boolean {
  const message = param.cqParam.krMessage;
  return message.startsWith('设定') || message.startsWith('群角色设定');
}

/**
 * 健康检查条件
 */
export function health(param: TriggerParameter): boolean {
  const message = param.cqParam.krMessage.trim();
  return message === 'ping';
}

/**
 * 下班时间报告条件
 */
export function offWorkTimeAnnounce(param: TriggerParameter): boolean {
  const message = param.cqParam.krMessage.trim();
  return ['报时', '11'].includes(message);
}

/**
 * 假期倒计时条件
 */
export function holidayAnnounce(param: TriggerParameter): boolean {
  const message = param.cqParam.krMessage;
  return message.includes('假期') || message.includes('假期倒计时');
}

/**
 * 群消息排名条件
 */
export function rankOfGroupMsg(param: TriggerParameter): boolean {
  const message = param.cqParam.krMessage.trim();
  return message === '排名';
}

/**
 * 群老婆条件
 */
export function myWifeOfGroup(param: TriggerParameter): boolean {
  const message = param.cqParam.krMessage.trim();
  return message.includes('群老婆');
}

/**
 * ChatGPT条件
 */
export function chatGPT(param: TriggerParameter): boolean {
  const userId = param.cqParam.user_id.toString();
  const blockAccounts = getEnv('block.account');
  
  // 如果用户在屏蔽列表中，则不触发
  if (blockAccounts && blockAccounts.includes(userId)) {
    return false;
  }
  
  return true;
}

/**
 * 智能回复条件
 */
export function smartReply(param: TriggerParameter): boolean {
  const message = param.cqParam.krMessage;
  return message.includes('人生') || 
         message.includes('不想上班') || 
         message.includes('好累') || 
         message.includes('工作');
}

/**
 * 重复消息条件
 */
export function repeat(param: TriggerParameter): boolean {
  if (param.msgQueue.length() >= 2) {
    const lastMsg = param.msgQueue.getIndex(param.msgQueue.length() - 1);
    const prevMsg = param.msgQueue.getIndex(param.msgQueue.length() - 2);
    
    if (lastMsg === prevMsg) {
      return true;
    }
  }
  return false;
}

/**
 * 执行SQL条件
 */
export function execSQL(param: TriggerParameter): boolean {
  return param.cqParam.krMessage.startsWith('-sql ');
}

/**
 * 人格分析条件
 */
export function characterPortrait(param: TriggerParameter): boolean {
  return param.cqParam.krMessage.includes('人格分析');
} 
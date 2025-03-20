import { Queue } from './queue';
import { getEnv } from '../config/env';

/**
 * QQ消息参数
 */
export interface Param {
  time: number;
  self_id: string;
  post_type: string; // message notice request meta_event
  sub_type: string;
  message_id: number;
  message: string;
  message_type: string; // group private
  group_id: number;
  raw_message: string;
  font: number;
  user_id: number;
  krMessage: string;
}

/**
 * 触发器参数
 */
export interface TriggerParameter {
  cqParam: Param;
  msgQueue: Queue<string>;
}

/**
 * 解析CQ码中的QQ号
 * @param input 包含CQ码的字符串
 * @returns QQ号码或为空字符串如果没有找到
 */
export function extractQQ(input: string): string {
  const matches = input.match(/qq=(\d+)/);
  if (!matches || matches.length < 2) {
    return '';
  }
  return matches[1];
}

/**
 * 解析CQ码，提取纯文本内容
 * @param input 包含CQ码的字符串
 * @returns 提取的纯文本内容
 */
export function parseCQCodes(input: string): string {
  // 定义正则表达式匹配 [CQ:...] 模式
  const regex = /\[CQ:(\w+),([^\]]+)\]/g;
  
  // 替换所有CQ码为空字符串
  const remainingText = input.replace(regex, '');
  
  return remainingText.trim();
}

/**
 * 解析消息参数
 * @param param 接收到的消息参数
 */
export function parseParam(param: Param): void {
  if (param.post_type === 'message') {
    switch (param.message_type) {
      case 'private':
        param.message_type = 'pr';
        param.krMessage = param.message;
        break;
        
      case 'group':
        if (param.raw_message.startsWith('[CQ:at,qq=')) {
          const qqAccount = extractQQ(param.raw_message);
          if (qqAccount !== getEnv('qq.account')) {
            return;
          }
          param.message_type = 'at';
          param.krMessage = parseCQCodes(param.raw_message);
          break;
        }
        
        if (!param.raw_message.startsWith('[CQ:')) {
          param.message_type = 'gr';
          param.krMessage = param.raw_message;
        }
        break;
    }
    
    param.krMessage = param.krMessage?.trim() || '';
  }
} 
import { TriggerParameter } from '../models/param';
import * as responders from './responders';

// 消息类型常量
export const MESSAGE_TYPES = {
  AT: 'at',        // 群组里@某人的触发器
  PR: 'pr',        // 非群组，单人私聊时的触发器
  GR: 'gr',        // 群聊消息
  MASTER: 'master' // 机器人主人身份，处理一些特殊数据，如密码管理
};

/**
 * 触发器定义
 */
export interface Trigger {
  messageType: string;
  condition: (param: TriggerParameter) => boolean;
  callback: (param: TriggerParameter) => Promise<string>;
}

// 静态触发器列表
export const triggers: Trigger[] = [];

// 动态触发器列表（从数据库加载）
export const dynamicTriggers: Trigger[] = [];

/**
 * 添加静态触发器
 */
export function addTrigger(
  messageType: string,
  condition: (param: TriggerParameter) => boolean,
  callback: (param: TriggerParameter) => Promise<string>
): void {
  triggers.push({
    messageType,
    condition,
    callback
  });
}

/**
 * 添加动态触发器
 */
export function addDynamicTrigger(
  messageType: string,
  condition: (param: TriggerParameter) => boolean,
  callback: (param: TriggerParameter) => Promise<string>
): void {
  dynamicTriggers.push({
    messageType,
    condition,
    callback
  });
}

/**
 * 重置动态触发器
 */
export function resetTriggers(): void {
  // 清空现有动态触发器
  dynamicTriggers.length = 0;
  
  // 从数据库加载动态触发器
  responders.registerDynamicTriggers(addDynamicTrigger);
}

// 初始化静态触发器
export function initTriggers(): void {
  // 清空现有静态触发器
  triggers.length = 0;
  
  // 帮助
  addTrigger(MESSAGE_TYPES.PR, responders.conditions.help, responders.help);
  addTrigger(MESSAGE_TYPES.AT, responders.conditions.help, responders.help);
  
  // 健康检查
  addTrigger(MESSAGE_TYPES.PR, responders.conditions.health, responders.health);
  
  // 下班时间
  addTrigger(MESSAGE_TYPES.AT, responders.conditions.offWorkTimeAnnounce, responders.offWorkTimeAnnounce);
  addTrigger(MESSAGE_TYPES.GR, responders.conditions.offWorkTimeAnnounce, responders.offWorkTimeAnnounce);
  
  // 假期倒计时
  addTrigger(MESSAGE_TYPES.AT, responders.conditions.holidayAnnounce, responders.holidayAnnounce);
  
  // AI角色设置
  addTrigger(MESSAGE_TYPES.AT, responders.conditions.aiSetting, responders.aiSetting);
  
  // ChatGPT
  addTrigger(MESSAGE_TYPES.AT, responders.conditions.chatGPT, responders.chatGPT);
  
  // 重复
  addTrigger(MESSAGE_TYPES.GR, responders.conditions.repeat, responders.repeat);
  
  // 智能回复
  addTrigger(MESSAGE_TYPES.GR, responders.conditions.smartReply, responders.smartReply);
  
  // 群消息排名
  addTrigger(MESSAGE_TYPES.GR, responders.conditions.rankOfGroupMsg, responders.rankOfGroupMsg);
  addTrigger(MESSAGE_TYPES.AT, responders.conditions.rankOfGroupMsg, responders.rankOfGroupMsg);
  
  // 加载动态触发器
  resetTriggers();
} 
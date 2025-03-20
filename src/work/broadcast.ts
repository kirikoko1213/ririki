import { getEnv } from '../config/env';
import { sendToGroup } from '../utils/qq';
import logger from '../utils/logger';

// 定义要广播的群组ID列表
let broadcastGroups: string[] = [];

/**
 * 启动广播服务
 */
export function startBroadcast(): void {
  try {
    // 从环境变量或配置中加载广播群组列表
    const groupsStr = getEnv('broadcast.groups');
    if (groupsStr) {
      broadcastGroups = groupsStr.split(',');
    }
    
    // 设置定时任务
    scheduleDailyBroadcasts();
    
    logger.info('广播服务已启动');
  } catch (error) {
    logger.error('启动广播服务失败:', error);
  }
}

/**
 * 安排每日定时广播
 */
function scheduleDailyBroadcasts(): void {
  // 早上问候
  scheduleTimeTask(8, 30, morningGreeting);
  
  // 午饭提醒
  scheduleTimeTask(11, 30, lunchReminder);
  
  // 下午茶提醒
  scheduleTimeTask(15, 0, teaTimeReminder);
  
  // 下班提醒
  scheduleTimeTask(17, 30, offWorkReminder);
}

/**
 * 安排定时任务
 * @param hour 小时
 * @param minute 分钟
 * @param callback 回调函数
 */
function scheduleTimeTask(hour: number, minute: number, callback: () => void): void {
  const checkTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    if (currentHour === hour && currentMinute === minute) {
      callback();
    }
  };
  
  // 每分钟检查一次时间
  setInterval(checkTime, 60 * 1000);
}

/**
 * 早上问候
 */
function morningGreeting(): void {
  const greeting = '早上好！新的一天开始了，祝大家工作顺利！';
  broadcastMessage(greeting);
}

/**
 * 午饭提醒
 */
function lunchReminder(): void {
  const message = '午饭时间到了，记得按时吃饭哦！';
  broadcastMessage(message);
}

/**
 * 下午茶提醒
 */
function teaTimeReminder(): void {
  const message = '下午茶时间到了，休息一下，喝杯茶放松一下吧！';
  broadcastMessage(message);
}

/**
 * 下班提醒
 */
function offWorkReminder(): void {
  const message = '还有30分钟就下班了，记得处理好收尾工作！';
  broadcastMessage(message);
}

/**
 * 向所有配置的群组广播消息
 * @param message 要广播的消息
 */
function broadcastMessage(message: string): void {
  broadcastGroups.forEach(groupId => {
    try {
      const groupIdNum = parseInt(groupId, 10);
      if (!isNaN(groupIdNum)) {
        sendToGroup(groupIdNum, message);
      }
    } catch (error) {
      logger.error(`向群组 ${groupId} 广播消息失败:`, error);
    }
  });
} 
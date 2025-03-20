import { TriggerParameter } from '../models/param';
import * as conditions from './conditions';
import { getRedisClient } from '../config/redis';
import { getEnv } from '../config/env';
import logger from '../utils/logger';
import messageRepository from '../services/messageRepository';

// 导出所有触发条件
export { conditions };

/**
 * 注册动态触发器
 * @param registerFn 注册函数
 */
export function registerDynamicTriggers(
  registerFn: (
    messageType: string,
    condition: (param: TriggerParameter) => boolean,
    callback: (param: TriggerParameter) => Promise<string>
  ) => void
): void {
  // 从数据库加载动态触发器并注册
  // 这里是一个示例实现，实际应从数据库加载
  logger.info('加载动态触发器');
  
  // 示例：动态添加的触发器
  // registerFn('gr', 
  //   (param) => param.cqParam.krMessage.includes('天气'), 
  //   async (param) => '今天天气真好！'
  // );
}

/**
 * 帮助响应
 */
export async function help(param: TriggerParameter): Promise<string> {
  return `🎮 QQ机器人帮助 🎮
  
👋 基本命令:
- help - 显示此帮助信息
- ping - 检查机器人是否正常运行
- 报时 - 显示当前工作时间
- 假期 - 显示假期倒计时

🤖 AI功能:
- 设定 [角色描述] - 设置AI角色
- @机器人 [任何问题] - 使用AI回答问题

🎯 其他功能:
- 排名 - 显示群消息排名
- 群老婆 - 随机分配群老婆

更多功能正在开发中...`;
}

/**
 * 健康检查响应
 */
export async function health(param: TriggerParameter): Promise<string> {
  return 'pong';
}

/**
 * 下班时间响应
 */
export async function offWorkTimeAnnounce(param: TriggerParameter): Promise<string> {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  if (hour < 9) {
    return `现在是${hour}:${minute.toString().padStart(2, '0')}，上班时间还没到呢，再睡一会吧！`;
  } else if (hour < 12) {
    const remainMinutes = (12 - hour) * 60 - minute;
    return `现在是${hour}:${minute.toString().padStart(2, '0')}，距离午饭还有${remainMinutes}分钟`;
  } else if (hour < 13) {
    return `现在是${hour}:${minute.toString().padStart(2, '0')}，是吃午饭的时间了！`;
  } else if (hour < 18) {
    const remainMinutes = (18 - hour) * 60 - minute;
    return `现在是${hour}:${minute.toString().padStart(2, '0')}，距离下班还有${remainMinutes}分钟！`;
  } else {
    return `现在是${hour}:${minute.toString().padStart(2, '0')}，已经下班了，快跑！`;
  }
}

/**
 * 假期倒计时响应
 */
export async function holidayAnnounce(param: TriggerParameter): Promise<string> {
  try {
    const now = new Date();
    const holidayStr = getEnv('holiday');
    let holidays = [];
    
    if (holidayStr) {
      try {
        holidays = JSON.parse(holidayStr);
      } catch (error) {
        logger.error('解析假期配置失败:', error);
      }
    }
    
    if (holidays.length === 0) {
      // 使用默认假期
      const nextYear = now.getFullYear() + 1;
      const newYear = new Date(`${nextYear}-01-01`);
      const daysToNewYear = Math.ceil((newYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return `距离${nextYear}年元旦还有${daysToNewYear}天`;
    }
    
    // 查找最近的假期
    let closestHoliday = null;
    let daysToHoliday = Number.MAX_SAFE_INTEGER;
    
    for (const holiday of holidays) {
      const holidayDate = new Date(holiday.date);
      const days = Math.ceil((holidayDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (days > 0 && days < daysToHoliday) {
        closestHoliday = holiday;
        daysToHoliday = days;
      }
    }
    
    if (closestHoliday) {
      return `距离${closestHoliday.name}还有${daysToHoliday}天`;
    } else {
      return '今年的假期都已经过完了，明年的假期还没有安排';
    }
  } catch (error) {
    logger.error('计算假期倒计时失败:', error);
    return '计算假期倒计时时出错了，请稍后再试';
  }
}

/**
 * AI设置响应
 */
export async function aiSetting(param: TriggerParameter): Promise<string> {
  const message = param.cqParam.krMessage;
  const groupId = param.cqParam.group_id;
  
  // 提取设定内容
  let setting = message.replace(/^设定/, '').replace(/^群角色设定/, '').trim();
  
  if (!setting) {
    return '请提供角色设定内容';
  }
  
  try {
    // 保存到Redis
    const redis = getRedisClient();
    await redis.set(`ai:setting:group:${groupId}`, setting);
    return `角色设定已保存: ${setting}`;
  } catch (error) {
    logger.error('保存AI设定失败', error);
    return '保存设定失败，请稍后再试';
  }
}

/**
 * ChatGPT响应
 */
export async function chatGPT(param: TriggerParameter): Promise<string> {
  const message = param.cqParam.krMessage;
  const groupId = param.cqParam.group_id;
  
  // 这里应该实现与ChatGPT API的集成
  // 为了示例，返回简单的回复
  return `你问的是: ${message}\n我是AI助手，目前正在开发中...`;
}

/**
 * 重复消息响应
 */
export async function repeat(param: TriggerParameter): Promise<string> {
  if (param.msgQueue.length() < 2) {
    return '';
  }
  
  return param.msgQueue.getIndex(param.msgQueue.length() - 1) || '';
}

/**
 * 智能回复响应
 */
export async function smartReply(param: TriggerParameter): Promise<string> {
  const message = param.cqParam.krMessage;
  
  if (message.includes('人生')) {
    return '人生苦短，及时行乐！';
  } else if (message.includes('不想上班')) {
    return '谁不想呢，但总要生活啊！';
  } else if (message.includes('好累')) {
    return '辛苦了，休息一下吧！';
  } else if (message.includes('工作')) {
    return '工作是为了更好的生活，加油！';
  }
  
  return '';
}

/**
 * 群消息排名响应
 */
export async function rankOfGroupMsg(param: TriggerParameter): Promise<string> {
  try {
    const groupId = param.cqParam.group_id;
    
    // 从MySQL数据库获取消息排名
    const rankings = await messageRepository.getRankByGroup(groupId, 10);
    
    if (rankings.length === 0) {
      return '暂无群消息排名数据';
    }
    
    let result = '📊 群消息排名 TOP 10 📊\n\n';
    
    rankings.forEach((rank, index) => {
      result += `${index + 1}. QQ: ${rank.userId} - ${rank.count}条消息\n`;
    });
    
    return result;
  } catch (error) {
    logger.error('获取群消息排名失败:', error);
    return '获取排名失败，请稍后再试';
  }
} 
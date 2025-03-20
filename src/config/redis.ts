import Redis from 'ioredis';
import { getEnv } from './env';

let redisClient: Redis | null = null;

/**
 * 初始化Redis客户端
 */
export async function initRedis(): Promise<void> {
  try {
    const host = getEnv('redis.host') || 'localhost';
    const port = parseInt(getEnv('redis.port') || '6379', 10);
    const password = getEnv('redis.password') || '';
    const db = parseInt(getEnv('redis.db') || '0', 10);
    
    const options: Record<string, any> = {
      host,
      port,
      db,
      lazyConnect: true,
    };
    
    if (password) {
      options.password = password;
    }
    
    redisClient = new Redis(options);
    await redisClient.connect();
    
    // 测试连接
    await redisClient.ping();
    console.log('Redis连接成功');
  } catch (error) {
    console.error('Redis连接失败:', error);
    throw error;
  }
}

/**
 * 获取Redis客户端实例
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    throw new Error('Redis客户端未初始化');
  }
  return redisClient;
}

/**
 * 保存消息记录到Redis
 * @param userId 用户ID
 * @param groupId 群组ID
 * @param message 消息内容
 */
export async function saveMessageRecord(userId: number, groupId: number, message: string): Promise<void> {
  try {
    if (!redisClient) {
      throw new Error('Redis客户端未初始化');
    }
    
    const key = `message:${groupId}:${userId}`;
    const now = Date.now();
    
    await redisClient.zadd(`messages:${groupId}`, now, JSON.stringify({
      userId,
      message,
      timestamp: now
    }));
    
    // 保留最近1000条消息
    await redisClient.zremrangebyrank(`messages:${groupId}`, 0, -1001);
  } catch (error) {
    console.error('保存消息记录失败:', error);
    throw error;
  }
} 
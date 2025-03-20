import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// 加载环境变量
dotenv.config();

const envCache: Record<string, string> = {};

/**
 * 从环境变量中获取值
 * @param key 环境变量键名
 * @returns 环境变量值
 */
export function getEnv(key: string): string {
  // 如果缓存中有值，直接返回
  if (envCache[key]) {
    return envCache[key];
  }

  // 处理main.前缀，将main.xxx.yyy转换为xxx.yyy
  const actualKey = key.startsWith('main.') ? key.substring(5) : key;
  
  // 尝试从环境变量获取
  // 将点号分隔的键名转换为下划线分隔的大写形式
  const envKey = actualKey.toUpperCase().replace(/\./g, '_');
  const value = process.env[envKey];
  if (value !== undefined) {
    envCache[key] = value;
    return value;
  }

  // 尝试从配置文件获取
  try {
    const configPath = path.resolve(process.cwd(), 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      const keys = actualKey.split('.');
      let result = config;
      
      for (const k of keys) {
        if (result[k] === undefined) {
          return '';
        }
        result = result[k];
      }
      
      if (typeof result === 'string' || typeof result === 'number') {
        const stringResult = String(result);
        envCache[key] = stringResult;
        return stringResult;
      }
    }
  } catch (error) {
    console.error('读取配置文件失败:', error);
  }

  return '';
}

// 预定义的环境变量键名
export const ENV_KEYS = {
  ONEBOT_HTTP_URL: 'onebot.http.url',
  QQ_ACCOUNT: 'qq.account',
  REDIS_HOST: 'redis.host',
  REDIS_PORT: 'redis.port',
  REDIS_PASSWORD: 'redis.password',
  REDIS_DB: 'redis.db',
  MASTER_QQ_ACCOUNT: 'master.qq_account',
  BLOCK_ACCOUNT: 'block.account',
  SERVE_PORT: 'serve.port',
  MYSQL_HOST: 'mysql.host',
  MYSQL_PORT: 'mysql.port',
  MYSQL_USERNAME: 'mysql.username',
  MYSQL_PASSWORD: 'mysql.password',
  MYSQL_DATABASE: 'mysql.database',
  CHATGPT_TIMEOUT: 'chatgpt.timeout',
  CHATGPT_SERVER_URL: 'chatgpt.server.url',
  CHATGPT_KEY: 'chatgpt.key',
  CHATGPT_MODEL: 'chatgpt.model',
  STORAGE_ENGINE: 'storage.engine',
  HOLIDAY: 'holiday'
}; 
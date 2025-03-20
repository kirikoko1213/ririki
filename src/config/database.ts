import { DataSource } from 'typeorm';
import { MessageRecord } from '../models/entities/MessageRecord';
import { getEnv } from './env';
import path from 'path';
import 'reflect-metadata';

// 创建TypeORM数据源
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: getEnv('mysql.host') || 'localhost',
  port: parseInt(getEnv('mysql.port') || '3306', 10),
  username: getEnv('mysql.username') || 'root',
  password: getEnv('mysql.password') || '',
  database: getEnv('mysql.database') || 'qqbot',
  charset: 'utf8mb4_unicode_ci',
  // synchronize: true, // 开发环境可以使用，生产环境建议关闭
  logging: getEnv('node.env') !== 'production',
  entities: [
    MessageRecord,
    // 添加其他实体
  ],
  migrations: [path.join(__dirname, '../migrations/*.{ts,js}')],
});

/**
 * 初始化数据库连接
 */
export async function initDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
}

/**
 * 获取数据库连接
 */
export function getConnection(): DataSource {
  if (!AppDataSource.isInitialized) {
    throw new Error('数据库未初始化');
  }
  return AppDataSource;
} 
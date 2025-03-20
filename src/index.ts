import express from 'express';
import { initRedis } from './config/redis';
import { initDatabase } from './config/database';
import { registerRouter } from './api/router';
import { startBroadcast } from './work/broadcast';
import { getEnv } from './config/env';
import { initTriggers } from './trigger/trigger';

async function main() {
  try {
    // 初始化 Redis
    await initRedis();
    console.log('Redis 初始化成功');
    
    // 初始化 MySQL 数据库
    await initDatabase();
    console.log('MySQL 数据库初始化成功');
    
    // 初始化触发器
    initTriggers();
    console.log('触发器初始化成功');
    
    // 启动定时广播服务
    startBroadcast();
    
    const app = express();
    app.use(express.json());
    
    // 注册路由
    registerRouter(app);
    
    const port = getEnv('serve.port') || '3000';
    app.listen(port, () => {
      console.log(`服务已启动，监听端口: ${port}`);
    });
  } catch (error) {
    console.error('服务启动失败:', error);
    process.exit(1);
  }
}

main();
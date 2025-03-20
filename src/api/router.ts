import express from 'express';
import path from 'path';
import { botHandler, pingHandler } from './handlers';
import { configAPI } from './config';
import { aiAPI } from './ai';
import { dynamicTriggerAPI } from './dynamic-trigger';

/**
 * 注册所有API路由
 * @param app Express应用实例
 */
export function registerRouter(app: express.Application): void {
  // 基本路由
  app.post('/ping', pingHandler);
  app.post('/api/bot', botHandler);
  
  // 静态文件
  app.use('/photo', express.static(path.join(process.cwd(), 'photo')));
  
  // 配置API
  app.get('/api/config/get', configAPI.get);
  app.post('/api/config/set', configAPI.set);
  app.get('/api/config/list', configAPI.list);
  app.post('/api/config/remove', configAPI.remove);
  
  // AI API
  app.post('/api/ai/clear-setting-cache', aiAPI.clearAISettingCache);
  
  // 动态触发器API
  app.get('/api/dynamic-trigger/list', dynamicTriggerAPI.list);
  app.post('/api/dynamic-trigger/save', dynamicTriggerAPI.save);
  app.post('/api/dynamic-trigger/delete', dynamicTriggerAPI.delete);
  app.get('/api/dynamic-trigger/find', dynamicTriggerAPI.find);
  app.get('/api/dynamic-trigger/get-functions', dynamicTriggerAPI.getFunctions);
} 
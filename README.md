# QQ机器人 - TypeScript版

这是一个基于TypeScript、Express、Redis和MySQL的QQ机器人应用，是从Go版本的QQ机器人迁移而来。

## 功能特性

- 基于OneBot协议的QQ机器人
- 支持群聊、私聊和@消息处理
- 内置多种实用功能：
  - 帮助命令
  - 下班时间提醒
  - 假期倒计时
  - AI聊天
  - 自动回复
  - 消息重复检测
  - 群消息排名统计
- 支持动态触发器，可以通过API添加和管理触发器
- 定时广播消息
- Redis数据缓存
- MySQL数据持久化存储

## 系统要求

- Node.js 16+
- Redis 5+
- MySQL 5.7+
- OneBot兼容的QQ机器人框架（如go-cqhttp）

## 安装和配置

1. 克隆仓库
```bash
git clone https://your-repo-url.git
cd qq-bot
```

2. 安装依赖
```bash
yarn install
```

3. 配置
   - 复制 `.env.example` 到 `.env`，并填写相应配置
   - 或者复制 `config.example.json` 到 `config.json`，并填写相应配置

4. 创建MySQL数据库
```sql
CREATE DATABASE qqbot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
   - 数据表会在应用启动时自动创建

5. 编译TypeScript
```bash
yarn build
```

6. 启动应用
```bash
yarn start
```

或者使用开发模式启动：
```bash
yarn dev
```

## API接口

### 基本接口
- `POST /ping` - 健康检查
- `POST /api/bot` - OneBot机器人消息入口

### 配置接口
- `GET /api/config/get` - 获取配置
- `POST /api/config/set` - 设置配置
- `GET /api/config/list` - 列出所有配置
- `POST /api/config/remove` - 删除配置

### AI接口
- `POST /api/ai/clear-setting-cache` - 清除AI设置缓存

### 动态触发器接口
- `GET /api/dynamic-trigger/list` - 列出所有动态触发器
- `POST /api/dynamic-trigger/save` - 保存动态触发器
- `POST /api/dynamic-trigger/delete` - 删除动态触发器
- `GET /api/dynamic-trigger/find` - 查找动态触发器
- `GET /api/dynamic-trigger/get-functions` - 获取可用函数列表

## 自定义触发器

你可以通过API接口添加自定义触发器，示例：

```json
{
  "name": "天气查询",
  "messageType": "gr",
  "condition": "contains(message, '天气')",
  "response": "今天天气不错，适合出门！",
  "enabled": true
}
```

## 数据存储

- Redis: 用于缓存AI设置、配置和其他临时数据
- MySQL: 用于持久化存储消息记录、用户数据等

## 许可证

MIT

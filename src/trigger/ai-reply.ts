import { TriggerParameter } from "../models/param";
import OpenAI from "openai";
import { ChatCompletionMessageParam, ChatCompletionRole } from "openai/resources/chat/completions";

// 内存存储实现
class MemoryStorage {
  private messageMap: Map<string, ChatCompletionMessageParam[]> = new Map();

  private getKey(groupId: number, userId: number): string {
    return `${groupId}-${userId}`;
  }

  async getMessages(groupId: number, userId: number): Promise<ChatCompletionMessageParam[]> {
    const key = this.getKey(groupId, userId);
    if (!this.messageMap.has(key)) {
      this.messageMap.set(key, []);
    }
    return this.messageMap.get(key) || [];
  }

  async pushMessage(groupId: number, userId: number, role: ChatCompletionRole, content: string): Promise<void> {
    const messages = await this.getMessages(groupId, userId);
    const message: ChatCompletionMessageParam = {
      role,
      content,
    } as ChatCompletionMessageParam;
    messages.push(message);
    
    // 保持最近16条消息
    if (messages.length > 16) {
      messages.splice(0, messages.length - 16);
    }
    
    this.messageMap.set(this.getKey(groupId, userId), messages);
  }

  async clear(groupId: number, userId: number): Promise<void> {
    const key = this.getKey(groupId, userId);
    this.messageMap.delete(key);
  }
}

const storage = new MemoryStorage();

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.CHATGPT_API_KEY,
  baseURL: process.env.CHATGPT_API_URL,
  timeout: parseInt(process.env.CHATGPT_TIMEOUT || "30000"),
  httpAgent: process.env.PROXY_URL ? new (require('https-proxy-agent'))(process.env.PROXY_URL) : undefined,
});

/**
 * AI回复
 */
export async function aiReply(param: TriggerParameter): Promise<string> {
  try {
    const message = param.cqParam.krMessage;
    const groupId = param.cqParam.group_id;
    const userId = param.cqParam.user_id;

    // 获取历史消息
    const messages = await storage.getMessages(groupId, userId);

    // 调用 ChatGPT API
    const completion = await openai.chat.completions.create({
      model: process.env.CHATGPT_MODEL || "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content || "";

    // 存储用户消息和AI回复
    await storage.pushMessage(groupId, userId, "user", message);
    await storage.pushMessage(groupId, userId, "assistant", aiResponse);

    return aiResponse.trim();
  } catch (error) {
    console.error("AI回复出错:", error);
    return "抱歉，我现在遇到了一些问题，请稍后再试。";
  }
}
  
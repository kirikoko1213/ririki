/**
 * 简单的队列实现
 */
export class Queue<T> {
  private items: T[] = [];
  private maxSize: number;
  
  /**
   * 创建一个新的队列
   * @param maxSize 队列最大容量
   */
  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }
  
  /**
   * 添加元素到队列尾部
   * @param item 要添加的元素
   */
  enqueue(item: T): void {
    this.items.push(item);
    
    // 如果超出最大容量，移除最早的元素
    if (this.items.length > this.maxSize) {
      this.items.shift();
    }
  }
  
  /**
   * 从队列头部移除元素
   * @returns 移除的元素，如果队列为空返回undefined
   */
  dequeue(): T | undefined {
    return this.items.shift();
  }
  
  /**
   * 查看队列头部元素
   * @returns 队列头部元素，如果队列为空返回undefined
   */
  peek(): T | undefined {
    return this.items[0];
  }
  
  /**
   * 获取队列长度
   * @returns 队列中的元素数量
   */
  length(): number {
    return this.items.length;
  }
  
  /**
   * 获取指定索引的元素
   * @param index 索引
   * @returns 对应索引的元素，如果索引无效返回undefined
   */
  getIndex(index: number): T | undefined {
    if (index < 0 || index >= this.items.length) {
      return undefined;
    }
    return this.items[index];
  }
  
  /**
   * 清空队列
   */
  clear(): void {
    this.items = [];
  }
  
  /**
   * 判断队列是否为空
   * @returns 队列为空时返回true，否则返回false
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }
} 
/**
 * LifeBase Memory Service
 * AI长期记忆系统
 */

interface MemoryEntry {
  id: string;
  timestamp: Date;
  type: 'user_data' | 'conversation' | 'preference' | 'goal' | 'insight';
  content: any;
  importance: number;
  tags: string[];
}

interface UserMemory {
  userId: string;
  entries: MemoryEntry[];
  summary: string;
  lastUpdated: Date;
}

class MemoryService {
  private memories: Map<string, UserMemory> = new Map();
  private maxEntriesPerUser: number = 1000;

  addMemory(
    userId: string,
    type: MemoryEntry['type'],
    content: any,
    importance: number = 0.5,
    tags: string[] = []
  ): MemoryEntry {
    if (!this.memories.has(userId)) {
      this.memories.set(userId, {
        userId,
        entries: [],
        summary: '',
        lastUpdated: new Date()
      });
    }

    const entry: MemoryEntry = {
      id: `${userId}_${Date.now()}`,
      timestamp: new Date(),
      type,
      content,
      importance,
      tags
    };

    const userMemory = this.memories.get(userId)!;
    userMemory.entries.push(entry);
    userMemory.lastUpdated = new Date();

    if (userMemory.entries.length > this.maxEntriesPerUser) {
      userMemory.entries = userMemory.entries.slice(-this.maxEntriesPerUser);
    }

    return entry;
  }

  getUserMemory(userId: string): UserMemory | undefined {
    return this.memories.get(userId);
  }

  searchMemories(userId: string, query: string): MemoryEntry[] {
    const userMemory = this.memories.get(userId);
    if (!userMemory) return [];

    const lowerQuery = query.toLowerCase();
    return userMemory.entries.filter(entry =>
      JSON.stringify(entry.content).toLowerCase().includes(lowerQuery)
    );
  }

  getRecentMemories(userId: string, limit: number = 10): MemoryEntry[] {
    const userMemory = this.memories.get(userId);
    if (!userMemory) return [];

    return userMemory.entries.slice(-limit).reverse();
  }

  getImportantMemories(userId: string, threshold: number = 0.7): MemoryEntry[] {
    const userMemory = this.memories.get(userId);
    if (!userMemory) return [];

    return userMemory.entries
      .filter(entry => entry.importance >= threshold)
      .sort((a, b) => b.importance - a.importance);
  }

  getMemoriesByType(userId: string, type: MemoryEntry['type']): MemoryEntry[] {
    const userMemory = this.memories.get(userId);
    if (!userMemory) return [];

    return userMemory.entries.filter(entry => entry.type === type);
  }

  generateMemorySummary(userId: string): string {
    const userMemory = this.memories.get(userId);
    if (!userMemory) return '';

    const userDataMemories = userMemory.entries.filter(e => e.type === 'user_data');
    const goalMemories = userMemory.entries.filter(e => e.type === 'goal');

    return `用户记忆摘要：数据${userDataMemories.length}条，目标${goalMemories.length}个`;
  }

  clearUserMemory(userId: string): void {
    this.memories.delete(userId);
  }

  exportMemory(userId: string): string {
    const userMemory = this.memories.get(userId);
    if (!userMemory) return '';

    return JSON.stringify(userMemory, null, 2);
  }

  getUserStats(userId: string): Record<string, any> {
    const userMemory = this.memories.get(userId);
    if (!userMemory) return {};

    return {
      totalEntries: userMemory.entries.length,
      lastUpdated: userMemory.lastUpdated
    };
  }
}

export default MemoryService;
export type { MemoryEntry, UserMemory };

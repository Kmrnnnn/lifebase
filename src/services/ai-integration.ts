/**
 * LifeBase AI Integration
 * 集成所有AI服务到应用中
 */

import AIService from './ai-service';
import ClassificationService from './classification-service';
import MemoryService from './memory-service';

interface AIIntegrationConfig {
  claudeApiKey: string;
  userId: string;
}

class AIIntegration {
  private aiService: AIService;
  private classificationService: ClassificationService;
  private memoryService: MemoryService;
  private userId: string;

  constructor(config: AIIntegrationConfig) {
    this.aiService = new AIService(config.claudeApiKey);
    this.classificationService = new ClassificationService();
    this.memoryService = new MemoryService();
    this.userId = config.userId;
  }

  /**
   * 处理用户输入并返回智能响应
   */
  async processUserInput(input: string): Promise<{
    response: string;
    classification?: any;
    insights?: string[];
  }> {
    try {
      // 获取用户的最近记忆作为上下文
      const recentMemories = this.memoryService.getRecentMemories(this.userId, 5);
      const userContext = {
        userId: this.userId,
        recentData: recentMemories.map(m => m.content),
        goals: [],
        preferences: {}
      };

      // 与AI对话
      const response = await this.aiService.chat(input, userContext);

      // 保存对话到记忆
      this.memoryService.addMemory(
        this.userId,
        'conversation',
        { input, response },
        0.8,
        ['chat', 'conversation']
      );

      // 尝试从输入中提取数据进行分类
      const classification = this.classificationService.classifyByText(input);

      return {
        response,
        classification,
        insights: []
      };
    } catch (error) {
      console.error('Error processing user input:', error);
      throw error;
    }
  }

  /**
   * 处理数据记录（拍照、手动输入等）
   */
  async processDataEntry(data: {
    text?: string;
    amount?: number;
    time?: Date;
    imageData?: string;
  }): Promise<{
    classification: any;
    insights: string[];
    recommendation: string;
  }> {
    try {
      // 自动分类
      const classification = this.classificationService.classifyComprehensive(data);

      // 保存到记忆
      this.memoryService.addMemory(
        this.userId,
        'user_data',
        data,
        classification.confidence,
        classification.tags
      );

      // 生成洞察
      const userContext = {
        userId: this.userId,
        recentData: this.memoryService.getRecentMemories(this.userId, 10).map(m => m.content),
        goals: [],
        preferences: {}
      };

      const insights = await this.aiService.generateRecommendations(userContext);
      const recommendation = insights[0] || '数据已记录';

      return {
        classification,
        insights,
        recommendation
      };
    } catch (error) {
      console.error('Error processing data entry:', error);
      throw error;
    }
  }

  /**
   * 获取用户的AI洞察
   */
  async getUserInsights(): Promise<{
    summary: string;
    patterns: string[];
    recommendations: string[];
  }> {
    try {
      const memorySummary = this.memoryService.generateMemorySummary(this.userId);
      const userStats = this.memoryService.getUserStats(this.userId);

      const userContext = {
        userId: this.userId,
        recentData: userStats,
        goals: [],
        preferences: {}
      };

      const recommendations = await this.aiService.generateRecommendations(userContext);

      return {
        summary: memorySummary,
        patterns: [],
        recommendations
      };
    } catch (error) {
      console.error('Error getting user insights:', error);
      throw error;
    }
  }

  /**
   * 获取用户的记忆摘要
   */
  getMemorySummary(): string {
    return this.memoryService.generateMemorySummary(this.userId);
  }

  /**
   * 获取用户统计
   */
  getUserStats(): Record<string, any> {
    return this.memoryService.getUserStats(this.userId);
  }

  /**
   * 清除用户数据
   */
  clearUserData(): void {
    this.memoryService.clearUserMemory(this.userId);
    this.aiService.clearHistory();
  }

  /**
   * 导出用户数据
   */
  exportUserData(): string {
    return this.memoryService.exportMemory(this.userId);
  }
}

export default AIIntegration;
export type { AIIntegrationConfig };

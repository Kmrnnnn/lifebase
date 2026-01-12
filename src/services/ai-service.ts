/**
 * LifeBase AI Service
 * 集成Claude 3.5 Sonnet进行深度思考和智能分析
 */

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAnalysisResult {
  classification: string;
  category: string;
  tags: string[];
  confidence: number;
  insights: string;
  recommendations: string[];
}

interface UserContext {
  userId: string;
  recentData: Record<string, any>;
  goals: string[];
  preferences: Record<string, any>;
}

class AIService {
  private apiKey: string;
  private model: string = 'claude-3-5-sonnet-20241022';
  private conversationHistory: AIMessage[] = [];
  private maxHistoryLength: number = 50;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * 与AI进行对话
   */
  async chat(userMessage: string, userContext?: UserContext): Promise<string> {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    try {
      const systemPrompt = this.buildSystemPrompt(userContext);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1024,
          system: systemPrompt,
          messages: this.conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      const assistantMessage = data.content[0].text;

      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });

      if (this.conversationHistory.length > this.maxHistoryLength) {
        this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
      }

      return assistantMessage;
    } catch (error) {
      console.error('AI Chat Error:', error);
      throw error;
    }
  }

  /**
   * 智能分析数据
   */
  async analyzeData(data: any, dataType: string, userContext?: UserContext): Promise<AIAnalysisResult> {
    const analysisPrompt = `分析以下${dataType}数据，并提供分类、标签、置信度、洞察和建议。数据：${JSON.stringify(data)}`;

    const response = await this.chat(analysisPrompt, userContext);
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse AI analysis result:', error);
    }

    return {
      classification: 'unknown',
      category: 'uncategorized',
      tags: [],
      confidence: 0,
      insights: response,
      recommendations: []
    };
  }

  /**
   * 生成个性化建议
   */
  async generateRecommendations(userContext: UserContext): Promise<string[]> {
    const prompt = `基于用户信息生成个性化建议。目标：${userContext.goals.join(', ')}`;

    const response = await this.chat(prompt, userContext);
    
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse recommendations:', error);
    }

    return [response];
  }

  /**
   * 构建系统提示
   */
  private buildSystemPrompt(userContext?: UserContext): string {
    const basePrompt = `你是LifeBase的AI助手，帮助用户管理个人数据。你应该理解用户需求、分析数据趋势、提供个性化建议，并以温暖的方式与用户互动。`;

    if (userContext) {
      return `${basePrompt}\n用户信息：ID=${userContext.userId}, 目标=${userContext.goals.join(', ')}`;
    }

    return basePrompt;
  }

  /**
   * 清除对话历史
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * 获取对话历史
   */
  getHistory(): AIMessage[] {
    return [...this.conversationHistory];
  }
}

export default AIService;
export type { AIMessage, AIAnalysisResult, UserContext };

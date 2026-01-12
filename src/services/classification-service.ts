/**
 * LifeBase Classification Service
 * 智能数据自动分类引擎
 */

interface ClassificationResult {
  category: string;
  subcategory: string;
  tags: string[];
  confidence: number;
  metadata: Record<string, any>;
}

interface ClassificationRule {
  pattern: RegExp;
  category: string;
  subcategory: string;
  tags: string[];
}

class ClassificationService {
  private rules: ClassificationRule[] = [];

  constructor() {
    this.initializeRules();
  }

  private initializeRules(): void {
    // 饮食相关规则
    this.rules.push({
      pattern: /早餐|breakfast|早饭/i,
      category: '饮食',
      subcategory: '早餐',
      tags: ['早餐', '饮食']
    });

    this.rules.push({
      pattern: /午餐|lunch|中饭/i,
      category: '饮食',
      subcategory: '午餐',
      tags: ['午餐', '饮食']
    });

    this.rules.push({
      pattern: /晚餐|dinner|晚饭|夜宵/i,
      category: '饮食',
      subcategory: '晚餐',
      tags: ['晚餐', '饮食']
    });

    // 消费相关规则
    this.rules.push({
      pattern: /购物|买|消费|支出|花钱|payment|shopping/i,
      category: '消费',
      subcategory: '购物',
      tags: ['消费', '购物']
    });

    // 运动相关规则
    this.rules.push({
      pattern: /运动|健身|跑步|瑜伽|游泳|exercise|gym/i,
      category: '运动',
      subcategory: '健身',
      tags: ['运动', '健身']
    });

    // 工作相关规则
    this.rules.push({
      pattern: /工作|项目|任务|会议|work|project|meeting/i,
      category: '工作',
      subcategory: '工作任务',
      tags: ['工作', '任务']
    });

    // 学习相关规则
    this.rules.push({
      pattern: /学习|读书|课程|教程|study|learning|course/i,
      category: '学习',
      subcategory: '学习',
      tags: ['学习', '知识']
    });

    // 社交相关规则
    this.rules.push({
      pattern: /聚会|朋友|家人|社交|party|friend|family/i,
      category: '社交',
      subcategory: '社交活动',
      tags: ['社交', '活动']
    });
  }

  classifyByText(text: string): ClassificationResult {
    for (const rule of this.rules) {
      if (rule.pattern.test(text)) {
        return {
          category: rule.category,
          subcategory: rule.subcategory,
          tags: rule.tags,
          confidence: 0.9,
          metadata: { source: 'text_matching' }
        };
      }
    }

    return {
      category: '其他',
      subcategory: '未分类',
      tags: ['其他'],
      confidence: 0.3,
      metadata: { source: 'default' }
    };
  }

  classifyByAmount(amount: number, description?: string): ClassificationResult {
    let baseClassification = this.classifyByText(description || '');

    if (baseClassification.category === '其他') {
      if (amount < 50) {
        baseClassification.category = '消费';
        baseClassification.subcategory = '小额消费';
        baseClassification.tags = ['消费', '小额'];
      } else if (amount < 200) {
        baseClassification.category = '消费';
        baseClassification.subcategory = '日常消费';
        baseClassification.tags = ['消费', '日常'];
      } else {
        baseClassification.category = '消费';
        baseClassification.subcategory = '大额消费';
        baseClassification.tags = ['消费', '大额'];
      }
      baseClassification.confidence = 0.6;
    }

    return baseClassification;
  }

  classifyByTime(hour: number, description?: string): ClassificationResult {
    let baseClassification = this.classifyByText(description || '');

    if (baseClassification.category === '其他') {
      if (hour >= 6 && hour < 12) {
        baseClassification.category = '饮食';
        baseClassification.subcategory = '早餐';
        baseClassification.tags = ['早餐', '饮食'];
      } else if (hour >= 12 && hour < 14) {
        baseClassification.category = '饮食';
        baseClassification.subcategory = '午餐';
        baseClassification.tags = ['午餐', '饮食'];
      } else if (hour >= 18 && hour < 21) {
        baseClassification.category = '饮食';
        baseClassification.subcategory = '晚餐';
        baseClassification.tags = ['晚餐', '饮食'];
      }
      baseClassification.confidence = 0.7;
    }

    return baseClassification;
  }

  classifyComprehensive(data: {
    text?: string;
    amount?: number;
    time?: Date;
  }): ClassificationResult {
    let results: ClassificationResult[] = [];

    if (data.text) {
      results.push(this.classifyByText(data.text));
    }

    if (data.amount !== undefined) {
      results.push(this.classifyByAmount(data.amount, data.text));
    }

    if (data.time) {
      results.push(this.classifyByTime(data.time.getHours(), data.text));
    }

    if (results.length === 0) {
      return {
        category: '其他',
        subcategory: '未分类',
        tags: ['其他'],
        confidence: 0,
        metadata: { source: 'none' }
      };
    }

    const bestResult = results.reduce((prev, current) =>
      current.confidence > prev.confidence ? current : prev
    );

    return bestResult;
  }

  addRule(rule: ClassificationRule): void {
    this.rules.push(rule);
  }

  getCategories(): string[] {
    return Array.from(new Set(this.rules.map(r => r.category)));
  }

  getSubcategories(category: string): string[] {
    return Array.from(new Set(
      this.rules
        .filter(r => r.category === category)
        .map(r => r.subcategory)
    ));
  }
}

export default ClassificationService;
export type { ClassificationResult, ClassificationRule };

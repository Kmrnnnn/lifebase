import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Analyzing text:', text);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `你是生活记录智能分析助手。仔细分析用户输入的文字，准确识别是收入还是支出。

**关键识别规则：**
1. 收入关键词：工资、薪水、收入、进账、到账、发工资、奖金、红包、转入、收到、赚了、卖了
2. 支出关键词：花了、买了、消费、付款、支付、外卖、打车、吃饭、购物、充值

**金额处理：**
- 收入记为正数
- 支出记为负数（如用户说"花了38块"，amount应为-38）

返回JSON格式：
{
  "category": "收入|餐饮|交通|购物|娱乐|生活|社交|其他",
  "subcategory": "具体子类别",
  "amount": 金额数字(支出为负,收入为正,无金额为null),
  "content": "整理后的描述",
  "suggested_module": "spending|income|diet|ingredients|pet|sleep|exercise|social",
  "is_income": true或false,
  "confidence": 0.0-1.0
}

**注意**：
- "收入2500"、"工资到了"等必须识别为收入，is_income为true，amount为正数
- "花了"、"买了"等识别为支出，is_income为false，amount为负数
- 社交相关（聚会、约会、见朋友）归类到social模块

只返回JSON，不要其他文字。`
          },
          { role: 'user', content: text }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error('AI analysis failed');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    console.log('AI response:', content);
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Invalid response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    console.log('Parsed analysis:', analysis);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      category: '其他',
      subcategory: '未分类',
      amount: null,
      content: '无法解析',
      suggested_module: 'spending',
      is_income: false,
      confidence: 0
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

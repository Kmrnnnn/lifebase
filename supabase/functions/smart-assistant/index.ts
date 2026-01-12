import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ModuleConfig {
  name: string;
  keywords: string[];
  icon: string;
  type: string;
}

const MODULE_CONFIGS: ModuleConfig[] = [
  { name: '消费', keywords: ['花', '买', '消费', '支出', '付', '元', '块', '购物', '购买', '花费', '开销'], icon: '💸', type: 'spending' },
  { name: '收入', keywords: ['收入', '工资', '赚', '收到', '进账', '到账', '入账', '薪水', '奖金', '红包', '转账收到'], icon: '💰', type: 'income' },
  { name: '饮食', keywords: ['吃', '喝', '餐', '饭', '食', '早餐', '午餐', '晚餐', '零食', '外卖', '做饭', '烹饪', '菜', '水果'], icon: '🍱', type: 'diet' },
  { name: '运动', keywords: ['运动', '健身', '跑步', '游泳', '锻炼', '走路', '步数', '瑜伽', '球', '骑车', '爬山'], icon: '🏃', type: 'fitness' },
  { name: '睡眠', keywords: ['睡', '觉', '失眠', '早起', '熬夜', '起床', '醒', '做梦', '午休', '休息'], icon: '😴', type: 'sleep' },
  { name: '情绪', keywords: ['开心', '难过', '焦虑', '压力', '心情', '情绪', '快乐', '悲伤', '烦', '累', '疲惫', '兴奋', '郁闷', '吵架', '生气', '愤怒', '感动', '委屈'], icon: '💭', type: 'mood' },
  { name: '社交', keywords: ['朋友', '聚会', '约会', '见面', '社交', '聊天', '派对', '同事', '家人', '对象', '男朋友', '女朋友', '老婆', '老公', '父母', '孩子'], icon: '👥', type: 'social' },
  { name: '工作', keywords: ['工作', '上班', '会议', '项目', '任务', '加班', '出差', '汇报', '客户', '开会', '办公'], icon: '💼', type: 'work' },
  { name: '学习', keywords: ['学习', '看书', '读书', '课程', '考试', '培训', '技能', '知识', '教程', '练习'], icon: '📚', type: 'learning' },
  { name: '娱乐', keywords: ['电影', '游戏', '看剧', '音乐', '演唱会', '旅游', '玩', '度假', '放松', '娱乐'], icon: '🎮', type: 'entertainment' },
  { name: '健康', keywords: ['医院', '看病', '药', '体检', '生病', '症状', '头疼', '发烧', '感冒', '不舒服', '养生'], icon: '❤️', type: 'health' },
  { name: '宠物', keywords: ['猫', '狗', '宠物', '遛狗', '喂食', '铲屎', '宠物医院', '猫粮', '狗粮'], icon: '🐾', type: 'pet' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history, userId } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Detect which modules should be activated based on the message
    const detectedModules = MODULE_CONFIGS.filter(config => 
      config.keywords.some(keyword => message.toLowerCase().includes(keyword))
    );

    // Extract amount if mentioned
    const amountMatch = message.match(/(\d+(?:\.\d+)?)\s*(元|块|￥|¥|rmb|RMB)?/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : null;

    // Determine if it's income or expense
    const isIncome = /收入|工资|赚|收到|进账|到账|入账|薪水|奖金|红包|转账收到/.test(message);

    // Build system prompt with context awareness
    const systemPrompt = `你是LifeBase的智能AI助手，帮助用户记录和分析日常生活。你有以下特点：

1. **温暖有同理心**：像朋友一样聊天，理解用户的情绪
2. **智能识别**：从对话中识别用户的活动类型（消费、饮食、运动、情绪、社交等）
3. **主动记录**：发现用户提到具体事件时，主动帮助记录
4. **提供洞察**：基于用户分享的信息给出简短建议

当前识别到的模块: ${detectedModules.map(m => m.name).join('、') || '无'}
${amount ? `识别到金额: ${isIncome ? '+' : '-'}${amount}元` : ''}

回复规则：
- 简洁友好，像朋友聊天
- 如果识别到具体事件，确认已帮用户记录
- 如果是情绪相关，表示理解和支持
- 如果有消费/收入，简单总结一下
- 偶尔给出一个小建议或鼓励
- 回复控制在100字以内`;

    // Call OpenAI GPT-5 for response
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.map((h: any) => ({ role: h.role, content: h.content })),
          { role: 'user', content: message }
        ],
        max_completion_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('AI response failed');
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.choices?.[0]?.message?.content || '收到了！让我想想...';

    // Activate modules and create records if needed
    let newModuleName = null;

    if (userId && detectedModules.length > 0) {
      for (const moduleConfig of detectedModules) {
        // Check if module exists
        const { data: existingModule } = await supabase
          .from('modules')
          .select('id, is_active')
          .eq('user_id', userId)
          .eq('module_type', moduleConfig.type)
          .single();

        let moduleId = existingModule?.id;

        if (!existingModule) {
          // Create new module
          const { data: newModule, error: createError } = await supabase
            .from('modules')
            .insert({
              user_id: userId,
              module_name: moduleConfig.name,
              module_type: moduleConfig.type,
              icon: moduleConfig.icon,
              is_active: true,
              record_count: 0
            })
            .select()
            .single();

          if (!createError && newModule) {
            moduleId = newModule.id;
            newModuleName = moduleConfig.name;
          }
        } else if (!existingModule.is_active) {
          // Activate existing module
          await supabase
            .from('modules')
            .update({ is_active: true })
            .eq('id', existingModule.id);
          
          newModuleName = moduleConfig.name;
        }

        // Create a record
        if (moduleId) {
          const recordAmount = amount ? (isIncome ? Math.abs(amount) : -Math.abs(amount)) : null;
          
          await supabase
            .from('records')
            .insert({
              user_id: userId,
              module_id: moduleId,
              content: message,
              input_type: 'text',
              category: moduleConfig.type,
              amount: recordAmount,
              tags: [moduleConfig.name],
              recorded_at: new Date().toISOString()
            });

          // Update module record count
          const { data: currentModule } = await supabase
            .from('modules')
            .select('record_count')
            .eq('id', moduleId)
            .single();
          
          await supabase
            .from('modules')
            .update({ 
              record_count: (currentModule?.record_count || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', moduleId);
        }
      }
    }

    return new Response(JSON.stringify({ 
      response: responseText,
      newModule: newModuleName,
      detectedModules: detectedModules.map(m => m.name),
      amount: amount ? (isIncome ? amount : -amount) : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Smart assistant error:', error);
    return new Response(JSON.stringify({ 
      response: '抱歉，我遇到了一点问题。不过你说的我记住了，稍后再试试吧！',
      error: error?.message || 'Unknown error'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

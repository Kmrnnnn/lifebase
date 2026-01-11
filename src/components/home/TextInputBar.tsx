import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCreateModule } from '@/hooks/useModules';
import { useCreateRecord } from '@/hooks/useRecords';
import { VoiceInputButton } from './VoiceInputButton';

const MODULE_NAMES: Record<string, string> = {
  spending: '消费',
  income: '收入',
  diet: '饮食',
  ingredients: '食材库',
  pet: '宠物',
  sleep: '作息',
  exercise: '运动',
  social: '社交',
};

export function TextInputBar() {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const createModule = useCreateModule();
  const createRecord = useCreateRecord();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      // Analyze text with AI
      const { data, error } = await supabase.functions.invoke('analyze-text', {
        body: { text: text.trim() },
      });

      if (error) throw error;

      // Create or get module
      const module = await createModule.mutateAsync(data.suggested_module);

      // Create record
      await createRecord.mutateAsync({
        module_id: module?.id,
        input_type: 'text',
        content: text.trim(),
        amount: data.amount,
        category: data.category,
        subcategory: data.subcategory,
        ai_analysis: data,
      });

      const moduleName = MODULE_NAMES[data.suggested_module] || data.suggested_module;
      const isIncome = data.is_income;
      
      toast.success(
        isIncome ? '收入已记录！' : '记录已保存！', 
        { description: `已添加到 ${moduleName} 模块` }
      );
      setText('');
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('处理失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-3 flex gap-2 items-center">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入：今天吃了38块炸鸡..."
        className="flex-1 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary text-foreground placeholder:text-muted-foreground"
        disabled={isProcessing}
        style={{ color: 'hsl(150 20% 90%)' }}
      />
      <VoiceInputButton />
      <button
        type="submit"
        disabled={!text.trim() || isProcessing}
        className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center disabled:opacity-50 hover:opacity-90 transition-opacity"
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
        ) : (
          <Send className="w-5 h-5 text-primary-foreground" />
        )}
      </button>
    </form>
  );
}

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useChatHistory, useSaveChatMessage, useClearChatHistory } from '@/hooks/useChatHistory';
import { toast } from 'sonner';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}

export function AIChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: chatHistory, isLoading: historyLoading } = useChatHistory();
  const saveChatMessage = useSaveChatMessage();
  const clearChatHistory = useClearChatHistory();

  // Load chat history on mount
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      setMessages(chatHistory.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })));
    } else if (!historyLoading && chatHistory?.length === 0) {
      setMessages([
        { role: 'assistant', content: '你好！我是你的生活助手，有什么可以帮你的吗？比如"这个月外卖花了多少？"' }
      ]);
    }
  }, [chatHistory, historyLoading]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    const newUserMessage: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Save user message to history
      await saveChatMessage.mutateAsync({ role: 'user', content: userMessage });

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { message: userMessage, history: messages },
      });

      if (error) throw error;

      const assistantMessage: Message = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save assistant message to history
      await saveChatMessage.mutateAsync({ role: 'assistant', content: data.response });
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，我遇到了一些问题，请稍后再试。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearChatHistory.mutateAsync();
      setMessages([
        { role: 'assistant', content: '对话已清空！有什么可以帮你的吗？' }
      ]);
      toast.success('对话历史已清空');
    } catch (error) {
      toast.error('清空失败，请重试');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full gradient-primary flex items-center justify-center glow-primary hover:scale-110 transition-transform animate-float"
      >
        <MessageCircle className="w-6 h-6 text-primary-foreground" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 left-4 z-40 max-w-sm ml-auto glass-strong rounded-2xl overflow-hidden animate-scale-in">
      {/* Header */}
      <div className="gradient-primary p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-medium text-primary-foreground">AI 助手</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="text-primary-foreground/80 hover:text-primary-foreground p-1"
            title="清空对话"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-primary-foreground/80 hover:text-primary-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="h-72 p-4" ref={scrollRef as any}>
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div
              key={msg.id || i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  msg.role === 'user'
                    ? 'gradient-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="问我任何问题..."
          className="flex-1 bg-muted/50 border-0 text-foreground placeholder:text-muted-foreground"
          style={{ color: 'hsl(150 20% 90%)' }}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center disabled:opacity-50"
        >
          <Send className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '你好！我是你的生活助手，有什么可以帮你的吗？比如"这个月外卖花了多少？"' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { message: userMessage, history: messages },
      });

      if (error) throw error;

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，我遇到了一些问题，请稍后再试。' }]);
    } finally {
      setIsLoading(false);
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
        <button
          onClick={() => setIsOpen(false)}
          className="text-primary-foreground/80 hover:text-primary-foreground"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <ScrollArea className="h-64 p-4">
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
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
          className="flex-1 bg-muted/50 border-0 text-gray-300 placeholder:text-gray-500"
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

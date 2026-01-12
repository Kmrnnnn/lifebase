/**
 * LifeBase - AI-First Home Page
 * 以AI对话为核心的智能生活数据银行
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useModules } from '@/hooks/useModules';
import { useChatHistory, useSaveChatMessage } from '@/hooks/useChatHistory';
import { BottomNav } from '@/components/layout/BottomNav';
import { ModuleCards } from '@/components/home/ModuleCards';
import { Loader2, Mic, Send, Phone, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Index() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: modules } = useModules();
  const { data: savedMessages } = useChatHistory();
  const saveChatMessage = useSaveChatMessage();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Onboarding redirect
  useEffect(() => {
    if (user && profile && !profile.onboarding_choice) {
      navigate('/onboarding');
    }
  }, [user, profile, navigate]);

  // Load saved messages
  useEffect(() => {
    if (savedMessages && savedMessages.length > 0) {
      const loaded = savedMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(m.created_at)
      }));
      setMessages(loaded);
    } else {
      // Welcome message
      setMessages([{
        role: 'assistant',
        content: `嗨${profile?.nickname ? ` ${profile.nickname}` : ''}！我是你的AI生活助手 ✨\n\n跟我聊聊你的日常吧，比如"今天花了50块吃午饭"或者"和朋友去看了电影"，我会帮你自动记录和分析。\n\n有什么想告诉我的？`,
        timestamp: new Date()
      }]);
    }
  }, [savedMessages, profile]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Save user message
      await saveChatMessage.mutateAsync({ role: 'user', content: userMessage.content });

      // Call AI for smart analysis and module activation
      const { data, error } = await supabase.functions.invoke('smart-assistant', {
        body: { 
          message: userMessage.content,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          userId: user?.id
        }
      });

      if (error) throw error;

      const aiResponse = data?.response || '抱歉，我暂时无法回应，请稍后再试。';
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      await saveChatMessage.mutateAsync({ role: 'assistant', content: aiResponse });

      // Check if new module was activated
      if (data?.newModule) {
        toast.success(`🎉 新模块已激活: ${data.newModule}`);
      }

    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '抱歉，我遇到了一点问题。请再试一次吧！',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startVoiceInput = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('您的浏览器不支持语音输入');
      return;
    }

    setIsListening(true);
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error('语音识别失败，请重试');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center breathing">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-24 safe-top safe-bottom">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] rounded-full bg-accent/10 blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto flex flex-col h-screen">
        {/* Header */}
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold gradient-text">LifeBase</h1>
            <p className="text-xs text-muted-foreground">智能生活数据银行</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full glass flex items-center justify-center text-primary hover:glow-primary transition-all">
              <Phone className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Status Indicator */}
        <div className="px-4 mb-4">
          <div className="glass rounded-2xl p-4 flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center breathing">
                <Sparkles className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">AI 助手在线</p>
              <p className="text-sm text-muted-foreground">
                已激活 {modules?.filter(m => m.is_active).length || 0} 个模块
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in-bottom`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'gradient-primary text-primary-foreground rounded-br-md'
                    : 'glass text-foreground rounded-bl-md'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-white/60' : 'text-muted-foreground'}`}>
                  {msg.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start animate-slide-in-bottom">
              <div className="glass rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Active Modules Preview */}
        {modules && modules.filter(m => m.is_active).length > 0 && (
          <div className="px-4 py-2">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {modules.filter(m => m.is_active).slice(0, 5).map((module) => (
                <button
                  key={module.id}
                  onClick={() => navigate(`/bank/${module.id}`)}
                  className="flex-shrink-0 glass rounded-xl px-3 py-2 flex items-center gap-2 hover:glow-primary transition-all"
                >
                  <span className="text-lg">{module.icon || '📊'}</span>
                  <span className="text-xs font-medium text-foreground">{module.module_name}</span>
                  <span className="text-xs text-primary">{module.record_count || 0}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-4 py-4 glass-strong">
          <div className="flex items-center gap-3">
            <button
              onClick={startVoiceInput}
              disabled={isListening}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isListening 
                  ? 'gradient-primary glow-primary animate-pulse' 
                  : 'glass hover:glow-primary'
              }`}
            >
              <Mic className={`w-5 h-5 ${isListening ? 'text-white' : 'text-primary'}`} />
            </button>
            
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="告诉我你的日常..."
                className="w-full h-12 px-4 rounded-full bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isTyping}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                inputValue.trim() && !isTyping
                  ? 'gradient-primary glow-primary hover:scale-105'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

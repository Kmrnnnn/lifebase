/**
 * LifeBase Insights Page
 * 智能洞察页面 - 分析用户生活模式
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRecords, useRecentStats } from '@/hooks/useRecords';
import { useModules } from '@/hooks/useModules';
import { BottomNav } from '@/components/layout/BottomNav';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, TrendingDown, Sparkles, AlertTriangle, 
  Utensils, DollarSign, Heart, Activity, Brain, Loader2
} from 'lucide-react';

interface AIInsight {
  title: string;
  content: string;
  type: 'positive' | 'warning' | 'neutral';
  icon: string;
}

export default function Insights() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: stats } = useRecentStats();
  const { data: records } = useRecords();
  const { data: modules } = useModules();
  const navigate = useNavigate();
  
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Generate AI insights based on user data
  useEffect(() => {
    const generateInsights = async () => {
      if (!records || records.length === 0) {
        setIsLoadingInsights(false);
        return;
      }

      setIsLoadingInsights(true);

      try {
        // Analyze records by category
        const categoryStats: Record<string, { count: number; totalAmount: number; recentTrend: string[] }> = {};
        
        records.forEach(record => {
          const category = record.category || 'other';
          if (!categoryStats[category]) {
            categoryStats[category] = { count: 0, totalAmount: 0, recentTrend: [] };
          }
          categoryStats[category].count++;
          if (record.amount) {
            categoryStats[category].totalAmount += record.amount;
          }
          categoryStats[category].recentTrend.push(record.content || '');
        });

        // Generate insights based on data patterns
        const insights: AIInsight[] = [];

        // Spending insights
        if (categoryStats['spending']) {
          const spendingTotal = Math.abs(categoryStats['spending'].totalAmount);
          insights.push({
            title: '消费分析',
            content: `本周消费 ¥${spendingTotal.toFixed(0)}，共 ${categoryStats['spending'].count} 笔记录。`,
            type: spendingTotal > 1000 ? 'warning' : 'neutral',
            icon: '💰'
          });
        }

        // Diet insights
        if (categoryStats['diet']) {
          insights.push({
            title: '饮食习惯',
            content: `记录了 ${categoryStats['diet'].count} 次饮食，保持规律饮食是健康的基础！`,
            type: 'positive',
            icon: '🍱'
          });
        }

        // Mood insights
        if (categoryStats['mood']) {
          insights.push({
            title: '情绪状态',
            content: `近期有 ${categoryStats['mood'].count} 条情绪记录。关注自己的感受很重要，继续保持！`,
            type: 'positive',
            icon: '💭'
          });
        }

        // Social insights
        if (categoryStats['social']) {
          insights.push({
            title: '社交活动',
            content: `参与了 ${categoryStats['social'].count} 次社交活动，良好的社交有助于心理健康。`,
            type: 'positive',
            icon: '👥'
          });
        }

        // Overall activity
        if (modules && modules.filter(m => m.is_active).length > 0) {
          const activeModules = modules.filter(m => m.is_active);
          insights.push({
            title: 'AI发现',
            content: `你已激活 ${activeModules.length} 个生活模块，数据越多，洞察越精准！`,
            type: 'neutral',
            icon: '✨'
          });
        }

        // If not enough data
        if (insights.length === 0) {
          insights.push({
            title: '开始记录',
            content: '多和AI助手聊聊你的日常，我会帮你发现生活中的模式和趋势。',
            type: 'neutral',
            icon: '💡'
          });
        }

        setAiInsights(insights);
      } catch (error) {
        console.error('Failed to generate insights:', error);
      } finally {
        setIsLoadingInsights(false);
      }
    };

    generateInsights();
  }, [records, modules]);

  if (!user) return null;

  const hasData = records && records.length > 0;

  // Calculate category distribution
  const categoryData = records?.reduce((acc, record) => {
    const category = record.category || 'other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const categoryIcons: Record<string, React.ReactNode> = {
    spending: <DollarSign className="w-4 h-4" />,
    diet: <Utensils className="w-4 h-4" />,
    health: <Heart className="w-4 h-4" />,
    fitness: <Activity className="w-4 h-4" />,
    mood: <Brain className="w-4 h-4" />,
  };

  return (
    <div className="min-h-screen bg-background pb-24 safe-top safe-bottom">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px]" />
        <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] rounded-full bg-primary/10 blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="animate-slide-in-bottom">
          <h1 className="text-2xl font-bold gradient-text">洞察</h1>
          <p className="text-muted-foreground text-sm">AI为你分析生活模式</p>
        </div>

        {hasData ? (
          <>
            {/* Weekly Overview */}
            <div className="glass rounded-2xl p-5 animate-slide-in-bottom" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">本周概览</h3>
                  <p className="text-sm text-muted-foreground">过去7天</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="glass-light rounded-xl p-4">
                  <p className="text-muted-foreground text-sm">总消费</p>
                  <p className="text-3xl font-bold gradient-text">
                    ¥{Math.abs(stats?.totalSpending || 0).toFixed(0)}
                  </p>
                </div>
                <div className="glass-light rounded-xl p-4">
                  <p className="text-muted-foreground text-sm">记录数</p>
                  <p className="text-3xl font-bold gradient-text">
                    {stats?.recordCount || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            {Object.keys(categoryData).length > 0 && (
              <div className="glass rounded-2xl p-5 animate-slide-in-bottom" style={{ animationDelay: '0.15s' }}>
                <h3 className="font-semibold text-foreground mb-4">分类分布</h3>
                <div className="space-y-3">
                  {Object.entries(categoryData)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([category, count]) => {
                      const total = records?.length || 1;
                      const percentage = Math.round((count / total) * 100);
                      return (
                        <div key={category} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                                {categoryIcons[category] || <Sparkles className="w-3 h-3" />}
                              </span>
                              <span className="text-sm text-foreground capitalize">{category}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{count} ({percentage}%)</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full gradient-primary rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* AI Insights */}
            <div className="glass rounded-2xl p-5 animate-slide-in-bottom" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center breathing">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">AI 洞察</h3>
                  <p className="text-sm text-muted-foreground">基于你的数据分析</p>
                </div>
              </div>

              {isLoadingInsights ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  {aiInsights.map((insight, idx) => (
                    <div 
                      key={idx}
                      className={`glass-light rounded-xl p-4 ${
                        insight.type === 'warning' ? 'border border-yellow-500/30' :
                        insight.type === 'positive' ? 'border border-green-500/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{insight.icon}</span>
                        <div>
                          <p className="font-medium text-foreground">{insight.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{insight.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tip */}
            <div className="text-center py-4 text-sm text-muted-foreground animate-slide-in-bottom" style={{ animationDelay: '0.3s' }}>
              💡 继续记录，AI会发现更多有趣的模式
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="glass rounded-2xl p-8 text-center animate-slide-in-bottom">
            <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center breathing">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              还没有足够的数据
            </h3>
            <p className="text-muted-foreground mb-6">
              回到首页和AI助手聊聊你的日常，<br />
              我会帮你发现生活中的模式和趋势
            </p>
            <button
              onClick={() => navigate('/')}
              className="gradient-primary text-primary-foreground font-medium px-6 py-3 rounded-xl hover:glow-primary transition-all"
            >
              开始记录
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

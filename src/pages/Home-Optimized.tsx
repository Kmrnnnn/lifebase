/**
 * LifeBase Home - Optimized Version
 * 改进的主页面，展示数据银行和快速操作
 */

import { useState, useEffect } from 'react';
import { Plus, Database, TrendingUp, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAIIntegration } from '@/hooks/useAIIntegration';
import { AIChatBubble } from '@/components/home/AIChatBubble';

export function HomeOptimized() {
  const { user } = useAuth();
  const { getUserStats, getUserInsights } = useAIIntegration({
    userId: user?.id || ''
  });

  const [stats, setStats] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingStats(true);
        const statsData = await getUserStats?.();
        const insightsData = await getUserInsights?.();
        
        if (statsData) setStats(statsData);
        if (insightsData) setInsights(insightsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-primary/10 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text">LifeBase</h1>
              <p className="text-sm text-muted-foreground">生活本源 · 个人数据银行</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">欢迎回来</p>
              <p className="font-semibold">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Data Bank Overview */}
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">数据银行</h2>
          </div>

          {isLoadingStats ? (
            <div className="space-y-2">
              <div className="h-4 bg-primary/10 rounded animate-pulse"></div>
              <div className="h-4 bg-primary/10 rounded animate-pulse w-3/4"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">总记录数</span>
                <span className="text-2xl font-bold text-primary">
                  {stats?.totalEntries || 0}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-background/50 border border-primary/10">
                  <p className="text-xs text-muted-foreground mb-1">活跃模块</p>
                  <p className="text-lg font-semibold">
                    {stats?.moduleCount || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-primary/10">
                  <p className="text-xs text-muted-foreground mb-1">最后更新</p>
                  <p className="text-sm font-semibold">
                    {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString() : '无'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            size="lg"
            className="h-24 flex flex-col items-center justify-center gap-2 gradient-primary text-primary-foreground hover:opacity-90"
            onClick={() => window.location.href = '/data-entry'}
          >
            <Plus className="w-6 h-6" />
            <span>新建记录</span>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => window.location.href = '/insights'}
          >
            <Brain className="w-6 h-6" />
            <span>AI洞察</span>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => window.location.href = '/analytics'}
          >
            <TrendingUp className="w-6 h-6" />
            <span>数据分析</span>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => window.location.href = '/settings'}
          >
            <span>⚙️</span>
            <span>设置</span>
          </Button>
        </div>

        {/* AI Insights */}
        {insights && (
          <div className="rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-secondary" />
              <h2 className="text-xl font-bold">AI洞察</h2>
            </div>

            {insights.summary && (
              <div className="mb-4 p-3 rounded-lg bg-background/50 border border-secondary/10">
                <p className="text-sm text-foreground/80">{insights.summary}</p>
              </div>
            )}

            {insights.recommendations && insights.recommendations.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">建议</p>
                {insights.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex gap-2 p-2 rounded bg-background/50 border border-secondary/10"
                  >
                    <span className="text-secondary">💡</span>
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Chat Bubble */}
      <AIChatBubble />
    </div>
  );
}

export default HomeOptimized;

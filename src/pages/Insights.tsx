import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRecords, useRecentStats } from '@/hooks/useRecords';
import { useModules } from '@/hooks/useModules';
import { BottomNav } from '@/components/layout/BottomNav';
import { TrendingUp, TrendingDown, Sparkles, AlertTriangle } from 'lucide-react';

export default function Insights() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: stats } = useRecentStats();
  const { data: records } = useRecords();
  const { data: modules } = useModules();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (!user) return null;

  const hasData = records && records.length > 0;

  return (
    <div className="dark min-h-screen bg-background pb-20">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-80 h-80 rounded-full bg-accent opacity-10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="animate-slide-in-bottom">
          <h1 className="text-2xl font-bold text-foreground">洞察</h1>
          <p className="text-muted-foreground">了解你的生活模式</p>
        </div>

        {hasData ? (
          <>
            {/* Weekly Stats */}
            <div className="glass rounded-2xl p-5 animate-slide-in-bottom">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">本周概览</h3>
                  <p className="text-sm text-muted-foreground">过去7天</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-muted-foreground text-sm">总消费</p>
                  <p className="text-2xl font-bold text-foreground">
                    ¥{stats?.totalSpending.toFixed(0) || 0}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-muted-foreground text-sm">记录数</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.recordCount || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="glass rounded-2xl p-5 animate-slide-in-bottom">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">AI 发现</h3>
                  <p className="text-sm text-muted-foreground">基于你的数据</p>
                </div>
              </div>

              <div className="space-y-3">
                {modules && modules.length > 0 ? (
                  <div className="flex items-start gap-3 bg-muted/30 rounded-xl p-3">
                    <TrendingDown className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-foreground text-sm">
                        你已开启 {modules.length} 个模块，共记录 {records?.length || 0} 条数据
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">
                        继续记录，AI 将发现更多有趣的模式
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 bg-muted/30 rounded-xl p-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-foreground text-sm">数据还不够多</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        多记录一些数据，AI 就能给你更多洞察
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="glass rounded-2xl p-8 text-center animate-slide-in-bottom">
            <div className="w-16 h-16 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              还没有足够的数据
            </h3>
            <p className="text-muted-foreground">
              开始记录你的日常，AI 会帮你发现生活中的模式和趋势
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

/**
 * LifeBase OKX-Style Home Page
 * 参考OKX设计的现代金融应用主页
 */

import { useState, useEffect } from 'react';
import { Plus, Eye, EyeOff, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAIIntegration } from '@/hooks/useAIIntegration';

export function OKXHome() {
  const { user } = useAuth();
  const { getUserStats, getUserInsights } = useAIIntegration({
    userId: user?.id || ''
  });

  const [showBalance, setShowBalance] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const statsData = await getUserStats?.();
        const insightsData = await getUserInsights?.();
        
        if (statsData) setStats(statsData);
        if (insightsData) setInsights(insightsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  return (
    <div className="space-y-6 pb-24">
      {/* Welcome Section */}
      <div className="space-y-2">
        <p className="text-slate-400 text-sm">欢迎回来</p>
        <h1 className="text-3xl font-bold">LifeBase</h1>
        <p className="text-slate-400 text-sm">个人数据银行 · 智能生活管理</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">数据银行总值</span>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 hover:bg-slate-800/50 rounded-lg transition"
          >
            {showBalance ? (
              <Eye className="w-5 h-5 text-slate-400" />
            ) : (
              <EyeOff className="w-5 h-5 text-slate-400" />
            )}
          </button>
        </div>

        <div className="space-y-2">
          <div className="text-4xl font-bold">
            {showBalance ? (
              <>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  {stats?.totalEntries || 0}
                </span>
                <span className="text-lg text-slate-400 ml-2">条记录</span>
              </>
            ) : (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                ••••••
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm">
            {stats?.lastUpdated ? `最后更新: ${new Date(stats.lastUpdated).toLocaleDateString()}` : '暂无数据'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-700/50">
          <div className="space-y-1">
            <p className="text-slate-400 text-xs">活跃模块</p>
            <p className="text-lg font-semibold">{stats?.moduleCount || 0}</p>
          </div>
          <div className="space-y-1">
            <p className="text-slate-400 text-xs">本周增长</p>
            <p className="text-lg font-semibold text-green-400">+{Math.floor(Math.random() * 50)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-slate-400 text-xs">完成度</p>
            <p className="text-lg font-semibold text-blue-400">85%</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl p-4 flex items-center justify-center gap-2 font-semibold transition-all hover:scale-105">
          <Plus className="w-5 h-5" />
          <span>新建记录</span>
        </button>

        <button className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-center gap-2 font-semibold transition-all hover:scale-105">
          <Zap className="w-5 h-5" />
          <span>AI洞察</span>
        </button>
      </div>

      {/* Assets Overview */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold">资产概览</h2>

        <div className="grid grid-cols-2 gap-3">
          {/* Spending */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">本月支出</span>
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-2xl font-bold">¥{Math.floor(Math.random() * 5000)}</p>
            <div className="flex items-center gap-1 text-red-400 text-xs">
              <ArrowDownLeft className="w-3 h-3" />
              <span>↑ 12% 较上月</span>
            </div>
          </div>

          {/* Income */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">本月收入</span>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold">¥{Math.floor(Math.random() * 10000)}</p>
            <div className="flex items-center gap-1 text-green-400 text-xs">
              <ArrowUpRight className="w-3 h-3" />
              <span>↑ 8% 较上月</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {insights && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold">AI洞察</h2>

          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span className="font-semibold">AI建议</span>
            </div>

            {insights.recommendations && insights.recommendations.length > 0 && (
              <div className="space-y-2">
                {insights.recommendations.slice(0, 2).map((rec: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 text-sm text-slate-300"
                  >
                    💡 {rec}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold">最近活动</h2>

        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
                  {i}
                </div>
                <div>
                  <p className="font-semibold">记录 #{i}</p>
                  <p className="text-xs text-slate-400">2小时前</p>
                </div>
              </div>
              <p className="font-semibold text-green-400">+¥{Math.floor(Math.random() * 500)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OKXHome;

/**
 * LifeBase OKX-Style Analytics Page
 * 数据分析和洞察页面
 */

import { BarChart3, TrendingUp, Calendar, Download } from 'lucide-react';

export function OKXAnalytics() {
  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">数据分析</h1>
        <p className="text-slate-400 text-sm">深度洞察你的生活数据</p>
      </div>

      {/* Time Period Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['7天', '30天', '90天', '1年', '全部'].map((period) => (
          <button
            key={period}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-semibold transition ${
              period === '30天'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:text-white'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-2">
          <p className="text-slate-400 text-xs">平均每日支出</p>
          <p className="text-2xl font-bold">¥156</p>
          <p className="text-xs text-red-400">↑ 8% 较上周</p>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-2">
          <p className="text-slate-400 text-xs">完成度</p>
          <p className="text-2xl font-bold">87%</p>
          <p className="text-xs text-green-400">↑ 3% 较上周</p>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-2">
          <p className="text-slate-400 text-xs">记录次数</p>
          <p className="text-2xl font-bold">156</p>
          <p className="text-xs text-green-400">↑ 12% 较上周</p>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-2">
          <p className="text-slate-400 text-xs">活跃天数</p>
          <p className="text-2xl font-bold">28</p>
          <p className="text-xs text-green-400">连续记录</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            支出趋势
          </h2>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition">
            <Download className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Mock Chart */}
        <div className="space-y-4">
          {[
            { day: '周一', amount: 120, height: '40%' },
            { day: '周二', amount: 180, height: '60%' },
            { day: '周三', amount: 95, height: '32%' },
            { day: '周四', amount: 210, height: '70%' },
            { day: '周五', amount: 150, height: '50%' },
            { day: '周六', amount: 280, height: '93%' },
            { day: '周日', amount: 100, height: '33%' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-end gap-2">
              <span className="text-xs text-slate-400 w-10">{item.day}</span>
              <div className="flex-1 flex items-end gap-1">
                <div
                  className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:from-blue-500 hover:to-blue-300"
                  style={{ height: item.height }}
                ></div>
              </div>
              <span className="text-xs text-slate-400 w-12 text-right">¥{item.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold">分类统计</h2>

        <div className="space-y-3">
          {[
            { name: '饮食', amount: 1200, percentage: 45, color: 'from-orange-500 to-red-500' },
            { name: '交通', amount: 600, percentage: 23, color: 'from-blue-500 to-cyan-500' },
            { name: '娱乐', amount: 400, percentage: 15, color: 'from-purple-500 to-pink-500' },
            { name: '其他', amount: 350, percentage: 17, color: 'from-green-500 to-emerald-500' },
          ].map((category, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{category.name}</span>
                <span className="text-slate-400">¥{category.amount}</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${category.color}`}
                  style={{ width: `${category.percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400">{category.percentage}% 的总支出</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          AI洞察
        </h2>

        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
            <p className="text-sm">💡 <strong>支出趋势：</strong>本周平均支出较上周增加12%，主要来自饮食和娱乐支出。</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
            <p className="text-sm">🎯 <strong>建议：</strong>建议减少外卖支出，尝试自己做饭可以节省30-40%的饮食成本。</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
            <p className="text-sm">📈 <strong>预测：</strong>按照当前趋势，本月支出预计为¥4,680，超预算20%。</p>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl py-4 font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105">
        <Download className="w-5 h-5" />
        <span>导出数据报告</span>
      </button>
    </div>
  );
}

export default OKXAnalytics;

/**
 * LifeBase OKX-Style Assets Page
 * 资产和数据管理页面
 */

import { MoreVertical, Plus, Filter, Download } from 'lucide-react';

export function OKXAssets() {
  const assets = [
    { name: '饮食数据', value: 156, change: '+12%', color: 'from-orange-500 to-red-500' },
    { name: '财务数据', value: 2450, change: '+8%', color: 'from-green-500 to-emerald-500' },
    { name: '健康数据', value: 89, change: '+5%', color: 'from-blue-500 to-cyan-500' },
    { name: '习惯数据', value: 42, change: '+15%', color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">资产管理</h1>
        <p className="text-slate-400 text-sm">查看和管理你的所有数据资产</p>
      </div>

      {/* Total Assets Card */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">总资产价值</span>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition">
            <MoreVertical className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            ¥2,737
          </p>
          <p className="text-slate-400 text-sm">
            <span className="text-green-400">↑ 10%</span> 较上周
          </p>
        </div>

        {/* Asset Distribution */}
        <div className="pt-4 border-t border-slate-700/50">
          <div className="space-y-2">
            {assets.map((asset, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${asset.color}`}></div>
                  <span className="text-sm text-slate-300">{asset.name}</span>
                </div>
                <span className="text-sm font-semibold">{asset.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Asset Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">数据分类</h2>
          <button className="p-2 hover:bg-slate-800 rounded-lg transition">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {assets.map((asset, idx) => (
            <div
              key={idx}
              className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-3 hover:border-slate-600/50 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${asset.color} flex items-center justify-center text-white font-bold`}>
                  {asset.name[0]}
                </div>
                <span className={`text-xs font-semibold ${asset.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {asset.change}
                </span>
              </div>

              <div>
                <p className="text-slate-400 text-xs mb-1">{asset.name}</p>
                <p className="text-2xl font-bold">{asset.value}</p>
              </div>

              <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${asset.color}`}
                  style={{ width: `${Math.random() * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">最近交易</h2>
          <button className="p-2 hover:bg-slate-800 rounded-lg transition">
            <Download className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {[
            { name: '早餐支出', amount: '-¥15', time: '今天 08:30', icon: '🍳' },
            { name: '健身房签到', amount: '+1', time: '今天 07:00', icon: '💪' },
            { name: '午餐外卖', amount: '-¥38', time: '昨天 12:15', icon: '🍜' },
            { name: '阅读打卡', amount: '+1', time: '昨天 21:00', icon: '📖' },
          ].map((tx, idx) => (
            <div
              key={idx}
              className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between hover:border-slate-600/50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{tx.icon}</div>
                <div>
                  <p className="font-semibold">{tx.name}</p>
                  <p className="text-xs text-slate-400">{tx.time}</p>
                </div>
              </div>
              <p className={`font-semibold ${tx.amount.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
                {tx.amount}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl py-4 font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105">
        <Plus className="w-5 h-5" />
        <span>新建资产</span>
      </button>
    </div>
  );
}

export default OKXAssets;

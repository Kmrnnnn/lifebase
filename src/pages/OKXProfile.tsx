/**
 * LifeBase OKX-Style Profile Page
 * 个人主页和设置页面
 */

import { Settings, LogOut, Shield, Bell, Download, Share2, Edit2, Upload } from 'lucide-react';
import { useState } from 'react';

export function OKXProfile() {
  const [isEditing, setIsEditing] = useState(false);

  const menuItems = [
    { icon: Shield, label: '数据隐私', description: '管理你的数据权限' },
    { icon: Bell, label: '通知设置', description: '自定义通知偏好' },
    { icon: Download, label: '导出数据', description: '导出你的所有数据' },
    { icon: Share2, label: '分享成就', description: '分享你的自律故事' },
    { icon: Settings, label: '账户设置', description: '修改账户信息' },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white">
                U
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition">
                <Upload className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h1 className="text-2xl font-bold">用户名</h1>
              <p className="text-slate-400 text-sm">user@example.com</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 hover:bg-slate-800 rounded-lg transition"
          >
            <Edit2 className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-700/50">
          <div className="space-y-1">
            <p className="text-slate-400 text-xs">数据条数</p>
            <p className="text-lg font-bold">1,256</p>
          </div>
          <div className="space-y-1">
            <p className="text-slate-400 text-xs">连续天数</p>
            <p className="text-lg font-bold">28</p>
          </div>
          <div className="space-y-1">
            <p className="text-slate-400 text-xs">完成度</p>
            <p className="text-lg font-bold">87%</p>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-3">
        <p className="text-slate-400 text-sm">个人简介</p>
        <textarea
          disabled={!isEditing}
          defaultValue="一个热爱自律和自我提升的大学生，正在用LifeBase改变我的生活。"
          className="w-full h-20 p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {isEditing && (
          <button className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg py-2 font-semibold transition">
            保存
          </button>
        )}
      </div>

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between hover:border-slate-600/50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-600/20">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.description}</p>
                </div>
              </div>
              <span className="text-slate-400">›</span>
            </button>
          );
        })}
      </div>

      {/* Achievements Section */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold">成就徽章</h2>

        <div className="grid grid-cols-4 gap-3">
          {[
            { emoji: '🔥', label: '7天连续' },
            { emoji: '💪', label: '健身达人' },
            { emoji: '💰', label: '理财小能手' },
            { emoji: '📚', label: '阅读爱好者' },
            { emoji: '🎯', label: '目标达成' },
            { emoji: '🌟', label: '完美周' },
            { emoji: '🚀', label: '快速成长' },
            { emoji: '👑', label: '月度冠军' },
          ].map((badge, idx) => (
            <div
              key={idx}
              className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:border-slate-600/50 transition cursor-pointer"
            >
              <span className="text-2xl">{badge.emoji}</span>
              <span className="text-xs text-center text-slate-400">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Community Section */}
      <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold">社区分享</h2>

        <p className="text-sm text-slate-300">
          分享你的自律故事和生活改变，激励更多人加入LifeBase社区。
        </p>

        <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg py-3 font-semibold transition-all hover:scale-105">
          分享我的故事
        </button>
      </div>

      {/* Danger Zone */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-red-400">危险区域</h2>

        <button className="w-full bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 rounded-xl py-3 font-semibold text-red-400 transition flex items-center justify-center gap-2">
          <LogOut className="w-5 h-5" />
          <span>退出登录</span>
        </button>

        <button className="w-full bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 rounded-xl py-3 font-semibold text-red-400 transition">
          删除账户
        </button>
      </div>

      {/* Footer */}
      <div className="text-center space-y-2 pt-4 border-t border-slate-700/50">
        <p className="text-slate-400 text-sm">LifeBase v1.0.0</p>
        <p className="text-slate-500 text-xs">© 2024 LifeBase. All rights reserved.</p>
      </div>
    </div>
  );
}

export default OKXProfile;

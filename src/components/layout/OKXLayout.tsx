/**
 * LifeBase OKX-Style Layout
 * 参考OKX设计的现代金融应用布局
 */

import { ReactNode } from 'react';
import { Home, Wallet, TrendingUp, User, MessageCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface OKXLayoutProps {
  children: ReactNode;
}

export function OKXLayout({ children }: OKXLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/assets', label: '资产', icon: Wallet },
    { path: '/analytics', label: '分析', icon: TrendingUp },
    { path: '/profile', label: '我的', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-white">
              LB
            </div>
            <span className="font-bold text-lg hidden sm:inline">LifeBase</span>
          </div>

          {/* Center: Search (Optional) */}
          <div className="hidden md:flex flex-1 max-w-xs mx-8">
            <input
              type="text"
              placeholder="搜索..."
              className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-slate-800 transition">
              <MessageCircle className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-800 transition">
              <span>🔔</span>
            </button>
            <button className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
              U
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="sticky bottom-0 z-50 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800/50 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between md:justify-center md:gap-12">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
                    active
                      ? 'text-blue-400 bg-blue-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* AI Chat Bubble */}
      <div className="fixed bottom-24 right-6 z-40">
        <button className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all animate-pulse">
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}

export default OKXLayout;

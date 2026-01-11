import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Lightbulb, Wallet, User } from 'lucide-react';

const navItems = [
  { icon: Home, label: '首页', path: '/' },
  { icon: Lightbulb, label: '洞察', path: '/insights' },
  { icon: Wallet, label: '银行', path: '/bank' },
  { icon: User, label: '我的', path: '/profile' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className={`relative ${isActive ? 'glow-primary' : ''}`}>
                  <item.icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  {isActive && (
                    <div className="absolute inset-0 gradient-primary opacity-20 blur-xl" />
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

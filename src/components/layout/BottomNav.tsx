import { NavLink } from 'react-router-dom';
import { Home, BarChart3, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/insights', icon: BarChart3, label: '洞察' },
  { to: '/bank', icon: Database, label: '我的银行' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                'flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-xl transition-all',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn(
                    'w-6 h-6 transition-transform',
                    isActive && 'scale-110'
                  )} />
                  <span className="text-xs font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

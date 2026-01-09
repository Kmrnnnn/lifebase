import { useProfile } from '@/hooks/useProfile';
import { useModules } from '@/hooks/useModules';
import { useRecords } from '@/hooks/useRecords';
import { User } from 'lucide-react';

export function ProfileCard() {
  const { data: profile } = useProfile();
  const { data: modules } = useModules();
  const { data: records } = useRecords();

  const moduleCount = modules?.length || 0;
  const recordCount = records?.length || 0;

  return (
    <div className="glass rounded-2xl p-5 animate-slide-in-bottom">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center glow-primary">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt="Avatar" 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-7 h-7 text-primary-foreground" />
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">
            {profile?.nickname || '数据探索者'}
          </h2>
          <p className="text-muted-foreground text-sm">
            数据银行 · {moduleCount} 模块 · {recordCount} 条记录
          </p>
        </div>
      </div>
    </div>
  );
}

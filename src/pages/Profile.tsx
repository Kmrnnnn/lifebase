import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useModules } from '@/hooks/useModules';
import { useRecentStats } from '@/hooks/useRecords';
import { BottomNav } from '@/components/layout/BottomNav';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Trophy,
  Target,
  Calendar,
  Edit3,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: modules } = useModules();
  const { data: stats } = useRecentStats();
  const updateProfile = useUpdateProfile();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editedNickname, setEditedNickname] = useState('');

  const handleStartEdit = () => {
    setEditedNickname(profile?.nickname || '');
    setIsEditing(true);
  };

  const handleSaveNickname = async () => {
    try {
      await updateProfile.mutateAsync({ nickname: editedNickname });
      setIsEditing(false);
      toast.success('昵称已更新');
    } catch (error) {
      toast.error('更新失败');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (profileLoading) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const memberDays = profile?.created_at 
    ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="dark min-h-screen bg-background pb-20">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full gradient-primary opacity-10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="glass rounded-3xl p-6 animate-slide-up">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 ring-2 ring-primary/30">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="gradient-primary text-2xl text-primary-foreground">
                {profile?.nickname?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editedNickname}
                    onChange={(e) => setEditedNickname(e.target.value)}
                    className="h-9 bg-muted/50 border-0 text-foreground"
                    style={{ color: 'hsl(150 20% 90%)' }}
                    placeholder="输入昵称"
                  />
                  <button
                    onClick={handleSaveNickname}
                    className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">
                    {profile?.nickname || '新用户'}
                  </h1>
                  <button
                    onClick={handleStartEdit}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 animate-slide-in-bottom">
          <div className="glass rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full gradient-primary">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{memberDays}</p>
            <p className="text-xs text-muted-foreground">加入天数</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full gradient-accent">
              <Trophy className="w-5 h-5 text-accent-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{modules?.length || 0}</p>
            <p className="text-xs text-muted-foreground">激活模块</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full bg-secondary">
              <Target className="w-5 h-5 text-secondary-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats?.recordCount || 0}</p>
            <p className="text-xs text-muted-foreground">本周记录</p>
          </div>
        </div>

        {/* Goal Card */}
        {profile?.goal_type && (
          <div className="glass rounded-2xl p-4 animate-slide-in-bottom">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">我的目标</h3>
            <p className="text-foreground">{profile.goal_type}</p>
          </div>
        )}

        {/* Menu Items */}
        <div className="glass rounded-2xl overflow-hidden animate-slide-in-bottom">
          <button
            onClick={() => navigate('/bank')}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <span className="text-foreground">数据管理</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <div className="h-px bg-border mx-4" />
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-destructive" />
              </div>
              <span className="text-foreground">退出登录</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>LifeBase · 生活本源</p>
          <p className="text-xs mt-1">Version 1.0.0</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

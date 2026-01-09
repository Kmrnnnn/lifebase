import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useModules } from '@/hooks/useModules';
import { useRecords } from '@/hooks/useRecords';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Database, ChevronRight, LogOut, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Bank() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { data: modules } = useModules();
  const { data: records } = useRecords();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleExportData = () => {
    const exportData = {
      modules,
      records,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifebase-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('数据已导出');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
    toast.success('已退出登录');
  };

  if (!user) return null;

  return (
    <div className="dark min-h-screen bg-background pb-20">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-1/4 left-0 w-80 h-80 rounded-full bg-secondary opacity-10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="animate-slide-in-bottom">
          <h1 className="text-2xl font-bold text-foreground">我的银行</h1>
          <p className="text-muted-foreground">管理你的数据模块</p>
        </div>

        {/* Stats */}
        <div className="glass rounded-2xl p-5 animate-slide-in-bottom">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Database className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">数据概览</h3>
              <p className="text-sm text-muted-foreground">
                {modules?.length || 0} 个模块 · {records?.length || 0} 条记录
              </p>
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-3 animate-slide-in-bottom">
          <h3 className="text-sm font-medium text-muted-foreground px-1">
            模块管理
          </h3>
          {modules && modules.length > 0 ? (
            modules.map((module) => (
              <button
                key={module.id}
                onClick={() => navigate(`/bank/${module.id}`)}
                className="w-full glass rounded-xl p-4 flex items-center gap-4 hover:scale-[1.01] transition-transform"
              >
                <div className="text-2xl">{module.icon}</div>
                <div className="flex-1 text-left">
                  <h4 className="font-medium text-foreground">{module.module_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {module.record_count} 条记录
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))
          ) : (
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-muted-foreground">
                还没有激活的模块，去首页记录一些数据吧
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3 animate-slide-in-bottom">
          <h3 className="text-sm font-medium text-muted-foreground px-1">
            数据控制
          </h3>
          <Button
            variant="outline"
            className="w-full justify-start h-12"
            onClick={handleExportData}
          >
            <Download className="w-5 h-5 mr-3" />
            导出所有数据
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start h-12 text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            退出登录
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

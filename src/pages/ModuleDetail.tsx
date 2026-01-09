import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useModules } from '@/hooks/useModules';
import { useRecords } from '@/hooks/useRecords';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function ModuleDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const { data: modules } = useModules();
  const { data: records, isLoading: recordsLoading } = useRecords(id);
  const navigate = useNavigate();

  const module = modules?.find(m => m.id === id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || recordsLoading) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !module) {
    return null;
  }

  return (
    <div className="dark min-h-screen bg-background pb-20">
      <div className="relative z-10 max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 animate-slide-in-bottom">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/bank')}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{module.icon}</span>
            <div>
              <h1 className="text-xl font-bold text-foreground">{module.module_name}</h1>
              <p className="text-sm text-muted-foreground">
                {module.record_count} 条记录
              </p>
            </div>
          </div>
        </div>

        {/* Records List */}
        <div className="space-y-3 animate-slide-in-bottom">
          {records && records.length > 0 ? (
            records.map((record) => (
              <div key={record.id} className="glass rounded-xl p-4">
                <div className="flex items-start gap-3">
                  {record.image_url && (
                    <img
                      src={record.image_url}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground">{record.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      {record.amount && (
                        <span className="text-accent font-medium">
                          ¥{record.amount.toFixed(2)}
                        </span>
                      )}
                      <span className="text-muted-foreground">
                        {format(new Date(record.recorded_at), 'MM月dd日 HH:mm', { locale: zhCN })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-muted-foreground">这个模块还没有记录</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

import { useModules } from '@/hooks/useModules';
import { useNavigate } from 'react-router-dom';

export function ModuleCards() {
  const { data: modules, isLoading } = useModules();
  const navigate = useNavigate();

  if (isLoading || !modules?.length) return null;

  return (
    <div className="space-y-3 animate-slide-in-bottom">
      <h3 className="text-sm font-medium text-muted-foreground px-1">
        已激活模块
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => navigate(`/bank/${module.id}`)}
            className="glass rounded-xl p-4 text-left hover:scale-[1.02] transition-transform"
          >
            <div className="text-2xl mb-2">{module.icon}</div>
            <h4 className="font-medium text-foreground">{module.module_name}</h4>
            <p className="text-sm text-muted-foreground">
              {module.record_count} 条记录
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

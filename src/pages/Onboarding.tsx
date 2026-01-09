import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpdateProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Wallet, Target, Sparkles, ArrowRight, Loader2 } from 'lucide-react';

const OPTIONS = [
  {
    id: 'spending' as const,
    icon: Wallet,
    title: '从消费开始',
    description: '记录日常开销，了解钱都花到哪里了',
    color: 'from-primary to-secondary',
  },
  {
    id: 'goal' as const,
    icon: Target,
    title: '我有个目标',
    description: '存钱、减肥、健身...让数据帮你达成',
    color: 'from-accent to-primary',
  },
  {
    id: 'explore' as const,
    icon: Sparkles,
    title: '让它随我成长',
    description: '不设限制，让应用随着生活自然生长',
    color: 'from-secondary to-accent',
  },
];

export default function Onboarding() {
  const [selected, setSelected] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const updateProfile = useUpdateProfile();
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!selected) {
      toast.error('请选择一个开始方式');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile.mutateAsync({
        onboarding_choice: selected as 'spending' | 'goal' | 'explore',
      });
      toast.success('设置完成！');
      navigate('/');
    } catch (error) {
      toast.error('保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full gradient-primary opacity-15 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-accent opacity-15 blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-3">你想从哪里开始？</h1>
          <p className="text-muted-foreground">
            不用担心，之后可以随时调整
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4 mb-8">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = selected === option.id;

            return (
              <button
                key={option.id}
                onClick={() => setSelected(option.id)}
                className={`
                  w-full p-5 rounded-2xl text-left transition-all duration-300
                  ${isSelected 
                    ? 'glass-strong ring-2 ring-primary scale-[1.02]' 
                    : 'glass hover:scale-[1.01]'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    bg-gradient-to-br ${option.color}
                  `}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {option.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {option.description}
                    </p>
                  </div>
                  <div className={`
                    w-6 h-6 rounded-full border-2 transition-all
                    ${isSelected 
                      ? 'border-primary bg-primary' 
                      : 'border-muted-foreground'
                    }
                  `}>
                    {isSelected && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!selected || isLoading}
          className="w-full h-14 gradient-primary hover:opacity-90 transition-opacity text-lg font-medium rounded-2xl"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              开始记录生活
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          跳过，稍后设置
        </button>
      </div>
    </div>
  );
}

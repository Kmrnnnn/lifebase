import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { BottomNav } from '@/components/layout/BottomNav';
import { ProfileCard } from '@/components/home/ProfileCard';
import { CaptureButton } from '@/components/home/CaptureButton';
import { ModuleCards } from '@/components/home/ModuleCards';
import { TextInputBar } from '@/components/home/TextInputBar';
import { AIChatBubble } from '@/components/home/AIChatBubble';
import { Loader2 } from 'lucide-react';

export default function Index() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && profile && !profile.onboarding_choice) {
      navigate('/onboarding');
    }
  }, [user, profile, navigate]);

  if (authLoading || profileLoading) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="dark min-h-screen bg-background pb-20">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full gradient-primary opacity-10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <ProfileCard />

        {/* Capture Button */}
        <div className="flex flex-col items-center py-8">
          <CaptureButton />
        </div>

        {/* Text Input */}
        <TextInputBar />

        {/* Module Cards */}
        <ModuleCards />
      </div>

      {/* AI Chat Bubble */}
      <AIChatBubble />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

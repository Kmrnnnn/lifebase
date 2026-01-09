import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AnalysisConfirmDialog } from './AnalysisConfirmDialog';

interface AnalysisResult {
  category: string;
  subcategory: string;
  amount: number | null;
  content: string;
  suggested_module: 'spending' | 'diet' | 'ingredients' | 'pet' | 'sleep' | 'exercise';
  confidence: number;
}

export function CaptureButton() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsAnalyzing(true);

    try {
      // Upload image to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('records')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('records')
        .getPublicUrl(fileName);

      setImageUrl(publicUrl);

      // Analyze image with AI
      const { data, error } = await supabase.functions.invoke('analyze-image', {
        body: { imageUrl: publicUrl },
      });

      if (error) throw error;

      setAnalysisResult(data);
      setShowDialog(true);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('分析失败，请重试');
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    setAnalysisResult(null);
    setImageUrl(null);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={handleCapture}
        disabled={isAnalyzing}
        className="relative group"
      >
        <div className="absolute inset-0 rounded-full gradient-primary opacity-50 blur-xl group-hover:blur-2xl transition-all animate-pulse-glow" />
        <div className="relative w-32 h-32 rounded-full gradient-primary flex items-center justify-center glow-primary hover:scale-105 transition-transform">
          {isAnalyzing ? (
            <Loader2 className="w-12 h-12 text-primary-foreground animate-spin" />
          ) : (
            <Camera className="w-12 h-12 text-primary-foreground" />
          )}
        </div>
      </button>

      <p className="text-muted-foreground text-center mt-4">
        {isAnalyzing ? 'AI 正在识别...' : '拍照记录小票、餐食、物品'}
      </p>

      {analysisResult && imageUrl && (
        <AnalysisConfirmDialog
          open={showDialog}
          onClose={handleDialogClose}
          analysis={analysisResult}
          imageUrl={imageUrl}
        />
      )}
    </>
  );
}

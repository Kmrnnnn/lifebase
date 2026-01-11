import { useState, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCreateModule } from '@/hooks/useModules';
import { useCreateRecord } from '@/hooks/useRecords';

const MODULE_NAMES: Record<string, string> = {
  spending: '消费',
  income: '收入',
  diet: '饮食',
  ingredients: '食材库',
  pet: '宠物',
  sleep: '作息',
  exercise: '运动',
  social: '社交',
};

export function VoiceInputButton() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const createModule = useCreateModule();
  const createRecord = useCreateRecord();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        await processRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info('开始录音...', { description: '再次点击结束录音' });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('无法访问麦克风', { description: '请确保已授权麦克风权限' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processRecording = async () => {
    if (chunksRef.current.length === 0) return;

    setIsProcessing(true);
    try {
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      
      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(audioBlob);
      const base64Audio = await base64Promise;

      // Transcribe audio
      toast.info('正在识别语音...');
      const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio },
      });

      if (transcribeError) throw transcribeError;
      
      const transcribedText = transcribeData?.text;
      if (!transcribedText) {
        toast.error('无法识别语音内容');
        return;
      }

      toast.success('语音识别成功', { description: transcribedText });

      // Analyze the transcribed text
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-text', {
        body: { text: transcribedText },
      });

      if (analysisError) throw analysisError;

      // Create module and record
      const module = await createModule.mutateAsync(analysisData.suggested_module);
      await createRecord.mutateAsync({
        module_id: module?.id,
        input_type: 'voice',
        content: transcribedText,
        amount: analysisData.amount,
        category: analysisData.category,
        subcategory: analysisData.subcategory,
        ai_analysis: analysisData,
      });

      const moduleName = MODULE_NAMES[analysisData.suggested_module] || analysisData.suggested_module;
      const isIncome = analysisData.is_income;
      
      toast.success(
        isIncome ? '收入已记录！' : '记录已保存！', 
        { description: `已添加到 ${moduleName} 模块` }
      );

    } catch (error) {
      console.error('Processing error:', error);
      toast.error('处理失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClick = () => {
    if (isProcessing) return;
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isProcessing}
      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
        isRecording 
          ? 'bg-destructive animate-recording' 
          : isProcessing 
            ? 'bg-muted' 
            : 'gradient-primary hover:scale-105 glow-primary'
      }`}
    >
      {isProcessing ? (
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      ) : isRecording ? (
        <MicOff className="w-5 h-5 text-destructive-foreground" />
      ) : (
        <Mic className="w-5 h-5 text-primary-foreground" />
      )}
    </button>
  );
}

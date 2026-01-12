/**
 * LifeBase Data Entry Page
 * 改进的数据记录页面，集成智能分类和AI建议
 */

import { useState, useRef } from 'react';
import { Camera, Mic, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAIIntegration } from '@/hooks/useAIIntegration';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function DataEntry() {
  const { user } = useAuth();
  const { processDataEntry, isLoading } = useAIIntegration({
    userId: user?.id || ''
  });

  const [input, setInput] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() && !imageData && !amount) {
      toast.error('请输入内容或上传图片');
      return;
    }

    try {
      const result = await processDataEntry({
        text: input,
        amount: amount ? parseFloat(amount) : undefined,
        imageData,
        time: new Date()
      });

      if (result) {
        setResult(result);
        setInput('');
        setAmount('');
        setImageData(null);
        toast.success('数据已记录并分类');
      }
    } catch (error) {
      toast.error('处理数据时出错');
      console.error(error);
    }
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageData(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">记录生活</h1>
          <p className="text-muted-foreground">拍照、输入或语音记录，AI自动分类和分析</p>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Preview */}
          {imageData && (
            <div className="relative rounded-xl overflow-hidden border border-primary/20">
              <img src={imageData} alt="Preview" className="w-full h-64 object-cover" />
              <button
                type="button"
                onClick={() => setImageData(null)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          )}

          {/* Input Fields */}
          <div className="space-y-4">
            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium mb-2">描述</label>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="例如：早餐吃了麦片，花了15元"
                className="w-full"
              />
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium mb-2">金额（可选）</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="w-full"
              />
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">分类（可选）</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
              >
                <option value="">自动分类</option>
                <option value="food">饮食</option>
                <option value="expense">支出</option>
                <option value="health">健康</option>
                <option value="home">居家</option>
                <option value="entertainment">娱乐</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {/* Camera Button */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-primary/20 hover:bg-primary/5 transition"
            >
              <Camera className="w-5 h-5" />
              <span>拍照</span>
            </button>

            {/* File Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-primary/20 hover:bg-primary/5 transition"
            >
              <Mic className="w-5 h-5" />
              <span>上传</span>
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg gradient-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>提交</span>
                </>
              )}
            </button>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageCapture}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageCapture}
            className="hidden"
          />
        </form>

        {/* Result Display */}
        {result && (
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <h2 className="text-xl font-bold mb-4">AI分析结果</h2>
            
            {result.classification && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">分类</h3>
                <div className="flex flex-wrap gap-2">
                  {result.classification.tags?.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.recommendation && (
              <div>
                <h3 className="font-semibold mb-2">AI建议</h3>
                <p className="text-foreground/80">{result.recommendation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DataEntry;

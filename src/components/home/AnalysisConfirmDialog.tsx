import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Check, X, Edit2, Loader2 } from 'lucide-react';
import { useCreateModule } from '@/hooks/useModules';
import { useCreateRecord } from '@/hooks/useRecords';

interface AnalysisResult {
  category: string;
  subcategory: string;
  amount: number | null;
  content: string;
  suggested_module: 'spending' | 'diet' | 'ingredients' | 'pet' | 'sleep' | 'exercise';
  confidence: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  analysis: AnalysisResult;
  imageUrl: string;
}

const MODULE_NAMES: Record<string, string> = {
  spending: '消费',
  diet: '饮食',
  ingredients: '食材库',
  pet: '宠物',
  sleep: '作息',
  exercise: '运动',
};

export function AnalysisConfirmDialog({ open, onClose, analysis, imageUrl }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAmount, setEditedAmount] = useState(analysis.amount?.toString() || '');
  const [editedContent, setEditedContent] = useState(analysis.content);
  const [isSaving, setIsSaving] = useState(false);
  
  const createModule = useCreateModule();
  const createRecord = useCreateRecord();

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      // Create or get module
      const module = await createModule.mutateAsync(analysis.suggested_module);

      // Create record
      await createRecord.mutateAsync({
        module_id: module?.id,
        input_type: 'photo',
        content: isEditing ? editedContent : analysis.content,
        image_url: imageUrl,
        amount: isEditing ? parseFloat(editedAmount) || null : analysis.amount,
        category: analysis.category,
        subcategory: analysis.subcategory,
        ai_analysis: analysis as unknown as Record<string, unknown>,
      });

      toast.success('记录已保存！', {
        description: `已添加到 ${MODULE_NAMES[analysis.suggested_module]} 模块`,
      });
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass-strong border-border max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">AI 识别结果</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image preview */}
          <div className="rounded-xl overflow-hidden aspect-video bg-muted">
            <img src={imageUrl} alt="Captured" className="w-full h-full object-cover" />
          </div>

          {/* Analysis result */}
          <div className="glass rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">识别内容</span>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-primary hover:text-primary/80"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            {isEditing ? (
              <Input
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="bg-muted/50"
              />
            ) : (
              <p className="text-foreground font-medium">{analysis.content}</p>
            )}

            {analysis.amount !== null && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">金额:</span>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedAmount}
                    onChange={(e) => setEditedAmount(e.target.value)}
                    className="w-24 bg-muted/50"
                  />
                ) : (
                  <span className="text-accent font-bold text-lg">
                    ¥{analysis.amount.toFixed(2)}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <span className="text-muted-foreground text-sm">归类至:</span>
              <span className="px-3 py-1 rounded-full gradient-primary text-primary-foreground text-sm font-medium">
                {MODULE_NAMES[analysis.suggested_module]}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSaving}
            >
              <X className="w-4 h-4 mr-2" />
              取消
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 gradient-primary"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  确认
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

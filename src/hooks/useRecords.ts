import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RecordEntry {
  id: string;
  user_id: string;
  module_id: string | null;
  input_type: 'photo' | 'text' | 'voice';
  content: string | null;
  image_url: string | null;
  amount: number | null;
  category: string | null;
  subcategory: string | null;
  ai_analysis: unknown;
  tags: string[] | null;
  recorded_at: string;
  created_at: string;
}

export function useRecords(moduleId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['records', user?.id, moduleId],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from('records')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(50);

      if (moduleId) {
        query = query.eq('module_id', moduleId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RecordEntry[];
    },
    enabled: !!user,
  });
}

export function useCreateRecord() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (record: Omit<Partial<RecordEntry>, 'user_id' | 'id' | 'created_at' | 'recorded_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('records')
        .insert({
          user_id: user.id,
          input_type: record.input_type || 'text',
          module_id: record.module_id,
          content: record.content,
          image_url: record.image_url,
          amount: record.amount,
          category: record.category,
          subcategory: record.subcategory,
          ai_analysis: record.ai_analysis as any,
          tags: record.tags,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['modules'] });
    },
  });
}

export function useRecentStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recent-stats', user?.id],
    queryFn: async () => {
      if (!user) return { totalSpending: 0, recordCount: 0 };
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('records')
        .select('amount')
        .eq('user_id', user.id)
        .gte('recorded_at', sevenDaysAgo.toISOString());

      if (error) throw error;

      const totalSpending = data?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
      return { totalSpending, recordCount: data?.length || 0 };
    },
    enabled: !!user,
  });
}

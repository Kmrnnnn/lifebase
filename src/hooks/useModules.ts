import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Module {
  id: string;
  user_id: string;
  module_type: 'spending' | 'diet' | 'ingredients' | 'pet' | 'sleep' | 'exercise' | 'custom';
  module_name: string;
  icon: string | null;
  is_active: boolean;
  is_hidden: boolean;
  record_count: number;
  created_at: string;
  updated_at: string;
}

const MODULE_ICONS: Record<string, string> = {
  spending: '💰',
  diet: '🍽️',
  ingredients: '🛒',
  pet: '🐾',
  sleep: '😴',
  exercise: '🏃',
  custom: '📦',
};

const MODULE_NAMES: Record<string, string> = {
  spending: '消费',
  diet: '饮食',
  ingredients: '食材库',
  pet: '宠物',
  sleep: '作息',
  exercise: '运动',
  custom: '自定义',
};

export function useModules() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['modules', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_hidden', false)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Module[];
    },
    enabled: !!user,
  });
}

export function useCreateModule() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (moduleType: Module['module_type']) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('modules')
        .insert({
          user_id: user.id,
          module_type: moduleType,
          module_name: MODULE_NAMES[moduleType] || moduleType,
          icon: MODULE_ICONS[moduleType] || '📦',
        })
        .select()
        .single();
      if (error) {
        if (error.code === '23505') {
          // Module already exists, just return it
          const { data: existing } = await supabase
            .from('modules')
            .select('*')
            .eq('user_id', user.id)
            .eq('module_type', moduleType)
            .single();
          return existing;
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
    },
  });
}

export function useUpdateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Module> }) => {
      const { data, error } = await supabase
        .from('modules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
    },
  });
}

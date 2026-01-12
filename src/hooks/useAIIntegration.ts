/**
 * useAIIntegration Hook
 * 在React组件中使用AI集成
 */

import { useState, useCallback, useEffect } from 'react';
import AIIntegration from '@/services/ai-integration';

interface UseAIIntegrationOptions {
  userId: string;
  claudeApiKey?: string;
}

export function useAIIntegration(options: UseAIIntegrationOptions) {
  const [aiIntegration, setAIIntegration] = useState<AIIntegration | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 初始化AI集成
  useEffect(() => {
    const apiKey = options.claudeApiKey || import.meta.env.VITE_CLAUDE_API_KEY;
    
    if (apiKey && options.userId) {
      try {
        const integration = new AIIntegration({
          claudeApiKey: apiKey,
          userId: options.userId
        });
        setAIIntegration(integration);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize AI'));
      }
    }
  }, [options.userId, options.claudeApiKey]);

  // 处理用户输入
  const processUserInput = useCallback(async (input: string) => {
    if (!aiIntegration) {
      setError(new Error('AI Integration not initialized'));
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await aiIntegration.processUserInput(input);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [aiIntegration]);

  // 处理数据记录
  const processDataEntry = useCallback(async (data: any) => {
    if (!aiIntegration) {
      setError(new Error('AI Integration not initialized'));
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await aiIntegration.processDataEntry(data);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [aiIntegration]);

  // 获取洞察
  const getUserInsights = useCallback(async () => {
    if (!aiIntegration) {
      setError(new Error('AI Integration not initialized'));
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await aiIntegration.getUserInsights();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [aiIntegration]);

  return {
    isInitialized: !!aiIntegration,
    isLoading,
    error,
    processUserInput,
    processDataEntry,
    getUserInsights
  };
}

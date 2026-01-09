-- LifeBase 数据库架构

-- 用户档案表
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nickname TEXT,
  avatar_url TEXT,
  onboarding_choice TEXT CHECK (onboarding_choice IN ('spending', 'goal', 'explore')),
  goal_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 模块表（用户已激活的功能模块）
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_type TEXT NOT NULL CHECK (module_type IN ('spending', 'diet', 'ingredients', 'pet', 'sleep', 'exercise', 'custom')),
  module_name TEXT NOT NULL,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  is_hidden BOOLEAN DEFAULT false,
  record_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_type)
);

-- 记录表（所有用户输入）
CREATE TABLE public.records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
  input_type TEXT NOT NULL CHECK (input_type IN ('photo', 'text', 'voice')),
  content TEXT,
  image_url TEXT,
  amount DECIMAL(10, 2),
  category TEXT,
  subcategory TEXT,
  ai_analysis JSONB,
  tags TEXT[],
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 洞察表（AI生成的洞察）
CREATE TABLE public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('daily', 'weekly', 'monthly', 'habit', 'warning', 'suggestion')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  related_module TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI对话历史表
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles RLS 策略
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Modules RLS 策略
CREATE POLICY "Users can view own modules" ON public.modules
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own modules" ON public.modules
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own modules" ON public.modules
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own modules" ON public.modules
  FOR DELETE USING (auth.uid() = user_id);

-- Records RLS 策略
CREATE POLICY "Users can view own records" ON public.records
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own records" ON public.records
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own records" ON public.records
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own records" ON public.records
  FOR DELETE USING (auth.uid() = user_id);

-- Insights RLS 策略
CREATE POLICY "Users can view own insights" ON public.insights
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON public.insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON public.insights
  FOR UPDATE USING (auth.uid() = user_id);

-- Chat Messages RLS 策略
CREATE POLICY "Users can view own chat messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 自动创建用户档案触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 更新记录数量触发器
CREATE OR REPLACE FUNCTION public.update_module_record_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.module_id IS NOT NULL THEN
    UPDATE public.modules SET record_count = record_count + 1 WHERE id = NEW.module_id;
  ELSIF TG_OP = 'DELETE' AND OLD.module_id IS NOT NULL THEN
    UPDATE public.modules SET record_count = record_count - 1 WHERE id = OLD.module_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_record_count
  AFTER INSERT OR DELETE ON public.records
  FOR EACH ROW EXECUTE FUNCTION public.update_module_record_count();

-- 更新时间戳函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 创建图片存储桶
INSERT INTO storage.buckets (id, name, public) VALUES ('records', 'records', true);

-- 存储策略
CREATE POLICY "Users can upload own record images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own record images" ON storage.objects
  FOR SELECT USING (bucket_id = 'records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view record images" ON storage.objects
  FOR SELECT USING (bucket_id = 'records');
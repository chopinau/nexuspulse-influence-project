
-- 为 dynamics 表添加 ai_summary 列
ALTER TABLE public.dynamics 
ADD COLUMN IF NOT EXISTS ai_summary TEXT;

-- 确保 dynamics 表有 sentiment 列 (之前可能已经存在，但为了保险)
ALTER TABLE public.dynamics 
ADD COLUMN IF NOT EXISTS sentiment TEXT;

-- 刷新 Schema Cache
NOTIFY pgrst, 'reload config';

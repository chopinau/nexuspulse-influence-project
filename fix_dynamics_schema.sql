
-- 为 dynamics 表添加 missing columns
ALTER TABLE public.dynamics 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS sentiment TEXT;

-- 刷新缓存
NOTIFY pgrst, 'reload config';

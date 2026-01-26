
-- 修复 analyst_reports 表结构
-- 1. 如果 entity_slug 存在且类型错误，先将其转换或删除重建
-- 由于可能是 bigint，直接转换可能会失败（如果里面已经有数字了），但现在报错是插入 "elon-musk" 失败，说明表里可能还是空的或者已有数据是数字。
-- 安全起见，我们将 entity_slug 修改为 TEXT

DO $$ 
BEGIN 
    -- 检查 entity_slug 的类型，如果是 bigint 则修改为 text
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'analyst_reports' 
        AND column_name = 'entity_slug' 
        AND data_type = 'bigint'
    ) THEN
        ALTER TABLE public.analyst_reports 
        ALTER COLUMN entity_slug TYPE TEXT USING entity_slug::TEXT;
    END IF;
END $$;

-- 确保 entity_slug 列存在且为 TEXT (如果上面没执行或列不存在)
ALTER TABLE public.analyst_reports 
ADD COLUMN IF NOT EXISTS entity_slug TEXT;

-- 确保其他列也存在
ALTER TABLE public.analyst_reports 
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS sentiment_score NUMERIC,
ADD COLUMN IF NOT EXISTS sentiment_label TEXT,
ADD COLUMN IF NOT EXISTS key_events JSONB,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 刷新 Schema Cache
NOTIFY pgrst, 'reload schema';

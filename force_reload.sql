
-- 强制刷新 Schema Cache
ALTER TABLE public.analyst_reports ADD COLUMN IF NOT EXISTS _dummy TEXT;
ALTER TABLE public.analyst_reports DROP COLUMN IF EXISTS _dummy;
NOTIFY pgrst, 'reload schema';

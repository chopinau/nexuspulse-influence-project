-- 更新 Elon Musk 的 RSS 链接以进行测试
UPDATE public.config
SET rss = 'https://news.google.com/rss/search?q=Elon+Musk&hl=en-US&gl=US&ceid=US:en'
WHERE slug = 'elon-musk';

-- 如果没有 Elon Musk，则插入一条
INSERT INTO public.config (slug, name, type, heatindex, trend, stocksymbol, tags, rss)
SELECT 'elon-musk', 'Elon Musk', 'person', '98', '12', 'TSLA', 'Tech,Space,EV', 'https://news.google.com/rss/search?q=Elon+Musk&hl=en-US&gl=US&ceid=US:en'
WHERE NOT EXISTS (SELECT 1 FROM public.config WHERE slug = 'elon-musk');

-- 开启 pg_cron 扩展 (如果尚未开启)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 删除旧的定时任务 (如果存在)
SELECT cron.unschedule('generate-6h-summary-job');

-- 创建新的定时任务：每 6 小时执行一次 (0, 6, 12, 18 点)
-- 注意：需要将 project_ref 替换为实际的项目 ID，anon_key 替换为实际的 key
-- 这里我们假设 net 扩展已开启，可以直接调用 HTTP 请求
SELECT cron.schedule(
  'generate-6h-summary-job',
  '0 */6 * * *', -- 每 6 小时
  $$
  select
    net.http_post(
      url:='https://caelloiugtmushijcwch.supabase.co/functions/v1/generate-6h-summary',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

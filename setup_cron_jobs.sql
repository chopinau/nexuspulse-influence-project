
-- 开启 pg_cron 扩展 (如果尚未开启)
create extension if not exists pg_cron;

-- 1. 配置 daily-summary 定时任务 (每 4 小时运行一次)
-- 用于抓取 RSS 并进行逐条 AI 分析存入 dynamics 表
select
  cron.schedule(
    'invoke-daily-summary',  -- 任务名称
    '0 */4 * * *',           -- cron 表达式 (每 4 小时的第 0 分钟)
    $$
    select
      net.http_post(
          url:='https://caelloiugtmushijcwch.supabase.co/functions/v1/daily-summary',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
    $$
  );

-- 2. 配置 generate-6h-summary 定时任务 (每 6 小时运行一次)
-- 用于基于 dynamics 表生成聚合分析报告存入 analyst_reports 表
select
  cron.schedule(
    'invoke-6h-summary',     -- 任务名称
    '30 */6 * * *',          -- cron 表达式 (每 6 小时的第 30 分钟，错开执行)
    $$
    select
      net.http_post(
          url:='https://caelloiugtmushijcwch.supabase.co/functions/v1/generate-6h-summary',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
    $$
  );

-- 查看已计划的任务
select * from cron.job;

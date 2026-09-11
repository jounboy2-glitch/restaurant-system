-- ============================================
-- CRON JOBS — ራስ-ሰር ሪፖርቶች
-- ============================================

-- pg_cron extension አስችል
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 1. ዕለታዊ ሪፖርት — በየቀኑ 11:00 PM
SELECT cron.schedule(
  'daily-report',
  '0 23 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/daily-report',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 2. ሳምንታዊ ሪፖርት — በየሰኞ 8:00 AM
SELECT cron.schedule(
  'weekly-report',
  '0 8 * * 1',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/weekly-report',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 3. ወርሃዊ ሪፖርት — በየወሩ 1ኛ ቀን 9:00 AM
SELECT cron.schedule(
  'monthly-report',
  '0 9 1 * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/monthly-report',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 4. Activity log ማጽዳት — ከ90 ቀን በላይ
SELECT cron.schedule(
  'cleanup-old-logs',
  '0 3 * * *',
  $$
  DELETE FROM activity_logs WHERE created_at < NOW() - INTERVAL '90 days';
  DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '30 days' AND is_read = true;
  $$
);

-- ማረጋገጫ
SELECT * FROM cron.job;

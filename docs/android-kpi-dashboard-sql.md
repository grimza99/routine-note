# Android 출시 KPI SQL / 대시보드 쿼리 초안

## 1) 목적

- `POST /api/events`로 적재되는 `analytics_events` 기반으로 Android 클로즈드 테스트 KPI를 조회한다.
- 출시 기간(`2026-02-19` ~ `2026-03-04`)의 설치/퍼널/안정성 지표를 일 단위로 모니터링한다.

## 2) 전제

- 테이블: `analytics_events`
- 기준 필드
  - `event_name`
  - `event_at`
  - `platform`
  - `app_version`
  - `app_build`
  - `user_id`
  - `properties->>'sessionId'`
  - `properties->>'installId'`
  - `properties->>'funnelStep'`
  - `properties->>'errorCode'`

## 3) 공통 파라미터 CTE

```sql
WITH params AS (
  SELECT
    DATE '2026-02-19' AS date_from,
    DATE '2026-03-04' AS date_to,
    'android'::text AS target_platform
)
```

아래 쿼리는 모두 위 `params` CTE를 포함해 실행한다.

## 4) KPI 쿼리

### A. 일별 설치 수 (`app_install`)

```sql
WITH params AS (
  SELECT DATE '2026-02-19' AS date_from, DATE '2026-03-04' AS date_to, 'android'::text AS target_platform
)
SELECT
  DATE(e.event_at) AS day,
  COUNT(*) AS install_events,
  COUNT(DISTINCT COALESCE(NULLIF(e.user_id::text, ''), NULLIF(e.properties->>'installId', ''), NULLIF(e.properties->>'sessionId', ''))) AS install_unique_keys
FROM analytics_events e
JOIN params p ON TRUE
WHERE e.platform = p.target_platform
  AND DATE(e.event_at) BETWEEN p.date_from AND p.date_to
  AND e.event_name = 'app_install'
GROUP BY 1
ORDER BY 1;
```

### B. 일별 퍼널 (app_open → login_success → workout_created)

```sql
WITH params AS (
  SELECT DATE '2026-02-19' AS date_from, DATE '2026-03-04' AS date_to, 'android'::text AS target_platform
),
daily AS (
  SELECT
    DATE(e.event_at) AS day,
    COALESCE(NULLIF(e.user_id::text, ''), NULLIF(e.properties->>'installId', ''), NULLIF(e.properties->>'sessionId', '')) AS actor_key,
    MAX(CASE WHEN e.event_name = 'app_open' THEN 1 ELSE 0 END) AS opened,
    MAX(CASE WHEN e.event_name = 'login_success' THEN 1 ELSE 0 END) AS logged_in,
    MAX(CASE WHEN e.event_name = 'workout_created' THEN 1 ELSE 0 END) AS workout_created
  FROM analytics_events e
  JOIN params p ON TRUE
  WHERE e.platform = p.target_platform
    AND DATE(e.event_at) BETWEEN p.date_from AND p.date_to
    AND e.event_name IN ('app_open', 'login_success', 'workout_created')
  GROUP BY 1, 2
)
SELECT
  day,
  COUNT(*) FILTER (WHERE opened = 1) AS open_users,
  COUNT(*) FILTER (WHERE logged_in = 1) AS login_users,
  COUNT(*) FILTER (WHERE workout_created = 1) AS workout_created_users,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE workout_created = 1)
    / NULLIF(COUNT(*) FILTER (WHERE logged_in = 1), 0),
    2
  ) AS login_to_workout_rate_pct
FROM daily
GROUP BY 1
ORDER BY 1;
```

### C. D1 유지율 (설치 Cohort 기준)

```sql
WITH params AS (
  SELECT DATE '2026-02-19' AS date_from, DATE '2026-03-04' AS date_to, 'android'::text AS target_platform
),
installs AS (
  SELECT
    COALESCE(NULLIF(e.user_id::text, ''), NULLIF(e.properties->>'installId', ''), NULLIF(e.properties->>'sessionId', '')) AS actor_key,
    MIN(DATE(e.event_at)) AS install_day
  FROM analytics_events e
  JOIN params p ON TRUE
  WHERE e.platform = p.target_platform
    AND DATE(e.event_at) BETWEEN p.date_from AND p.date_to
    AND e.event_name = 'app_install'
  GROUP BY 1
),
d1_return AS (
  SELECT DISTINCT
    i.install_day,
    i.actor_key
  FROM installs i
  JOIN analytics_events e
    ON COALESCE(NULLIF(e.user_id::text, ''), NULLIF(e.properties->>'installId', ''), NULLIF(e.properties->>'sessionId', '')) = i.actor_key
   AND DATE(e.event_at) = i.install_day + INTERVAL '1 day'
   AND e.platform = 'android'
   AND e.event_name = 'app_open'
)
SELECT
  i.install_day,
  COUNT(*) AS install_users,
  COUNT(d.actor_key) AS d1_return_users,
  ROUND(100.0 * COUNT(d.actor_key) / NULLIF(COUNT(*), 0), 2) AS d1_retention_pct
FROM installs i
LEFT JOIN d1_return d
  ON d.install_day = i.install_day
 AND d.actor_key = i.actor_key
GROUP BY 1
ORDER BY 1;
```

### D. 크래시프리 세션 비율 (errorCode 프록시)

```sql
WITH params AS (
  SELECT DATE '2026-02-19' AS date_from, DATE '2026-03-04' AS date_to, 'android'::text AS target_platform
),
session_errors AS (
  SELECT
    DATE(e.event_at) AS day,
    e.properties->>'sessionId' AS session_id,
    MAX(CASE WHEN COALESCE(e.properties->>'errorCode', '') <> '' THEN 1 ELSE 0 END) AS has_error
  FROM analytics_events e
  JOIN params p ON TRUE
  WHERE e.platform = p.target_platform
    AND DATE(e.event_at) BETWEEN p.date_from AND p.date_to
    AND COALESCE(e.properties->>'sessionId', '') <> ''
  GROUP BY 1, 2
)
SELECT
  day,
  COUNT(*) AS total_sessions,
  COUNT(*) FILTER (WHERE has_error = 0) AS crash_free_sessions,
  ROUND(100.0 * COUNT(*) FILTER (WHERE has_error = 0) / NULLIF(COUNT(*), 0), 2) AS crash_free_session_rate_pct
FROM session_errors
GROUP BY 1
ORDER BY 1;
```

### E. 이벤트 누락률 (login_success 대비 workout_created 누락)

```sql
WITH params AS (
  SELECT DATE '2026-02-19' AS date_from, DATE '2026-03-04' AS date_to, 'android'::text AS target_platform
),
base AS (
  SELECT
    DATE(e.event_at) AS day,
    COALESCE(NULLIF(e.user_id::text, ''), NULLIF(e.properties->>'installId', ''), NULLIF(e.properties->>'sessionId', '')) AS actor_key,
    MAX(CASE WHEN e.event_name = 'login_success' THEN 1 ELSE 0 END) AS has_login,
    MAX(CASE WHEN e.event_name = 'workout_created' THEN 1 ELSE 0 END) AS has_workout_created
  FROM analytics_events e
  JOIN params p ON TRUE
  WHERE e.platform = p.target_platform
    AND DATE(e.event_at) BETWEEN p.date_from AND p.date_to
    AND e.event_name IN ('login_success', 'workout_created')
  GROUP BY 1, 2
)
SELECT
  day,
  COUNT(*) FILTER (WHERE has_login = 1) AS login_users,
  COUNT(*) FILTER (WHERE has_login = 1 AND has_workout_created = 0) AS missing_workout_created_users,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE has_login = 1 AND has_workout_created = 0)
    / NULLIF(COUNT(*) FILTER (WHERE has_login = 1), 0),
    2
  ) AS missing_rate_pct
FROM base
GROUP BY 1
ORDER BY 1;
```

## 5) 대시보드 패널 구성

1. 상단 카드
   - 설치 수
   - D1 유지율
   - 크래시프리 세션 비율
   - 로그인→운동저장 전환율
2. 시계열
   - 일별 설치 수
   - 일별 퍼널 전환율
   - 일별 크래시프리 세션 비율
3. 품질 모니터링
   - `errorCode` Top N
   - 이벤트 누락률 추이
   - `app_build`별 KPI 비교

# 운동 기록 서비스 백엔드 스펙

## 1) API 계약 (상세)

### 공통 규칙

- Base URL: `/api`
- Auth: `Authorization: Bearer <token>`
- 시간 포맷: `YYYY-MM-DD`, 월 포맷: `YYYY-MM`
- 클라이언트 메타 헤더(필수)
  - `x-client-platform`: `ios | android | web`
  - `x-app-version`: 앱/웹 버전 문자열 (`1.0.0`, `web`)
  - `x-app-build`: 빌드 번호/식별자
  - 누락 시: 요청은 처리하되 서버 경고 로그를 남긴다.
- 에러 응답 예시

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "date is required"
  }
}
```

### 에러 코드 (예시)

- `UNAUTHORIZED`: 인증 토큰이 없거나 유효하지 않음
- `FORBIDDEN`: 권한 없음(타 유저 리소스 접근)
- `NOT_FOUND`: 리소스 없음
- `VALIDATION_ERROR`: 필수 값 누락/형식 오류
- `CONFLICT`: 중복 생성(예: 동일 날짜 Workout)
- `NICKNAME_TAKEN`: 닉네임 중복
- `STORAGE_ERROR` : 버킷 업로드 에러
- `DB_ERROR` : 데이터 베이스 에러

### 유효성 규칙 (핵심)

- 공통
  - `date`: `YYYY-MM-DD` 형식
  - `month`: `YYYY-MM` 형식
  - `order`: 1 이상 정수
- 내 정보
  - `nickname`: 공백 불가
  - `goalWorkoutDays`: 1 이상 정수
- Workout
  - `date` 필수, 유저별 하루 1개 제한
- WorkoutRoutine
  - `routineId` 필수
- ExerciseCatalog
  - `name` 필수, 유저 내 중복 불가
- Routine
  - `name` 필수, `items`는 1개 이상 권장
- RoutineItem
  - `setCount`는 1 이상 정수
- Set
  - `weight`는 0 이상 숫자, `reps`는 1 이상 정수
- InbodyRecord
  - `measuredAt` 필수, 같은 날짜 중복 허용 여부는 정책 결정 필요

### 인증

#### POST /auth/signup

요청

```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "유선향",
  "nickname?": "유선향" || null, // null일 경우 username이 닉네임으로 설정됨
  "age?": 20, //최소 20 ~ 100세
  "policy": false,
}
```

응답

```json
{
  "id": "u1",
  "email": "user@example.com",
  "username": "유선향",
  "nickname": "유선향",
  "age": 0,
  "privacy_policy": true,
  "token": "jwt-token",
  "profile_image": null
}
```

에러

- 닉네임 중복: `409` + `{ "error": { "code": "NICKNAME_TAKEN", "message": "이미 존재하는 닉네임 입니다." } }`
- 이메일 중복 (409, { error: { code: 'EMAIL_TAKEN', message: '이미 존재하는 이메일 입니다.' } });

#### POST /auth/login

요청

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

응답

```json
{
  "id": "u1",
  "email": "user@example.com",
  "username": "유선향",
  "nickname": "유선향",
  "age": 0,
  "privacy_policy": true,
  "token": "jwt-token",
  "refresh_token": "refresh-token",
  "profile_image": "" || null,
}
```

#### POST /auth/refresh

설명: 리프레시 토큰 쿠키를 검증하고 새 토큰을 발급하며, 기존 리프레시 토큰은 폐기

요청

```json
{
  "refreshToken?": "refresh-token"
}
```

응답

```json
{
  "token": "new-jwt-token",
  "refresh_token": "new-refresh-token",
  "user": { "id": "u1", "email": "user@example.com" }
}
```

#### POST /auth/logout

설명: 리프레시 토큰 쿠키 삭제 (서버에 블랙리스트/세션 저장 시 함께 무효화)

요청

```json
{}
```

응답

```json
{ "ok": true }
```

#### POST /auth/withdraw

설명: 현재 로그인한 사용자 탈퇴 처리
- `public.users.deleted_at`에 탈퇴 시각 기록 (soft delete)
- `auth.users`는 즉시 삭제하여 로그인 불가 상태로 전환
- 인증 쿠키 정리

요청 body x

응답

```json
{ "ok": true }
```

#### POST /auth/password-reset/request

설명: 슈파베이스의 auth 에 등록된 이메일 주소로 비밀번호 재설정 이메일 발송

요청 body x

응답

```json
{ "ok": true }
```

#### POST /auth/password-reset/confirm

설명: request시 쿠키에 첨부된 accessToken으로 비밀번호 변경

요청

```json
{
  "newPassword": "newPassword123"
}
```

응답

```json
{ "ok": true }
```

### 내 정보

#### PATCH /account/profile

설명: 닉네임과 이번달 목표를 함께 수정 (둘 중 하나 이상 필수)

요청

```json
{
  "nickname?": "새로운닉네임",
  "goalWorkoutDays?": 12
}
```

응답

```json
{
  "nickname": "새로운닉네임"|null,
  "goalWorkoutDays": 12|null
}
```

#### POST /account/profile-image

설명: 프로필 이미지 업로드 (Supabase Storage public 버킷 사용)

요청

- Content-Type: `multipart/form-data`
- form-data
  - `file`: 이미지 파일

응답

```json
{
  "profileUrl": "https://<project>.supabase.co/storage/v1/object/public/profile-images/<userId>/..."
}
```

### 루틴

#### GET /routines

응답

```json
[
  {
    "routineId": "r1",
    "routineName": "상체 루틴",
    "exercises": [
      { "id": "ri1", "exerciseId": "ex1", "exerciseName": "벤치프레스", "order": 1 },
      { "id": "ri2", "exerciseId": "ex2", "exerciseName": "풀다운", "order": 2 }
    ]
  }
]
```

#### POST /routines

요청

```json
{
  "routineName": "하체 루틴",
  "exercises": ["스쿼트", "레그프레스"]
}
```

응답

```json
{ "routineId": "r2", "routineName": "하체 루틴" }
```

#### GET /routines/{routineId}

응답

```json
{
  "routineId": "r1",
  "routineName": "상체 루틴",
  "exercises": [
    { "id": "ri1", "exerciseId": "ex1", "exerciseName": "벤치프레스", "order": 1 },
    { "id": "ri2", "exerciseId": "ex2", "exerciseName": "풀다운", "order": 2 }
  ]
}
```

#### PATCH /routines/{routineId}

요청

```json
{
  "routineName": "상체 루틴 v2",
  "exercises": [{ "exerciseName": "벤치프레스" }, { "exerciseName": "딥스" }]
}
```

응답

```json
{ "routineId": "r1", "routineName": "상체 루틴 v2" }
```

#### DELETE /routines/{routineId}

응답

```json
{ "ok": true }
```

### 운동 기록

#### GET /workouts?date=YYYY-MM-DD

응답

```json
{
  "id": "w1",
  "date": "2026-01-27",
  "routines": [
    {
      "id": "wr1",
      "routineId": "r1",
      "routineName": "상체 루틴",
      "order": 1,
      "exercises": [
        {
          "id": "ex1",
          "name": "벤치프레스",
          "order": 1,
          "note": null,
          "sets": []
        }
      ]
    }
  ],
  "exercises": [
    {
      "id": "we2",
      "name": "푸쉬업",
      "order": 1,
      "note": "",
      "sets": []
    }
  ]
} ||null
```

#### POST /workouts

요청

```json
{
  "date": "2026-01-27",
  "routines": [{ "routineId": "r1", "order": 1, "note": "" }], //order optional
  "exercises": [
    { "exerciseName": "ex1", "order": 1, "note": "" }, //order optional
    { "exerciseName": "ex2", "order": 2, "note": "" }
  ]
}
```

설명

- `routines`는 해당 루틴의 운동 아이템을 `workout_routine_items`로 복사 저장
- `exercises`는 루틴과 무관한 standalone 운동만 `workout_exercises`에 저장

응답

```json
{
  "id": "w1",
  "date": "2026-01-27",
  "routines": [
    {
      "id": "wr1",
      "routineId": "r1",
      "routineName": "루틴 A",
      "order": 1,
      "note": "",
      "exercises": [{ "id": "ex1", "name": "벤치프레스", "order": 1, "note": null, "sets": [] }]
    }
  ],
  "exercises": [{ "id": "we2", "name": "ex2", "order": 2, "note": "", "sets": [] }]
}
```

#### GET /workouts/{workoutId}

응답

```json
{
  "id": "w1",
  "date": "2026-01-27",
  "routines": [],
  "exercises": []
}
```

#### PUT /workouts/{workoutId}

설명: 동일한 바디로 하루 운동 기록을 전체 교체 (하위 데이터 삭제 후 재삽입)

요청

```json
{
  "date": "2026-01-27",
  "routines": [{ "routineId": "r1", "order": 1, "note": "" }],
  "exercises": [
    { "exerciseName": "ex1", "order": 1, "note": "" },
    { "exerciseName": "ex2", "order": 2, "note": "" }
  ]
}
```

응답

```json
{
  "id": "w1",
  "date": "2026-01-27",
  "routines": [
    {
      "id": "wr1",
      "routineId": "r1",
      "routineName": "루틴 A",
      "order": 1,
      "note": "",
      "exercises": [{ "id": "ex1", "name": "벤치프레스", "order": 1, "note": null, "sets": [] }]
    }
  ],
  "exercises": [{ "id": "we2", "name": "ex2", "order": 2, "note": "", "sets": [] }]
}
```

#### DELETE /workouts/{workoutId}

응답

```json
{ "ok": true }
```

### 하루 루틴 기록

#### POST /workouts/{workoutId}/routines

설명: 하루 기록에 루틴 실행 단위를 추가

요청

```json
{ "routineId": "r1", "order": 1, "note": "" }
```

응답

```json
{ "id": "wr1", "routineId": "r1", "order": 1, "note": "" }
```

#### PATCH /workout-routines/{workoutRoutineId}

요청

```json
{ "order": 2, "note": "후반 루틴" }
```

응답

```json
{ "id": "wr1", "order": 2, "note": "후반 루틴" }
```

#### DELETE /workout-routines/{workoutRoutineId}

응답

```json
{ "ok": true }
```

### 운동 종목 기록

#### POST /workouts/{workoutId}/exercises

요청

```json
{ "exerciseId": "ex1", "order": 1, "note": "", "workoutRoutineId": "wr1" }
```

응답

```json
{ "id": "we1", "exerciseId": "ex1", "order": 1, "note": "", "workoutRoutineId": "wr1" }
```

#### PATCH /workout-exercises/{workoutExerciseId}

요청

```json
{ "note": "폼 체크", "order": 2 }
```

응답

```json
{ "id": "we1", "note": "폼 체크", "order": 2 }
```

#### DELETE /workout-exercises/{workoutExerciseId}

응답

```json
{ "ok": true }
```

### 세트 기록

#### POST /workout-exercises/{workoutExerciseId}/sets

요청

```json
{ "weight": 80, "reps": 8, "note": "", "order": 1 }
```

응답

```json
{ "id": "s1", "weight": 80, "reps": 8, "note": "", "order": 1 }
```

#### PATCH /sets/{setId}

요청

```json
{ "weight": 85, "reps": 6, "note": "무거움" }
```

응답

```json
{ "id": "s1", "weight": 85, "reps": 6, "note": "무거움" }
```

#### DELETE /sets/{setId}

응답

```json
{ "ok": true }
```

### 루틴 불러오기 (기록용 복사)

#### POST /workouts/{workoutId}/apply-routine

요청

```json
{ "routineId": "r1" }
```

응답

```json
{
  "workoutId": "w1",
  "workoutRoutineId": "wr1",
  "createdExercises": [
    { "id": "we1", "exerciseId": "ex1", "order": 1, "workoutRoutineId": "wr1" },
    { "id": "we2", "exerciseId": "ex2", "order": 2, "workoutRoutineId": "wr1" }
  ]
}
```

### 리포트

#### GET /reports/monthly?month=YYYY-MM

응답

```json
{
  "month": "2026-01",
  "workoutDays": 12,
  "totalSets": 210,
  "maxConsecutiveWorkoutDays": 5, // 해당 월 내 최대 연속 운동 일수
  "goalWorkoutDays": 20, // 해당 월 목표 운동 일수 (없으면 null)
  "goalAchievementRate": 60.0, // 목표 달성률(%) (목표 없으면 null)
  "weightChange": -1.2, // 해당 월 첫/마지막 인바디 체중 변화
  "skeletalMuscleMassChange": 0.6, // 해당 월 첫/마지막 인바디 골격근량 변화
  "bodyFatMassChange": -0.8 // 해당 월 첫/마지막 인바디 체지방량 변화
}
```

#### GET /reports/monthly-all

설명: 지난 달까지의 월간 리포트를 전체 조회 (이번 달 제외)

응답

```json
[
  {
    "month": "2025-12",
    "workoutDays": 10,
    "totalSets": 180,
    "maxConsecutiveWorkoutDays": 4,
    "goalWorkoutDays": 20,
    "goalAchievementRate": 50.0,
    "weightChange": -0.8,
    "skeletalMuscleMassChange": 0.4,
    "bodyFatMassChange": -0.6
  },
  {
    "month": "2026-01",
    "workoutDays": 12,
    "totalSets": 210,
    "maxConsecutiveWorkoutDays": 5,
    "goalWorkoutDays": 20,
    "goalAchievementRate": 60.0,
    "weightChange": -1.2,
    "skeletalMuscleMassChange": 0.6,
    "bodyFatMassChange": -0.8
  }
]
```

#### GET /reports/monthly-trends

설명: 지난 달까지의 월간 목표 달성률 추이 조회 (라인 차트용)

응답

```json
[
  {
    "id": "goalAchievementRate",
    "data": [
      { "x": "1주차", "y": 50.0 },
      { "x": "2주차", "y": 60.0 }
    ]
  }
]
```

#### GET /reports/routine-distribution?month=YYYY-MM

설명: 해당 월 루틴 분포 조회 (파이 차트용)

응답

```json
[
  { "id": "r1", "label": "상체 루틴", "value": 8 },
  { "id": "r2", "label": "하체 루틴", "value": 5 }
]
```

#### GET /reports/weekly-volume?month=YYYY-MM

설명: 이번 주(월~일) 요일별 운동량 조회 (세트수 × 무게, 바 차트용)

응답

```json
[
  { "day": "월", "volume": 1200 },
  { "day": "화", "volume": 0 },
  { "day": "수", "volume": 900 },
  { "day": "목", "volume": 600 },
  { "day": "금", "volume": 1500 },
  { "day": "토", "volume": 0 },
  { "day": "일", "volume": 0 }
]
```

#### POST /reports/monthly-goal

요청

```json
{
  "month": "2026-01",
  "goalWorkoutDays": 20
}
```

응답

```json
{
  "id": "mg1",
  "month": "2026-01",
  "goalWorkoutDays": 20
}
```

### 인바디(체성분)

#### GET /inbody?month=YYYY-MM

응답

```json
[
  {
    "id": "ib1",
    "measuredAt": "2026-01-10",
    "weight": 72.4,
    "skeletalMuscleMass": 32.1,
    "bodyFatMass": 14.2
  }
]
```

#### POST /inbody

요청

```json
{
  "measuredAt": "2026-01-10",
  "weight": 72.4,
  "skeletalMuscleMass": 32.1,
  "bodyFatMass": 14.2
}
```

응답

```json
{ "id": "ib1" }
```

#### PATCH /inbody/{inbodyId}

요청

```json
{ "weight": 72.0 }
```

응답

```json
{ "id": "ib1", "weight": 72.0 }
```

#### DELETE /inbody/{inbodyId}

응답

```json
{ "ok": true }
```

### 챌린지

#### GET /challenges/monthly-rank?month=YYYY-MM

응답

```json
[
  { "rank": 1, "userId": "u1", "workoutDays": 20 },
  { "rank": 2, "userId": "u2", "workoutDays": 18 }
]
```

#### GET /challenges/my-rank?month=YYYY-MM

설명: 현재 로그인 유저의 월간 챌린지 등수 조회 (month 생략 시 현재 월)

응답

```json
{
  "month": "2026-02",
  "rank": 4,
  "workoutDays": 12,
  "totalParticipants": 24
}
```

### 이벤트 수집

#### POST /events

설명: 웹/RN 공통 이벤트 수집 엔드포인트. 서버에서 유효성 검증 후 `analytics_events` 테이블에 적재.

요청

```json
{
  "eventName": "login_success",
  "userId": "uuid-string or omitted",
  "source": "web-login-form",
  "platform": "web",
  "appVersion": "web",
  "appBuild": "local",
  "sessionId": "session-uuid-or-random",
  "screenName": "LoginScreen",
  "funnelStep": "login_success",
  "errorCode": "NETWORK_TIMEOUT",
  "timestamp": "2026-02-13T12:00:00.000Z",
  "properties": {
    "month": "2026-02"
  }
}
```

허용 `eventName`

- `app_install`
- `app_open`
- `login_success`
- `workout_saved`
- `workout_created`
- `workout_updated`
- `workout_removed`
- `routine_applied`
- `report_viewed`
- `workout_sets_created`
- `workout_sets_updated`

응답

```json
{ "ok": true }
```

저장 테이블

- `analytics_events`
  - `event_name`, `user_id?`, `source?`, `platform?`, `app_version?`, `app_build?`, `properties(jsonb)`, `event_at`
  - `sessionId/screenName/funnelStep/errorCode`는 v1에서 `properties` 내부 키로 저장

## 2) DB 스키마 (Postgres 초안)

> 월간 리포트/챌린지 랭킹은 계산형으로 운영 가능하며, 캐시형으로 저장하려면 아래 테이블을 사용

```sql
-- users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- exercise catalog
CREATE TABLE exercise_catalogs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX exercise_catalogs_user_id_name_uq
  ON exercise_catalogs (user_id, name);

-- routines
CREATE TABLE routines (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE routine_items (
  id UUID PRIMARY KEY,
  routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercise_catalogs(id),
  item_order INT NOT NULL,
  set_count INT NOT NULL DEFAULT 1
);

CREATE INDEX routine_items_routine_id_idx ON routine_items (routine_id);

-- workouts
CREATE TABLE workouts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  workout_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX workouts_user_id_date_uq ON workouts (user_id, workout_date);

CREATE TABLE workout_routines (
  id UUID PRIMARY KEY,
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  routine_id UUID NOT NULL REFERENCES routines(id),
  item_order INT NOT NULL,
  note TEXT
);

CREATE INDEX workout_routines_workout_id_idx ON workout_routines (workout_id);

CREATE TABLE workout_routine_items (
  id UUID PRIMARY KEY,
  workout_routine_id UUID NOT NULL REFERENCES workout_routines(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL,
  exercise_name TEXT,
  item_order INT NOT NULL
);

CREATE INDEX workout_routine_items_workout_routine_id_idx
  ON workout_routine_items (workout_routine_id);

CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY,
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  workout_routine_id UUID REFERENCES workout_routines(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercise_catalogs(id),
  exercise_name TEXT,
  item_order INT NOT NULL,
  note TEXT
);

CREATE INDEX workout_exercises_workout_id_idx ON workout_exercises (workout_id);
CREATE INDEX workout_exercises_workout_routine_id_idx ON workout_exercises (workout_routine_id);

CREATE TABLE sets (
  id UUID PRIMARY KEY,
  workout_exercise_id UUID NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
  weight NUMERIC(6, 2),
  reps INT,
  note TEXT,
  set_order INT NOT NULL
);

CREATE INDEX sets_workout_exercise_id_idx ON sets (workout_exercise_id);

-- inbody records
CREATE TABLE inbody_records (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  measured_at DATE NOT NULL,
  weight NUMERIC(6, 2),
  skeletal_muscle_mass NUMERIC(6, 2),
  body_fat_mass NUMERIC(6, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX inbody_records_user_id_measured_at_idx
  ON inbody_records (user_id, measured_at);

-- monthly goals
CREATE TABLE monthly_goals (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  report_month DATE NOT NULL,
  goal_workout_days INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX monthly_goals_user_id_month_uq
  ON monthly_goals (user_id, report_month);

-- optional cache tables
CREATE TABLE monthly_reports (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  report_month DATE NOT NULL,
  workout_days INT NOT NULL,
  total_sets INT NOT NULL,
  weight_change NUMERIC(6, 2),
  skeletal_muscle_mass_change NUMERIC(6, 2),
  body_fat_mass_change NUMERIC(6, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX monthly_reports_user_id_month_uq
  ON monthly_reports (user_id, report_month);

CREATE TABLE challenge_rankings (
  id UUID PRIMARY KEY,
  report_month DATE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  rank INT NOT NULL,
  workout_days INT NOT NULL
);

CREATE UNIQUE INDEX challenge_rankings_month_rank_uq
  ON challenge_rankings (report_month, rank);

-- analytics events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  event_name TEXT NOT NULL,
  source TEXT NULL,
  platform TEXT NULL,
  app_version TEXT NULL,
  app_build TEXT NULL,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT NULL,
  user_agent TEXT NULL,
  event_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX analytics_events_event_name_idx ON analytics_events (event_name);
CREATE INDEX analytics_events_user_id_idx ON analytics_events (user_id);
CREATE INDEX analytics_events_event_at_idx ON analytics_events (event_at DESC);
```

## 3) 리포트/챌린지 집계 로직 (초안)

### 공통 기준

- 기준 월: `YYYY-MM`의 1일 00:00 ~ 말일 23:59 (사용자 로컬 타임존 기준)
- 대상 데이터: 삭제되지 않은 Workout/Set/InbodyRecord만 포함
- 하루 운동 중복: 유저당 `workout_date` 1개만 허용 (중복 생성 불가)

### 월간 리포트

- 운동한 일자수: 해당 월에 존재하는 Workout의 일자 수
- 운동한 세트수: 해당 월 Workout에 속한 모든 Set의 개수 합
- 체중/골격근량/체지방 변화
  - 해당 월의 첫 InbodyRecord와 마지막 InbodyRecord의 차이
  - 해당 월에 인바디 기록이 2개 미만이면 변화량은 `null` 처리

### 챌린지 (월간 출석 랭킹)

- 랭킹 기준: 월간 운동한 일자수 내림차순
- 동점 처리(우선순위)
  1. 월간 세트수 내림차순
  2. 마지막 운동일이 더 최근인 유저
  3. userId 사전순

### 집계 방식

- 계산형: 요청 시 실시간 집계
- 캐시형: 월말/일 1회 배치로 `monthly_reports`, `challenge_rankings` 갱신

## 4) 백엔드 구현을 위한 추가 스펙

### 인증/인가

- 인증 방식: 이메일/비밀번호, 로그인 시 JWT 발급
- 액세스 토큰 만료: 15분
- 리프레시 토큰 만료: 3일
- 리프레시 토큰 저장: HttpOnly 쿠키로 발급, 브라우저가 자동 첨부
- 쿠키 옵션(통상): `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, `Max-Age=259200`
- 토큰 갱신: `POST /auth/refresh` 호출 시 새 리프레시 토큰을 쿠키로 재발급하고 기존 토큰은 폐기
- 로그아웃: `POST /auth/logout` 호출 시 리프레시 쿠키 삭제 (서버 저장 시 블랙리스트/세션 무효화)
- 권한: 모든 리소스는 `userId` 기반으로 본인 것만 접근 가능

### 데이터 무결성/삭제 정책

- Workout: 유저당 하루 1개(`user_id + workout_date` 유니크)
- ExerciseCatalog: 유저 내 이름 중복 금지
- RoutineItem/WorkoutExercise/Set: 상위 삭제 시 하위 연쇄 삭제
- 삭제 정책: 기본은 hard delete, 추후 soft delete 고려

### 리포트/챌린지 집계 정책

- 타임존: 유저 로컬 타임존 기준 집계
- 리포트 캐시: MVP는 계산형, 트래픽 증가 시 월별 캐시 테이블 사용
- 챌린지 랭킹: 월간 출석 수 기준, 동점은 세트 수/최근 운동일로 결정

### 에러/HTTP 상태 규칙 (초안)

- 400: 유효성 오류
- 401: 인증 필요
- 403: 권한 없음
- 404: 리소스 없음
- 409: 중복 생성/충돌
- 500: 서버 내부 오류

### 운영/감사 로깅

- 핵심 이벤트: 로그인, 운동 기록 생성/삭제, 루틴 변경, 인바디 등록
- 로그 필드: userId, action, targetId, createdAt

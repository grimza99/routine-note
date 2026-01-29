# 운동 기록 서비스 백엔드 스펙

## 1) API 계약 (상세)

### 공통 규칙

- Base URL: `/api`
- Auth: `Authorization: Bearer <token>`
- 시간 포맷: `YYYY-MM-DD`, 월 포맷: `YYYY-MM`
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

### 유효성 규칙 (핵심)

- 공통
  - `date`: `YYYY-MM-DD` 형식
  - `month`: `YYYY-MM` 형식
  - `order`: 1 이상 정수
- Workout
  - `date` 필수, 유저별 하루 1개 제한
- ExerciseCatalog
  - `name` 필수, 유저 내 중복 불가
- Routine
  - `name` 필수, `items`는 1개 이상 권장
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
  "nickname": null, // 이 경우 username이 닉네임으로 설정됨
  "age": 0,
  "policy": false
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
  "token": "jwt-token"
}
```

에러

- 닉네임 중복: `409` + `{ "error": { "code": "NICKNAME_TAKEN", "message": "nickname already exists" } }`
- 이메일 인증 설정에 따라 `token`이 `null`일 수 있음

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
  "token": "jwt-token",
  "user": { "id": "u1", "email": "user@example.com" }
}
```

#### POST /auth/refresh

설명: 리프레시 토큰 쿠키를 검증하고 새 토큰을 발급하며, 기존 리프레시 토큰은 폐기

요청

```json
{}
```

응답

```json
{
  "token": "new-jwt-token",
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

### 운동 종목(사전)

#### GET /exercises

응답

```json
[
  { "id": "ex1", "name": "벤치프레스" },
  { "id": "ex2", "name": "스쿼트" }
]
```

#### POST /exercises

요청

```json
{ "name": "데드리프트" }
```

응답

```json
{ "id": "ex3", "name": "데드리프트" }
```

#### PATCH /exercises/{exerciseId}

요청

```json
{ "name": "스쿼트(하이바)" }
```

응답

```json
{ "id": "ex2", "name": "스쿼트(하이바)" }
```

#### DELETE /exercises/{exerciseId}

응답

```json
{ "ok": true }
```

### 루틴

#### GET /routines

응답

```json
[
  {
    "id": "r1",
    "name": "상체 루틴",
    "items": [
      { "id": "ri1", "exerciseId": "ex1", "order": 1 },
      { "id": "ri2", "exerciseId": "ex2", "order": 2 }
    ]
  }
]
```

#### POST /routines

요청

```json
{
  "name": "하체 루틴",
  "items": [
    { "exerciseId": "ex2", "order": 1 },
    { "exerciseId": "ex3", "order": 2 }
  ]
}
```

응답

```json
{ "id": "r2", "name": "하체 루틴" }
```

#### GET /routines/{routineId}

응답

```json
{
  "id": "r1",
  "name": "상체 루틴",
  "items": [
    { "id": "ri1", "exerciseId": "ex1", "order": 1 },
    { "id": "ri2", "exerciseId": "ex2", "order": 2 }
  ]
}
```

#### PATCH /routines/{routineId}

요청

```json
{
  "name": "상체 루틴 v2",
  "items": [
    { "exerciseId": "ex1", "order": 1 },
    { "exerciseId": "ex4", "order": 2 }
  ]
}
```

응답

```json
{ "id": "r1", "name": "상체 루틴 v2" }
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
  "exercises": [
    {
      "id": "we1",
      "exerciseId": "ex1",
      "note": "컨디션 좋음",
      "sets": [
        { "id": "s1", "weight": 80, "reps": 8, "note": "" },
        { "id": "s2", "weight": 80, "reps": 8, "note": "" }
      ]
    }
  ]
} ||null
```

#### POST /workouts

요청

```json
{ "date": "2026-01-27" }
```

응답

```json
{ "id": "w1", "date": "2026-01-27" }
```

#### GET /workouts/{workoutId}

응답

```json
{
  "id": "w1",
  "date": "2026-01-27",
  "exercises": []
}
```

#### PATCH /workouts/{workoutId}

요청

```json
{ "date": "2026-01-26" }
```

응답

```json
{ "id": "w1", "date": "2026-01-26" }
```

#### DELETE /workouts/{workoutId}

응답

```json
{ "ok": true }
```

### 운동 종목 기록

#### POST /workouts/{workoutId}/exercises

요청

```json
{ "exerciseId": "ex1", "order": 1, "note": "" }
```

응답

```json
{ "id": "we1", "exerciseId": "ex1", "order": 1, "note": "" }
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
  "createdExercises": [
    { "id": "we1", "exerciseId": "ex1", "order": 1 },
    { "id": "we2", "exerciseId": "ex2", "order": 2 }
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

#### GET /challenges/monthly-attendance?month=YYYY-MM

응답

```json
[
  { "rank": 1, "userId": "u1", "workoutDays": 20 },
  { "rank": 2, "userId": "u2", "workoutDays": 18 }
]
```

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
  item_order INT NOT NULL
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

CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY,
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercise_catalogs(id),
  item_order INT NOT NULL,
  note TEXT
);

CREATE INDEX workout_exercises_workout_id_idx ON workout_exercises (workout_id);

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

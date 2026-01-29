# 운동 기록 서비스 문서 (도메인/플로우/API)

## 1) 개요

- 목적: 하루 단위 운동 기록, 루틴 저장/불러오기, 달력 기반 조회
- 대상: 로그인 필수 사용자
- 특징: 루틴을 불러와 기록 폼을 만들되, 원본 루틴은 수정하지 않음

## 2) 도메인 모델 정의

### 엔티티

- User
- Workout (하루 운동 기록)
- WorkoutRoutine (하루 기록 내 실행한 루틴 단위)
- WorkoutExercise (그날 수행한 종목)
- Set (세트 기록)
- ExerciseCatalog (유저가 만든 운동 종목 사전)
- Routine
- RoutineItem (루틴의 종목 구성)
- InbodyRecord (인바디/체성분 기록)
- MonthlyReport (월간 리포트)
- ChallengeRanking (월간 출석 랭킹 결과)

### 관계

- User 1—N Workout
- User 1—N ExerciseCatalog
- User 1—N Routine
- Workout 1—N WorkoutRoutine
- Workout 1—N WorkoutExercise (루틴 미지정 종목)
- WorkoutRoutine 1—N WorkoutExercise
- WorkoutExercise 1—N Set
- Routine 1—N RoutineItem
- WorkoutExercise N—1 ExerciseCatalog
- RoutineItem N—1 ExerciseCatalog
- User 1—N InbodyRecord
- User 1—N MonthlyReport
- MonthlyReport 1—N ChallengeRanking

### 핵심 필드 (초안)

User

- id, email, passwordHash, createdAt

ExerciseCatalog

- id, userId, name, createdAt

Routine

- id, userId, name, createdAt, updatedAt

RoutineItem

- id, routineId, exerciseId, order

Workout

- id, userId, date(YYYY-MM-DD), createdAt, updatedAt

WorkoutRoutine

- id, workoutId, routineId, order, note

WorkoutExercise

- id, workoutId, workoutRoutineId?, exerciseId, order, note

Set

- id, workoutExerciseId, weight, reps, note, order

InbodyRecord

- id, userId, measuredAt(YYYY-MM-DD), weight, skeletalMuscleMass, bodyFatMass, createdAt

MonthlyReport

- id, userId, month(YYYY-MM), workoutDays, totalSets, weightChange, skeletalMuscleMassChange, bodyFatMassChange, createdAt

ChallengeRanking

- id, month(YYYY-MM), userId, rank, workoutDays

### 설계 원칙

- 루틴 불러오기: RoutineItem을 기반으로 WorkoutRoutine + WorkoutExercise/Set 틀을 복사 생성
- 하루 기록은 여러 루틴을 포함할 수 있음
- 루틴에 속하지 않은 종목은 WorkoutExercise에 workoutRoutineId 없이 저장
- 루틴 수정: 기록 중 변경은 WorkoutExercise/Set에만 반영, Routine은 불변
- 메모: 종목 단위로 기록 (WorkoutExercise.note)
- 리포트는 월 단위 집계이며, 조회는 계산형(실시간 집계) 또는 캐시형(MonthlyReport 저장) 중 택 1
- 챌린지 랭킹은 월 단위 출석 기준(Workout.date 기준)으로 산출

## 3) 유저 플로우

### A. 오늘 운동 기록

1. 로그인
2. 달력에서 오늘 날짜 선택
3. 운동 시작
4. 루틴 불러오기 또는 종목 추가
5. 세트 입력(무게/횟수/메모)
6. 저장

### B. 과거 날짜 기록

1. 로그인
2. 달력에서 과거 날짜 선택
3. 운동 기록 추가/수정
4. 저장

### C. 루틴 관리

1. 루틴 생성
2. 종목 추가/순서 지정
3. 저장

### D. 월간 리포트 조회

1. 로그인
2. 리포트 페이지에서 월 선택
3. 운동한 일자수/세트수/체성분 변화 확인

### E. 챌린지 랭킹 조회

1. 로그인
2. 챌린지 페이지에서 이번 달 랭킹 조회

## 4) 백엔드 명세

- 백엔드/API/DB 관련 명세는 `docs/workout-backend-spec.md`에 정리

## 5) 기능 설명

### 운동 기록

- 하루 단위로 운동 기록을 생성/조회
- 달력에서 특정 날짜 선택 시 해당 날짜 운동 조회
- 종목 추가: 기존 종목(ExerciseCatalog) 선택 또는 새 종목 생성

### 루틴

- 자주 하는 운동을 루틴으로 저장
- 기록 시 루틴을 불러와 빠르게 폼 생성
- 기록 중 변경은 루틴 원본에 영향을 주지 않음

### 기록 상세

- 종목별 메모 지원
- 세트별 무게/횟수/메모 기록

### 리포트

- 월별 운동 일자수, 세트수 집계
- 인바디 연동 데이터 기반 체중/골격근량/체지방량 변화 제공

### 챌린지

- 이번 달 출석(운동 기록 일자수) 기준 랭킹 제공

## 6) 화면 목록 / IA

### 인증

- 로그인
- 회원가입

### 홈/달력

- 월간 달력 (출석 표시)
- 날짜 선택 시 운동 기록 보기/작성

### 운동 기록

- 운동 기록 상세(종목/세트 입력)
- 종목 추가/수정
- 세트 추가/수정

### 루틴

- 루틴 목록
- 루틴 상세/편집
- 루틴 생성

### 리포트

- 월간 리포트 조회
- 인바디 기록 목록/추가/수정

### 챌린지

- 월간 출석 랭킹

### 설정

- 계정/로그아웃

## 7) 이후 확장 포인트

- 통계: 종목별 PR, 주간/월간 볼륨
- 템플릿: 루틴 버전 관리
- 공유: 루틴 공유/복제

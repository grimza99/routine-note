# AGENT_NOTES.md

이 파일은 에이전트가 작업 전에 확인해야 하는 누적 메모입니다.
짧고 사실 중심으로 기록합니다.
에이전트는 코드 작성, 의사결정 시에 해당 파일을 읽고 최종 결정을 내립니다.

## 기록 규칙

- 항목은 최신이 위로 오도록 추가
- 과도한 맥락은 링크/파일 경로로 대신
- 해결된 항목은 `[done]` 표시

## 노트 템플릿

- [date] [topic] 요약 한 줄
  - 영향/증상/개요 (필수):
  - 결정/조치 (필수):
  - 관련 파일/링크 (선택):

## 노트

- [2026-01-29] [backend] catalog 테이블 및 관련 로직 제거 예정 기록.
  - 영향/증상/개요 (필수): 백엔드 이슈로 catalog 테이블과 연관 로직을 제거하려고 함.
  - 결정/조치 (필수): 사용자가 catalog 테이블 및 관련 로직을 직접 삭제하기로 했고, 에이전트는 노트에 기록만 수행.
  - 관련 파일/링크 (선택): `supabase`, `src/app/api`

- [2026-01-27] [impl] Supabase 세팅 및 API 라우트 MVP/챌린지 구현.
  - 영향/증상/개요 (필수): Supabase 서버/클라이언트 초기화 및 인증/데이터 API 라우트 구성.
  - 결정/조치 (필수): `getSupabaseAdmin/getSupabaseAnon/getAuthUserId` 추가, auth/signup/login/refresh/logout 및 운동/루틴/세트/인바디/리포트/챌린지 API 라우트 생성.
  - 관련 파일/링크 (선택): `src/shared/libs/supabase/server.ts`, `src/shared/libs/supabase/auth.ts`, `src/app/api`

- [2026-01-27] [doc] `docs/workout-product-spec.md` 신규 작성.
  - 영향/증상/개요 (필수): 운동 기록 서비스의 도메인 모델, 유저 플로우, API 계약, 기능 설명을 한 문서로 정리.
  - 결정/조치 (필수): User/Workout/WorkoutExercise/Set/ExerciseCatalog/Routine/RoutineItem 및 리포트·챌린지 관련 엔티티 정의, 월간 리포트/인바디/챌린지 랭킹 API 상세 포함.
  - 관련 파일/링크 (선택): `docs/workout-product-spec.md`

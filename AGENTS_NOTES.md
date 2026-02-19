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

- [2026-02-18] [android-release] Android 클로즈드 테스트 플랜 구현 반영
  - 영향/증상/개요 (필수): 사용자가 안드로이드 2주 출시 플랜의 코드/문서 구현을 요청해 설치 이벤트 계측(`app_install`, `installId`)과 Android KPI 문서를 즉시 반영할 필요.
  - 결정/조치 (필수): 모바일 트래킹 메타에 `installId`를 추가하고, SecureStore 기반 `installStorage`를 신설해 최초 실행 시 `app_install` 1회 전송/성공 플래그 저장 규칙을 `useAuthSession`에 적용. 서버 `/api/events` 스키마에 `installId` optional 필드를 추가하고 `docs/android-kpi-dashboard-sql.md` 문서를 신설.
  - 관련 파일/링크 (선택): `mobile/src/shared/libs/analytics/track.ts`, `mobile/src/shared/libs/storage/installStorage.ts`, `mobile/src/features/auth/model/useAuthSession.tsx`, `src/app/api/events/route.ts`, `docs/android-kpi-dashboard-sql.md`

- [2026-02-17] [release] iOS MVP 출시 플랜 실행 문서/계약 반영
  - 영향/증상/개요 (필수): 사용자 요청으로 KR TestFlight 2주 + 6주 일정의 출시 플랜을 실제 운영 가능한 문서/계약으로 코드베이스에 고정할 필요.
  - 결정/조치 (필수): `docs/ios-mvp-launch-plan.md`를 신설하고, `/api/events` 스키마에 `sessionId/screenName/funnelStep/errorCode`를 확장. 모바일 메타 헤더 누락 시 경고 로그를 남기도록 서버 유틸/라우트를 보강하고, 라우팅 계약 동결 버전을 타입/문서에 명시.
  - 관련 파일/링크 (선택): `docs/ios-mvp-launch-plan.md`, `src/app/api/events/route.ts`, `src/shared/libs/api-route/header/getClientMeta.ts`, `docs/mobile-routing-contract.md`

- [2026-02-13] [mobile] DraggableSheet 공통 컴포넌트 신규 추가
  - 영향/증상/개요 (필수): 날짜 중심 워크아웃 UX 개편을 위해 하단에서 드래그로 접고 펼치는 공통 시트 UI 필요.
  - 결정/조치 (필수): `mobile/src/shared/ui/draggable-sheet/DraggableSheet.tsx`를 추가해 `visible/onClose` 기반 열림/닫힘, backdrop 탭 닫기, 아래로 드래그 닫기, `children` 또는 `renderContent(close)` 전달 방식을 지원. `shared/ui/index.ts` export 반영 및 타입체크 통과.
  - 관련 파일/링크 (선택): `mobile/src/shared/ui/draggable-sheet/DraggableSheet.tsx`, `mobile/src/shared/ui/index.ts`

- [2026-02-13] [mobile] 공통 Button 이후 Input 공통 컴포넌트 추가 적용
  - 영향/증상/개요 (필수): `RoutineScreen`, `WorkoutScreen`에서 `TextInput` 스타일/속성 패턴이 반복되어 유지보수 비용 증가.
  - 결정/조치 (필수): `mobile/src/shared/ui/input/Input.tsx`를 추가하고 두 화면의 입력 필드를 `Input`으로 교체. `shared/ui/index.ts` export 반영 및 모바일 타입체크(`pnpm --filter routine-note-mobile exec tsc --noEmit`) 통과.
  - 관련 파일/링크 (선택): `mobile/src/shared/ui/input/Input.tsx`, `mobile/src/features/routine/ui/RoutineScreen.tsx`, `mobile/src/features/workout/ui/WorkoutScreen.tsx`

- [2026-02-13] [env] Expo 부팅 시 `@babel/runtime` 해석 오류 대응
  - 영향/증상/개요 (필수): `mobile/index.ts`에서 `@babel/runtime/helpers/interopRequireDefault` 모듈 미해석으로 Metro 번들 실패.
  - 결정/조치 (필수): `mobile` 워크스페이스에 `@babel/runtime` 의존성 추가(`pnpm --filter routine-note-mobile add @babel/runtime`).
  - 관련 파일/링크 (선택): `mobile/package.json`, `pnpm-lock.yaml`

- [2026-02-13] [mobile] WorkoutScreen 세트 입력 방식을 운동별 개별값으로 확장
  - 영향/증상/개요 (필수): 공통 세트값 1개만 입력 가능해 운동별 강도 차이를 반영하기 어려움.
  - 결정/조치 (필수): 운동 입력 목록 기준으로 각 운동마다 `세트수/무게/횟수`를 개별 입력하도록 UI/상태를 변경하고, 저장 시 운동별 설정값으로 세트 생성 호출.
  - 관련 파일/링크 (선택): `mobile/src/features/workout/ui/WorkoutScreen.tsx`

- [2026-02-13] [mobile] WorkoutScreen 세트 입력(세트수/무게/횟수) 및 세트 생성 API 연동
  - 영향/증상/개요 (필수): 모바일 운동 기록에서 세트 단위 입력이 없어 웹 대비 핵심 기록 정보가 누락됨.
  - 결정/조치 (필수): `WorkoutScreen`에 세트 기본값 입력 UI를 추가하고, 저장 시 `POST /api/workout-exercises/{id}/sets`를 호출해 각 운동에 세트 생성하도록 구현. 세트 생성 라우트의 standalone 식별 조건을 `exercise_id`가 아닌 `id` 기준으로 수정.
  - 관련 파일/링크 (선택): `mobile/src/features/workout/ui/WorkoutScreen.tsx`, `mobile/src/features/workout/api/workoutApi.ts`, `src/app/api/workout-exercises/[workoutExerciseId]/sets/route.ts`

- [2026-02-13] [mobile] 모바일 Native 화면에 운동기록/루틴 CRUD API 연동 추가
  - 영향/증상/개요 (필수): 하이브리드 앱 골격 이후 실제 사용 가능한 CRUD(루틴 생성/수정/삭제, 날짜별 운동 생성/수정/삭제) 연결이 필요.
  - 결정/조치 (필수): `mobile`에 `routineApi/workoutApi`를 추가하고 `RoutineScreen`, `WorkoutScreen`을 폼+목록 기반 CRUD 화면으로 교체. 저장 후 이벤트(`workout_created`, `routine_applied`) 전송 연결.
  - 관련 파일/링크 (선택): `mobile/src/features/routine/ui/RoutineScreen.tsx`, `mobile/src/features/workout/ui/WorkoutScreen.tsx`, `mobile/src/features/routine/api/routineApi.ts`, `mobile/src/features/workout/api/workoutApi.ts`

- [2026-02-13] [env] 워크스페이스 의존성 설치 실패 (npm registry DNS)
  - 영향/증상/개요 (필수): `pnpm install` 시 `ERR_PNPM_META_FETCH_FAIL` (`getaddrinfo ENOTFOUND registry.npmjs.org`)로 `mobile` 워크스페이스 의존성 설치 불가.
  - 결정/조치 (필수): 코드/문서 반영은 완료했고, 의존성 설치/lockfile 갱신은 네트워크 복구 후 재실행 필요.
  - 관련 파일/링크 (선택): `package.json`, `pnpm-workspace.yaml`, `mobile/package.json`

- [2026-02-13] [mobile] 하이브리드 RN 실행 골격/딥링크 계약/이벤트 DB 적재 2차 반영
  - 영향/증상/개요 (필수): 추천 순서(모바일 워크스페이스 → 라우트 계약 → 이벤트 적재)에 맞춰 실제 실행 가능한 기반 코드 필요.
  - 결정/조치 (필수): `mobile/` Expo 워크스페이스를 추가하고(로그인/운동/루틴 Native + 리포트/챌린지/마이페이지 WebView fallback), 딥링크 계약 문서/타입(`docs/mobile-routing-contract.md`, `src/shared/types/mobile-routing.type.ts`)을 신설. `/api/events`를 `analytics_events` 테이블 insert로 전환하고 마이그레이션 SQL(`supabase/migrations/20260213_create_analytics_events.sql`) 추가.
  - 관련 파일/링크 (선택): `mobile/App.tsx`, `mobile/src/app/navigation/routeContract.ts`, `src/app/api/events/route.ts`, `src/app/api/auth/refresh/route.ts`

- [2026-02-13] [mobile] 하이브리드 RN 전환 계획에 맞춘 공통 인터페이스 1차 반영
  - 영향/증상/개요 (필수): 웹 MVP 기반 모바일 확장을 위해 모바일 메타 헤더, 이벤트 스키마, 실행 문서가 필요.
  - 결정/조치 (필수): `x-client-platform/x-app-version/x-app-build` 헤더를 공통 API 클라이언트에 추가하고 `POST /api/events` 라우트 및 이벤트 상수/트래킹 유틸을 신설. 실행/홍보 문서(`docs/mobile-hybrid-plan.md`, `docs/growth-launch-playbook.md`) 추가.
  - 관련 파일/링크 (선택): `src/shared/libs/api/client.ts`, `src/app/api/events/route.ts`, `src/shared/constants/mobile.ts`, `src/shared/constants/analytics.ts`

- [2026-02-12] [ui] 모달 V2 스켈레톤(provider/registry/useModal) 신규 추가
  - 영향/증상/개요 (필수): 기존 모달 코드를 유지한 채 key 기반 레지스트리 패턴을 실험/점진 전환할 수 있는 신규 구조 필요.
  - 결정/조치 (필수): `shared`에 범용 `ModalProvider/useModal`을 추가하고, `app/providers/modal`에 앱 전용 `modalRegistry`/bridge provider를 신설. 기존 모달 사용처는 수정하지 않고 루트 레이아웃에만 브리지 provider 연결.
  - 관련 파일/링크 (선택): `src/shared/ui/modals-v2/ModalProvider.tsx`, `src/shared/ui/modals-v2/types.ts`, `src/shared/hooks/useModal.ts`, `src/app/providers/modal/modalRegistry.tsx`, `src/app/providers/modal/ModalBridgeProvider.tsx`, `src/app/layout.tsx`

- [2026-02-12] [auth] `/auth` prerender 에러 대응을 위한 `useSearchParams` 제거
  - 영향/증상/개요 (필수): `/auth` 빌드 시 prerender 에러가 발생해 로그인 폼의 URL 쿼리 읽기 방식 점검 필요.
  - 결정/조치 (필수): `LoginForm`에서 `useSearchParams`를 제거하고 `window.location.search` 기반 즉시 계산으로 `next` 파라미터를 전달하도록 변경.
  - 관련 파일/링크 (선택): `src/features/auth/ui/LoginForm.tsx`

- [2026-02-12] [auth] `src/proxy.ts` `next` 파라미터 기반 로그인 후 리다이렉트 반영
  - 영향/증상/개요 (필수): 보호 라우트 접근 시 `/auth?next=...`로 이동하지만 로그인 성공 후 항상 기본 경로로만 이동하던 흐름 보완 필요.
  - 결정/조치 (필수): `LoginForm`에서 `next` 쿼리를 읽어 `useLoginMutation`에 전달하고, mutation 내부에서 내부 경로(`/` 시작, `//` 제외)만 허용해 안전하게 `router.push` 하도록 수정.
  - 관련 파일/링크 (선택): `src/features/auth/ui/LoginForm.tsx`, `src/features/auth/model/auth.mutation.ts`, `src/proxy.ts`

- [2026-02-11] [next16] 동적 API 라우트 params Promise 타입 정리 및 빌드 차단 이슈 확인
  - 영향/증상/개요 (필수): Next.js 16 빌드에서 동적 라우트 핸들러의 `context.params`가 Promise 시그니처를 요구해 타입 불일치 발생.
  - 결정/조치 (필수): `[exerciseId]` 포함 모든 동적 API 라우트에서 `type Params = Promise<...>`로 통일하고 핸들러에서 `await context.params` 사용으로 수정. 검증 빌드 중 `@/shared`의 `getMonthRange` export 누락(월간 랭킹/리포트 라우트) 별도 오류 확인.
  - 관련 파일/링크 (선택): `src/app/api/exercises/[exerciseId]/route.ts`, `src/app/api/workouts/[workoutId]/route.ts`, `src/app/api/challenges/monthly-rank/route.ts`, `src/app/api/reports/monthly-trends/route.ts`

- [2026-02-06] [backend] workout 루틴 아이템 저장 구조 변경
  - 영향/증상/개요 (필수): 루틴 기반 운동은 `workout_exercises`가 아닌 `workout_routine_items`에 저장하도록 구조 변경 필요.
  - 결정/조치 (필수): `workouts` POST에서 루틴 아이템을 `workout_routine_items`로 insert, `workoutSelect`/응답 매핑 변경, `workout_exercises`는 standalone만 저장하도록 문서 반영.
  - 관련 파일/링크 (선택): `src/app/api/workouts/route.ts`, `docs/workout-backend-spec.md`

- [2026-02-06] [e2e] auth 이후 routine 관리 e2e 플로우 구성
  - 영향/증상/개요 (필수): auth.spec.ts 실행 후 로그인 상태를 저장하고, routine 관리 e2e가 해당 상태를 재사용하도록 구성 필요.
  - 결정/조치 (필수): `auth.spec.ts`에서 storageState 저장, `playwright.config.ts`에 `auth`→`e2e` 프로젝트 의존성 추가, `routine.manage.spec.ts`에서 루틴 생성/수정/삭제 플로우 작성.
  - 관련 파일/링크 (선택): `e2e/auth.spec.ts`, `e2e/routine.manage.spec.ts`, `playwright.config.ts`

- [2026-02-04] [env] pnpm add 실패 (네트워크/스토어 위치 충돌) [done]
  - 영향/증상/개요 (필수): `pnpm add -D @playwright/test` 실행 시 registry 접근 실패(ENOTFOUND)와 pnpm store location 불일치 오류 발생.
  - 결정/조치 (필수): 에스컬레이션 승인 후 `pnpm add -D @playwright/test` 성공적으로 설치 완료.
  - 관련 파일/링크 (선택): `package.json`

- [2026-02-04] [env] Playwright webServer EPERM listen 오류
  - 영향/증상/개요 (필수): `pnpm test:e2e` 실행 시 Next dev 서버가 `0.0.0.0:3000`에 바인딩하며 EPERM 발생.
  - 결정/조치 (필수): Playwright webServer를 `127.0.0.1`로 바인딩하도록 변경.
  - 관련 파일/링크 (선택): `playwright.config.ts`

- [2026-02-03] [process] 라우트 변경 시 백엔드 스펙 문서 반영 규칙 추가.
  - 영향/증상/개요 (필수): API 라우트 변경/추가 누락으로 문서 최신성 저하 위험.
  - 결정/조치 (필수): 라우트가 바뀔 때마다 `docs/workout-backend-spec.md`에 즉시 반영.
  - 관련 파일/링크 (선택): `docs/workout-backend-spec.md`

- [2026-02-03] [report] 리포트 차트 요구사항 정정 반영.
  - 영향/증상/개요 (필수): 주간 운동량은 월~일 기준, 월간 성과 추이는 목표 달성률 라인 1개로 변경 요청.
  - 결정/조치 (필수): weekly-volume 집계 기준을 월~일로 수정하고, monthly-trends를 goalAchievementRate 단일 라인으로 변경.
  - 관련 파일/링크 (선택): `src/app/api/reports/weekly-volume/route.ts`, `src/app/api/reports/monthly-trends/route.ts`, `src/app/(app-layout)/report/page.tsx`

- [2026-02-03] [doc] monthly-all 리포트 API 스펙 추가.
  - 영향/증상/개요 (필수): 월별 리포트 전체 조회 API 문서화 필요.
  - 결정/조치 (필수): `GET /reports/monthly-all` 스펙을 `docs/workout-backend-spec.md`에 추가.
  - 관련 파일/링크 (선택): `docs/workout-backend-spec.md`

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

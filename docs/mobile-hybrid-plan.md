# 하이브리드 RN 구현 가이드 (v1)

## 1) 목적

- 웹 MVP를 유지하면서, 핵심 플로우(`로그인`, `운동기록`, `루틴`)를 네이티브로 전환한다.
- 비핵심 화면(`리포트`, `챌린지`, `마이페이지`)은 WebView fallback으로 우선 출시한다.

## 2) 앱 구조

- `Native Shell (React Native)`
  - 네비게이션, 인증 상태, 공통 토스트/에러 처리
- `Native Feature`
  - 로그인, 운동기록 작성/수정, 루틴 목록/적용
- `WebView Fallback`
  - 리포트, 챌린지, 마이페이지

## 3) 인증 전략 (기본값)

- 토큰 저장: Secure Storage 단일 전략
- API 호출: `Authorization: Bearer <access token>` 주입
- 401 재시도: refresh 1회 후 실패 시 로그인 화면으로 이동 + 사용자 안내

## 4) API/헤더 계약

- 모든 요청에 클라이언트 메타 헤더를 포함한다.
  - `x-client-platform`: `ios | android | web`
  - `x-app-version`: semver
  - `x-app-build`: build number
- 이벤트 전송 API: `POST /api/events`

## 5) RN ↔ WebView 경계

- 책임 분리
  - RN: 인증, 기록/루틴 핵심 입력 UX
  - WebView: 비핵심 조회 화면
- WebView 진입 시에만 세션 브리지(최소화)
- 딥링크 우선순위
  - RN 지원 화면이면 RN 라우트
  - 미지원이면 WebView URL fallback

## 6) 완료 기준

- 로그인 → 기록 저장 → 루틴 적용 플로우 완주
- WebView fallback 진입/복귀 시 세션 끊김 없음
- 치명 크래시 0, 핵심 플로우 성공률 95%+

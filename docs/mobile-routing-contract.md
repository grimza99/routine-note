# RN/WebView 라우팅 + 딥링크 계약

## 1) 목적

- RN 네이티브 화면과 WebView fallback 화면의 경계를 고정한다.
- `routine-note://` 딥링크를 앱 라우팅에 일관되게 매핑한다.

## 2) 딥링크 스킴

- 스킴: `routine-note://`
- 예시
  - `routine-note://auth/login`
  - `routine-note://workout/record`
  - `routine-note://report/monthly`

## 3) 라우트 계약

| key | deep link path | resolution |
| --- | --- | --- |
| `auth.login` | `auth/login` | `native` |
| `workout.record` | `workout/record` | `native` |
| `routine.list` | `routine/list` | `native` |
| `report.monthly` | `report/monthly` | `webview` |
| `challenge.monthly` | `challenge/monthly` | `webview` |
| `mypage` | `mypage` | `webview` |

## 4) 릴리즈 동결 정보

- Contract Version: `2026-03-10-v1`
- Frozen At: `2026-03-10`
- 변경 원칙
  - 동결 이후 라우트 추가/수정은 App Store 심사 리스크가 낮은 핫픽스 사유일 때만 허용
  - 변경 시 웹/모바일 계약 소스와 본 문서를 같은 PR에서 동시 갱신

## 5) 기준 소스

- 웹 공유 타입: `src/shared/types/mobile-routing.type.ts`
- 모바일 매핑 구현: `mobile/src/app/navigation/routeContract.ts`
- 모바일 linking 설정: `mobile/src/app/navigation/linking.ts`

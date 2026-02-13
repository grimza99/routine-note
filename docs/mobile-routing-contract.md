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

## 4) 기준 소스

- 웹 공유 타입: `src/shared/types/mobile-routing.type.ts`
- 모바일 매핑 구현: `mobile/src/app/navigation/routeContract.ts`
- 모바일 linking 설정: `mobile/src/app/navigation/linking.ts`

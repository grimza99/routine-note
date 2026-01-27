# AGENTS.md

## 프로젝트 요약

- 해당 프로젝트는 사용자의 운동 기록을 위한 웹 서비스로, 히스토리, 리포트, 루틴 커스텀, 다른 사용자와의 운동 비교 서비스를 제공 합니다.

## 규칙

- 파스칼 케이스: 컴포넌트명, 인터페이스, 클래스, 타입
- 카멜 케이스 : 함수명, 변수, 속성,메서드 등
- 이미 절대 경로 임포트를 쓰는 파일이 아니라면 상대 경로 임포트를 우선한다.
- FSD 스타일 구조를 준수한다.
- `src/` 아래 FSD 스타일 구조로, 각 레이어에서는 index.ts 로 export 하고, //contants ,//libs 등 적절한 주석으로 타 팀원의 가독성 향상을 도모한다.
- 에이전트는 어떠한 일의 수행이나 의사결정 직전에 `AGENTS_NOTES.md` 를 읽고 최종 의사결정을 내린다.
- global.css 에 root 키워드로 선언된 컬러변수를 사용하여 스타일링 한다.

## AGENTS_NOTES.md

- 해당 md 파일에는 다음 상황에 기록한다:
  - 버전 충돌/환경 이슈등 에러에 대한 기록
  - 사용자 이해가 어려워 개념에 대해 물어보거나 자세하게 이야기를 나눈 개념이나 포인트
  - 에이전트가 만들어낸 1차 결과에 대해 사용자가 추가 수정 요청을 했을 경우
  - "AGENTS_NOTES.md에 이내용 명시해줘 내용 : ~", 라고 사용자가 명시 명령과 함께 같이 작성한 내용

## docs

- workout-product-spec.md : 이후 백엔드 확장, 앱 개발시 공통으로 참고할 도메인 모델/유저 플로우/API 계약 문서
- design-system.md : 웹/앱에서 동일한 시각 언어를 유지하기 위한 기준 문서

## 우선 확인 파일

- `/AGENTS_NOTES.md`
- `docs/workout-product-spec.md`
- `docs/design-system.md`

## Do/Don't

- Do: 해당 파일의 규칙 부분을 준수한다.
- Do: 요청 범위에 맞춰 최소한의 변경만 한다.
- Do not: 의사결정시에 AGENTS_NOTES.md 파일을 확인하지 않고 코드를 작성하거나 의사결정을 내린다.
- Do not: 요청 없이는 라이브러리 관련 설정을 변경하지 않는다. (lint, type, queryProvider 등)
- Do not: 수행중 요청과 관련 없는 파일에서 어떠한 오류를 발견했을경우, 에이전트는 코드를 요류를 바로 수정하지 않고 관련 사항과 해결방안을 정리하여 제시한다.

## skills & version

- pnpm 패키지 매니져 사용
  "dependencies": {
  "next": "16.1.5",
  "react": "19.2.3",
  "react-dom": "19.2.3"
  },
  "devDependencies": {
  "@tailwindcss/postcss": "^4",
  "@types/node": "^20",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "eslint": "^9",
  "eslint-config-next": "16.1.5",
  "prettier": "^3.8.1",
  "tailwindcss": "^4",
  "typescript": "^5"
  },

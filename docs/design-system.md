# 디자인 시스템 (앱/웹 공통 참고)

## 1) 목적

- 웹/앱에서 동일한 시각 언어를 유지하기 위한 기준 문서
- 컴포넌트 제작 전에 Foundations(기초 규칙)를 고정

## 2) Foundations (현재 합의)

### Color

- Primary: `#E60023`
- Disabled Grey: `#E0E0E0`
- Text: Primary 또는 White, Disabled는 Grey

### Radius

- 기본 Border Radius: `8px`

## 3) 컴포넌트 적용 원칙 (초안)

- 버튼/카드/입력 등 모든 UI는 Foundations 토큰을 우선 사용
- 웹은 `src/app/globals.css`의 `:root` 컬러 변수 기준으로 확장
- 앱에서도 동일 토큰 명칭을 사용해 매핑

## 4) 컴포넌트 스타일 (현재 합의)

### Button

- Primary: Primary 배경, White 텍스트
- Secondary: Primary 보더, White 배경, Primary 텍스트
- Disabled: Grey 보더, White 배경, Grey 텍스트 (Grey = `#E0E0E0`)

### Card / Input

- 버튼의 Primary/Secondary 스타일 원칙을 따른다

## 5) Foundations (권장 기본값)

### Color (권장)

- Background: `#FFFFFF`
- Surface: `#F7F7F7`
- Text Primary: `#1A1A1A`
- Text Secondary: `#666666`
- Border: `#E6E6E6`
- Focus Ring: Primary 30% opacity (예: `rgba(230, 0, 35, 0.3)`)

### Typography

- Font Family (KR): `Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`
- Base Size: `16px`
- Scale: `12 / 14 / 16 / 18 / 20 / 24 / 32`
- Line Height: `1.4` (본문), `1.2` (타이틀)
- Font Weight: `400`(본문), `600`(강조), `700`(헤드라인)

### Spacing

- 4px 기반 스케일: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48`

### Border

- Border Width: `1px`
- Border Style: `solid`

### Shadow (Elevations)

- E1: `0 1px 2px rgba(0, 0, 0, 0.08)`
- E2: `0 4px 12px rgba(0, 0, 0, 0.12)`

### Icon

- Size: `16 / 20 / 24`
- Stroke: `1.5px` 기본

## 6) Layout (권장)

- Max Width: `1200px` (웹 기준)
- Grid: 12 columns
- Gutter: `24px`
- Breakpoints: `360 / 768 / 1024 / 1280`

## 7) 컴포넌트 상태 규칙

- 상태: Default / Hover / Active / Focus / Disabled / Loading
- Disabled는 색상 대비 약화, 인터랙션 비활성
- Focus는 `2px` ring 또는 outline로 명확히 표시

## 8) 컴포넌트 목록 (권장)

- Button, IconButton
- Input, Textarea, Select, Search
- Checkbox, Radio, Toggle, Switch
- Badge, Chip, Tag
- Card, ListItem
- Modal, BottomSheet, Drawer
- Tabs, SegmentedControl
- Table, Pagination
- Toast, Alert, EmptyState

## 9) 패턴 (권장)

- Form: 필수 표시, 에러 메시지, 도움말 텍스트
- List: 좌측 정렬, 행 간격 `12px`
- Empty: 아이콘 + 문구 + CTA
- Loading: 스켈레톤 또는 스피너 1종 통일

## 10) Motion (권장)

- Duration: `150ms / 200ms / 300ms`
- Easing: `ease-out`
- 모션은 정보 전달/상태 변화에만 사용

## 11) 접근성 (권장)

- 텍스트 대비 4.5:1 이상 목표
- 키보드 포커스 이동 가능
- 터치 타깃 최소 `44px`

## 12) 콘텐츠 가이드 (권장)

- 문장은 짧고 명확하게
- CTA는 동사형으로 시작 (예: "저장", "삭제", "추가")
- 에러 문구는 원인 + 해결 힌트 포함

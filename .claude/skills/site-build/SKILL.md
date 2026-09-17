---
name: site-build
description: 개인 포트폴리오 사이트를 실제로 구현·수정·배포한다. 페이지/컴포넌트 작성, 디자인 토큰, 반응형, 다크모드, 프로젝트 JSON 렌더링, GitHub 저장소 초기화, Vercel 배포가 대상. "사이트 만들어", "페이지 추가", "디자인 바꿔", "배포해줘", "깃허브에 올려", "모바일에서 깨져", "다크모드", "빌드 안 돼" 요청 시 반드시 사용하라. 카피 작성(site-copy)이나 공개 검수(publish-gate)는 하지 않는다.
---

# site-build — 구현과 배포

## 기본 스택 (변경하려면 사유를 기록한다)
- **Next.js (App Router) + TypeScript + Tailwind CSS**, 정적 생성
- 배포: **Vercel** (GitHub 연동, main push → 자동 배포)
- 저장소: GitHub `yt-hwang/<repo>`
- 이미지: `next/image`, 폰트는 `next/font` (외부 CDN 호출 금지)

바꿀 수 있다. 다만 `_workspace/04_builder_notes.md`에 **왜 바꿨는지**를 남긴다.
기록 없는 스택 교체는 다음 세션의 나를 헤매게 만든다.

## 구조 원칙

### 1. 콘텐츠는 코드 밖에 있다
```
content/projects/*.json   ← 프로젝트 데이터 (단일 진실 원천)
content/copy/{ko,en}/*.md ← 긴 본문
app/                      ← 라우팅
components/               ← 재사용 컴포넌트
```
프로젝트를 하나 추가할 때 **JSON 한 개만 넣으면 사이트에 나와야 한다.**
컴포넌트에 프로젝트 이름이 하드코딩되어 있으면 설계 실패다.

### 2. 카드는 한 종류다
프로젝트마다 다른 레이아웃을 만들지 않는다. 데이터의 유무에 따라 요소가 나타나고 사라질 뿐이다.
- 링크가 없으면 링크 영역 자체를 렌더하지 않는다 (빈 `<a href="">` 금지)
- `visibility: "limited"`면 상세 링크를 걸지 않고 카드에서 끝낸다
- `visibility: "private"`면 목록에서 제외한다 (JSON은 남기되 렌더하지 않는다)

### 3. 색은 토큰으로만
`:root`에 라이트 팔레트를 전부 정의하고, `@media (prefers-color-scheme: dark)`와
`[data-theme="dark"]` 양쪽에서 같은 토큰을 재정의한다.
토큰 밖에서 색상 리터럴을 쓰지 않는다 — 다크모드에서 한 군데만 튀는 사고가 여기서 나온다.

### 4. 모바일 우선
360px에서 가로 스크롤이 생기면 미완성이다.
넓은 요소(표, 코드블록, 다이어그램)는 자기 자신만 `overflow-x: auto`로 스크롤한다.

### 5. 접근성 기본선
이미지 `alt`, 의미 있는 링크 텍스트("여기" 금지), `h1`은 페이지당 하나, 대비 4.5:1 이상,
키보드 탭으로 모든 링크 도달 가능.

## 저장소 초기화 절차
1. `.gitignore` 먼저 만든다 — `.env*`, `node_modules`, `.next`, `.vercel`, `_workspace/` (중간 산출물은 공개할 이유가 없다)
2. `git init` → `git add -A` 전에 **반드시 `git status`로 목록을 눈으로 확인**한다
3. `publish-gate` 통과 전에는 push하지 않는다
4. GitHub 저장소는 `gh repo create`로 만들되, 공개/비공개는 사용자에게 확인받는다

## 배포 절차
1. 로컬 `npm run build` 성공 확인
2. `publish-gate` 최종 검사 통과 확인 (`_workspace/05_privacy_gate.md`에 PASS 기록이 있어야 한다)
3. Vercel 연결 → 프리뷰 배포 → 실제 URL에서 QA
4. 프로덕션 승격
5. 배포 URL을 `_workspace/04_builder_notes.md`에 기록

## 빌드가 깨졌을 때
되돌리지 말고 원인을 찾는다. 에러 메시지 전문을 노트에 남기고, 고친 뒤 무엇이 원인이었는지 한 줄 적는다.
같은 에러를 두 번 만나면 그때는 구조가 문제다.

## 하지 않는 것
- 문장 작성 → `site-copy`
- 공개 가능 여부 판단 → `publish-gate`
- 프로젝트 사실 조사 → `project-inventory`

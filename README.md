# personal-website

황윤태(Yun Hwang)의 개인 사이트. 진행 중인 프로젝트를 한곳에 모아 소개한다.

한국어 기본, 영어 토글. Next.js(App Router) + TypeScript + Tailwind, 정적 생성.

## 구조

```
content/projects/*.json   프로젝트 데이터 — 단일 진실 원천
content/copy/{ko,en}/     문장
lib/projects.ts           렌더 규칙 전부가 여기 한 곳에 있다
components/               재사용 컴포넌트 (프로젝트 이름이 하드코딩되지 않는다)
app/(ko) app/(en)         라우팅. html lang 을 나누려고 루트 레이아웃을 둘 둔다
```

프로젝트를 추가할 때 고칠 것은 `content/projects/` 에 JSON 한 개다.
카드·상세 페이지·집계 수치가 그 파일 하나로 따라온다.

## 개발

```bash
npm install
npm run dev
```

배포 시 `NEXT_PUBLIC_SITE_URL` 이 필요하다. 없으면 canonical 과 hreflang 이 localhost 로 굳는다.
`.env.example` 참고.

## 만든 방식

이 사이트는 여섯 역할의 AI 에이전트 팀이 만들었다 — 정보구조, 사실 조사, 카피, 구현, 공개 검수, QA.
역할 정의는 `.claude/agents/`, 각 역할이 따르는 절차는 `.claude/skills/` 에 있다.

조사 담당은 값마다 출처 파일 경로를 남기고, 근거를 댈 수 없는 값은 비워 둔다.
공개 검수 담당은 배포를 막을 권한을 가지며, 카피 작성 전과 push 직전 두 번 검사한다.

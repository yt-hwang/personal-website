# Personal-Website

개인 포트폴리오 웹사이트. 운영 중인 프로젝트들을 한곳에서 소개하고 링크한다.
소스는 GitHub에 공개 저장소로 올린다.

## 하네스: 개인 포트폴리오 사이트

**목표:** 흩어진 프로젝트를 사실 기반으로 정리해 하나의 공개 페이지로 만들고, 새 프로젝트가 생기면 JSON 한 개로 추가된다.

**트리거:** 사이트 제작·수정·프로젝트 추가·배포 등 복합 작업 요청 시 `portfolio-orchestrate` 스킬을 사용하라.
단일 영역이면 해당 스킬을 직접 쓴다 — 조사 `project-inventory` / 문구 `site-copy` / 구현·배포 `site-build` / 공개 검수 `publish-gate`.
단순 질문은 직접 응답 가능.

**불변 규칙:** push·배포 직전에는 요청이 없어도 `publish-gate`를 돌린다. 이 저장소는 공개되고, 원본 프로젝트에는 회사 기밀·개인 금융/건강 데이터·제3자 개인정보가 섞여 있다.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-09-16 | 초기 구성 (에이전트 6 + 스킬 5 + 오케스트레이터) | 전체 | - |
| 2026-09-16 | 스키마 확장 — restrictions[] 추가 | skills/project-inventory | 공개하되 범위를 제한해야 하는 케이스(회사 프로젝트)가 실제로 발생 |
| 2026-09-16 | 스키마 확장 — role/highlights 이중언어, body 4블록, featured | content/projects/*.json | /en 빌드가 막혀 있었음 (site-architect 지적) |
| 2026-09-16 | doyak을 community → agent-systems로 이동 | content/projects/doyak.json | 11인 에이전트 팀으로 운영되는 시스템. 그룹 기준을 "누가 굴리는가"로 통일 |
| 2026-09-16 | this-site 카드 신설 | content/projects/this-site.json | 이 사이트 자신이 6번째 에이전트 팀. 없으면 "6개"가 5개로 보임 |
| 2026-09-16 | humor-test 카드 추가 (12장) | content/projects/humor-test.json | 사용자 추가 요청. 12장 중 유일하게 저장소 public + 배포 라이브 |
| 2026-09-16 | 공개/내부 데이터 파일 분리 (화이트리스트) | content/projects + _workspace/notes | 내부 메모(restrictions)에 전략 코드네임·호칭이 담긴 채 공개 커밋될 뻔함 |
| 2026-09-16 | 게이트 검사 대상을 빌드 산출물·커밋 대상으로 확대 | skills/publish-gate | 카피에서 지운 고유명사가 데이터에 남아 렌더 단계에서 되살아남 |
| 2026-09-16 | renfinity 페르소나 고유명사 데이터 층에서 제거 | content/projects/renfinity.json | 검색으로 비공개 대시보드에 도달하는 경로 차단 |
| 2026-09-16 | links[].label 이중언어 승격 + "가시 문자열은 전부 {ko,en}" 원칙 | content/projects/*.json | /en 링크 텍스트가 한국어로 렌더됨 (QA D-2). 같은 누락이 두 번째라 원칙으로 못박음 |
| 2026-09-16 | 404를 라우트 그룹 분리 대신 단일 이중언어 페이지로 | app/not-found.tsx | 루트 레이아웃 2개 구조에서 Next 16이 404 레이아웃을 정하지 못함. 실제 페이지 21장의 html lang 을 지키는 쪽을 택함 |
| 2026-09-16 | 배포 런북 작성 | _workspace/07_deploy_runbook.md | 게이트→저장소→환경변수→프리뷰 순서를 고정. push가 게이트보다 먼저 가면 되돌릴 수 없음 |
| 2026-09-16 | 게이트 검사 대상을 `git diff --cached` 전체로 변경 | skills/publish-gate | 디렉토리를 손으로 골라 스캔하다 ops/*.py 를 세 번째로 빠뜨림. 목록은 반드시 무언가를 빠뜨린다 |
| 2026-09-16 | ops/ 를 저장소에서 제외 (_workspace/ops 로 이동) | .gitignore | 마이그레이션 스크립트가 금칙어 목록을 하드코딩하고 있어 공개 불가 |
| 2026-09-16 | 미승인 링크를 공개 카드에서 제거 | content/projects, _workspace/notes | limited·LINK_HOLD 프로젝트의 URL이 렌더는 안 되나 저장소에는 커밋됨 |
| 2026-09-16 | 배포 — 공개 저장소 + 프로덕션 | 전체 | 배포 https://personal-website-flax-eight-41.vercel.app · 저장소 https://github.com/yt-hwang/personal-website |
| 2026-09-17 | 전면 재디자인 (기술 문서 조판 · 종이/잉크 팔레트 · Hahmlet+IBM Plex) + About 구조화 | app/ components/ lib/ | 사용자 피드백 "디자인 UI/UX 별로야", "소개 페이지 산문이라 뭘 하는지 모르겠어". IA는 유지, 시각 언어·레이아웃·정보 밀도만 교체. 근거는 `_workspace/04_builder_notes.md` §11~§17 |
| 2026-09-17 | 의존성 추가 — `lucide-react@0.577.0` (버전 고정) | package.json | 아이콘 세트 단일화. 1.x 는 아이콘 기반 컴포넌트에 `"use client"` 가 붙어 전 페이지에 11KB 클라이언트 청크가 생긴다. 0.577 은 서버에서 순수 SVG 로 렌더되고 클라이언트 JS 0바이트 |

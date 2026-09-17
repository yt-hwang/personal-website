---
name: portfolio-orchestrate
description: 개인 포트폴리오 웹사이트를 처음부터 만들거나, 만든 뒤 고치고 확장한다. 프로젝트 조사 → 정보구조 설계 → 공개 검수 → 카피 → 구현 → QA → 배포 전 과정을 6인 에이전트 팀으로 조율한다. "개인 웹페이지 만들어", "포트폴리오 사이트", "내 프로젝트 소개 페이지", "사이트 전체 다시", "프로젝트 추가하고 반영해줘", "다시 실행", "재실행", "업데이트", "보완", "이전 결과 기반으로 개선", "배포까지 해줘" 요청 시 반드시 사용하라. 단일 영역(문구만, 배포만, 등급 판정만)이면 해당 스킬을 직접 호출하고 이 스킬은 쓰지 않는다.
---

# portfolio-orchestrate — 포트폴리오 사이트 오케스트레이터

## 팀
| 에이전트 | 타입 | 담당 | 산출물 |
|---|---|---|---|
| `project-scout` | Explore | 프로젝트 사실 조사 | `content/projects/*.json`, `_workspace/02_scout_report.md` |
| `privacy-auditor` | general-purpose | 공개 등급 판정·배포 차단 | `_workspace/05_privacy_gate.md` |
| `site-architect` | general-purpose | 목적·IA·페이지 사양 | `_workspace/01_architect_ia.md` |
| `content-writer` | general-purpose | 한/영 카피 | `_workspace/03_writer_copy.md`, `content/copy/**` |
| `web-builder` | general-purpose | 구현·저장소·배포 | 사이트 소스, `_workspace/04_builder_notes.md` |
| `qa-reviewer` | general-purpose | 링크·반응형·정합성 검증 | `_workspace/06_qa_report.md` |

모든 `Agent` 호출에 `model: "opus"`를 명시한다.

## 실행 모드: 하이브리드
- Phase 1 (조사) — **서브 에이전트 병렬**. 프로젝트끼리 의존이 없으므로 통신 오버헤드가 순손해다.
- Phase 2 (게이트) — **단독**. 다른 작업을 시작하기 전에 공개 등급이 확정돼야 헛일이 없다.
- Phase 3~5 (설계·카피·구현) — **에이전트 팀**. 사양↔카피↔구현이 계속 되먹임되므로 직접 통신이 필요하다.
- Phase 6 (QA·배포) — **서브 에이전트**. 검증은 독립적일수록 정확하다.

## Phase 0 — 컨텍스트 확인 (항상 먼저)
1. `_workspace/` 존재 여부 확인
   - 없음 → **초기 실행** (Phase 1부터)
   - 있음 + 사용자가 특정 부분 수정 요청 → **부분 재실행** (해당 에이전트만)
   - 있음 + 새 입력/전면 개편 → `_workspace/`를 `_workspace_prev/`로 옮기고 **새 실행**
2. `_workspace/00_purpose.md` 확인. 없으면 **사용자에게 사이트 목적과 대상 독자를 먼저 묻고** 이 파일을 만든다.
   목적 없이 IA를 그리면 전부 다시 하게 된다.
3. `content/projects/*.json` 개수와 `updated` 날짜 확인 — 오래된 것만 재조사한다.

## Phase 1 — 프로젝트 조사 (병렬)
프로젝트를 3~4개씩 묶어 `project-scout`를 `run_in_background: true`로 병렬 호출한다.
각 호출에 `project-inventory` 스킬을 따르도록 지시한다.
완료 후 `_workspace/02_scout_report.md`의 `unknowns`를 취합해 **사용자에게 한 번에 질문**한다.
질문은 프로젝트당 최대 2개로 줄인다. 20개를 늘어놓으면 답이 오지 않는다.

## Phase 2 — 공개 게이트 (1차)
`privacy-auditor`를 단독 호출해 프로젝트별 등급을 확정한다.
`NEEDS_USER_DECISION` 항목은 사용자에게 위험을 한 줄로 설명하고 판단을 받는다.
**이 단계를 건너뛰고 카피를 쓰지 않는다.**

## Phase 3~5 — 설계 → 카피 → 구현 (팀)
`TeamCreate`로 `site-architect`, `content-writer`, `web-builder` 팀을 만들고 `TaskCreate`로 작업을 건다.
- 순서는 설계 → 카피 → 구현이지만 **배리어를 걸지 않는다.**
  IA가 확정된 섹션부터 카피가 붙고, 카피가 끝난 섹션부터 구현이 들어간다.
- 팀원 간 조율은 `SendMessage`, 산출물은 파일(`_workspace/`), 진행 상태는 `TaskUpdate`로 공유한다.
- 사양과 카피가 충돌하면 오케스트레이터가 중재하지 말고 두 에이전트가 직접 합의하게 둔다.
  합의가 2회 실패하면 그때 사용자에게 올린다.

## Phase 6 — QA와 배포
1. `qa-reviewer` 호출 → `_workspace/06_qa_report.md`
2. 결함이 있으면 `web-builder`로 되돌리고 QA를 다시 돈다 (회귀 검사 포함)
3. `privacy-auditor` **2차 호출** — 기계 검사(`publish-gate`의 grep 3종) 포함
4. 판정이 `PASS`일 때만 push/배포. `BLOCKED`면 사용자에게 사유와 함께 보고하고 중단한다.
5. 배포 URL을 `_workspace/04_builder_notes.md`와 `CLAUDE.md` 변경 이력에 기록한다

## 데이터 전달
- 중간 산출물: `_workspace/{순번}_{에이전트}_{산출물}.md` — 지우지 않는다(감사 추적)
- 프로젝트 데이터: `content/projects/*.json` — 단일 진실 원천
- `_workspace/`는 `.gitignore`에 넣는다. 공개 저장소에 초안이 갈 이유가 없다.

## 에러 핸들링
| 상황 | 대응 |
|---|---|
| 에이전트 1회 실패 | 1회 재시도. 재실패면 그 결과 없이 진행하되 보고서에 **누락을 명시**한다 |
| 프로젝트 폴더 못 찾음 | `status: "not_found"` 카드로 남긴다. 조용히 빠뜨리지 않는다 |
| 사실이 서로 충돌 | 삭제하지 않고 양쪽을 출처와 함께 병기한 뒤 사용자에게 올린다 |
| 빌드 실패 | 되돌리지 말고 원인 기록 후 수정 |
| 게이트 BLOCKED | 배포 중단. 우회하지 않는다 |

## 테스트 시나리오
**정상 흐름** — "내 프로젝트 10개 넣은 개인 웹페이지 만들어줘"
→ Phase 0에서 목적 질문 → Phase 1 병렬 조사 10건 → unknowns 질문 → Phase 2 등급 확정
→ Phase 3~5 팀 실행 → Phase 6 QA + 게이트 PASS → 배포 URL 보고

**에러 흐름** — 배포 직전 `publish-gate` grep이 커밋 대상에서 `.env`를 발견
→ `privacy-auditor`가 `BLOCKED` 판정 → 오케스트레이터가 push를 중단
→ 사용자에게 "어떤 파일이 왜 위험한지 + 히스토리에 이미 들어갔다면 파일 삭제만으로 부족함"을 보고
→ `web-builder`가 `.gitignore` 수정 → 게이트 재실행 → PASS 후 배포

**부분 재실행 흐름** — "3번 프로젝트 설명만 다시 써줘"
→ Phase 0에서 부분 재실행 판별 → `content-writer`만 호출 → 해당 문장만 수정 → QA 회귀 검사

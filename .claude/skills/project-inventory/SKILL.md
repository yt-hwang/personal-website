---
name: project-inventory
description: 개인 포트폴리오 사이트에 실을 프로젝트를 조사해 표준 카드 데이터(content/projects/{slug}.json)로 만들거나 갱신한다. "프로젝트 조사", "프로젝트 추가", "프로젝트 정보 갱신", "새 프로젝트 넣어줘", "카드 데이터 만들어", "링크 확인해줘", "프로젝트 목록 다시 뽑아" 요청 시 반드시 사용하라. 사실 확인·출처 기록·모르는 것 표시가 핵심이며, 카피 작성(site-copy)이나 화면 구현(site-build)은 이 스킬이 하지 않는다.
---

# project-inventory — 프로젝트 사실 카드 만들기

## 왜 이렇게 하는가
포트폴리오가 무너지는 지점은 디자인이 아니라 **사실이 틀리는 것**이다.
없는 링크, 과장된 역할, 기억으로 쓴 기술 스택은 방문자가 한 번 클릭하면 바로 들킨다.
그래서 모든 값은 파일에서 나오고, 파일 경로를 함께 남긴다.

## 절차

### 1. 대상 폴더 특정
프로젝트 이름만으로 폴더를 짐작하지 말고 데스크톱 트리를 키워드로 검색한다.
같은 프로젝트가 여러 곳(작업 폴더 + 아카이브 폴더 + 옵시디언 노트)에 있으면 전부 `sources[]`에 남긴다.

### 2. 사실 수집 — 이 순서로 읽는다
| 찾는 것 | 어디서 |
|---|---|
| 한 줄 설명 | `README.md` 첫 문단 → `CLAUDE.md` 상단 → 패키지 `description` |
| 기술 스택 | `package.json` deps, `requirements.txt`, `*.csproj`, `pubspec.yaml` |
| 저장소 | `.git/config` 의 `[remote "origin"] url` |
| 커밋 활동 | `git log -1 --format=%cd`, 커밋 수 |
| 배포 URL | `.vercel/project.json`, `vercel.json`, `firebase.json`, `manifest.json` 의 `start_url`, README 뱃지 |
| 에이전트 팀 | `.claude/agents/*.md` 파일 수와 각 파일의 `name`/역할 한 줄 |
| 라이선스 | `LICENSE` |
| 이미지 자산 | `*.png|jpg|svg` 중 로고/배너/아바타 성격의 것 |

### 3. 열지 않는 파일
`.env*`, `*token*`, `*secret*`, `credential*`, `_private/`, 급여·명세·계좌 관련 문서.
**존재한다는 사실만** `sensitive_present[]`에 적는다. 내용은 읽지도 인용하지도 않는다.

### 4. 스키마로 저장 — 공개와 내부를 파일로 분리한다

카드는 두 파일로 나뉜다. 한 파일에 섞으면 내부 메모가 공개 저장소에 그대로 커밋된다.

| 파일 | 내용 | 공개 여부 |
|---|---|---|
| `content/projects/{slug}.json` | slug, order, group, title, tagline, role, status, period, stack, agent_team, highlights, body, links, assets, visibility, featured, updated | 공개 저장소에 커밋됨 |
| `_workspace/notes/{slug}.json` | restrictions, sensitive_present, sources, _source, unknowns | `.gitignore` 대상 |

공개 파일은 **화이트리스트**로 거른다 — 새 필드의 기본값은 비공개다.

아래는 두 파일을 합친 전체 스키마다:

```json
{
  "slug": "fantasy-epl",
  "order": 4,
  "group": "agent-teams",
  "title": { "ko": "", "en": "" },
  "tagline": { "ko": "", "en": "" },
  "role": "",
  "status": "live | active | prototype | planning | archived | not_found",
  "period": { "start": "YYYY-MM", "end": "YYYY-MM | null" },
  "stack": [],
  "agent_team": { "count": 0, "members": [] },
  "highlights": [],
  "links": [{ "label": "", "url": "", "kind": "repo|site|app|doc|video" }],
  "assets": [{ "path": "", "kind": "logo|banner|screenshot|avatar", "cleared": false }],
  "visibility": "public | limited | private",
  "restrictions": [],
  "sources": [],
  "sensitive_present": [],
  "unknowns": [{ "field": "", "why": "" }],
  "_source": { "tagline": "경로", "stack": "경로" },
  "updated": "YYYY-MM-DD"
}
```

**규칙**
- 값의 근거 경로를 `_source`에 남길 수 없으면 그 값을 비우고 `unknowns`에 넣는다. 빈 칸은 실패가 아니라 정직함이다.
- `visibility`는 여기서 잠정 제안만 하고, 확정은 `publish-gate`가 한다.
- `restrictions[]`는 "공개하되 이것만은 빼라"를 적는 자리다. `public`이어도 제한이 있을 수 있다 (예: 회사 프로젝트의 성과 수치).
- `highlights`는 최대 3개, 각각 "무엇을 했다"가 아니라 **"무엇이 가능해졌다"**로 쓴다.
- `assets[].cleared`는 privacy 검수를 통과하기 전까지 항상 `false`다.

### 5. 취합 보고
`_workspace/02_scout_report.md`에 전체 프로젝트의 `unknowns`를 한데 모아
**사용자에게 물어볼 질문 목록**으로 정리한다. 이게 이 스킬의 가장 가치 있는 산출물이다.

## 갱신(재실행) 시
기존 JSON을 읽고 병합한다. `_source`가 `"user"`인 필드는 사람이 직접 채운 값이므로 덮어쓰지 않는다.
`updated` 날짜만 올리고, 바뀐 필드를 보고서에 diff로 남긴다.

## 하지 않는 것
- 문장을 다듬는 일 → `site-copy`
- 공개 등급 확정 → `publish-gate`
- 화면 구현 → `site-build`

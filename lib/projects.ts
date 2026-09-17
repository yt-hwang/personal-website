import fs from "node:fs";
import path from "node:path";

import type {
  AgentTeam,
  Bilingual,
  BilingualList,
  BodyBlocks,
  GroupId,
  Lang,
  Project,
  ProjectLink,
  TeamMember,
} from "./types";

export type { Project, Lang, GroupId, TeamMember, ProjectLink } from "./types";

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

/**
 * 렌더 정책 — 데이터로 표현되지 않는 판정만 여기 둔다.
 * 컴포넌트에는 프로젝트 이름이 한 글자도 들어가지 않는다.
 */

/**
 * _workspace/05_privacy_gate.md 판정표 — "soccer-tactics: 정본 URL 확정 전 링크 보류".
 * 스키마에 '링크 보류' 필드가 없어 렌더 정책으로 둔다.
 * 보류가 풀리면 이 집합에서 slug 를 지우면 끝난다.
 */
const LINK_HOLD = new Set<string>(["soccer-tactics"]);

/**
 * 오케스트레이터 / 게이트키퍼 수동 매핑 (IA 5.3-1, 5.3-2).
 * 비어 있으면 role 문자열의 선두 표기로 자동 판정한다 — 새 프로젝트가 JSON 하나로 추가돼도 동작한다.
 * 자동 판정이 틀리는 팀이 생기면 slug 를 키로 멤버 이름을 적어 덮어쓴다.
 */
const ORCHESTRATOR_OVERRIDE: Record<string, string> = {};
const GATEKEEPER_OVERRIDE: Record<string, string[]> = {};

const ORCHESTRATOR_MARK = "오케스트레이터";
const GATEKEEPER_MARK = "게이트키퍼";
const SOLE_VETO_MARK = "유일하게";

/** IA 5.3-3 — 7인 이상이면 6명까지 노출하고 나머지는 펼침 */
export const TEAM_VISIBLE_LIMIT = 6;

/** 홈 카드 그리드에 쓰는 그룹 순서 (IA 4.3) */
export const GRID_GROUPS: GroupId[] = ["agent-systems", "products"];

/**
 * 그룹 단위 렌더 정책. 앵커·카피 슬롯·카드 밀도를 한 곳에 모은다.
 *
 * `density` 는 **그룹의 내용 무게**에 붙는다 — 프로젝트별 레이아웃이 아니다.
 * 에이전트 시스템은 팀·역할·스택이 다 있어 넓은 판(full)이 필요하고,
 * 앱은 한 줄이면 끝나므로 밀도 높은 목록(compact)이 맞다.
 * 카드 컴포넌트는 여전히 하나이고, 이 값 하나로 조판만 갈린다.
 */
export const GROUP_META: Record<
  GroupId,
  {
    anchor: string;
    titleSlot: string;
    leadSlot: string;
    navSlot: string;
    density: "full" | "compact";
  }
> = {
  "agent-systems": {
    anchor: "systems",
    titleSlot: "SEC3-TITLE",
    leadSlot: "GRP-A",
    navSlot: "NAV-SYSTEMS",
    density: "full",
  },
  products: {
    anchor: "apps",
    titleSlot: "SEC5-TITLE",
    leadSlot: "GRP-B",
    navSlot: "NAV-APPS",
    density: "compact",
  },
  community: {
    anchor: "community",
    titleSlot: "SEC6-TITLE",
    leadSlot: "GRP-C",
    navSlot: "NAV-COMMUNITY",
    density: "full",
  },
};

export function groupMeta(group: GroupId) {
  return GROUP_META[group] ?? GROUP_META.products;
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function strList(v: unknown): string[] {
  return Array.isArray(v) ? v.map(str).filter(Boolean) : [];
}

function bilingual(v: unknown): Bilingual {
  const o = (v ?? {}) as Record<string, unknown>;
  return { ko: str(o.ko), en: str(o.en) };
}

function bilingualList(v: unknown): BilingualList {
  const o = (v ?? {}) as Record<string, unknown>;
  return { ko: strList(o.ko), en: strList(o.en) };
}

function blocks(v: unknown): BodyBlocks {
  const o = (v ?? {}) as Record<string, unknown>;
  return {
    problem: str(o.problem),
    work: str(o.work),
    structure: str(o.structure),
    result: str(o.result),
  };
}

function team(v: unknown): AgentTeam {
  const o = (v ?? {}) as Record<string, unknown>;
  const members = Array.isArray(o.members)
    ? (o.members as Record<string, unknown>[])
        .map((m) => ({ name: bilingual(m?.name), role: bilingual(m?.role) }))
        .filter((m) => m.name.ko.length > 0 || m.name.en.length > 0)
    : [];
  const declared = typeof o.count === "number" ? o.count : members.length;
  return { count: Math.max(declared, members.length), members };
}

function links(v: unknown): ProjectLink[] {
  if (!Array.isArray(v)) return [];
  return (v as Record<string, unknown>[])
    .map((l) => ({
      label: bilingual(l?.label),
      url: str(l?.url),
      kind: str(l?.kind),
    }))
    .filter((l) => l.url.length > 0 && (l.label.ko || l.label.en).length > 0);
}

function normalize(raw: Record<string, unknown>): Project {
  const period = (raw.period ?? {}) as Record<string, unknown>;
  const body = (raw.body ?? {}) as Record<string, unknown>;
  return {
    slug: str(raw.slug),
    order: typeof raw.order === "number" ? raw.order : 999,
    group: (str(raw.group) || "products") as GroupId,
    title: bilingual(raw.title),
    tagline: bilingual(raw.tagline),
    role: bilingual(raw.role),
    status: str(raw.status),
    period: { start: str(period.start) || null, end: str(period.end) || null },
    stack: strList(raw.stack),
    agent_team: team(raw.agent_team),
    highlights: bilingualList(raw.highlights),
    body: { ko: blocks(body.ko), en: blocks(body.en) },
    links: links(raw.links),
    assets: Array.isArray(raw.assets) ? (raw.assets as Project["assets"]) : [],
    visibility: (str(raw.visibility) || "private") as Project["visibility"],
    featured: raw.featured === true,
    updated: str(raw.updated),
  };
}

let cache: Project[] | null = null;

/** 빌드 타임에 content/projects 의 모든 JSON 을 읽어 order 로 정렬한다. */
export function allProjects(): Project[] {
  if (cache) return cache;
  if (!fs.existsSync(PROJECTS_DIR)) {
    cache = [];
    return cache;
  }
  const files = fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();
  cache = files
    .map(
      (f) =>
        JSON.parse(fs.readFileSync(path.join(PROJECTS_DIR, f), "utf8")) as Record<
          string,
          unknown
        >,
    )
    .map(normalize)
    .filter((p) => p.slug.length > 0)
    .sort((a, b) => a.order - b.order);
  return cache;
}

/** visibility private 는 출력에서 제외한다 (IA 5.2.1). */
export function listedProjects(): Project[] {
  return allProjects().filter((p) => p.visibility !== "private");
}

/** featured 카드는 그리드에서 빼고 홈 단독 섹션이 소비한다 (IA 4.3). */
export function gridProjects(): Project[] {
  return listedProjects().filter((p) => !p.featured);
}

export function featuredProjects(): Project[] {
  return listedProjects().filter((p) => p.featured);
}

export function projectsInGroup(group: GroupId): Project[] {
  return gridProjects().filter((p) => p.group === group);
}

/** 상세 페이지 생성 조건 (IA 5.2) */
export function hasDetailPage(p: Project): boolean {
  return (
    p.visibility === "public" &&
    (p.highlights.ko.length >= 2 || p.agent_team.count > 0)
  );
}

export function detailProjects(): Project[] {
  return listedProjects().filter(hasDetailPage);
}

export function findProject(slug: string): Project | undefined {
  return allProjects().find((p) => p.slug === slug);
}

/**
 * 화면에 걸 수 있는 링크.
 * limited 는 등급 정의상 전부 불가 (IA 5.2.1), private 은 애초에 렌더되지 않는다.
 */
export function renderableLinks(p: Project): ProjectLink[] {
  if (p.visibility !== "public") return [];
  if (LINK_HOLD.has(p.slug)) return [];
  return p.links;
}

/** limited 는 스택·팀 배지를 카드에 노출하지 않는다 (IA 5.2.1). */
export function cardShowsMeta(p: Project): boolean {
  return p.visibility === "public";
}

/** 표기가 name 에 오는 팀과 role 에 오는 팀이 섞여 있어 둘 다 본다. */
export function isOrchestrator(slug: string, m: TeamMember): boolean {
  const override = ORCHESTRATOR_OVERRIDE[slug];
  if (override) return m.name.ko === override;
  return (
    m.role.ko.startsWith(ORCHESTRATOR_MARK) ||
    m.name.ko.startsWith(ORCHESTRATOR_MARK)
  );
}

/**
 * 게이트키퍼 = 단독 거부권. 데이터에 "게이트키퍼" 또는 "유일하게 ...할 수 있는" 으로
 * 명시된 역할에만 표식을 붙인다. 추정해서 붙이지 않는다 (IA 5.3-2).
 */
export function isGatekeeper(slug: string, m: TeamMember): boolean {
  const override = GATEKEEPER_OVERRIDE[slug];
  if (override) return override.includes(m.name.ko);
  return (
    m.role.ko.includes(GATEKEEPER_MARK) || m.role.ko.includes(SOLE_VETO_MARK)
  );
}

/** 2층 목록 — 1층 오케스트레이터(없으면 null) + 2층 나머지 (IA 5.3) */
export function splitTeam(p: Project): {
  orchestrator: TeamMember | null;
  specialists: TeamMember[];
} {
  const members = p.agent_team.members;
  const idx = members.findIndex((m) => isOrchestrator(p.slug, m));
  if (idx < 0) return { orchestrator: null, specialists: members };
  return {
    orchestrator: members[idx],
    specialists: members.filter((_, i) => i !== idx),
  };
}

/** 같은 그룹 안에서 상세 페이지가 있는 이전/다음 (IA 5.1 슬롯 9) */
export function neighbors(p: Project): {
  prev: Project | null;
  next: Project | null;
} {
  const siblings = listedProjects().filter(
    (x) => x.group === p.group && hasDetailPage(x),
  );
  const i = siblings.findIndex((x) => x.slug === p.slug);
  if (i < 0) return { prev: null, next: null };
  return {
    prev: i > 0 ? siblings[i - 1] : null,
    next: i < siblings.length - 1 ? siblings[i + 1] : null,
  };
}

/**
 * 빠지면 요소가 망가지는 표기(팀원 이름·역할, 링크 레이블)용.
 * 해당 언어 값이 비면 정본인 ko 로 떨어진다 — 이름 없는 카드나 텍스트 없는 링크를 만들지 않기 위해서다.
 * 두 언어가 모두 채워져 있으면 쓸 일이 없다. 생략해도 되는 문장에는 쓰지 않는다(그건 text()).
 */
export function localized(b: Bilingual, lang: Lang): string {
  return b[lang] || b.ko || b.en || "";
}

export function text(b: Bilingual, lang: Lang): string {
  return b[lang] ?? "";
}

export function list(b: BilingualList, lang: Lang): string[] {
  return b[lang] ?? [];
}

export function bodyOf(p: Project, lang: Lang): BodyBlocks {
  return p.body[lang];
}

/** start 가 없으면 빈 문자열을 돌려 기간 표기를 통째로 생략하게 한다. */
export function periodLabel(p: Project): string {
  const { start, end } = p.period;
  if (!start) return "";
  return end ? start + " – " + end : start + " –";
}

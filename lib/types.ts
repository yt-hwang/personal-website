// content/projects/*.json 의 스키마. 단일 진실 원천은 JSON 파일이며 이 타입은 그 거울이다.

export type Lang = "ko" | "en";
export type Visibility = "public" | "limited" | "private";
export type GroupId = "agent-systems" | "products" | "community";
export type Status = "active" | "live" | "planning" | (string & {});

export interface Bilingual {
  ko: string;
  en: string;
}

export interface BilingualList {
  ko: string[];
  en: string[];
}

export interface BodyBlocks {
  problem: string;
  work: string;
  structure: string;
  result: string;
}

export interface ProjectLink {
  label: Bilingual;
  url: string;
  kind: string;
}

export interface TeamMember {
  name: Bilingual;
  role: Bilingual;
}

export interface AgentTeam {
  count: number;
  members: TeamMember[];
}

export interface ProjectAsset {
  path: string;
  kind: string;
  cleared: boolean;
}

export interface Project {
  slug: string;
  order: number;
  group: GroupId;
  title: Bilingual;
  tagline: Bilingual;
  /**
   * 카드에는 `tagline` 한 문장만 나간다 — 12장이 같은 문장 수여야 그리드가 흔들리지 않는다.
   * 둘째 문장이 필요한 프로젝트는 여기에 두고 **상세 머리에서만** 받는다.
   * 상세 페이지가 없는 limited 카드는 받을 자리가 없으므로 비워 둔다.
   */
  tagline_more: Bilingual;
  role: Bilingual;
  status: Status;
  period: { start: string | null; end: string | null };
  stack: string[];
  agent_team: AgentTeam;
  highlights: BilingualList;
  body: { ko: BodyBlocks; en: BodyBlocks };
  links: ProjectLink[];
  assets: ProjectAsset[];
  visibility: Visibility;
  featured: boolean;
  updated: string;
}

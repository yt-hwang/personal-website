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

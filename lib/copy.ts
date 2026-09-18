import fs from "node:fs";
import path from "node:path";

import type { Lang } from "./types";

/**
 * 사이트 문구(카피)는 코드 밖에 있다. content-writer 산출물을 읽기만 한다.
 *
 * 저장 위치와 형식 (둘 다 지원, 없어도 빌드는 성공한다):
 *   content/copy/{ko,en}/*.json   슬롯ID -> 문자열 | 문자열 배열 인 평면 객체
 *   content/copy/{ko,en}/*.md     "## 슬롯ID" 헤딩으로 구분된 섹션
 *
 * 값이 없거나 [[NEEDS: ...]] 플레이스홀더가 남아 있으면 빈 값으로 취급하고
 * 호출부에서 그 요소를 통째로 렌더하지 않는다 (IA 5.1 — 빈 칸은 미완성으로 읽힌다).
 */

const COPY_DIR = path.join(process.cwd(), "content", "copy");

export type CopyValue = string | string[];
export type CopyMap = Record<string, CopyValue>;

const NEEDS = /\[\[NEEDS[\s\S]*?\]\]/gi;
/** 플레이스홀더를 걷어낸 뒤 남은 꼬리 구분자 (— · - | :) 를 정리한다. */
const DANGLING = /^[\s—·|:-]+|[\s—·|:-]+$/g;

function scrub(raw: string): string {
  return raw.replace(NEEDS, " ").replace(/[ \t]{2,}/g, " ").replace(DANGLING, "").trim();
}

function clean(v: unknown): CopyValue | null {
  if (typeof v === "string") {
    const s = scrub(v);
    return s ? s : null;
  }
  if (Array.isArray(v)) {
    const arr = v
      .map((x) => (typeof x === "string" ? scrub(x) : ""))
      .filter((x) => x.length > 0);
    return arr.length ? arr : null;
  }
  return null;
}

function flatten(obj: Record<string, unknown>, prefix: string, out: CopyMap) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? prefix + "." + k : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      flatten(v as Record<string, unknown>, key, out);
      continue;
    }
    const c = clean(v);
    if (c !== null) out[key] = c;
  }
}

function parseMarkdown(src: string, out: CopyMap) {
  const lines = src.split(/\r?\n/);
  let id: string | null = null;
  let buf: string[] = [];
  const flush = () => {
    if (!id) return;
    const c = clean(buf.join("\n").trim());
    if (c !== null) out[id] = c;
    buf = [];
  };
  for (const line of lines) {
    const m = /^#{2,3}\s+([A-Za-z0-9._-]+)\s*$/.exec(line);
    if (m) {
      flush();
      id = m[1];
      continue;
    }
    if (id) buf.push(line);
  }
  flush();
}

const cache = new Map<Lang, CopyMap>();

export function getCopy(lang: Lang): CopyMap {
  const hit = cache.get(lang);
  if (hit) return hit;
  const out: CopyMap = {};
  const dir = path.join(COPY_DIR, lang);
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir).sort()) {
      const full = path.join(dir, f);
      if (!fs.statSync(full).isFile()) continue;
      const raw = fs.readFileSync(full, "utf8");
      try {
        if (f.endsWith(".json")) {
          flatten(JSON.parse(raw) as Record<string, unknown>, "", out);
        } else if (f.endsWith(".md")) {
          parseMarkdown(raw, out);
        }
      } catch {
        // 카피 파일이 깨져 있어도 사이트 빌드를 막지 않는다. 그 슬롯만 비어 보인다.
      }
    }
  }
  cache.set(lang, out);
  return out;
}

/** 문자열 슬롯. 없으면 빈 문자열 — 호출부가 요소 자체를 생략한다. */
export function t(lang: Lang, id: string): string {
  const v = getCopy(lang)[id];
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.join("\n\n");
  return "";
}

/** 여러 슬롯 ID 후보 중 먼저 채워진 것을 쓴다 — 카피 파일의 명명이 바뀌어도 화면이 비지 않게. */
export function pick(lang: Lang, ...ids: string[]): string {
  for (const id of ids) {
    const v = t(lang, id);
    if (v) return v;
  }
  return "";
}

/** 목록 슬롯. 없으면 빈 배열. */
export function tl(lang: Lang, id: string): string[] {
  const v = getCopy(lang)[id];
  if (Array.isArray(v)) return v;
  if (typeof v === "string") return [v];
  return [];
}

/** 문단 분리 — 빈 줄 기준 */
export function paragraphs(value: string): string[] {
  return value
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * "지금 맡고 있는 역할" 슬롯 묶음 (`ROLE-1-ORG` / `-TITLE` / `-DESC` …).
 *
 * About 페이지가 쓰던 읽기 로직을 여기로 올렸다 — 홈 히어로도 같은 슬롯을 쓰기 때문이다.
 * (2026-09-18: 히어로 왼쪽 아래가 인물 사진 자리 모양으로 비어 있었다. 장식으로 채우지 않고
 *  **이미 있는 카피**인 현재 역할 4개를 그 자리에 넣었다. 채용담당자에게 가장 값이 큰 사실이고,
 *  그때까지 About 에만 있었다.)
 *
 * 역할 개수는 코드에 고정돼 있지 않다. `ROLE-5-*` 가 생기면 그대로 한 줄 더 붙는다.
 * 세 슬롯이 전부 비면 그 항목은 렌더하지 않는다 (닐슨 5 — 빈 칸을 만들지 않는다).
 */
export type RoleEntry = { n: number; org: string; title: string; desc: string };

const MAX_ROLES = 12;

export function roles(lang: Lang, limit = MAX_ROLES): RoleEntry[] {
  const out: RoleEntry[] = [];
  for (let n = 1; n <= MAX_ROLES && out.length < limit; n++) {
    const org = t(lang, "ROLE-" + n + "-ORG");
    const title = t(lang, "ROLE-" + n + "-TITLE");
    const desc = t(lang, "ROLE-" + n + "-DESC");
    if (!org && !title && !desc) continue;
    out.push({ n, org, title, desc });
  }
  return out;
}

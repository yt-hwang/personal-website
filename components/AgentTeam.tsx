import { t } from "@/lib/copy";
import {
  TEAM_VISIBLE_LIMIT,
  isGatekeeper,
  localized,
  splitTeam,
} from "@/lib/projects";
import type { Lang, Project, TeamMember } from "@/lib/types";
import { ordinal, teamBadge, ui } from "@/lib/ui";

import { AgentIcon, ToggleIcon, VetoIcon } from "./Icon";

/**
 * 팀 구성 — 표도 조직도도 아닌 2층 목록 (IA 5.3). 조판만 명부(로스터)로 바꿨다.
 *   1층: 오케스트레이터 1인 — 용어 풀이를 달고 단독 행 (표기가 없는 팀은 1층을 비우고 평면 렌더)
 *   2층: 나머지 전원 — 번호 · 이름 · 역할 세 칸의 명부
 * 관계선·화살표·"보고" 표현은 쓰지 않는다 — 데이터에 관계 정보가 없다.
 */

const LABEL = "font-mono text-[0.6875rem] tracking-[0.14em] uppercase";

function Row({
  m,
  slug,
  lang,
  n,
  lead = false,
}: {
  m: TeamMember;
  slug: string;
  lang: Lang;
  n: number;
  lead?: boolean;
}) {
  const gate = isGatekeeper(slug, m);
  const name = localized(m.name, lang);
  const role = localized(m.role, lang);
  return (
    <li
      className={
        "grid gap-x-6 gap-y-1 border-t py-3 sm:grid-cols-[2.5rem_minmax(0,11rem)_minmax(0,1fr)] " +
        (lead
          ? "border-[var(--rule-strong)] bg-accent-soft px-3 sm:px-3"
          : "border-[var(--rule)]")
      }
    >
      <p className={LABEL + " text-ink-subtle tabular-nums"}>{ordinal(n)}</p>
      <p
        className={
          "font-display text-[0.9375rem] leading-snug font-medium tracking-tight " +
          (lead ? "text-accent-soft-ink" : "text-ink")
        }
      >
        {name}
      </p>
      <div className="min-w-0">
        {role && (
          <p className="text-[0.875rem] leading-relaxed text-ink-muted">
            {role}
          </p>
        )}
        {gate && (
          <p
            className={
              LABEL + " mt-1 inline-flex items-center gap-1.5 text-sig-active"
            }
          >
            <VetoIcon className="size-3.5" />
            {ui(lang, "UI.gatekeeper")}
          </p>
        )}
      </div>
    </li>
  );
}

export function AgentTeamBlock({ p, lang }: { p: Project; lang: Lang }) {
  if (p.agent_team.count <= 0 || p.agent_team.members.length === 0) return null;

  const { orchestrator, specialists } = splitTeam(p);
  const note = t(lang, "TEAM-NOTE");
  const total = p.agent_team.members.length;
  const budget = TEAM_VISIBLE_LIMIT - (orchestrator ? 1 : 0);
  const overflow = total > TEAM_VISIBLE_LIMIT;
  const head = overflow ? specialists.slice(0, budget) : specialists;
  const tail = overflow ? specialists.slice(budget) : [];
  const offset = orchestrator ? 1 : 0;
  const hasGate = p.agent_team.members.some((m) => isGatekeeper(p.slug, m));

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className={LABEL + " text-ink-subtle"}>{ui(lang, "UI.team")}</h2>
        <p className={LABEL + " text-ink-subtle tabular-nums"}>
          {teamBadge(lang, p.agent_team.count)}
        </p>
      </div>

      {/* 구성원이 사람이 아니라 AI 에이전트임을 팀 블록 최상단에 항상 고지한다 (IA 5.3-4). */}
      {note && (
        <p className="flex gap-2.5 border border-[var(--rule)] bg-surface-2 px-3 py-2.5 text-[0.8125rem] leading-relaxed text-ink-muted">
          <span className="mt-0.5 shrink-0 text-ink-subtle">
            <AgentIcon />
          </span>
          {note}
        </p>
      )}

      {orchestrator && (
        <div>
          <p className={LABEL + " text-ink-subtle"}>
            {ui(lang, "UI.orchestrator")}
            <span className="ml-2 font-sans text-[0.8125rem] tracking-normal text-ink-muted normal-case">
              {ui(lang, "UI.glossOrchestrator")}
            </span>
          </p>
          <ul className="mt-2">
            <Row m={orchestrator} slug={p.slug} lang={lang} n={1} lead />
          </ul>
        </div>
      )}

      {head.length > 0 && (
        <ul className="border-b border-[var(--rule)]">
          {head.map((m, i) => (
            <Row
              key={m.name.ko || m.name.en}
              m={m}
              slug={p.slug}
              lang={lang}
              n={i + 1 + offset}
            />
          ))}
        </ul>
      )}

      {tail.length > 0 && (
        <details className="group">
          <summary
            className={
              LABEL +
              " inline-flex items-center gap-2 border border-[var(--rule-strong)] px-3 py-1.5 text-ink-muted hover:border-[var(--accent)] hover:text-accent"
            }
          >
            <span className="group-open:hidden">
              {ui(lang, "UI.teamExpand")} ({tail.length})
            </span>
            <span className="hidden group-open:inline">
              {ui(lang, "UI.teamCollapse")}
            </span>
            <ToggleIcon className="size-3.5 transition-transform group-open:rotate-180" />
          </summary>
          <ul className="mt-2 border-b border-[var(--rule)]">
            {tail.map((m, i) => (
              <Row
                key={m.name.ko || m.name.en}
                m={m}
                slug={p.slug}
                lang={lang}
                n={i + 1 + offset + head.length}
              />
            ))}
          </ul>
        </details>
      )}

      {hasGate && (
        <p
          className={
            "flex items-center gap-2 text-[0.8125rem] text-ink-muted"
          }
        >
          <span className="text-sig-active">
            <VetoIcon className="size-3.5" />
          </span>
          <span className={LABEL + " text-ink-subtle"}>
            {ui(lang, "UI.gatekeeper")}
          </span>
          {ui(lang, "UI.glossGatekeeper")}
        </p>
      )}
    </section>
  );
}

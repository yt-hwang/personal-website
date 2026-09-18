import { t } from "@/lib/copy";
import {
  TEAM_VISIBLE_LIMIT,
  isGatekeeper,
  localized,
  splitTeam,
} from "@/lib/projects";
import type { Lang, Project, TeamMember } from "@/lib/types";
import { ui } from "@/lib/ui";

import { AgentIcon, ToggleIcon, VetoIcon } from "./Icon";

/**
 * 팀 구성 — 표도 조직도도 아닌 2층 명부 (IA 5.3).
 *   1층: 오케스트레이터 1인 — 용어 풀이를 달고 단독 행 (표기가 없는 팀은 1층을 비우고 평면 렌더)
 *   2층: 나머지 전원 — 이름 · 역할 두 칸
 * 관계선·화살표·"보고" 표현은 쓰지 않는다 — 데이터에 관계 정보가 없다.
 *
 * 이전 디자인의 두 가지를 걷어냈다.
 *   - 행마다 붙던 모노 번호(01/02/03) — 순서에 뜻이 없다.
 *   - 오케스트레이터 행의 강조색 배경 — 강조색은 면적으로 쓰지 않는다(레퍼런스 §6).
 *     대신 그 행 위에만 **검정 규칙선**을 그어 한 층 위임을 보인다.
 *
 * 블록의 제목("팀 구성")과 인원수는 상세 페이지의 `Block` 이 왼쪽 열에 그린다.
 * 이 컴포넌트는 안쪽 내용만 돌려준다.
 */

function Row({
  m,
  slug,
  lang,
  lead = false,
}: {
  m: TeamMember;
  slug: string;
  lang: Lang;
  lead?: boolean;
}) {
  const gate = isGatekeeper(slug, m);
  const name = localized(m.name, lang);
  const role = localized(m.role, lang);
  return (
    <li
      className={
        "grid gap-x-8 gap-y-1 border-t py-4 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] " +
        (lead ? "border-ink" : "border-rule")
      }
    >
      <p className="t-sub">{name}</p>
      <div className="min-w-0">
        {role && <p className="measure">{role}</p>}
        {gate && (
          <p className="t-micro mt-2 inline-flex items-center gap-2 text-accent">
            <VetoIcon className="size-3.5" />
            {ui(lang, "UI.gatekeeper")}
          </p>
        )}
      </div>
    </li>
  );
}

export function AgentRoster({ p, lang }: { p: Project; lang: Lang }) {
  if (p.agent_team.count <= 0 || p.agent_team.members.length === 0) return null;

  const { orchestrator, specialists } = splitTeam(p);
  const note = t(lang, "TEAM-NOTE");
  const total = p.agent_team.members.length;
  const budget = TEAM_VISIBLE_LIMIT - (orchestrator ? 1 : 0);
  const overflow = total > TEAM_VISIBLE_LIMIT;
  const head = overflow ? specialists.slice(0, budget) : specialists;
  const tail = overflow ? specialists.slice(budget) : [];
  const hasGate = p.agent_team.members.some((m) => isGatekeeper(p.slug, m));

  return (
    <div className="space-y-8">
      {/* 구성원이 사람이 아니라 AI 에이전트임을 팀 블록 최상단에 항상 고지한다 (IA 5.3-4). */}
      {note && (
        <p className="measure flex gap-3 border-l border-rule pl-5">
          <span className="mt-1 shrink-0 text-ink-soft">
            <AgentIcon />
          </span>
          {note}
        </p>
      )}

      {orchestrator && (
        <div>
          <p className="t-micro text-accent">
            {ui(lang, "UI.orchestrator")}
            <span className="ml-3 font-sans text-[0.875rem] tracking-normal text-ink-soft normal-case">
              {ui(lang, "UI.glossOrchestrator")}
            </span>
          </p>
          <ul className="mt-3">
            <Row m={orchestrator} slug={p.slug} lang={lang} lead />
          </ul>
        </div>
      )}

      {head.length > 0 && (
        <ul className="border-b border-rule">
          {head.map((m) => (
            <Row
              key={m.name.ko || m.name.en}
              m={m}
              slug={p.slug}
              lang={lang}
            />
          ))}
        </ul>
      )}

      {tail.length > 0 && (
        <details className="group">
          <summary className="pill border border-ink text-ink hover:bg-ink hover:text-bg">
            <span className="group-open:hidden">
              {ui(lang, "UI.teamExpand")} ({tail.length})
            </span>
            <span className="hidden group-open:inline">
              {ui(lang, "UI.teamCollapse")}
            </span>
            <ToggleIcon className="size-3.5 transition-transform group-open:rotate-180" />
          </summary>
          <ul className="mt-5 border-b border-rule">
            {tail.map((m) => (
              <Row
                key={m.name.ko || m.name.en}
                m={m}
                slug={p.slug}
                lang={lang}
              />
            ))}
          </ul>
        </details>
      )}

      {hasGate && (
        <p className="measure flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="t-micro inline-flex items-center gap-2 text-accent">
            <VetoIcon className="size-3.5" />
            {ui(lang, "UI.gatekeeper")}
          </span>
          <span>{ui(lang, "UI.glossGatekeeper")}</span>
        </p>
      )}
    </div>
  );
}

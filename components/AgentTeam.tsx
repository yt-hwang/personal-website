import { t } from "@/lib/copy";
import {
  TEAM_VISIBLE_LIMIT,
  isGatekeeper,
  localized,
  splitTeam,
} from "@/lib/projects";
import type { Lang, Project, TeamMember } from "@/lib/types";
import { ui } from "@/lib/ui";

/**
 * 팀 구성 — 표도 조직도도 아닌 2층 목록 (IA 5.3).
 * 1층: 오케스트레이터 1인 단독 행 (표기가 없는 팀은 1층을 비우고 평면 렌더)
 * 2층: 전문가 n인 균등 그리드
 * 관계선·화살표·"보고" 표현은 쓰지 않는다 — 데이터에 관계 정보가 없다.
 */
function Member({
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
    <div
      className={
        "rounded-md border border-[var(--border)] px-3 py-2.5 " +
        (lead ? "bg-accent-weak" : "bg-surface-2")
      }
    >
      <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-text">
        {name}
        {gate && (
          <span className="rounded-sm bg-[var(--badge-planning-bg)] px-1.5 py-px text-[0.625rem] font-medium text-[var(--badge-planning-text)]">
            {ui(lang, "UI.gatekeeper")}
          </span>
        )}
      </p>
      {role && (
        <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-text-muted">
          {role}
        </p>
      )}
    </div>
  );
}

function Grid({
  members,
  slug,
  lang,
}: {
  members: TeamMember[];
  slug: string;
  lang: Lang;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((m) => (
        <Member key={m.name.ko || m.name.en} m={m} slug={slug} lang={lang} />
      ))}
    </div>
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

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold tracking-wide text-text-subtle uppercase">
        {ui(lang, "UI.team")}
      </h2>

      {note && (
        <p className="rounded-md border border-[var(--border)] bg-surface-2 px-3 py-2 text-[0.8125rem] leading-relaxed text-text-muted">
          {note}
        </p>
      )}

      {orchestrator && (
        <Member m={orchestrator} slug={p.slug} lang={lang} lead />
      )}

      {head.length > 0 && <Grid members={head} slug={p.slug} lang={lang} />}

      {tail.length > 0 && (
        <details className="group">
          <summary className="inline-flex items-center rounded-md border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-accent hover:bg-surface-2">
            <span className="group-open:hidden">
              {ui(lang, "UI.teamExpand")} ({tail.length})
            </span>
            <span className="hidden group-open:inline">
              {ui(lang, "UI.teamCollapse")}
            </span>
          </summary>
          <div className="mt-2">
            <Grid members={tail} slug={p.slug} lang={lang} />
          </div>
        </details>
      )}
    </section>
  );
}

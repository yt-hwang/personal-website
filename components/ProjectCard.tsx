import Link from "next/link";

import { t } from "@/lib/copy";
import {
  cardShowsMeta,
  groupMeta,
  hasDetailPage,
  periodLabel,
  renderableLinks,
  text,
} from "@/lib/projects";
import { href } from "@/lib/routes";
import type { Lang, Project } from "@/lib/types";
import { ordinal, ui } from "@/lib/ui";

import { GroupMark, LimitedMark, StackList, StatusMark, TeamMark } from "./Badges";
import { ExternalLinks } from "./ExternalLinks";
import { GoLink } from "./Links";

/**
 * 프로젝트 카드는 **한 종류**다. 프로젝트마다 다른 레이아웃을 만들지 않는다.
 * 갈리는 것은 그룹의 밀도(`GROUP_META[].density`) 하나뿐이다 —
 * 팀·역할·스택이 다 있는 에이전트 시스템은 넓은 판(full),
 * 한 줄이면 끝나는 앱은 밀도 높은 목록(compact)으로 같은 데이터를 조판만 달리 싣는다.
 *
 * 카드만 보고도 "무엇이고 어느 그룹인가"를 알 수 있어야 한다(닐슨 6) —
 * 그룹 라벨·상태·역할이 제목과 함께 항상 붙어 있다.
 * 데이터가 없는 필드는 요소 자체를 렌더하지 않는다(닐슨 5).
 */

function MetaLine({
  p,
  lang,
  groupLabel,
}: {
  p: Project;
  lang: Lang;
  groupLabel: string;
}) {
  const meta = cardShowsMeta(p);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <GroupMark label={groupLabel} />
      <StatusMark lang={lang} status={p.status} />
      {meta && <TeamMark lang={lang} count={p.agent_team.count} />}
      {p.visibility === "limited" && <LimitedMark lang={lang} />}
    </div>
  );
}

function Title({ p, lang, className }: { p: Project; lang: Lang; className: string }) {
  const title = text(p.title, lang);
  if (!title) return null;
  // limited 카드는 <a> 로 만들지 않는다 — 커서만 바뀌고 아무 일도 안 일어나면 버그로 읽힌다.
  return (
    <h3 className={className}>
      {hasDetailPage(p) ? (
        <Link
          href={href(lang, "/projects/" + p.slug)}
          className="underline decoration-transparent decoration-from-font underline-offset-4 hover:text-accent hover:decoration-[var(--accent)]"
        >
          {title}
        </Link>
      ) : (
        title
      )}
    </h3>
  );
}

function FullRow({
  p,
  lang,
  index,
  groupLabel,
}: {
  p: Project;
  lang: Lang;
  index: number;
  groupLabel: string;
}) {
  const tagline = text(p.tagline, lang);
  const role = text(p.role, lang);
  const meta = cardShowsMeta(p);
  const links = renderableLinks(p);
  const period = periodLabel(p);

  return (
    <article className="grid gap-x-8 gap-y-3 border-t border-[var(--rule)] py-7 sm:grid-cols-[4.5rem_minmax(0,1fr)]">
      <div className="flex items-baseline gap-3 sm:block">
        <p className="font-mono text-[1.375rem] leading-none text-ink-subtle tabular-nums">
          {ordinal(index)}
        </p>
        {period && (
          <p className="font-mono text-[0.6875rem] text-ink-subtle tabular-nums sm:mt-2">
            {period}
          </p>
        )}
      </div>

      <div className="min-w-0">
        <MetaLine p={p} lang={lang} groupLabel={groupLabel} />

        <Title
          p={p}
          lang={lang}
          className="mt-2 font-display text-xl leading-snug font-medium tracking-tight text-ink sm:text-2xl"
        />

        {/* 무엇을 만들었나만큼 어떤 위치였나가 중요하다. 역할을 제목 바로 아래 둔다. */}
        {meta && role && (
          <p className="mt-1.5 font-mono text-[0.8125rem] tracking-[0.04em] text-accent">
            {role}
          </p>
        )}

        {tagline && (
          <p className="mt-3 max-w-2xl leading-relaxed text-ink-muted">
            {tagline}
          </p>
        )}

        {meta && p.stack.length > 0 && (
          <div className="mt-4">
            <StackList stack={p.stack} max={4} />
          </div>
        )}

        {(hasDetailPage(p) || links.length > 0) && (
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8125rem]">
            {hasDetailPage(p) && (
              <GoLink href={href(lang, "/projects/" + p.slug)}>
                {ui(lang, "UI.detail")}
              </GoLink>
            )}
            <ExternalLinks links={links} lang={lang} />
          </div>
        )}
      </div>
    </article>
  );
}

function CompactRow({
  p,
  lang,
  index,
  groupLabel,
}: {
  p: Project;
  lang: Lang;
  index: number;
  groupLabel: string;
}) {
  const tagline = text(p.tagline, lang);
  const role = text(p.role, lang);
  const meta = cardShowsMeta(p);
  const links = renderableLinks(p);

  return (
    <article className="grid gap-x-8 gap-y-1.5 border-t border-[var(--rule)] py-4 sm:grid-cols-[4.5rem_minmax(0,1fr)]">
      <p className="font-mono text-[0.875rem] leading-6 text-ink-subtle tabular-nums">
        {ordinal(index)}
      </p>

      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <Title
            p={p}
            lang={lang}
            className="font-display text-base leading-snug font-medium tracking-tight text-ink"
          />
          <MetaLine p={p} lang={lang} groupLabel={groupLabel} />
        </div>

        {tagline && (
          <p className="mt-1 max-w-2xl text-[0.875rem] leading-relaxed text-ink-muted">
            {tagline}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[0.8125rem]">
          {meta && role && (
            <span className="font-mono text-[0.6875rem] tracking-[0.04em] text-accent">
              {role}
            </span>
          )}
          {meta && p.stack.length > 0 && <StackList stack={p.stack} max={3} />}
          {hasDetailPage(p) && (
            <GoLink href={href(lang, "/projects/" + p.slug)}>
              {ui(lang, "UI.detail")}
            </GoLink>
          )}
          <ExternalLinks links={links} lang={lang} />
        </div>
      </div>
    </article>
  );
}

export function ProjectCard({
  p,
  lang,
  index,
}: {
  p: Project;
  lang: Lang;
  index: number;
}) {
  if (!text(p.title, lang)) return null;
  const g = groupMeta(p.group);
  const groupLabel = t(lang, g.navSlot);
  const props = { p, lang, index, groupLabel };
  return g.density === "compact" ? (
    <CompactRow {...props} />
  ) : (
    <FullRow {...props} />
  );
}

/** 목록은 대칭 그리드가 아니라 규칙선으로 나뉜 한 줄짜리 항목들이다. */
export function ProjectList({ items, lang }: { items: Project[]; lang: Lang }) {
  if (!items.length) return null;
  return (
    <ul>
      {items.map((p, i) => (
        <li key={p.slug}>
          <ProjectCard p={p} lang={lang} index={i + 1} />
        </li>
      ))}
    </ul>
  );
}

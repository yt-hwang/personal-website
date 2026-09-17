import Link from "next/link";

import {
  cardShowsMeta,
  hasDetailPage,
  renderableLinks,
  text,
} from "@/lib/projects";
import { href } from "@/lib/routes";
import type { Lang, Project } from "@/lib/types";
import { ui } from "@/lib/ui";

import { LimitedBadge, StackChips, StatusBadge, TeamBadge } from "./Badges";
import { ExternalLinks } from "./ExternalLinks";

/**
 * 프로젝트 카드는 한 종류다. 데이터의 유무로 요소가 나타나고 사라질 뿐,
 * 프로젝트마다 다른 레이아웃을 만들지 않는다.
 */
export function ProjectCard({ p, lang }: { p: Project; lang: Lang }) {
  const title = text(p.title, lang);
  const tagline = text(p.tagline, lang);
  const detail = hasDetailPage(p);
  const meta = cardShowsMeta(p);
  const links = renderableLinks(p);
  const limited = p.visibility === "limited";

  if (!title) return null;

  return (
    <article className="flex h-full w-full flex-col gap-3 rounded-lg border border-[var(--border)] bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge lang={lang} status={p.status} />
        {meta && <TeamBadge lang={lang} count={p.agent_team.count} />}
        {limited && <LimitedBadge lang={lang} />}
      </div>

      <h3 className="text-base font-semibold tracking-tight text-text sm:text-lg">
        {detail ? (
          <Link
            href={href(lang, "/projects/" + p.slug)}
            className="underline-offset-4 hover:text-accent hover:underline"
          >
            {title}
          </Link>
        ) : (
          title
        )}
      </h3>

      {tagline && (
        <p className="text-sm leading-relaxed text-text-muted">{tagline}</p>
      )}

      {meta && <StackChips stack={p.stack} max={3} />}

      {(detail || links.length > 0) && (
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-sm">
          {detail && (
            <Link
              href={href(lang, "/projects/" + p.slug)}
              className="font-medium text-accent underline-offset-4 hover:underline"
            >
              {ui(lang, "UI.detail")}
              <span aria-hidden="true"> →</span>
            </Link>
          )}
          <ExternalLinks links={links} lang={lang} />
        </div>
      )}
    </article>
  );
}

export function ProjectGrid({ items, lang }: { items: Project[]; lang: Lang }) {
  if (!items.length) return null;
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {items.map((p) => (
        <li key={p.slug} className="flex">
          <ProjectCard p={p} lang={lang} />
        </li>
      ))}
    </ul>
  );
}

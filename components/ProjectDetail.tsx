import Link from "next/link";

import { paragraphs, t } from "@/lib/copy";
import {
  bodyOf,
  groupMeta,
  list,
  neighbors,
  periodLabel,
  renderableLinks,
  text,
} from "@/lib/projects";
import { href } from "@/lib/routes";
import type { Lang, Project } from "@/lib/types";
import { ordinal, ui } from "@/lib/ui";

import { GroupMark, StackList, StatusMark } from "./Badges";
import { AgentTeamBlock } from "./AgentTeam";
import { ExternalLinks } from "./ExternalLinks";
import { BackIcon, ForwardIcon } from "./Icon";
import { BackLink } from "./Links";

/** 상세 페이지 고정 슬롯 (IA 5.1). 데이터가 없는 슬롯은 자리를 비우지 않고 섹션째 생략한다. */

const LABEL = "font-mono text-[0.6875rem] tracking-[0.14em] uppercase";

function Block({
  n,
  heading,
  children,
}: {
  n?: number;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-x-8 gap-y-3 border-t border-[var(--rule)] pt-5 sm:grid-cols-[4.5rem_minmax(0,1fr)]">
      <div>
        {n !== undefined && (
          <p className={LABEL + " text-ink-subtle tabular-nums"}>
            {ordinal(n)}
          </p>
        )}
        <h2 className={LABEL + " mt-1 text-ink-subtle"}>{heading}</h2>
      </div>
      <div className="min-w-0 space-y-3">{children}</div>
    </section>
  );
}

function Prose({ value }: { value: string }) {
  return (
    <>
      {paragraphs(value).map((para, i) => (
        <p key={i} className="max-w-2xl leading-relaxed text-ink-muted">
          {para}
        </p>
      ))}
    </>
  );
}

export function ProjectDetail({ p, lang }: { p: Project; lang: Lang }) {
  const title = text(p.title, lang);
  const tagline = text(p.tagline, lang);
  const role = text(p.role, lang);
  const period = periodLabel(p);
  const body = bodyOf(p, lang);
  const highlights = list(p.highlights, lang).slice(0, 3);
  const links = renderableLinks(p);
  const disclosure = t(lang, "PRIVACY-NOTE-" + p.slug);
  const g = groupMeta(p.group);
  const groupLabel = t(lang, g.navSlot);
  const { prev, next } = neighbors(p);

  const bodyBlocks = [
    { key: "problem", label: ui(lang, "UI.bodyProblem"), value: body.problem },
    { key: "work", label: ui(lang, "UI.bodyWork"), value: body.work },
    {
      key: "structure",
      label: ui(lang, "UI.bodyStructure"),
      value: body.structure,
    },
    { key: "result", label: ui(lang, "UI.bodyResult"), value: body.result },
  ].filter((b) => b.value);

  return (
    <article className="pt-6 pb-4 sm:pt-8">
      {/* 온 곳으로 돌아가는 길을 페이지 맨 위에 둔다 (닐슨 3 — 사용자 통제와 자유) */}
      <BackLink href={href(lang, "/") + "#" + g.anchor}>
        {ui(lang, "UI.back")}
        {groupLabel ? " · " + groupLabel : ""}
      </BackLink>

      <header className="mt-6 border-t-2 border-[var(--rule-strong)] pt-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <GroupMark label={groupLabel} />
          <StatusMark lang={lang} status={p.status} />
          {period && (
            <span className={LABEL + " text-ink-subtle tabular-nums"}>
              {period}
            </span>
          )}
        </div>

        {title && (
          <h1 className="mt-3 max-w-3xl font-display text-[1.75rem] leading-tight font-medium tracking-tight text-ink sm:text-4xl">
            {title}
          </h1>
        )}

        {tagline && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            {tagline}
          </p>
        )}

        {role && (
          <dl className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <dt className={LABEL + " text-ink-subtle"}>
              {ui(lang, "UI.role")}
            </dt>
            <dd className="font-mono text-[0.875rem] tracking-[0.04em] text-accent">
              {role}
            </dd>
          </dl>
        )}
      </header>

      <div className="mt-12 space-y-10">
        {/* 3 본문 4블록 */}
        {bodyBlocks.map((b, i) => (
          <Block key={b.key} n={i + 1} heading={b.label}>
            <Prose value={b.value} />
          </Block>
        ))}

        {/* 4 팀 구성 */}
        <AgentTeamBlock p={p} lang={lang} />

        {/* 5 스택 */}
        {p.stack.length > 0 && (
          <Block heading={ui(lang, "UI.stack")}>
            <StackList stack={p.stack} />
          </Block>
        )}

        {/* 6 하이라이트 */}
        {highlights.length > 0 && (
          <Block heading={ui(lang, "UI.highlights")}>
            <ul className="space-y-2">
              {highlights.map((h) => (
                <li
                  key={h}
                  className="max-w-2xl border-l-2 border-[var(--rule-strong)] pl-4 leading-relaxed text-ink-muted"
                >
                  {h}
                </li>
              ))}
            </ul>
          </Block>
        )}

        {/* 7 링크 */}
        {links.length > 0 && (
          <Block heading={ui(lang, "UI.links")}>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-[0.875rem]">
              <ExternalLinks links={links} lang={lang} />
            </div>
          </Block>
        )}

        {/* 8 공개 범위 고지 */}
        {disclosure && (
          <Block heading={ui(lang, "UI.disclosure")}>
            <Prose value={disclosure} />
          </Block>
        )}
      </div>

      {/* 9 이웃 이동 */}
      {(prev || next) && (
        <nav className="mt-16 grid gap-3 border-t-2 border-[var(--rule-strong)] pt-5 sm:grid-cols-2">
          {prev ? (
            <Link
              href={href(lang, "/projects/" + prev.slug)}
              className="group flex items-start gap-3 border border-[var(--rule)] px-4 py-3 hover:border-[var(--accent)]"
            >
              <span className="mt-1 text-ink-subtle group-hover:text-accent">
                <BackIcon />
              </span>
              <span className="min-w-0">
                <span className={LABEL + " block text-ink-subtle"}>
                  {ui(lang, "UI.prev")}
                </span>
                <span className="mt-0.5 block font-display text-[0.9375rem] font-medium tracking-tight text-ink group-hover:text-accent">
                  {text(prev.title, lang)}
                </span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={href(lang, "/projects/" + next.slug)}
              className="group flex items-start justify-end gap-3 border border-[var(--rule)] px-4 py-3 text-right hover:border-[var(--accent)] sm:col-start-2"
            >
              <span className="min-w-0">
                <span className={LABEL + " block text-ink-subtle"}>
                  {ui(lang, "UI.next")}
                </span>
                <span className="mt-0.5 block font-display text-[0.9375rem] font-medium tracking-tight text-ink group-hover:text-accent">
                  {text(next.title, lang)}
                </span>
              </span>
              <span className="mt-1 text-ink-subtle group-hover:text-accent">
                <ForwardIcon />
              </span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}

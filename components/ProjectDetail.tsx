import Link from "next/link";

import { paragraphs, t } from "@/lib/copy";
import {
  bodyOf,
  list,
  neighbors,
  periodLabel,
  renderableLinks,
  text,
} from "@/lib/projects";
import { href } from "@/lib/routes";
import type { Lang, Project } from "@/lib/types";
import { ui } from "@/lib/ui";

import { AgentTeamBlock } from "./AgentTeam";
import { StackChips, StatusBadge } from "./Badges";
import { ExternalLinks } from "./ExternalLinks";

/** 상세 페이지 고정 슬롯 (IA 5.1). 데이터가 없는 슬롯은 자리를 비우지 않고 섹션째 생략한다. */

function Block({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold tracking-wide text-text-subtle uppercase">
        {heading}
      </h2>
      {children}
    </section>
  );
}

function Prose({ value }: { value: string }) {
  return (
    <>
      {paragraphs(value).map((para, i) => (
        <p key={i} className="text-[0.9375rem] leading-relaxed text-text-muted">
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
  const groupLabel = t(lang, "SECTION." + p.group);
  const { prev, next } = neighbors(p);

  const bodyBlocks = [
    { key: "problem", label: ui(lang, "UI.bodyProblem"), value: body.problem },
    { key: "work", label: ui(lang, "UI.bodyWork"), value: body.work },
    { key: "structure", label: ui(lang, "UI.bodyStructure"), value: body.structure },
    { key: "result", label: ui(lang, "UI.bodyResult"), value: body.result },
  ].filter((b) => b.value);

  return (
    <article className="py-10 sm:py-14">
      {/* 1 헤더 */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge lang={lang} status={p.status} />
          {groupLabel && (
            <span className="text-[0.75rem] text-text-subtle">{groupLabel}</span>
          )}
        </div>
        {title && (
          <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            {title}
          </h1>
        )}
        {/* 2 한 줄 정의 */}
        {tagline && (
          <p className="max-w-2xl text-base leading-relaxed text-text-muted">
            {tagline}
          </p>
        )}
        {(role || period) && (
          <dl className="flex flex-wrap gap-x-6 gap-y-1 text-[0.8125rem] text-text-subtle">
            {role && (
              <div className="flex gap-2">
                <dt>{ui(lang, "UI.role")}</dt>
                <dd className="text-text-muted">{role}</dd>
              </div>
            )}
            {period && (
              <div className="flex gap-2">
                <dt>{ui(lang, "UI.period")}</dt>
                <dd className="text-text-muted tabular-nums">{period}</dd>
              </div>
            )}
          </dl>
        )}
      </header>

      <div className="mt-10 space-y-10">
        {/* 3 본문 4블록 */}
        {bodyBlocks.map((b) => (
          <Block key={b.key} heading={b.label}>
            <Prose value={b.value} />
          </Block>
        ))}

        {/* 4 팀 구성 */}
        <AgentTeamBlock p={p} lang={lang} />

        {/* 5 스택 */}
        {p.stack.length > 0 && (
          <Block heading={ui(lang, "UI.stack")}>
            <StackChips stack={p.stack} max={0} />
          </Block>
        )}

        {/* 6 하이라이트 */}
        {highlights.length > 0 && (
          <Block heading={ui(lang, "UI.highlights")}>
            <ul className="space-y-2">
              {highlights.map((h) => (
                <li
                  key={h}
                  className="border-l-2 border-[var(--border-strong)] pl-3 text-[0.9375rem] leading-relaxed text-text-muted"
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
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
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
        <nav className="mt-14 flex flex-wrap justify-between gap-4 border-t border-[var(--border)] pt-6 text-sm">
          {prev ? (
            <Link
              href={href(lang, "/projects/" + prev.slug)}
              className="text-accent underline-offset-4 hover:underline"
            >
              <span aria-hidden="true">← </span>
              {ui(lang, "UI.prev")} · {text(prev.title, lang)}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={href(lang, "/projects/" + next.slug)}
              className="text-accent underline-offset-4 hover:underline"
            >
              {ui(lang, "UI.next")} · {text(next.title, lang)}
              <span aria-hidden="true"> →</span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}

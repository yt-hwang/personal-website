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
import { teamBadge, ui } from "@/lib/ui";

import { GroupMark, MetaLine, stackLabel, statusLabel, teamLabel } from "./Badges";
import { AgentRoster } from "./AgentTeam";
import { ExternalLinks } from "./ExternalLinks";
import { BackIcon, ForwardIcon } from "./Icon";
import { BackLink } from "./Links";

/**
 * 상세 페이지 고정 슬롯 (IA 5.1). 데이터가 없는 슬롯은 자리를 비우지 않고 섹션째 생략한다.
 *
 * 조판은 홈과 같은 언어다 — 얇은 규칙선 하나로 블록을 끊고,
 * **왼쪽 좁은 열에 라벨 / 오른쪽 넓은 열에 본문**의 비대칭을 반복한다(레퍼런스 §5).
 * 번호 거터를 걷어냈다. 블록의 정체는 번호가 아니라 라벨이 말한다.
 */

/** 라벨 | 본문 두 칸. 상세 페이지의 모든 블록이 이 한 가지 모양을 쓴다(닐슨 4). */
function Block({
  heading,
  aside,
  children,
}: {
  heading: string;
  aside?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bay border-t border-rule pt-8 pb-[clamp(2.5rem,7vh,4.5rem)]">
      <div className="lg:col-span-3">
        <h2 className="t-micro text-accent">{heading}</h2>
        {aside && <p className="t-meta mt-2 text-ink-soft">{aside}</p>}
      </div>
      <div className="lg:col-span-8 lg:col-start-5">{children}</div>
    </section>
  );
}

function Prose({ value }: { value: string }) {
  return (
    <>
      {paragraphs(value).map((para, i) => (
        <p key={i} className={"measure" + (i > 0 ? " mt-5" : "")}>
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
  const body = bodyOf(p, lang);
  const highlights = list(p.highlights, lang).slice(0, 3);
  const links = renderableLinks(p);
  const disclosure = t(lang, "PRIVACY-NOTE-" + p.slug);
  const g = groupMeta(p.group);
  const groupLabel = t(lang, g.navSlot);
  const { prev, next } = neighbors(p);
  const hasTeam = p.agent_team.count > 0 && p.agent_team.members.length > 0;

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
    <article className="pt-[clamp(2rem,6vh,3.5rem)]">
      {/* 온 곳으로 돌아가는 길을 페이지 맨 위에 둔다 (닐슨 3 — 사용자 통제와 자유) */}
      <BackLink href={href(lang, "/") + "#" + g.anchor}>
        {ui(lang, "UI.back")}
        {groupLabel ? " · " + groupLabel : ""}
      </BackLink>

      <header className="mt-[clamp(3rem,10vh,7rem)]">
        <GroupMark label={groupLabel} />
        {title && <h1 className="t-display measure-display mt-5">{title}</h1>}

        <div className="bay mt-[clamp(2rem,6vh,3.5rem)]">
          <div className="lg:col-span-7 lg:col-start-6">
            {tagline && <p className="t-lead">{tagline}</p>}
            {role && <p className="t-meta mt-5 text-ink">{role}</p>}
            <MetaLine
              items={[
                statusLabel(lang, p.status),
                periodLabel(p),
                teamLabel(lang, p.agent_team.count),
              ]}
              className="mt-2"
            />
          </div>
        </div>
      </header>

      <div className="mt-[clamp(4rem,13vh,9rem)]">
        {/* 3 본문 4블록 */}
        {bodyBlocks.map((b) => (
          <Block key={b.key} heading={b.label}>
            <Prose value={b.value} />
          </Block>
        ))}

        {/* 4 팀 구성 */}
        {hasTeam && (
          <Block
            heading={ui(lang, "UI.team")}
            aside={teamBadge(lang, p.agent_team.count)}
          >
            <AgentRoster p={p} lang={lang} />
          </Block>
        )}

        {/* 5 스택 */}
        {p.stack.length > 0 && (
          <Block heading={ui(lang, "UI.stack")}>
            <p className="t-meta measure text-ink">{stackLabel(p.stack)}</p>
          </Block>
        )}

        {/* 6 하이라이트 */}
        {highlights.length > 0 && (
          <Block heading={ui(lang, "UI.highlights")}>
            <ul className="space-y-4">
              {highlights.map((h) => (
                <li key={h} className="measure border-l border-rule pl-5">
                  {h}
                </li>
              ))}
            </ul>
          </Block>
        )}

        {/* 7 링크 */}
        {links.length > 0 && (
          <Block heading={ui(lang, "UI.links")}>
            <div className="flex flex-wrap gap-x-7 gap-y-3">
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

      {/* 9 이웃 이동 — 상자를 만들지 않는다. 규칙선 하나 위에 좌우로 갈라 놓는다. */}
      {(prev || next) && (
        <nav className="mt-[clamp(3rem,9vh,6rem)] grid gap-8 border-t border-rule pt-8 sm:grid-cols-2">
          {prev ? (
            <Link
              href={href(lang, "/projects/" + prev.slug)}
              className="group flex items-start gap-3 text-ink hover:text-accent"
            >
              <span className="mt-2 shrink-0 text-accent">
                <BackIcon />
              </span>
              <span className="min-w-0">
                <span className="t-micro block text-ink-soft">
                  {ui(lang, "UI.prev")}
                </span>
                <span className="t-sub mt-1 block">{text(prev.title, lang)}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={href(lang, "/projects/" + next.slug)}
              className="group flex items-start justify-end gap-3 text-right text-ink hover:text-accent sm:col-start-2"
            >
              <span className="min-w-0">
                <span className="t-micro block text-ink-soft">
                  {ui(lang, "UI.next")}
                </span>
                <span className="t-sub mt-1 block">{text(next.title, lang)}</span>
              </span>
              <span className="mt-2 shrink-0 text-accent">
                <ForwardIcon />
              </span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}

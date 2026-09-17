import { paragraphs, pick, t } from "@/lib/copy";
import {
  GRID_GROUPS,
  featuredProjects,
  groupMeta,
  hasDetailPage,
  list,
  periodLabel,
  projectsInGroup,
  renderableLinks,
  text,
} from "@/lib/projects";
import { href } from "@/lib/routes";
import type { GroupId, Lang, Project } from "@/lib/types";
import { ordinal, ui } from "@/lib/ui";

import { GroupMark, StatusMark } from "./Badges";
import { ExternalLinks } from "./ExternalLinks";
import { ContactChannels } from "./ContactChannels";
import { GhostAction, GoLink, OutLink, PrimaryAction } from "./Links";
import { ProjectList } from "./ProjectCard";

/**
 * 홈 — 기술 문서(dossier) 조판.
 * 대칭 카드 그리드를 쓰지 않는다. 섹션 번호(모노) + 가는 규칙선 + 여백으로 위계를 만들고,
 * 내용의 무게에 따라 항목의 형태를 달리한다(에이전트 시스템은 넓게, 앱은 밀도 높은 목록으로).
 *
 * 섹션 헤더는 sticky 라 스크롤 중에도 현재 섹션 번호·제목이 화면에 남는다 (닐슨 1).
 */

const HEADING_LABEL =
  "font-mono text-[0.75rem] tracking-[0.16em] tabular-nums uppercase";

function Section({
  id,
  index,
  heading,
  lead,
  children,
}: {
  id: string;
  index: number;
  heading: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      data-section="true"
      className="scroll-mt-[var(--header-h)] pt-14 sm:pt-20"
    >
      <div className="sticky top-[var(--header-h)] z-20 -mx-4 bg-bg px-4 sm:-mx-6 sm:px-6">
        <div className="flex items-baseline gap-4 pt-2 pb-2.5">
          <span
            data-section-marker="true"
            className={HEADING_LABEL + " text-ink-subtle"}
          >
            {ordinal(index)}
          </span>
          {heading && (
            <h2 className="font-display text-lg leading-snug font-medium tracking-tight text-ink sm:text-xl">
              {heading}
            </h2>
          )}
        </div>
        <div
          data-section-rule="true"
          className="h-0.5 bg-[var(--rule-strong)]"
        />
      </div>

      {lead && (
        <p className="mt-6 max-w-2xl leading-relaxed text-ink-muted">{lead}</p>
      )}
      {children && <div className="mt-8">{children}</div>}
    </section>
  );
}

/** 처음 나오는 내부 용어에는 한 줄 설명을 붙인다 (닐슨 2 — 현실 세계와의 일치). */
function Gloss({ lang, body }: { lang: Lang; body: string }) {
  if (!body) return null;
  return (
    <p className="mt-5 max-w-2xl border-l-2 border-[var(--rule-strong)] pl-4 text-[0.8125rem] leading-relaxed text-ink-muted">
      <span className="mr-2 font-mono text-[0.6875rem] tracking-[0.14em] text-ink-subtle uppercase">
        {ui(lang, "UI.terms")}
      </span>
      {body}
    </p>
  );
}

/**
 * 증명 항목은 카피가 "값 · 라벨" 한 줄로 온다 ("6 · 에이전트 시스템").
 * 분리자가 없으면 전체를 라벨로 쓴다. 코드가 숫자를 지어내지 않는다.
 */
function splitProof(raw: string): { value: string; label: string } {
  const i = raw.indexOf("·");
  if (i < 0) return { value: "", label: raw };
  return { value: raw.slice(0, i).trim(), label: raw.slice(i + 1).trim() };
}

function Ledger({ lang }: { lang: Lang }) {
  const items = [1, 2, 3, 4]
    .map((n) => {
      const id = "PROOF-" + n;
      const value = t(lang, id + ".value");
      const label = t(lang, id + ".label");
      if (value || label) return { key: id, value, label };
      return { key: id, ...splitProof(t(lang, id)) };
    })
    .filter((i) => i.value || i.label);

  if (!items.length) return null;

  return (
    <ul className="grid grid-cols-2 border-t-2 border-[var(--rule-strong)] sm:grid-cols-4">
      {items.map((i, n) => (
        <li
          key={i.key}
          className={
            "border-b border-[var(--rule)] py-4 sm:border-b-0 " +
            (n % 2 === 1 ? "pl-4 " : "pr-4 ") +
            "sm:border-r sm:border-[var(--rule)] sm:px-4 sm:first:pl-0 sm:last:border-r-0"
          }
        >
          {i.value && (
            <p className="font-display text-2xl leading-none tracking-tight text-ink tabular-nums sm:text-3xl">
              {i.value}
            </p>
          )}
          {i.label && (
            <p className="mt-2 font-mono text-[0.6875rem] leading-snug tracking-[0.1em] text-ink-subtle uppercase">
              {i.label}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

/** 첫 화면 — 스크롤 없이 "이 사이트가 무엇인지"가 끝난다 (닐슨 10). */
function Masthead({ lang }: { lang: Lang }) {
  const h1 = t(lang, "HERO-1");
  const sub = t(lang, "HERO-2");
  const cta1 = t(lang, "HERO-CTA-1");
  const cta2 = t(lang, "HERO-CTA-2");

  return (
    <section className="stagger pt-10 pb-4 sm:pt-16">
      {h1 && (
        <h1 className="max-w-3xl font-display text-[2rem] leading-[1.25] font-medium tracking-tight text-ink sm:text-5xl">
          {h1}
        </h1>
      )}
      {sub && (
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
          {sub}
        </p>
      )}
      {(cta1 || cta2) && (
        <div className="mt-8 flex flex-wrap gap-3">
          {cta1 && <PrimaryAction href="#systems">{cta1}</PrimaryAction>}
          {cta2 && <GhostAction href="#contact">{cta2}</GhostAction>}
        </div>
      )}
      <div className="mt-10 sm:mt-12">
        <Ledger lang={lang} />
      </div>
    </section>
  );
}

function withProtocol(url: string): string {
  return /^https?:\/\//i.test(url) ? url : "https://" + url;
}

/**
 * 링크 카피는 "레이블 · 주소" 한 줄로 온다 ("소스 보기 · github.com/yt-hwang/personal-website").
 * 주소 부분이 없으면 링크를 만들지 않는다 — 빈 <a href=""> 를 만들지 않기 위해.
 */
function splitLink(
  single: string,
  label: string,
  url: string,
): { label: string; url: string } {
  if (label && url) return { label, url: withProtocol(url) };
  if (!single) return { label: "", url: "" };
  const i = single.indexOf("·");
  if (i < 0) return { label: "", url: "" };
  const l = single.slice(0, i).trim();
  const u = single.slice(i + 1).trim();
  if (!l || !u || !/[a-z]+\.[a-z]/i.test(u)) return { label: "", url: "" };
  return { label: l, url: withProtocol(u) };
}

/**
 * 저장소 링크는 `NEXT_PUBLIC_REPO_URL` 이 설정돼 있을 때만 앵커가 된다.
 * 저장소가 없을 때 주장을 검증하러 온 방문자가 404를 맞는 일이 없게 한다 (닐슨 5).
 */
function repoLink(lang: Lang): { label: string; url: string } {
  const env = (process.env.NEXT_PUBLIC_REPO_URL ?? "").trim();
  if (!env) return { label: "", url: "" };
  const fromCopy = splitLink(
    t(lang, "SELFDEMO-LINK"),
    t(lang, "SELFDEMO-LINK.label"),
    t(lang, "SELFDEMO-LINK.url"),
  );
  const label = fromCopy.label || t(lang, "SELFDEMO-LINK");
  if (!label) return { label: "", url: "" };
  return { label, url: withProtocol(env) };
}

function MethodSection({ lang, index }: { lang: Lang; index: number }) {
  const intro = t(lang, "METHOD-INTRO");
  const patterns = [1, 2, 3]
    .map((n) => ({
      key: n,
      title: t(lang, "METHOD-" + n + ".title"),
      body: t(lang, "METHOD-" + n + ".body") || t(lang, "METHOD-" + n),
    }))
    .filter((p) => p.title || p.body);
  const selfDemo = t(lang, "SELFDEMO");
  const repo = repoLink(lang);
  const heading = pick(lang, "SEC4-TITLE", "SECTION.method");

  if (!intro && !patterns.length && !selfDemo && !heading) return null;

  return (
    <Section id="method" index={index} heading={heading} lead={intro}>
      {patterns.length > 0 && (
        <ol>
          {patterns.map((p, i) => (
            <li
              key={p.key}
              className="grid gap-x-8 gap-y-2 border-t border-[var(--rule)] py-6 sm:grid-cols-[4.5rem_minmax(0,1fr)]"
            >
              <p className="font-mono text-[1.375rem] leading-none text-ink-subtle tabular-nums">
                {ordinal(i + 1)}
              </p>
              <div className="min-w-0">
                {p.title && (
                  <h3 className="font-display text-base font-medium tracking-tight text-ink">
                    {p.title}
                  </h3>
                )}
                {p.body && (
                  <p className="max-w-2xl leading-relaxed text-ink-muted">
                    {p.body}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
      {(selfDemo || repo.url) && (
        <div className="mt-8 border border-[var(--rule)] bg-surface p-5 sm:p-6">
          {selfDemo &&
            paragraphs(selfDemo).map((para, i) => (
              <p
                key={i}
                className={
                  "max-w-2xl text-[0.875rem] leading-relaxed text-ink-muted" +
                  (i > 0 ? " mt-3" : "")
                }
              >
                {para}
              </p>
            ))}
          {repo.url && (
            <p className="mt-4 text-[0.8125rem]">
              <OutLink href={repo.url} lang={lang}>
                {repo.label}
              </OutLink>
            </p>
          )}
        </div>
      )}
    </Section>
  );
}

/** featured 카드는 그리드에서 빠지고 이 단독 블록이 소비한다 (IA 4.3). */
function FeaturedBlock({ p, lang }: { p: Project; lang: Lang }) {
  const title = text(p.title, lang);
  const tagline = text(p.tagline, lang);
  const role = text(p.role, lang);
  const body = t(lang, "AKDS-SEC");
  const highlights = list(p.highlights, lang).slice(0, 3);
  const links = renderableLinks(p);
  const period = periodLabel(p);
  const groupLabel = t(lang, groupMeta(p.group).navSlot);

  return (
    <article className="grid gap-x-8 gap-y-4 border-t border-[var(--rule)] py-7 sm:grid-cols-[4.5rem_minmax(0,1fr)]">
      <div className="flex items-baseline gap-3 sm:block">
        {period && (
          <p className="font-mono text-[0.6875rem] text-ink-subtle tabular-nums">
            {period}
          </p>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <GroupMark label={groupLabel} />
          <StatusMark lang={lang} status={p.status} />
        </div>

        {title && (
          <h3 className="mt-2 font-display text-xl leading-snug font-medium tracking-tight text-ink sm:text-2xl">
            {title}
          </h3>
        )}
        {role && (
          <p className="mt-1.5 font-mono text-[0.8125rem] tracking-[0.04em] text-accent">
            {role}
          </p>
        )}
        {tagline && (
          <p className="mt-3 max-w-2xl leading-relaxed text-ink-muted">
            {tagline}
          </p>
        )}
        {body &&
          paragraphs(body).map((para, i) => (
            <p
              key={i}
              className="mt-3 max-w-2xl text-[0.875rem] leading-relaxed text-ink-muted"
            >
              {para}
            </p>
          ))}
        {highlights.length > 0 && (
          <ul className="mt-5 space-y-2">
            {highlights.map((h) => (
              <li
                key={h}
                className="border-l-2 border-[var(--rule-strong)] pl-4 text-[0.8125rem] leading-relaxed text-ink-muted"
              >
                {h}
              </li>
            ))}
          </ul>
        )}
        {(hasDetailPage(p) || links.length > 0) && (
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8125rem]">
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

function GroupSection({
  group,
  index,
  lang,
  gloss,
}: {
  group: GroupId;
  index: number;
  lang: Lang;
  gloss?: string;
}) {
  const items = projectsInGroup(group);
  if (!items.length) return null;
  const g = groupMeta(group);
  return (
    <Section
      id={g.anchor}
      index={index}
      heading={pick(lang, g.titleSlot, "SECTION." + group)}
      lead={t(lang, g.leadSlot)}
    >
      {gloss && <Gloss lang={lang} body={gloss} />}
      <div className={gloss ? "mt-8" : undefined}>
        <ProjectList items={items} lang={lang} />
      </div>
    </Section>
  );
}

export function HomePage({ lang }: { lang: Lang }) {
  const featured = featuredProjects();
  const contact = t(lang, "CONTACT");

  return (
    <>
      <Masthead lang={lang} />

      <GroupSection
        group={GRID_GROUPS[0]}
        index={1}
        lang={lang}
        gloss={ui(lang, "UI.glossHarness")}
      />

      <MethodSection lang={lang} index={2} />

      <GroupSection group={GRID_GROUPS[1]} index={3} lang={lang} />

      {featured.length > 0 && (
        <Section
          id="community"
          index={4}
          heading={pick(lang, "SEC6-TITLE", "SECTION.community")}
          lead={t(lang, "GRP-C")}
        >
          {featured.map((p) => (
            <FeaturedBlock key={p.slug} p={p} lang={lang} />
          ))}
        </Section>
      )}

      <Section
        id="contact"
        index={5}
        heading={pick(lang, "SEC7-TITLE", "SECTION.contact")}
        lead={contact}
      >
        <ContactChannels lang={lang} className="max-w-2xl" />
        <p className="mt-8 text-[0.8125rem]">
          <GoLink href={href(lang, "/about")}>
            {t(lang, "NAV-ABOUT") || ui(lang, "UI.about")}
          </GoLink>
        </p>
      </Section>
    </>
  );
}

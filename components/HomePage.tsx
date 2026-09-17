import Link from "next/link";

import { paragraphs, pick, t } from "@/lib/copy";
import {
  GRID_GROUPS,
  featuredProjects,
  hasDetailPage,
  list,
  periodLabel,
  projectsInGroup,
  renderableLinks,
  text,
} from "@/lib/projects";
import { href } from "@/lib/routes";
import type { GroupId, Lang, Project } from "@/lib/types";
import { ui } from "@/lib/ui";

import { StatusBadge } from "./Badges";
import { ExternalLinks } from "./ExternalLinks";
import { ProjectGrid } from "./ProjectCard";

const GROUP_HEADING: Record<string, string> = {
  "agent-systems": "SEC3-TITLE",
  products: "SEC5-TITLE",
  community: "SEC6-TITLE",
};

const GROUP_ANCHOR: Record<string, string> = {
  "agent-systems": "systems",
  products: "apps",
  community: "community",
};

function Section({
  id,
  heading,
  lead,
  children,
}: {
  id?: string;
  heading?: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-16 border-t border-[var(--border)] py-10 sm:py-14">
      {heading && (
        <h2 className="text-lg font-semibold tracking-tight text-text sm:text-xl">
          {heading}
        </h2>
      )}
      {lead && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
          {lead}
        </p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </section>
  );
}

/**
 * 증명 항목은 카피가 "값 · 라벨" 한 줄로 온다 ("6 · 에이전트 시스템").
 * 분리자가 없으면 전체를 라벨로 쓴다. 코드가 숫자를 지어내지 않는다.
 */
function splitProof(raw: string): { value: string; label: string } {
  const i = raw.indexOf("·");
  if (i < 0) return { value: "", label: raw };
  return {
    value: raw.slice(0, i).trim(),
    label: raw.slice(i + 1).trim(),
  };
}

function ProofStrip({ lang }: { lang: Lang }) {
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
    <ul className="grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-6 sm:grid-cols-4 sm:gap-4">
      {items.map((i) => (
        <li key={i.key}>
          {i.value && (
            <p className="text-2xl font-semibold tracking-tight text-text tabular-nums sm:text-3xl">
              {i.value}
            </p>
          )}
          {i.label && (
            <p className="mt-1 text-[0.8125rem] leading-snug text-text-muted">
              {i.label}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

function Hero({ lang }: { lang: Lang }) {
  const h1 = t(lang, "HERO-1");
  const sub = t(lang, "HERO-2");
  const cta1 = t(lang, "HERO-CTA-1");
  const cta2 = t(lang, "HERO-CTA-2");

  return (
    <section className="py-12 sm:py-20">
      {h1 && (
        <h1 className="max-w-3xl text-2xl leading-tight font-semibold tracking-tight text-text sm:text-4xl">
          {h1}
        </h1>
      )}
      {sub && (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg">
          {sub}
        </p>
      )}
      {(cta1 || cta2) && (
        <div className="mt-7 flex flex-wrap gap-3">
          {cta1 && (
            <a
              href="#systems"
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-[var(--accent-on)] hover:bg-accent-hover"
            >
              {cta1}
            </a>
          )}
          {cta2 && (
            <Link
              href={href(lang, "/about")}
              className="rounded-md border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-text hover:border-accent hover:text-accent"
            >
              {cta2}
            </Link>
          )}
        </div>
      )}
      <div className="mt-10">
        <ProofStrip lang={lang} />
      </div>
    </section>
  );
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

function withProtocol(url: string): string {
  return /^https?:\/\//i.test(url) ? url : "https://" + url;
}

/**
 * 저장소 링크는 `NEXT_PUBLIC_REPO_URL` 이 설정돼 있을 때만 앵커가 된다.
 * 저장소를 만들기 전에는 주소가 없으므로 문장만 남기고 링크를 만들지 않는다 —
 * 사이트의 핵심 주장을 검증하러 온 방문자가 404를 맞는 일이 없게 한다.
 * 변수를 넣는 순간 카피의 레이블로 링크가 살아난다.
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

function MethodSection({ lang }: { lang: Lang }) {
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
  const repoLabel = repo.label;
  const repoUrl = repo.url;
  const heading = pick(lang, "SEC4-TITLE", "SECTION.method");

  if (!intro && !patterns.length && !selfDemo && !heading) return null;

  return (
    <Section id="method" heading={heading} lead={intro}>
      {patterns.length > 0 && (
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {patterns.map((p) => (
            <li
              key={p.key}
              className="rounded-lg border border-[var(--border)] bg-surface p-4"
            >
              {p.title && (
                <h3 className="text-sm font-semibold text-text">{p.title}</h3>
              )}
              {p.body && (
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-text-muted">
                  {p.body}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
      {(selfDemo || (repoLabel && repoUrl)) && (
        <div className="mt-6 rounded-lg border border-[var(--border)] bg-surface-2 p-4 sm:p-5">
          {selfDemo &&
            paragraphs(selfDemo).map((para, i) => (
              <p
                key={i}
                className={
                  "text-sm leading-relaxed text-text-muted" + (i > 0 ? " mt-2" : "")
                }
              >
                {para}
              </p>
            ))}
          {repoLabel && repoUrl && (
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-medium text-accent underline-offset-4 hover:underline"
            >
              {repoLabel}
              <span aria-hidden="true"> ↗</span>
            </a>
          )}
        </div>
      )}
    </Section>
  );
}

function FeaturedBlock({ p, lang }: { p: Project; lang: Lang }) {
  const title = text(p.title, lang);
  const tagline = text(p.tagline, lang);
  const body = t(lang, "AKDS-SEC");
  const highlights = list(p.highlights, lang).slice(0, 3);
  const links = renderableLinks(p);
  const period = periodLabel(p);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge lang={lang} status={p.status} />
        {period && (
          <span className="text-[0.75rem] text-text-subtle tabular-nums">
            {period}
          </span>
        )}
      </div>
      {title && (
        <h3 className="mt-2 text-base font-semibold tracking-tight text-text sm:text-lg">
          {title}
        </h3>
      )}
      {tagline && (
        <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
          {tagline}
        </p>
      )}
      {body &&
        paragraphs(body).map((para, i) => (
          <p key={i} className="mt-3 text-sm leading-relaxed text-text-muted">
            {para}
          </p>
        ))}
      {highlights.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {highlights.map((h) => (
            <li
              key={h}
              className="border-l-2 border-[var(--border-strong)] pl-3 text-[0.8125rem] leading-relaxed text-text-muted"
            >
              {h}
            </li>
          ))}
        </ul>
      )}
      {(hasDetailPage(p) || links.length > 0) && (
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {hasDetailPage(p) && (
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
    </div>
  );
}

function GroupSection({
  group,
  lead,
  lang,
}: {
  group: GroupId;
  lead: string;
  lang: Lang;
}) {
  const items = projectsInGroup(group);
  if (!items.length) return null;
  return (
    <Section
      id={GROUP_ANCHOR[group]}
      heading={pick(lang, GROUP_HEADING[group], "SECTION." + group)}
      lead={t(lang, lead)}
    >
      <ProjectGrid items={items} lang={lang} />
    </Section>
  );
}

export function HomePage({ lang }: { lang: Lang }) {
  const featured = featuredProjects();
  const contact = t(lang, "CONTACT");

  return (
    <>
      <Hero lang={lang} />

      <GroupSection group={GRID_GROUPS[0]} lead="GRP-A" lang={lang} />

      <MethodSection lang={lang} />

      <GroupSection group={GRID_GROUPS[1]} lead="GRP-B" lang={lang} />

      {featured.length > 0 && (
        <Section
          id="community"
          heading={pick(lang, "SEC6-TITLE", "SECTION.community")}
          lead={t(lang, "GRP-C")}
        >
          <div className="space-y-4">
            {featured.map((p) => (
              <FeaturedBlock key={p.slug} p={p} lang={lang} />
            ))}
          </div>
        </Section>
      )}

      <Section
        id="contact"
        heading={pick(lang, "SEC7-TITLE", "SECTION.contact")}
        lead={contact}
      >
        <Link
          href={href(lang, "/about")}
          className="text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          {t(lang, "NAV-ABOUT") || ui(lang, "UI.about")}
          <span aria-hidden="true"> →</span>
        </Link>
      </Section>
    </>
  );
}

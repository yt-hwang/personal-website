import { paragraphs, pick, t } from "@/lib/copy";
import type { Lang } from "@/lib/types";
import { ordinal, ui } from "@/lib/ui";

import { ContactChannels } from "./ContactChannels";

/**
 * About — 산문 한 덩어리가 아니라 **구조화된 슬롯**으로 짠다.
 *
 * 페이지의 주인공은 "지금 맡고 있는 역할 4개"다. 한 역할은 세 층으로 쌓는다.
 *   기관명(ROLE-n-ORG)   모노 · 작게 — 어디에서
 *   직함(ROLE-n-TITLE)   디스플레이 · 가장 크게 · 강조색 — 어떤 위치로
 *   설명(ROLE-n-DESC)    본문 — 무엇을
 * 세 층이 서로 다른 서체·크기·색을 쓰므로 한눈에 갈린다.
 *
 * 역할 수는 코드에 고정돼 있지 않다. 카피에 ROLE-5-* 가 생기면 그대로 한 줄 더 붙는다.
 * 세 슬롯이 전부 비면 그 항목은 렌더하지 않는다 (닐슨 5 — 빈 칸을 만들지 않는다).
 */

const MAX_ROLES = 12;
const LABEL = "font-mono text-[0.6875rem] tracking-[0.14em] uppercase";

type Role = { n: number; org: string; title: string; desc: string };

function readRoles(lang: Lang): Role[] {
  const out: Role[] = [];
  for (let n = 1; n <= MAX_ROLES; n++) {
    const org = t(lang, "ROLE-" + n + "-ORG");
    const title = t(lang, "ROLE-" + n + "-TITLE");
    const desc = t(lang, "ROLE-" + n + "-DESC");
    if (!org && !title && !desc) continue;
    out.push({ n, org, title, desc });
  }
  return out;
}

function Section({
  index,
  heading,
  children,
}: {
  index: number;
  heading: string;
  children: React.ReactNode;
}) {
  if (!heading && !children) return null;
  return (
    <section className="pt-12 sm:pt-16">
      <div className="flex items-baseline gap-4 pb-2.5">
        <span className={LABEL + " text-ink-subtle tabular-nums"}>
          {ordinal(index)}
        </span>
        {heading && (
          <h2 className="font-display text-lg leading-snug font-medium tracking-tight text-ink sm:text-xl">
            {heading}
          </h2>
        )}
      </div>
      <div className="h-0.5 bg-[var(--rule-strong)]" />
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Prose({ value, className = "" }: { value: string; className?: string }) {
  if (!value) return null;
  return (
    <>
      {paragraphs(value).map((para, i) => (
        <p
          key={i}
          className={
            "max-w-2xl leading-relaxed text-ink-muted " +
            (i > 0 ? "mt-3 " : "") +
            className
          }
        >
          {para}
        </p>
      ))}
    </>
  );
}

export function AboutPage({ lang }: { lang: Lang }) {
  const heading =
    pick(lang, "ABOUT-TITLE", "NAV-ABOUT") || ui(lang, "UI.about");
  const lead = t(lang, "ABOUT-LEAD");
  const roles = readRoles(lang);

  const bgTitle = t(lang, "BG-TITLE");
  const bg = t(lang, "ABOUT-BG");
  const sideTitle = t(lang, "SIDE-TITLE");
  const side = t(lang, "ABOUT-SIDE");
  const contactTitle = t(lang, "CONTACT-TITLE");
  const contact = t(lang, "ABOUT-CONTACT");
  const repoNote = t(lang, "ABOUT-REPO-NOTE");

  // 번호는 실제로 렌더되는 섹션에만 순서대로 붙는다.
  let n = 0;
  const next = () => ++n;

  return (
    <article className="pt-10 pb-4 sm:pt-14">
      <header className="stagger">
        <p className={LABEL + " text-ink-subtle"}>{heading}</p>
        {lead && (
          <h1 className="mt-4 max-w-3xl font-display text-[1.75rem] leading-tight font-medium tracking-tight text-ink sm:text-4xl">
            {lead}
          </h1>
        )}
      </header>

      {roles.length > 0 && (
        <Section index={next()} heading={t(lang, "ROLES-TITLE")}>
          {/*
            기관명은 왼쪽 칸, 직함과 설명은 오른쪽 칸에 둔다.
            칸이 갈리는 것만으로 "어디에서 / 어떤 위치로 / 무엇을"이 구분되고,
            섹션 번호(01)와 항목 번호가 나란히 서서 헷갈리는 일도 없다.
          */}
          <ul>
            {roles.map((r) => (
              <li
                key={r.n}
                className="grid gap-x-8 gap-y-1.5 border-t border-[var(--rule)] py-6 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]"
              >
                {/* 기관명이 없으면 빈 칸을 남긴다 — 직함이 왼쪽 칸으로 밀려 들어가지 않게. */}
                {r.org ? (
                  <p className="font-mono text-[0.75rem] leading-relaxed tracking-[0.06em] text-ink-subtle">
                    {r.org}
                  </p>
                ) : (
                  <span aria-hidden="true" />
                )}
                <div className="min-w-0">
                  {r.title && (
                    <p className="font-display text-xl leading-snug font-medium tracking-tight text-accent sm:text-2xl">
                      {r.title}
                    </p>
                  )}
                  {r.desc && (
                    <p className="mt-2.5 max-w-2xl leading-relaxed text-ink-muted">
                      {r.desc}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {bg && (
        <Section index={next()} heading={bgTitle}>
          <Prose value={bg} />
        </Section>
      )}

      {side && (
        <Section index={next()} heading={sideTitle}>
          <Prose value={side} />
        </Section>
      )}

      {(contact || repoNote) && (
        <Section index={next()} heading={contactTitle}>
          <Prose value={contact} />
          <ContactChannels
            lang={lang}
            prefer="about"
            className="mt-6 max-w-2xl"
          />
          {repoNote && (
            <p className="mt-6 max-w-2xl border-l-2 border-[var(--rule-strong)] pl-4 text-[0.8125rem] leading-relaxed text-ink-muted">
              {repoNote}
            </p>
          )}
        </Section>
      )}
    </article>
  );
}

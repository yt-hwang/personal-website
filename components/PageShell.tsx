import Link from "next/link";

import { pick, t } from "@/lib/copy";
import { LANG_SHORT, href, otherLang } from "@/lib/routes";
import type { NeutralPath } from "@/lib/routes";
import type { Lang } from "@/lib/types";
import { ui } from "@/lib/ui";

import { ContactChannels } from "./ContactChannels";

/**
 * 모든 페이지가 같은 껍데기를 쓴다.
 * path 는 언어 중립 경로("/", "/about", "/projects/<slug>")이며 언어 토글이 이것을 그대로 유지한다.
 *
 * 시스템 상태 가시성(닐슨 1)은 두 층으로 준다.
 *   ① 페이지 층 — 지금 페이지에 해당하는 내비 항목에 aria-current="page" 와 밑줄이 붙는다. 서버가 안다.
 *   ② 섹션 층 — 홈 섹션 헤더가 sticky 라 스크롤 중에도 현재 섹션 번호·제목이 화면에 남고,
 *      해시로 이동하면 globals.css 의 :target + :has() 규칙이 해당 내비 항목을 강조한다.
 * 둘 다 CSS 로만 처리한다 — 이 파일에 클라이언트 JS 는 없다.
 */

/** 섹션 앵커 — 홈의 해시로 이동한다. 라벨 카피가 없으면 항목 자체를 렌더하지 않는다. */
const SECTION_NAV = [
  { key: "systems", slot: "NAV-SYSTEMS" },
  { key: "apps", slot: "NAV-APPS" },
  { key: "community", slot: "NAV-COMMUNITY" },
  { key: "contact", slot: "NAV-CONTACT" },
];

const NAV_ITEM =
  "font-mono text-[0.6875rem] tracking-[0.12em] uppercase whitespace-nowrap border-b border-transparent pb-0.5 text-ink-muted hover:text-accent hover:border-[var(--accent)]";

export function PageShell({
  lang,
  path,
  children,
}: {
  lang: Lang;
  path: NeutralPath;
  children: React.ReactNode;
}) {
  const other = otherLang(lang);
  const brand = pick(lang, "SITE-NAME", "NAV-HOME");
  const home = href(lang, "/");
  const onHome = path === "/";
  const onAbout = path === "/about";
  const aboutLabel = t(lang, "NAV-ABOUT") || ui(lang, "UI.about");
  const sections = SECTION_NAV.map((s) => ({
    ...s,
    label: t(lang, s.slot),
    // 홈에서는 해시만, 다른 페이지에서는 홈 경로 + 해시로 간다.
    href: onHome ? "#" + s.key : home + "#" + s.key,
  })).filter((s) => s.label);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:border focus:border-[var(--accent)] focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:text-ink"
      >
        {ui(lang, "UI.skip")}
      </a>

      <header className="sticky top-0 z-30 border-b border-[var(--rule)] bg-bg">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav
            aria-label={brand || ui(lang, "UI.home")}
            className="flex h-14 items-center justify-between gap-3"
          >
            {/* 어느 페이지에서도 홈까지 1클릭 (닐슨 3) */}
            <Link
              href={home}
              aria-current={onHome ? "page" : undefined}
              className="font-display text-[0.9375rem] font-medium tracking-tight text-ink aria-[current=page]:text-accent hover:text-accent"
            >
              {brand || ui(lang, "UI.home")}
            </Link>

            <div className="flex items-center gap-4 sm:gap-5">
              {sections.map((s) => (
                <Link
                  key={s.key}
                  href={s.href}
                  data-nav={s.key}
                  className={"hidden sm:inline-block " + NAV_ITEM}
                >
                  {s.label}
                </Link>
              ))}
              <Link
                href={href(lang, "/about")}
                aria-current={onAbout ? "page" : undefined}
                className={
                  NAV_ITEM +
                  " aria-[current=page]:border-[var(--accent)] aria-[current=page]:text-accent"
                }
              >
                {aboutLabel}
              </Link>
              <Link
                href={href(other, path)}
                hrefLang={other}
                lang={other}
                className="border border-[var(--rule-strong)] px-2 py-1 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted hover:border-[var(--accent)] hover:text-accent"
              >
                {LANG_SHORT[other]}
              </Link>
            </div>
          </nav>

          {/* 좁은 화면에서도 섹션에 직접 닿는다 (닐슨 7). 이 줄만 가로로 스크롤한다. */}
          {sections.length > 0 && (
            <div className="scroll-x -mx-4 border-t border-[var(--rule)] px-4 sm:hidden">
              <div className="flex items-center gap-4 py-1.5">
                {sections.map((s) => (
                  <Link
                    key={s.key}
                    href={s.href}
                    data-nav={s.key}
                    className={NAV_ITEM}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* tabIndex -1: skip-link 가 실제로 포커스를 옮기려면 대상이 포커스 가능해야 한다 (QA D-9) */}
      <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-4 sm:px-6">
        {children}
      </main>

      <SiteFooter lang={lang} brand={brand} home={home} />
    </>
  );
}

function SiteFooter({
  lang,
  brand,
  home,
}: {
  lang: Lang;
  brand: string;
  home: string;
}) {
  return (
    <footer className="mt-20 border-t border-[var(--rule)]">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:px-6">
        <div>
          {brand && (
            <p className="font-display text-base tracking-tight text-ink">
              {brand}
            </p>
          )}
          <Link
            href={home}
            className="mt-3 inline-block font-mono text-[0.6875rem] tracking-[0.12em] text-ink-subtle uppercase hover:text-accent"
          >
            {t(lang, "NAV-HOME") || ui(lang, "UI.home")}
          </Link>
        </div>
        <ContactChannels lang={lang} />
      </div>
    </footer>
  );
}

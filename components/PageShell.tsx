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
 * 헤더는 레퍼런스처럼 **얇고 조용하다** — 규칙선 하나, 세리프 브랜드 하나, 나머지는 14px 한 줄.
 * 시스템 상태 가시성(닐슨 1)은 두 층으로 준다.
 *   ① 페이지 층 — 지금 페이지에 해당하는 내비 항목에 aria-current="page" 와 강조색이 붙는다. 서버가 안다.
 *   ② 섹션 층 — 홈 섹션의 마이크로 라벨이 sticky 라 스크롤 중에도 현재 섹션이 화면에 남고,
 *      해시로 이동하면 globals.css 의 :target + :has() 규칙이 해당 내비 항목을 강조한다.
 * 둘 다 CSS 로만 처리한다 — 이 파일에 클라이언트 JS 는 없다.
 */

/** 섹션 앵커 — 홈의 해시로 이동한다. 라벨 카피가 없으면 항목 자체를 렌더하지 않는다. */
const SECTION_NAV = [
  { key: "systems", slot: "NAV-SYSTEMS" },
  { key: "method", slot: "NAV-METHOD" },
  { key: "apps", slot: "NAV-APPS" },
  { key: "community", slot: "NAV-COMMUNITY" },
  { key: "contact", slot: "NAV-CONTACT" },
];

const NAV_ITEM =
  "text-[0.875rem] leading-6 tracking-[0.06em] whitespace-nowrap text-ink-soft hover:text-accent aria-[current=page]:text-accent";

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
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:border focus:border-ink focus:bg-bg focus:px-4 focus:py-2 focus:text-ink"
      >
        {ui(lang, "UI.skip")}
      </a>

      <header className="sticky top-0 z-30 border-b border-rule bg-bg">
        <div className="shell">
          <nav
            aria-label={brand || ui(lang, "UI.home")}
            className="flex h-16 items-center justify-between gap-4 lg:h-20"
          >
            {/* 어느 페이지에서도 홈까지 1클릭 (닐슨 3) */}
            <Link
              href={home}
              aria-current={onHome ? "page" : undefined}
              className="font-display text-[1.125rem] font-medium tracking-[-0.01em] text-ink aria-[current=page]:text-accent hover:text-accent"
            >
              {brand || ui(lang, "UI.home")}
            </Link>

            <div className="flex items-center gap-5 lg:gap-8">
              {sections.map((s) => (
                <Link
                  key={s.key}
                  href={s.href}
                  data-nav={s.key}
                  className={"hidden lg:inline-block " + NAV_ITEM}
                >
                  {s.label}
                </Link>
              ))}
              <Link
                href={href(lang, "/about")}
                aria-current={onAbout ? "page" : undefined}
                className={NAV_ITEM}
              >
                {aboutLabel}
              </Link>
              <Link
                href={href(other, path)}
                hrefLang={other}
                lang={other}
                className="rounded-full border border-ink-soft px-3 py-1 font-mono text-[0.75rem] tracking-[0.06em] text-ink-soft hover:border-ink hover:text-ink"
              >
                {LANG_SHORT[other]}
              </Link>
            </div>
          </nav>
        </div>

        {/* 좁은 화면에서도 섹션에 직접 닿는다 (닐슨 7). 이 줄만 가로로 스크롤한다. */}
        {sections.length > 0 && (
          <div className="border-t border-rule lg:hidden">
            <div className="shell scroll-x">
              <div className="flex items-center gap-6 py-2">
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
          </div>
        )}
      </header>

      {/* tabIndex -1: skip-link 가 실제로 포커스를 옮기려면 대상이 포커스 가능해야 한다 (QA D-9) */}
      <main id="main" tabIndex={-1} className="shell">
        {children}
      </main>

      <SiteFooter
        lang={lang}
        brand={brand}
        home={home}
        sections={sections}
        aboutHref={href(lang, "/about")}
        aboutLabel={aboutLabel}
      />
    </>
  );
}

/**
 * 푸터 — 왼쪽은 **이름 + 이 사이트의 목적지 전부**, 오른쪽은 연락 수단.
 *
 * 이전에는 왼쪽이 이름과 "홈" 링크 두 줄뿐이라, 오른쪽 연락 수단 블록 옆으로
 * 세로로 긴 빈 사각형이 남았다(사진 자리로 읽히던 자리다).
 * 장식을 넣는 대신 **원래 있어야 할 정보**를 넣었다 — 헤더에서 1024px 미만이면 숨는
 * 섹션 앵커들이 푸터에 전부 모여 있다. 페이지 맨 아래에서도 어디로든 한 번에 간다(닐슨 3·7).
 */
function SiteFooter({
  lang,
  brand,
  home,
  sections,
  aboutHref,
  aboutLabel,
}: {
  lang: Lang;
  brand: string;
  home: string;
  sections: { key: string; label: string; href: string }[];
  aboutHref: string;
  aboutLabel: string;
}) {
  const destinations = [
    { key: "home", label: t(lang, "NAV-HOME") || ui(lang, "UI.home"), href: home },
    ...sections,
    { key: "about", label: aboutLabel, href: aboutHref },
  ].filter((d) => d.label);

  return (
    <footer className="mt-[clamp(3rem,8vh,4.75rem)] border-t border-rule">
      <div className="shell">
        <div className="bay py-11 sm:py-14">
          <div className="lg:col-span-5">
            {brand && <p className="t-sub">{brand}</p>}
            {destinations.length > 0 && (
              <nav aria-label={ui(lang, "UI.footerNav")} className="mt-7">
                <ul className="flex flex-col gap-y-2.5 sm:flex-row sm:flex-wrap sm:gap-x-7">
                  {destinations.map((d) => (
                    <li key={d.key}>
                      <Link href={d.href} className={NAV_ITEM}>
                        {d.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <ContactChannels lang={lang} />
          </div>
        </div>
      </div>
    </footer>
  );
}

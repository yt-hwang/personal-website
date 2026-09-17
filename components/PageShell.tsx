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
 */

/** 섹션 앵커 — 홈의 해시로 이동한다. 라벨 카피가 없으면 항목 자체를 렌더하지 않는다. */
const SECTION_NAV = [
  { slot: "NAV-SYSTEMS", hash: "#systems" },
  { slot: "NAV-APPS", hash: "#apps" },
  { slot: "NAV-COMMUNITY", hash: "#community" },
];

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
  const sections = SECTION_NAV.map((s) => ({
    ...s,
    label: t(lang, s.slot),
  })).filter((s) => s.label);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:text-text"
      >
        {ui(lang, "UI.skip")}
      </a>

      <header className="border-b border-[var(--border)]">
        <nav className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            href={home}
            className="text-sm font-semibold tracking-tight text-text underline-offset-4 hover:underline"
          >
            {brand || ui(lang, "UI.home")}
          </Link>
          <div className="flex items-center gap-3 text-sm sm:gap-5">
            {sections.map((s) => (
              <Link
                key={s.slot}
                href={home === "/" ? s.hash : home + s.hash}
                className="hidden text-text-muted underline-offset-4 hover:text-text hover:underline sm:inline"
              >
                {s.label}
              </Link>
            ))}
            <Link
              href={href(lang, "/about")}
              className="text-text-muted underline-offset-4 hover:text-text hover:underline"
            >
              {t(lang, "NAV-ABOUT") || ui(lang, "UI.about")}
            </Link>
            <Link
              href={href(other, path)}
              hrefLang={other}
              lang={other}
              className="rounded-md border border-[var(--border-strong)] px-2 py-1 text-xs font-medium text-text-muted hover:border-accent hover:text-accent"
            >
              {LANG_SHORT[other]}
            </Link>
          </div>
        </nav>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-4 sm:px-6">
        {children}
      </main>

      <SiteFooter lang={lang} />
    </>
  );
}

/** 푸터는 연락 수단만 둔다 — 홈의 연락 섹션과 같은 문장을 두 번 보여주지 않는다. */
function SiteFooter({ lang }: { lang: Lang }) {
  return (
    <footer className="mt-16 border-t border-[var(--border)]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <ContactChannels lang={lang} />
      </div>
    </footer>
  );
}

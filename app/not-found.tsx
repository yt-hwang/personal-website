import Link from "next/link";

import { paragraphs, t } from "@/lib/copy";
import { fontClass } from "@/lib/fonts";
import { href } from "@/lib/routes";
import type { Lang } from "@/lib/types";
import { ordinal, ui } from "@/lib/ui";

import "./globals.css";

/**
 * 404 는 두 언어를 함께 보여주고, **어디로 갈 수 있는지**를 같이 준다 (닐슨 9 — 오류 복구).
 *
 * 이중언어인 이유: 루트 레이아웃이 언어별로 둘(app/(ko), app/(en))이라 Next 가 이 전역 404 에
 * 레이아웃을 붙이지 못한다. 라우트 그룹 안에 not-found 를 두거나 catch-all 로 언어를 나누면
 * 요청 시 NoFallbackError 가 나면서 본문이 통째로 비어 버린다(실측 확인).
 * 그래서 이 페이지는 자기 <html><body> 를 직접 그리고, <title> 도 직접 올린다(React 가 head 로 끌어올린다).
 * 존재하지 않는 주소를 홈으로 조용히 리다이렉트하지 않는다 (IA 6.2).
 */

const LABEL = "font-mono text-[0.6875rem] tracking-[0.14em] uppercase";

/** 주요 목적지 — 홈의 섹션 앵커와 About. 라벨 카피가 없으면 항목 자체가 빠진다. */
const DESTINATIONS = [
  { slot: "NAV-HOME", path: "/", hash: "" },
  { slot: "NAV-SYSTEMS", path: "/", hash: "#systems" },
  { slot: "NAV-APPS", path: "/", hash: "#apps" },
  { slot: "NAV-COMMUNITY", path: "/", hash: "#community" },
  { slot: "NAV-ABOUT", path: "/about", hash: "" },
];

function Block({ lang }: { lang: Lang }) {
  const body = t(lang, "404");
  const items = DESTINATIONS.map((d) => ({
    ...d,
    label: t(lang, d.slot),
  })).filter((d) => d.label);

  return (
    <div lang={lang}>
      <h2 className="font-display text-xl leading-snug font-medium tracking-tight text-ink sm:text-2xl">
        {ui(lang, "UI.notFoundTitle")}
      </h2>
      {body &&
        paragraphs(body).map((para, i) => (
          <p key={i} className="mt-3 max-w-xl leading-relaxed text-ink-muted">
            {para}
          </p>
        ))}
      {items.length > 0 && (
        <>
          <p className={LABEL + " mt-7 text-ink-subtle"}>
            {ui(lang, "UI.notFoundGo")}
          </p>
          <ul className="mt-3 border-t border-[var(--rule)]">
            {items.map((d, i) => (
              <li key={d.slot} className="border-b border-[var(--rule)]">
                <Link
                  href={href(lang, d.path) + d.hash}
                  hrefLang={lang}
                  className="flex items-baseline gap-4 py-2.5 text-ink hover:text-accent"
                >
                  <span className={LABEL + " text-ink-subtle tabular-nums"}>
                    {ordinal(i + 1)}
                  </span>
                  <span className="font-display text-[0.9375rem] font-medium tracking-tight">
                    {d.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default function NotFound() {
  const title =
    ui("ko", "UI.notFoundTitle") + " · " + ui("en", "UI.notFoundTitle");

  return (
    <html lang="ko" className={fontClass}>
      <body className="min-h-screen antialiased">
        <title>{title}</title>
        <main className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="max-w-3xl py-16 sm:py-24">
            {/* 페이지당 h1 하나. 404 라는 사실 자체가 이 페이지의 제목이다. */}
            <h1 className={LABEL + " text-accent tabular-nums"}>404</h1>
            <div className="mt-6 grid gap-12 border-t-2 border-[var(--rule-strong)] pt-8 sm:grid-cols-2 sm:gap-10">
              <Block lang="ko" />
              <Block lang="en" />
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}

import Link from "next/link";

import { paragraphs, t } from "@/lib/copy";
import { fontClass } from "@/lib/fonts";
import { href } from "@/lib/routes";
import type { Lang } from "@/lib/types";
import { ui } from "@/lib/ui";

import "./globals.css";

/**
 * 404 는 두 언어를 함께 보여준다.
 *
 * 이유: 루트 레이아웃이 언어별로 둘(app/(ko), app/(en))이라 Next 가 이 전역 404 에
 * 레이아웃을 붙이지 못한다. 라우트 그룹 안에 not-found 를 두거나 catch-all 로 언어를 나누면
 * 요청 시 NoFallbackError 가 나면서 본문이 통째로 비어 버린다(실측 확인).
 * 그래서 이 페이지는 자기 <html><body> 를 직접 그리고, <title> 도 직접 올린다(React 가 head 로 끌어올린다).
 * 언어를 서버에서 알 수 없으므로 한쪽을 고르는 대신 둘 다 보여준다 —
 * 주소를 잘못 친 방문자의 언어는 어차피 알 수 없고, 영어권 방문자가 한국어만 받는 상황이 사라진다.
 * 존재하지 않는 주소를 홈으로 조용히 리다이렉트하지 않는다 (IA 6.2).
 */
function Block({ lang }: { lang: Lang }) {
  const body = t(lang, "404");
  return (
    <div lang={lang} className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight text-text sm:text-xl">
        {ui(lang, "UI.notFoundTitle")}
      </h2>
      {body &&
        paragraphs(body).map((para, i) => (
          <p key={i} className="text-[0.9375rem] leading-relaxed text-text-muted">
            {para}
          </p>
        ))}
      <Link
        href={href(lang, "/")}
        hrefLang={lang}
        className="inline-block text-sm font-medium text-accent underline-offset-4 hover:underline"
      >
        {ui(lang, "UI.backHome")}
        <span aria-hidden="true"> →</span>
      </Link>
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
          <div className="max-w-2xl py-20 sm:py-28">
            <p className="text-sm font-medium text-text-subtle tabular-nums">
              404
            </p>
            <div className="mt-4 space-y-8">
              <Block lang="ko" />
              <div className="border-t border-[var(--border)] pt-8">
                <Block lang="en" />
              </div>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}

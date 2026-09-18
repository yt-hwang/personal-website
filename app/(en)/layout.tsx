import type { Metadata } from "next";

import { pick } from "@/lib/copy";
import { fontClass } from "@/lib/fonts";
import { alternates } from "@/lib/routes";

import "../globals.css";

/**
 * **기본 언어 루트 레이아웃.** 접두사 없는 주소(`/`, `/about`, `/projects/<slug>`)를 소유한다.
 * 2026-09-18 언어 정책 변경으로 영어가 기본이 됐다 — 대상 독자에 영어권 채용담당자가 있다.
 * 한국어는 `app/(ko)/layout.tsx` 가 `/ko` 이하를 소유한다.
 */
const siteName = pick("en", "SITE-NAME", "NAV-HOME");

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: pick("en", "META-home-title", "META-home.title") || siteName,
    template: siteName ? "%s · " + siteName : "%s",
  },
  description:
    pick("en", "META-home-desc", "META-home.description") || undefined,
  alternates: alternates("/", "en"),
};

export default function EnRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontClass}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

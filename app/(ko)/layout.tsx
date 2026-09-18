import type { Metadata } from "next";

import { pick } from "@/lib/copy";
import { fontClass } from "@/lib/fonts";
import { alternates } from "@/lib/routes";

import "../globals.css";

/**
 * 한국어 루트 레이아웃 — `/ko` 이하를 소유한다.
 * 기본 언어(영어)는 `app/(en)/layout.tsx` 가 접두사 없는 주소를 소유한다.
 * App Router 는 루트 레이아웃 하나가 `<html>` 을 소유하므로, `<html lang>` 이
 * 언어별로 달라지려면 라우트 그룹으로 루트 레이아웃을 둘 두는 수밖에 없다.
 */
const siteName = pick("ko", "SITE-NAME", "NAV-HOME");

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: pick("ko", "META-home-title", "META-home.title") || siteName,
    template: siteName ? "%s · " + siteName : "%s",
  },
  description:
    pick("ko", "META-home-desc", "META-home.description") || undefined,
  alternates: alternates("/", "ko"),
};

export default function KoRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={fontClass}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

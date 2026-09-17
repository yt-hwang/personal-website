import type { Metadata } from "next";

import { pick } from "@/lib/copy";
import { fontClass } from "@/lib/fonts";
import { alternates } from "@/lib/routes";

import "../globals.css";

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

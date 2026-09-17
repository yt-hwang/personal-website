import type { Metadata } from "next";

import { AboutPage } from "@/components/AboutPage";
import { PageShell } from "@/components/PageShell";
import { aboutMeta } from "@/lib/meta";

export const metadata: Metadata = aboutMeta("ko");

export default function Page() {
  return (
    <PageShell lang="ko" path="/about">
      <AboutPage lang="ko" />
    </PageShell>
  );
}

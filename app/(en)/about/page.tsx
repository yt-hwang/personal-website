import type { Metadata } from "next";

import { AboutPage } from "@/components/AboutPage";
import { PageShell } from "@/components/PageShell";
import { aboutMeta } from "@/lib/meta";

export const metadata: Metadata = aboutMeta("en");

export default function Page() {
  return (
    <PageShell lang="en" path="/about">
      <AboutPage lang="en" />
    </PageShell>
  );
}

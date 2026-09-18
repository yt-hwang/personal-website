import type { Metadata } from "next";

import { HomePage } from "@/components/HomePage";
import { PageShell } from "@/components/PageShell";
import { homeMeta } from "@/lib/meta";

export const metadata: Metadata = homeMeta("en");

export default function Page() {
  return (
    <PageShell lang="en" path="/">
      <HomePage lang="en" />
    </PageShell>
  );
}

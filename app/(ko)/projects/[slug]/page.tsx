import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/PageShell";
import { ProjectDetail } from "@/components/ProjectDetail";
import { projectMeta } from "@/lib/meta";
import { detailProjects, findProject, hasDetailPage } from "@/lib/projects";

type Params = { params: Promise<{ slug: string }> };

/** 상세 페이지는 IA 5.2 규칙을 통과한 프로젝트에만 생성된다. limited/private 은 라우트 자체가 없다. */
export function generateStaticParams() {
  return detailProjects().map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = findProject(slug);
  if (!p || !hasDetailPage(p)) return {};
  return projectMeta(p, "ko");
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const p = findProject(slug);
  if (!p || !hasDetailPage(p)) notFound();

  return (
    <PageShell lang="ko" path={"/projects/" + p.slug}>
      <ProjectDetail p={p} lang="ko" />
    </PageShell>
  );
}

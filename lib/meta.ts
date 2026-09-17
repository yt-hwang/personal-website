import type { Metadata } from "next";

import { pick } from "./copy";
import { text } from "./projects";
import { alternates, type NeutralPath } from "./routes";
import type { Lang, Project } from "./types";

/** 카피가 없으면 데이터에서, 그것도 없으면 필드 자체를 비운다. */
export function pageMeta(
  lang: Lang,
  path: NeutralPath,
  title: string,
  description: string,
): Metadata {
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: alternates(path, lang),
  };
}

export function projectMeta(p: Project, lang: Lang): Metadata {
  const title =
    pick(lang, "META-" + p.slug + "-title", "META-" + p.slug + ".title") ||
    text(p.title, lang);
  const description =
    pick(
      lang,
      "META-" + p.slug + "-desc",
      "META-" + p.slug + ".description",
      "META-" + p.slug,
    ) || text(p.tagline, lang);
  return pageMeta(lang, "/projects/" + p.slug, title, description);
}

export function homeMeta(lang: Lang): Metadata {
  const title = pick(
    lang,
    "META-home-title",
    "META-home.title",
    "SITE-NAME",
    "HERO-1",
  );
  const description = pick(
    lang,
    "META-home-desc",
    "META-home.description",
    "HERO-2",
  );
  return {
    // 홈 제목에는 사이트 이름이 이미 들어 있으므로 레이아웃 템플릿을 덧붙이지 않는다.
    ...(title ? { title: { absolute: title } } : {}),
    ...(description ? { description } : {}),
    alternates: alternates("/", lang),
  };
}

export function aboutMeta(lang: Lang): Metadata {
  return pageMeta(
    lang,
    "/about",
    pick(lang, "META-about-title", "META-about.title", "ABOUT-TITLE"),
    pick(lang, "META-about-desc", "META-about.description", "ABOUT-1"),
  );
}

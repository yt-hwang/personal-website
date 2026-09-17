import type { Lang } from "./types";

export const LANGS: Lang[] = ["ko", "en"];

/** 언어 중립 경로 — "/", "/about", "/projects/<slug>" */
export type NeutralPath = string;

/** ko 는 접두사 없음, en 은 /en 접두사 (IA 6.2) */
export function href(lang: Lang, p: NeutralPath): string {
  const clean = p === "/" ? "" : p;
  return lang === "ko" ? clean || "/" : "/en" + clean;
}

export function otherLang(lang: Lang): Lang {
  return lang === "ko" ? "en" : "ko";
}

export const LANG_LABEL: Record<Lang, string> = { ko: "한국어", en: "English" };
export const LANG_SHORT: Record<Lang, string> = { ko: "KO", en: "EN" };

/** hreflang 3종 — ko / en / x-default=ko (IA 6.2) */
export function alternates(p: NeutralPath, lang: Lang = "ko") {
  return {
    canonical: href(lang, p),
    languages: {
      ko: href("ko", p),
      en: href("en", p),
      "x-default": href("ko", p),
    },
  };
}

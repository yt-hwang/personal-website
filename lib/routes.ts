import type { Lang } from "./types";

/**
 * 기본 언어는 **영어**다 (2026-09-18, `_workspace/00_purpose.md` 언어 정책 변경).
 *   `/`      영어 (접두사 없음)
 *   `/ko`    한국어
 * 이전에는 반대였다(`/` = ko, `/en` = en). 이미 나간 `/en*` 주소는
 * `next.config.ts` 의 영구 리다이렉트가 접두사 없는 주소로 보낸다.
 *
 * 목록의 첫 항목이 기본 언어다 — hreflang 의 x-default 도 여기서 나온다.
 */
export const LANGS: Lang[] = ["en", "ko"];

export const DEFAULT_LANG: Lang = "en";

/** 언어 중립 경로 — "/", "/about", "/projects/<slug>" */
export type NeutralPath = string;

/** 기본 언어(en)는 접두사 없음, 한국어는 `/ko` 접두사 */
export function href(lang: Lang, p: NeutralPath): string {
  const clean = p === "/" ? "" : p;
  return lang === DEFAULT_LANG ? clean || "/" : "/" + lang + clean;
}

export function otherLang(lang: Lang): Lang {
  return lang === "ko" ? "en" : "ko";
}

export const LANG_LABEL: Record<Lang, string> = { ko: "한국어", en: "English" };
export const LANG_SHORT: Record<Lang, string> = { ko: "KO", en: "EN" };

/** hreflang 3종 — en / ko / x-default=en (기본 언어) */
export function alternates(p: NeutralPath, lang: Lang = DEFAULT_LANG) {
  return {
    canonical: href(lang, p),
    languages: {
      en: href("en", p),
      ko: href("ko", p),
      "x-default": href(DEFAULT_LANG, p),
    },
  };
}

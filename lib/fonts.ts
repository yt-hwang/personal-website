import { Hahmlet, IBM_Plex_Mono, IBM_Plex_Sans_KR } from "next/font/google";

/**
 * 폰트는 next/font/google 로 빌드 타임에 셀프 호스팅한다. 런타임 외부 CDN 호출 없음.
 *
 * 한국어가 1순위 언어다. Hahmlet 과 IBM Plex Sans KR 은 구글 폰트 CSS 에서
 * 한글 글리프를 이름 없는 unicode-range 조각(각 90여 개)으로 내려주는데,
 * next/font 는 CSS 에 있는 파일을 **전부** 내려받아 셀프 호스팅하고
 * `subsets` 에 적은 것만 preload 한다(node_modules/next/.../find-font-files-in-css.js).
 * 그래서 `subsets: ["latin"]` 이어도 한글은 우리 오리진에서 정상으로 나온다 —
 * preload 링크만 라틴 조각으로 제한되어 <head> 가 90개 링크로 불어나지 않는다.
 */

/*
 * 변수 이름은 `--ff-*` 로 둔다. Tailwind 테마 키(`--font-display`/`--font-sans`/`--font-mono`)와
 * 같은 이름을 쓰면 :root 에서 `--font-mono: var(--font-mono), ...` 같은 자기참조가 생겨
 * 값이 무효가 된다(빌드 산출물에서 실제로 확인했다).
 */

/** 디스플레이 — 제목·프로젝트명. 한글·라틴 모두 지원하는 세리프. */
export const display = Hahmlet({
  subsets: ["latin"],
  variable: "--ff-display",
  display: "swap",
});

/** 본문 */
export const body = IBM_Plex_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--ff-body",
  display: "swap",
});

/** 메타데이터·라벨·수치 */
export const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--ff-mono",
  display: "swap",
});

export const fontClass =
  display.variable + " " + body.variable + " " + mono.variable;

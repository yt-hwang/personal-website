import { IBM_Plex_Mono, Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";

/**
 * 폰트는 next/font/google 로 빌드 타임에 셀프 호스팅한다. 런타임 외부 CDN 호출 없음.
 *
 * 서체 선택의 근거는 `_workspace/09_design_reference.md` 다.
 * 레퍼런스(timmyomahony.com)는 디스플레이에 Noto Serif JP, 본문에 Inter 를 쓴다.
 *   - Noto Serif JP → **Noto Serif KR**. 같은 슈퍼패밀리의 한국어판이라 한글이 폴백으로 안 떨어진다.
 *   - Inter → **Noto Sans KR**. Inter 에는 한글 글리프가 아예 없다.
 *     같은 "중립적 그로테스크" 역할을 하면서 한국어를 지원하는 형제 서체로 바꾼다.
 *   - IBM Plex Mono → 레퍼런스와 동일. 알약 버튼과 수치 표기에만 쓴다.
 *
 * 한국어가 1순위 언어다. 두 Noto 한국어 폰트는 구글 폰트 CSS 에서 한글 글리프를
 * 이름 없는 unicode-range 조각(각 100여 개)으로 내려주는데, next/font 는 CSS 에 있는 파일을
 * **전부** 내려받아 셀프 호스팅하고 `subsets` 에 적은 것만 preload 한다
 * (node_modules/next/.../find-font-files-in-css.js).
 * 그래서 `subsets: ["latin"]` 이어도 한글은 우리 오리진에서 정상으로 나온다 —
 * preload 링크만 라틴 조각으로 제한되어 <head> 가 100개 링크로 불어나지 않는다.
 *
 * 두 Noto 는 **가변 폰트**로 받는다(weight 를 적지 않으면 variable). 정적 weight 를 두 개
 * 적으면 조각 파일 수가 두 배가 되는데, 가변이면 한 벌로 500(기본)과 700(강조)을 다 쓴다.
 * 레퍼런스의 "한 문장 안에서 굵기를 바꿔 강조한다"(진짜 이유 §7)를 공짜로 얻는다.
 */

/*
 * 변수 이름은 `--ff-*` 로 둔다. Tailwind 테마 키(`--font-display`/`--font-sans`/`--font-mono`)와
 * 같은 이름을 쓰면 :root 에서 `--font-mono: var(--font-mono), ...` 같은 자기참조가 생겨
 * 값이 무효가 된다(빌드 산출물에서 실제로 확인했다).
 */

/** 디스플레이 — 제목·프로젝트명. 기본 굵기 500 은 globals.css 의 `.t-*` 가 지정한다. */
export const display = Noto_Serif_KR({
  subsets: ["latin"],
  variable: "--ff-display",
  display: "swap",
});

/** 본문 · 마이크로 라벨 */
export const body = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--ff-body",
  display: "swap",
});

/** 알약 버튼 · 기간 · 수치 */
export const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--ff-mono",
  display: "swap",
});

export const fontClass =
  display.variable + " " + body.variable + " " + mono.variable;

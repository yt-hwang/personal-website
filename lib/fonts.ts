import { Inter, Noto_Sans_KR } from "next/font/google";

/** 폰트는 next/font 로 빌드 타임에 셀프 호스팅한다. 런타임 외부 CDN 호출 없음. */
export const latin = Inter({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
});

export const hangul = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-hangul",
  display: "swap",
});

export const fontClass = latin.variable + " " + hangul.variable;

import fs from "node:fs";
import path from "node:path";

/**
 * 래스터 아이콘처럼 CSS 변수를 못 쓰는 자리에서 토큰 값을 꺼내 쓴다.
 * 색 리터럴을 두 번 적지 않기 위해 globals.css 의 라이트 팔레트를 그대로 읽는다.
 */
const CSS_PATH = path.join(process.cwd(), "app", "globals.css");

let cache: Record<string, string> | null = null;

function lightTokens(): Record<string, string> {
  if (cache) return cache;
  const out: Record<string, string> = {};
  try {
    const css = fs.readFileSync(CSS_PATH, "utf8");
    // 첫 :root 블록 = 라이트 팔레트
    const block = css.slice(css.indexOf(":root {"), css.indexOf("}"));
    for (const m of block.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) {
      out[m[1]] = m[2].trim();
    }
  } catch {
    // 토큰을 못 읽어도 빌드를 막지 않는다. 호출부가 기본값을 쓴다.
  }
  cache = out;
  return cache;
}

export function token(name: string, fallback: string): string {
  return lightTokens()[name] || fallback;
}

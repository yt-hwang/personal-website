import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 하네스 정의는 사이트 소스가 아니다. 우리 스킬·에이전트는 마크다운이라
    // 린트 대상이 없지만, 외부 도구를 설치하면 번들된 JS 가 딸려 들어와
    // 사이트 코드의 린트 결과를 덮어버린다 (실측: 외부 UI 린터 1개가 경고 94건).
    ".claude/**",
  ]),
]);

export default eslintConfig;

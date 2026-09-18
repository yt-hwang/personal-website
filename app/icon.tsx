import { ImageResponse } from "next/og";

import { pick } from "@/lib/copy";
import { token } from "@/lib/tokens";

/**
 * 파비콘을 코드로 생성한다 — 텍스트 전용 사이트라 받아올 이미지 자산이 없고,
 * 외부 자산을 내려받지 않는다는 원칙도 그대로 지킨다.
 * 글자는 사이트 이름에서 머리글자를 따고, 색은 globals.css 의 라이트 토큰을 읽어 쓴다.
 * 강조색을 면적으로 쓰지 않는 원칙(레퍼런스 §6)에 맞춰 검정 바탕 + 본 화이트 글자로 둔다.
 */
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

function initials(): string {
  // 라틴 글자만 쓴다 — ImageResponse 기본 폰트에 한글 글리프가 없다.
  const name = pick("en", "SITE-NAME");
  const letters = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter((c) => /[A-Za-z]/.test(c ?? ""))
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return letters || "·";
}

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: token("ink", "#000000"),
          color: token("bg", "#f0f0e8"),
          fontSize: 34,
          fontWeight: 600,
          letterSpacing: -1,
        }}
      >
        {initials()}
      </div>
    ),
    size,
  );
}

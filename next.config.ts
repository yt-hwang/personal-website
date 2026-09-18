import type { NextConfig } from "next";

/**
 * 기본 언어를 한국어 → 영어로 뒤집으면서(`/` = en, `/ko` = ko)
 * **이미 나간 영어 주소(`/en`, `/en/*`)를 깨지 않는다.** 308 영구 리다이렉트로 접두사를 떼어낸다.
 *
 * 기존 한국어 주소(`/about`, `/projects/<slug>`)는 리다이렉트하지 않는다 —
 * 같은 콘텐츠의 영어판이 그 자리에 그대로 서기 때문이다(주소가 살아 있고 내용이 대응된다).
 * 한국어를 원하는 방문자는 헤더의 KO 토글이 같은 경로의 `/ko...` 로 보낸다.
 */
const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/:path*", destination: "/:path*", permanent: true },
    ];
  },
};

export default nextConfig;

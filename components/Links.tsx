import Link from "next/link";

import type { Lang } from "@/lib/types";
import { ui } from "@/lib/ui";

import { BackIcon, ExternalIcon, ForwardIcon } from "./Icon";

/**
 * 링크·버튼의 역할별 생김새를 여기 한 곳에서 고정한다 (닐슨 4 — 일관성과 표준).
 *
 *   OutLink        외부로 나간다        → 강조색 + 밑줄 + ArrowUpRight, 새 탭 안내를 스크린리더에 남긴다
 *   GoLink         사이트 안으로 들어간다 → 강조색 + 밑줄 + ArrowRight
 *   BackLink       되돌아간다           → 마이크로 라벨 + ArrowLeft
 *   PrimaryAction  주 행동 1개          → 검정 알약 + 모노 (레퍼런스 §8)
 *   GhostAction    보조 행동            → 테두리 알약 + 모노
 *
 * 외부 링크는 예외 없이 ArrowUpRight 를 달고, 내부 링크는 절대 달지 않는다.
 *
 * 강조색은 **링크와 마이크로 라벨에만** 쓴다(레퍼런스 §6 — 면적으로 쓰지 않는다).
 * 그래서 채워진 알약도 강조색이 아니라 검정(--ink)이다.
 */

const INLINE =
  "inline-flex items-center gap-1.5 text-accent underline decoration-from-font underline-offset-[0.3em] decoration-accent/40 hover:decoration-accent";

export function OutLink({
  href,
  lang,
  children,
  className = "",
}: {
  href: string;
  lang: Lang;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={INLINE + " " + className}
    >
      {children}
      <ExternalIcon />
      <span className="sr-only">({ui(lang, "UI.newTab")})</span>
    </a>
  );
}

export function GoLink({
  href,
  children,
  className = "",
  ...rest
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
} & Omit<React.ComponentProps<typeof Link>, "href" | "children" | "className">) {
  return (
    <Link href={href} className={INLINE + " " + className} {...rest}>
      {children}
      <ForwardIcon />
    </Link>
  );
}

export function BackLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={
        "t-micro inline-flex items-center gap-2.5 text-accent hover:text-ink " +
        className
      }
    >
      <BackIcon />
      {children}
    </Link>
  );
}

export function PrimaryAction({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="pill border border-ink bg-ink text-bg hover:bg-bg hover:text-ink"
    >
      {children}
    </Link>
  );
}

export function GhostAction({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="pill border border-ink text-ink hover:bg-ink hover:text-bg"
    >
      {children}
    </Link>
  );
}

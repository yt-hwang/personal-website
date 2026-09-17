import Link from "next/link";

import type { Lang } from "@/lib/types";
import { ui } from "@/lib/ui";

import { BackIcon, ExternalIcon, ForwardIcon } from "./Icon";

/**
 * 링크·버튼의 역할별 생김새를 여기 한 곳에서 고정한다 (닐슨 4 — 일관성과 표준).
 *
 *   OutLink        외부로 나간다        → 밑줄 + ArrowUpRight, 새 탭 안내를 스크린리더에 남긴다
 *   GoLink         사이트 안으로 들어간다 → 밑줄 + ArrowRight
 *   BackLink       되돌아간다           → ArrowLeft 가 앞에 온다
 *   PrimaryAction  주 행동 1개
 *   GhostAction    보조 행동
 *
 * 외부 링크는 예외 없이 ArrowUpRight 를 달고, 내부 링크는 절대 달지 않는다.
 * 방문자가 "이 링크는 사이트를 떠난다"를 매번 같은 신호로 읽게 만든다.
 */

const INLINE =
  "inline-flex items-center gap-1.5 text-accent underline decoration-from-font underline-offset-4 decoration-[var(--rule-strong)] hover:decoration-[var(--accent)] hover:text-accent-strong";

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
        "inline-flex items-center gap-1.5 font-mono text-[0.75rem] tracking-[0.08em] text-ink-muted uppercase hover:text-accent " +
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
      className="inline-flex items-center gap-2 bg-accent px-4 py-2 font-mono text-[0.75rem] tracking-[0.1em] text-accent-on uppercase hover:bg-accent-strong"
    >
      {children}
      <ForwardIcon />
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
      className="inline-flex items-center gap-2 border border-[var(--rule-strong)] px-4 py-2 font-mono text-[0.75rem] tracking-[0.1em] text-ink uppercase hover:border-[var(--accent)] hover:text-accent"
    >
      {children}
      <ForwardIcon />
    </Link>
  );
}

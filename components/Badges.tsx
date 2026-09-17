import { pick, t } from "@/lib/copy";
import type { Lang } from "@/lib/types";
import { teamBadge, ui } from "@/lib/ui";

import { LockIcon } from "./Icon";

/**
 * 메타 표기 — 알약 배지를 쓰지 않는다.
 * 기술 문서의 난외 표기처럼 모노 대문자 라벨 + 신호색으로 상태를 싣는다.
 * 색만으로 뜻을 전하지 않는다 — 라벨 문자열이 항상 함께 있다.
 */

const LABEL =
  "font-mono text-[0.6875rem] leading-5 tracking-[0.14em] uppercase whitespace-nowrap";

const STATUS_COLOR: Record<string, string> = {
  active: "text-sig-active",
  live: "text-sig-live",
  planning: "text-sig-planning",
};

export function StatusMark({ lang, status }: { lang: Lang; status: string }) {
  if (!status) return null;
  // 라벨은 카피 슬롯이 있으면 그것을, 없으면 데이터 원값을 쓴다.
  const label =
    pick(lang, "STATUS-LABEL-" + status.toUpperCase(), "STATUS." + status) ||
    status;
  const tone = STATUS_COLOR[status] ?? "text-ink-subtle";
  return <span className={LABEL + " " + tone}>{label}</span>;
}

export function TeamMark({ lang, count }: { lang: Lang; count: number }) {
  if (count <= 0) return null;
  return (
    <span className={LABEL + " text-ink-subtle"}>{teamBadge(lang, count)}</span>
  );
}

export function LimitedMark({ lang }: { lang: Lang }) {
  const label = t(lang, "LIMITED-BADGE") || ui(lang, "UI.detailNone");
  if (!label) return null;
  return (
    <span
      className={LABEL + " inline-flex items-center gap-1 text-sig-held"}
    >
      <LockIcon className="size-3" />
      {label}
    </span>
  );
}

/** 카드·상세에서 프로젝트가 어느 그룹인지 보여준다 (닐슨 6 — 회상보다 인식). */
export function GroupMark({ label }: { label: string }) {
  if (!label) return null;
  return <span className={LABEL + " text-ink-subtle"}>{label}</span>;
}

export function StackList({
  stack,
  max = 0,
}: {
  stack: string[];
  max?: number;
}) {
  if (!stack.length) return null;
  const shown = max > 0 ? stack.slice(0, max) : stack;
  const rest = stack.length - shown.length;
  return (
    <ul className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.6875rem] leading-5 text-ink-subtle">
      {shown.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden="true">/</span>}
          <span>{s}</span>
        </li>
      ))}
      {rest > 0 && (
        <li className="flex items-center gap-2">
          <span aria-hidden="true">/</span>
          <span>+{rest}</span>
        </li>
      )}
    </ul>
  );
}

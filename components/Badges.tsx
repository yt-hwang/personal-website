import { pick, t } from "@/lib/copy";
import type { Lang } from "@/lib/types";
import { teamBadge, ui } from "@/lib/ui";

const STATUS_CLASS: Record<string, string> = {
  active: "bg-[var(--badge-active-bg)] text-[var(--badge-active-text)]",
  live: "bg-[var(--badge-live-bg)] text-[var(--badge-live-text)]",
  planning: "bg-[var(--badge-planning-bg)] text-[var(--badge-planning-text)]",
};

const BASE =
  "inline-flex items-center rounded-full px-2 py-0.5 text-[0.6875rem] font-medium leading-5 whitespace-nowrap";

export function StatusBadge({ lang, status }: { lang: Lang; status: string }) {
  if (!status) return null;
  // 라벨은 카피 슬롯이 있으면 그것을, 없으면 데이터 원값을 쓴다.
  const label = pick(
    lang,
    "STATUS-LABEL-" + status.toUpperCase(),
    "STATUS." + status,
  ) || status;
  const tone = STATUS_CLASS[status] ?? "bg-chip-bg text-chip-text";
  return <span className={BASE + " " + tone}>{label}</span>;
}

export function TeamBadge({ lang, count }: { lang: Lang; count: number }) {
  if (count <= 0) return null;
  return (
    <span className={BASE + " bg-accent-weak text-[var(--accent-weak-text)]"}>
      {teamBadge(lang, count)}
    </span>
  );
}

export function LimitedBadge({ lang }: { lang: Lang }) {
  const label = t(lang, "LIMITED-BADGE") || ui(lang, "UI.detailNone");
  if (!label) return null;
  return (
    <span
      className={
        BASE +
        " bg-[var(--badge-limited-bg)] text-[var(--badge-limited-text)]"
      }
    >
      {label}
    </span>
  );
}

export function StackChips({
  stack,
  max = 3,
}: {
  stack: string[];
  max?: number;
}) {
  if (!stack.length) return null;
  const shown = max > 0 ? stack.slice(0, max) : stack;
  const rest = stack.length - shown.length;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {shown.map((s) => (
        <li
          key={s}
          className="rounded-md bg-chip-bg px-2 py-0.5 text-[0.6875rem] leading-5 text-chip-text"
        >
          {s}
        </li>
      ))}
      {rest > 0 && (
        <li className="px-1 py-0.5 text-[0.6875rem] leading-5 text-text-subtle">
          +{rest}
        </li>
      )}
    </ul>
  );
}

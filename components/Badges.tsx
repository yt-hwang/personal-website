import { Fragment } from "react";

import { pick, t } from "@/lib/copy";
import type { Lang } from "@/lib/types";
import { teamBadge, ui } from "@/lib/ui";

import { LockIcon } from "./Icon";

/**
 * 메타 표기 — 알약 배지도, 배지 더미도 쓰지 않는다.
 *
 * 레퍼런스가 깔끔한 이유 §2("한 화면에 요소가 적다")에 대한 답이다.
 * 이전 디자인은 카드 하나에 그룹·상태·팀·비공개 표식이 **네 덩어리**로 따로 떠 있었다.
 * 지금은 두 가지만 남는다.
 *   ① 그룹 라벨 — 제목 위에 강조색 마이크로 라벨 한 줄 (닐슨 6, 이 자리는 비우지 않는다)
 *   ② 나머지 사실 전부 — 제목 아래 **가운뎃점으로 이은 한 줄**(모노 13px)
 *
 * 색으로 뜻을 전하지 않는다. 상태별 신호색(sig-*)을 팔레트에서 아예 없앴다 —
 * 상태는 글자로만 말하고, 색은 링크와 마이크로 라벨에만 쓴다(레퍼런스 §6).
 */

/** 카드·상세에서 프로젝트가 어느 그룹인지 보여준다 (닐슨 6 — 회상보다 인식). */
export function GroupMark({ label }: { label: string }) {
  if (!label) return null;
  return <span className="t-micro text-accent">{label}</span>;
}

/** 라벨은 카피 슬롯이 있으면 그것을, 없으면 데이터 원값을 쓴다. */
export function statusLabel(lang: Lang, status: string): string {
  if (!status) return "";
  return (
    pick(lang, "STATUS-LABEL-" + status.toUpperCase(), "STATUS." + status) ||
    status
  );
}

export function teamLabel(lang: Lang, count: number): string {
  return count > 0 ? teamBadge(lang, count) : "";
}

/** 스택은 슬래시로 잇는다. 칩을 만들지 않는다. */
export function stackLabel(stack: string[], max = 0): string {
  if (!stack.length) return "";
  const shown = max > 0 ? stack.slice(0, max) : stack;
  const rest = stack.length - shown.length;
  return shown.join(" / ") + (rest > 0 ? " / +" + rest : "");
}

/** limited 프로젝트에만 붙는다 — 죽은 링크 대신 상태를 보인다 (닐슨 5). */
export function LimitedMark({ lang }: { lang: Lang }) {
  const label = t(lang, "LIMITED-BADGE") || ui(lang, "UI.detailNone");
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1.5">
      <LockIcon className="size-3.5" />
      {label}
    </span>
  );
}

/**
 * 사실을 한 줄로 잇는다. 빈 값은 통째로 빠지므로 " ·  · " 같은 꼬리가 남지 않는다.
 * 문자열과 노드(자물쇠 표식)를 함께 받는다.
 *
 * **flex 가 아니라 보통의 글 흐름이다.** flex 로 깔면 항목 하나(예: 긴 스택 문자열)가
 * 줄바꿈되지 않는 한 덩어리가 되어 좁은 칸에서 칸 밖으로 삐져나간다(카드가 두 칸이 되면서 실제로 그랬다).
 * 문장처럼 흘리면 칸 폭에 맞춰 알아서 접힌다.
 */
export function MetaLine({
  items,
  className = "",
}: {
  items: React.ReactNode[];
  className?: string;
}) {
  const shown = items.filter(Boolean);
  if (!shown.length) return null;
  return (
    <p className={"t-meta text-ink-soft " + className}>
      {shown.map((node, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span aria-hidden="true" className="px-2.5 opacity-60">
              ·
            </span>
          )}
          {node}
        </Fragment>
      ))}
    </p>
  );
}

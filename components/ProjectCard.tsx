import Link from "next/link";

import { t } from "@/lib/copy";
import {
  cardShowsMeta,
  groupMeta,
  hasDetailPage,
  periodLabel,
  renderableLinks,
  text,
} from "@/lib/projects";
import { href } from "@/lib/routes";
import type { Lang, Project } from "@/lib/types";
import { ui } from "@/lib/ui";

import {
  GroupMark,
  LimitedMark,
  MetaLine,
  stackLabel,
  statusLabel,
  teamLabel,
} from "./Badges";
import { ExternalLinks } from "./ExternalLinks";
import { GoLink } from "./Links";

/**
 * 프로젝트 카드는 **한 종류**다. 프로젝트마다 다른 레이아웃을 만들지 않는다.
 * 갈리는 것은 그룹의 밀도(`GROUP_META[].density`) 하나뿐이다.
 *
 * ── 이미지가 없는데 어떻게 그리드의 여백감을 내는가 (이번 재디자인의 핵심 문제)
 *
 * 레퍼런스는 "최근 작업"을 이미지 3열 그리드로 보여준다. 우리는 쓸 수 있는 이미지가 0장이다
 * (`assets[].cleared` 전부 false). 빈 박스나 회색 플레이스홀더를 두면 즉시 미완성으로 읽힌다.
 *
 * 그래서 **이미지가 하던 두 가지 일을 각각 다른 것으로 대신한다.**
 *   ① 덩어리감(mass) → 큰 세리프 제목. 28~40px 제목이 한 항목의 시각적 무게를 혼자 진다.
 *      이미지 대신 **글자 자체가 그림**이 된다. 그래서 제목만 크게 두고 나머지는 전부 16px 이하로 눌렀다.
 *   ② 리듬(rhythm) → **좌우로 번갈아 들어가는 비대칭 열**. 3열 그리드가 만들던 "찼다 / 비었다"의
 *      교차를, 12열 격자에서 항목이 홀수는 왼쪽(1~7열)·짝수는 오른쪽(5~12열)에 놓이며 만든다.
 *      비는 칸은 플레이스홀더가 아니라 **아무것도 없는 격자 칸**이다. 그릴 게 없으면 그리지 않는다.
 * 항목 사이는 가는 규칙선 하나와 큰 세로 여백(최대 4.5rem × 2)으로 끊는다.
 *
 * 카드만 보고도 "무엇이고 어느 그룹인가"를 알 수 있어야 한다(닐슨 6) —
 * 그룹 라벨이 제목 위 강조색 마이크로 라벨로 항상 붙는다.
 * 데이터가 없는 필드는 요소 자체를 렌더하지 않는다(닐슨 5).
 */

const PLATE = "border-t border-rule py-10 sm:py-14 lg:py-[4.5rem]";
const ROW = "border-t border-rule py-7 sm:py-9";

/** 홀수는 왼쪽 열, 짝수는 오른쪽 열 — 대칭 그리드를 만들지 않는다(레퍼런스 §5). */
function bayColumn(index: number): string {
  return index % 2 === 1
    ? "lg:col-span-7"
    : "lg:col-start-5 lg:col-span-8";
}

function Title({
  p,
  lang,
  className,
}: {
  p: Project;
  lang: Lang;
  className: string;
}) {
  const title = text(p.title, lang);
  if (!title) return null;
  // limited 카드는 <a> 로 만들지 않는다 — 커서만 바뀌고 아무 일도 안 일어나면 버그로 읽힌다.
  return (
    <h3 className={className}>
      {hasDetailPage(p) ? (
        <Link
          href={href(lang, "/projects/" + p.slug)}
          className="underline decoration-transparent decoration-from-font underline-offset-[0.25em] hover:text-accent hover:decoration-accent"
        >
          {title}
        </Link>
      ) : (
        title
      )}
    </h3>
  );
}

function facts(p: Project, lang: Lang, maxStack: number): React.ReactNode[] {
  const meta = cardShowsMeta(p);
  return [
    statusLabel(lang, p.status),
    periodLabel(p),
    meta ? teamLabel(lang, p.agent_team.count) : "",
    meta ? stackLabel(p.stack, maxStack) : "",
    p.visibility === "limited" ? <LimitedMark key="lim" lang={lang} /> : "",
  ];
}

function Actions({
  p,
  lang,
  className = "",
}: {
  p: Project;
  lang: Lang;
  className?: string;
}) {
  const links = renderableLinks(p);
  if (!hasDetailPage(p) && !links.length) return null;
  return (
    <div className={"flex flex-wrap items-center gap-x-7 gap-y-2 " + className}>
      {hasDetailPage(p) && (
        <GoLink href={href(lang, "/projects/" + p.slug)}>
          {ui(lang, "UI.detail")}
        </GoLink>
      )}
      <ExternalLinks links={links} lang={lang} />
    </div>
  );
}

/** 에이전트 시스템 — 한 항목이 한 판(plate)을 쓴다. 제목이 이미지 자리를 대신한다. */
function Plate({
  p,
  lang,
  index,
  groupLabel,
}: {
  p: Project;
  lang: Lang;
  index: number;
  groupLabel: string;
}) {
  const tagline = text(p.tagline, lang);
  const role = text(p.role, lang);
  const meta = cardShowsMeta(p);

  return (
    <article className={"bay " + PLATE}>
      <div className={bayColumn(index)}>
        <GroupMark label={groupLabel} />

        <Title p={p} lang={lang} className="t-title mt-4" />

        {/* 무엇을 만들었나만큼 어떤 위치였나가 중요하다. 역할을 제목 바로 아래 둔다. */}
        {meta && role && <p className="t-meta mt-3 text-ink">{role}</p>}

        {tagline && <p className="measure-tight mt-6">{tagline}</p>}

        <MetaLine items={facts(p, lang, 4)} className="mt-6" />

        <Actions p={p} lang={lang} className="mt-7" />
      </div>
    </article>
  );
}

/**
 * 앱 — 한 줄이면 끝나는 항목. 제목과 한 줄 설명을 **한 문장처럼 이어** 싣는다.
 * 같은 줄 안에서 서체·굵기·크기가 바뀌며 위계를 만든다(레퍼런스 §7).
 */
function Row({
  p,
  lang,
  groupLabel,
}: {
  p: Project;
  lang: Lang;
  groupLabel: string;
}) {
  const tagline = text(p.tagline, lang);

  return (
    <article className={"bay " + ROW}>
      <div className="lg:col-span-9 lg:col-start-2">
        <p>
          <Title p={p} lang={lang} className="t-sub inline" />
          {tagline && (
            <span className="ml-2.5 align-baseline">
              <span aria-hidden="true" className="mr-2.5 text-ink-soft">
                —
              </span>
              {tagline}
            </span>
          )}
        </p>

        <MetaLine
          items={[groupLabel, ...facts(p, lang, 3)]}
          className="mt-3.5"
        />

        <Actions p={p} lang={lang} className="mt-4" />
      </div>
    </article>
  );
}

export function ProjectCard({
  p,
  lang,
  index,
}: {
  p: Project;
  lang: Lang;
  index: number;
}) {
  if (!text(p.title, lang)) return null;
  const g = groupMeta(p.group);
  const groupLabel = t(lang, g.navSlot);
  return g.density === "compact" ? (
    <Row p={p} lang={lang} groupLabel={groupLabel} />
  ) : (
    <Plate p={p} lang={lang} index={index} groupLabel={groupLabel} />
  );
}

/** 목록은 대칭 카드 그리드가 아니라 규칙선으로 나뉜 판들이다. */
export function ProjectList({ items, lang }: { items: Project[]; lang: Lang }) {
  if (!items.length) return null;
  return (
    <ul>
      {items.map((p, i) => (
        <li key={p.slug}>
          <ProjectCard p={p} lang={lang} index={i + 1} />
        </li>
      ))}
    </ul>
  );
}

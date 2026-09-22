import Link from "next/link";

import { t } from "@/lib/copy";
import {
  cardShowsMeta,
  groupMeta,
  hasDetailPage,
  list,
  periodLabel,
  renderableLinks,
  stageOf,
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
 * ── 이미지가 없는데 어떻게 그리드의 여백감을 내는가
 *
 * 레퍼런스는 "최근 작업"을 이미지 3열 그리드로 보여준다. 우리는 쓸 수 있는 이미지가 0장이다
 * (`assets[].cleared` 전부 false). 빈 박스나 회색 플레이스홀더를 두면 즉시 미완성으로 읽힌다.
 *
 *   ① 덩어리감(mass) → 큰 세리프 제목. 28~40px 제목이 한 항목의 시각적 무게를 혼자 진다.
 *      이미지 대신 **글자 자체가 그림**이 된다. 그래서 제목만 크게 두고 나머지는 전부 16px 이하로 눌렀다.
 *   ② **판은 두 칸이다.** 2026-09-18 이전에는 판 하나가 한 칸만 쓰고 홀수는 왼쪽·짝수는 오른쪽에
 *      번갈아 놓였다. 맞은편 칸은 원래 작업 스크린샷이 들어갈 자리였고, 사진이 없으니
 *      여섯 판 내내 큰 빈 사각형이 따라다녔다 — 여백이 아니라 빠진 것으로 읽혔다.
 *      지금은 그 칸에 **이미 데이터에 있는 사실**을 넣는다:
 *        왼쪽 = 정체·사실·행동 (그룹 · 이름 · 역할 · 메타 줄 · 링크)
 *        오른쪽 = 서술·근거 (한 줄 설명 · 하이라이트 2개)
 *      새 사실을 지어내지 않았다. 하이라이트는 그때까지 상세 페이지에만 있던 데이터다.
 *      `limited` 카드는 하이라이트를 싣지 않는다(공개 게이트: "limited 는 한 문장 + 태그만").
 *      오른쪽 칸에 실을 것이 하나도 없으면 두 칸으로 나누지 않고 왼쪽 칸을 넓힌다 —
 *      빈 칸을 만들 바에는 칸을 안 만든다.
 *   ③ **홀짝 교차 배치는 철회했다** (2026-09-18). 한 그룹의 항목은 전부 같은 열에 선다.
 *      교차는 레퍼런스의 이미지 3열 그리드의 *모양*만 흉내 낸 것이었고, 이미지가 없으니
 *      결과는 리듬이 아니라 구멍이었다 — 히어로에서 지적받은 "사진 자리가 비어 보인다"를
 *      목록에서 그대로 재생산했다. 게다가 훑는 목록에서 눈이 좌→우→좌로 점프해 스캔이 느려지고,
 *      같은 종류의 항목을 다른 위치에 세우는 것은 **없는 차이를 있는 것처럼 보이게 하는 신호**라
 *      닐슨 4(일관성)에 어긋난다. 항목 사이의 구분은 위치가 아니라 **내용의 무게**가 진다 —
 *      제목 크기, 여백, 메타 줄 유무, 그리고 `GROUP_META[].density`(판 / 행).
 *      비대칭은 역할이 다른 두 요소 사이(섹션 제목 ↔ 리드, 정체 ↔ 근거)에만 쓴다.
 * 항목 사이는 가는 규칙선 하나와 큰 세로 여백(최대 4.5rem × 2)으로 끊는다.
 *
 * 카드만 보고도 "무엇이고 어느 그룹인가"를 알 수 있어야 한다(닐슨 6) —
 * 그룹 라벨이 제목 위 강조색 마이크로 라벨로 항상 붙는다.
 * 데이터가 없는 필드는 요소 자체를 렌더하지 않는다(닐슨 5).
 */

const PLATE = "border-t border-rule py-6 sm:py-7 lg:py-8";
const ROW = "border-t border-rule py-5 sm:py-6";

/**
 * 한 그룹의 항목은 **전부 같은 열에 선다.** 왼쪽 = 정체·사실·행동, 오른쪽 = 서술·근거.
 * 항목마다 위치를 바꾸지 않는다(위 ③).
 */
const IDENTITY_COL = "lg:col-span-5";
const EVIDENCE_COL = "lg:col-span-6 lg:col-start-7";

/** 오른쪽 칸이 통째로 비면 두 칸으로 나누지 않는다. */
const IDENTITY_ALONE = "lg:col-span-9";

/** 카드에 싣는 하이라이트 수. 상세 페이지(3개)보다 하나 적게 둬 카드가 무거워지지 않게 한다. */
const CARD_HIGHLIGHTS = 2;

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

/**
 * 팀 눈금 — `agent_team.members[]` 하나를 눈금 하나로 깐다.
 *
 * 왜 넣는가: 카드 12장이 전부 `기간 · N인 팀 · 스택 3개` 한 줄이라 **무게가 똑같았다.**
 * 11인 팀과 5인 팀의 차이를 숫자로 읽어야만 알 수 있었는데, 눈금이면 훑는 동안 눈에 들어온다.
 * 새 사실을 지어내지 않는다 — 이미 상세 페이지 명부에 있던 것을 길이로 바꿔 놓았을 뿐이다.
 *
 * 세 자리만 표시가 다르다.
 *   조율(오케스트레이터) — 검정 · 키가 크다
 *   게이트(멈출 수 있는 자리) — **강조색** · 가장 크다. 강조색은 이 자리에만 쓴다.
 *   나머지 — 규칙선 색
 * 애니메이션 없음. 이건 움직일 이유가 없는 정지 정보다.
 *
 * 눈금만으로는 뜻이 전달되지 않으므로(색 하나에 기대지 않는다) 게이트가 있는 팀에는
 * 아래에 텍스트 라벨 한 줄이 함께 나간다. 스크린리더에는 눈금 대신 그 문장이 읽힌다.
 */
function TeamGauge({ p, lang }: { p: Project; lang: Lang }) {
  if (!cardShowsMeta(p)) return null;
  const members = p.agent_team.members;
  if (members.length < 2) return null;

  const marks = members.map((m, i) => ({
    key: (m.name.en || m.name.ko || "") + i,
    stage: stageOf(p.slug, m),
  }));
  const gateCount = marks.filter((m) => m.stage === "gate").length;

  return (
    <div className="mt-5">
      <div
        aria-hidden="true"
        data-team-gauge="true"
        className="inline-flex items-end gap-1.5 border-b border-rule pb-1.5"
      >
        {marks.map((m) => (
          <span
            key={m.key}
            className={
              "w-[1.125rem] shrink-0 " +
              (m.stage === "gate"
                ? "h-11 bg-accent"
                : m.stage === "orchestrate"
                  ? "h-8 bg-ink"
                  : "h-5 bg-rule")
            }
          />
        ))}
      </div>
      {gateCount > 0 && (
        <p className="t-meta mt-3 text-accent">
          {ui(lang, "UI.teamStripGate")}
        </p>
      )}
    </div>
  );
}

/** 에이전트 시스템 — 한 항목이 한 판(plate)을 쓴다. 제목이 이미지 자리를 대신한다. */
function Plate({
  p,
  lang,
  groupLabel,
}: {
  p: Project;
  lang: Lang;
  groupLabel: string;
}) {
  const tagline = text(p.tagline, lang);
  const role = text(p.role, lang);
  const meta = cardShowsMeta(p);
  // limited 는 "한 문장 + 태그만" 이다 (05_privacy_gate.md). 하이라이트를 카드에 싣지 않는다.
  const highlights = meta ? list(p.highlights, lang).slice(0, CARD_HIGHLIGHTS) : [];
  const hasEvidence = Boolean(tagline) || highlights.length > 0;

  return (
    <article className={"bay " + PLATE}>
      <div className={hasEvidence ? IDENTITY_COL : IDENTITY_ALONE}>
        <GroupMark label={groupLabel} />

        <Title p={p} lang={lang} className="t-title mt-3" />

        {/* 무엇을 만들었나만큼 어떤 위치였나가 중요하다. 역할을 제목 바로 아래 둔다. */}
        {meta && role && <p className="t-meta mt-2 text-ink">{role}</p>}

        <MetaLine items={facts(p, lang, 4)} className="mt-4" />

        <TeamGauge p={p} lang={lang} />

        <Actions p={p} lang={lang} className="mt-5" />
      </div>

      {hasEvidence && (
        <div className={EVIDENCE_COL}>
          {tagline && <p className="measure-tight">{tagline}</p>}
          {highlights.length > 0 && (
            <ul className={"space-y-3" + (tagline ? " mt-6" : "")}>
              {highlights.map((h) => (
                <li
                  key={h}
                  className="measure-tight border-l border-rule pl-5 text-ink-soft"
                >
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
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
        {/*
          `Title` 이 h3 를 렌더하므로 이 줄을 <p> 로 감싸면 무효 HTML 이 된다 —
          파서는 `<p></p><h3>…` 로 쪼개는데 React 는 `<p><h3>…</p>` 로 만들어
          홈에서만 하이드레이션이 실패한다(#418). 블록 래퍼는 <div> 여야 한다.
        */}
        <div>
          <Title p={p} lang={lang} className="t-sub inline" />
          {tagline && (
            <span className="ml-2.5 align-baseline">
              <span aria-hidden="true" className="mr-2.5 text-ink-soft">
                —
              </span>
              {tagline}
            </span>
          )}
        </div>

        <MetaLine
          items={[groupLabel, ...facts(p, lang, 3)]}
          className="mt-3.5"
        />

        <Actions p={p} lang={lang} className="mt-4" />
      </div>
    </article>
  );
}

export function ProjectCard({ p, lang }: { p: Project; lang: Lang }) {
  if (!text(p.title, lang)) return null;
  const g = groupMeta(p.group);
  const groupLabel = t(lang, g.navSlot);
  return g.density === "compact" ? (
    <Row p={p} lang={lang} groupLabel={groupLabel} />
  ) : (
    <Plate p={p} lang={lang} groupLabel={groupLabel} />
  );
}

/** 목록은 대칭 카드 그리드가 아니라 규칙선으로 나뉜 판들이다. */
export function ProjectList({ items, lang }: { items: Project[]; lang: Lang }) {
  if (!items.length) return null;
  return (
    <ul>
      {items.map((p) => (
        <li key={p.slug}>
          <ProjectCard p={p} lang={lang} />
        </li>
      ))}
    </ul>
  );
}

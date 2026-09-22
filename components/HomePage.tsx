import { paragraphs, pick, roles, t } from "@/lib/copy";
import {
  GRID_GROUPS,
  continuityNote,
  featuredProjects,
  groupMeta,
  hasDetailPage,
  list,
  periodLabel,
  projectsInGroup,
  renderableLinks,
  text,
} from "@/lib/projects";
import { href } from "@/lib/routes";
import type { GroupId, Lang, Project } from "@/lib/types";
import { ui } from "@/lib/ui";

import { MetaLine, stackLabel, statusLabel, teamLabel } from "./Badges";
import { ExternalLinks } from "./ExternalLinks";
import { HarnessFlow, HarnessRail } from "./HarnessFlow";
import { ContactChannels } from "./ContactChannels";
import { GhostAction, GoLink, OutLink, PrimaryAction } from "./Links";
import { ProjectList } from "./ProjectCard";

/**
 * 홈 — `_workspace/09_design_reference.md` 의 시각 언어.
 *
 * 조판을 지배하는 규칙은 세 개다.
 *   ① **여백이 주인공이다.** 섹션 사이가 `clamp(6rem, 17vh, 11rem)` 로 벌어진다.
 *      1080px 높이 화면에서 약 184px — 위아래 여백이 합쳐지면 화면의 3분의 1 이상이 빈다.
 *   ② **한 화면에 요소가 적다.** 섹션 머리는 [마이크로 라벨] [제목] [리드 한 문장] 셋뿐이고,
 *      번호 거터·배지 더미·상태색을 전부 걷어냈다.
 *   ③ **비대칭.** 가운데 정렬을 쓰지 않는다. 히어로 본문은 오른쪽 열에만,
 *      섹션 제목은 왼쪽 5열·리드는 오른쪽 6열에, 프로젝트 판은 좌우로 번갈아 놓인다.
 *
 * 현재 섹션 표시(닐슨 1)는 sticky **마이크로 라벨 한 줄**이 맡는다.
 * 이전 디자인은 섹션 헤더 전체를 붙였는데 여백이 주인공인 조판에서는 그게 화면을 무겁게 만든다.
 */

/*
 * 세로 여백 (2026-09-22 축소).
 * 이전 값은 1440x900 에서 섹션 사이가 **153px** 였다. 여백이 주인공인 조판이라 의도한 값이었는데,
 * 실제 화면에서는 "여백"이 아니라 **죽은 공백**으로 읽혔다 — 밀도가 낮아서가 아니라 빈 곳이 많아서
 * 심심해 보인다는 지적이 맞았다. 상한을 내려 96px 로 줄였다.
 * 덤으로 홈 스크롤 총량이 IA 목표 대역(7~9 화면, `01_architect_ia.md:123`) 안으로 돌아온다.
 */
const SECTION_GAP = "mt-[clamp(2.75rem,7vh,4.25rem)]";
const HEAD_GAP = "mt-[clamp(1.75rem,4vh,2.75rem)]";
const BODY_GAP = "mt-[clamp(2rem,5vh,3.25rem)]";

/**
 * 섹션 하나.
 * 위에 얇은 규칙선 **하나**만 긋는다(레퍼런스 실측: 섹션 사이 가로 규칙선 1개).
 *
 * sticky 마이크로 라벨이 "지금 어느 섹션인가"를 스크롤 내내 화면에 남긴다(닐슨 1).
 * 짧은 내비 라벨(`NAV-*`)이 있으면 그것을, 없으면 섹션 제목을 그대로 쓴다 —
 * **어떤 섹션에서도 표시가 비지 않게** 하기 위해서다(카피가 빠져도 화면이 비지 않는다).
 * 라벨은 `aria-hidden` 이다. 바로 아래 h2 가 같은 말을 이미 하고 있고,
 * 이 줄은 눈으로 위치를 잡기 위한 장치일 뿐이라 스크린리더에서 두 번 읽힐 이유가 없다.
 */
function Section({
  id,
  label,
  heading,
  lead,
  children,
}: {
  id: string;
  label?: string;
  heading: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  const mark = label || heading;
  return (
    <section
      id={id}
      data-section="true"
      className={"scroll-mt-[var(--header-h)] " + SECTION_GAP}
    >
      <div data-section-rule="true" className="h-px w-full bg-rule" />

      {mark && (
        <p
          aria-hidden="true"
          className="sticky top-[var(--header-h)] z-10 bg-bg py-3"
        >
          <span data-section-marker="true" className="t-micro text-accent">
            {mark}
          </span>
        </p>
      )}

      <div className={"bay " + (mark ? HEAD_GAP : "pt-7")}>
        {heading && (
          <h2 className="t-title lg:col-span-5">{heading}</h2>
        )}
        {lead && (
          <p className="t-lead lg:col-span-6 lg:col-start-7">{lead}</p>
        )}
      </div>

      {children && <div className={BODY_GAP}>{children}</div>}
    </section>
  );
}

/** 처음 나오는 내부 용어에는 한 줄 설명을 붙인다 (닐슨 2 — 현실 세계와의 일치). */
function Gloss({ lang, body }: { lang: Lang; body: string }) {
  if (!body) return null;
  return (
    <div className="bay">
      <p className="measure border-l border-rule pl-5 lg:col-span-7">
        <span className="t-micro mr-3 text-accent">{ui(lang, "UI.terms")}</span>
        {body}
      </p>
    </div>
  );
}

/**
 * 한 문장 안에서 굵기를 바꿔 강조한다(레퍼런스 §7).
 * 카피에 이미 있는 가운뎃점을 경계로만 가른다 — 코드가 어디를 강조할지 지어내지 않는다.
 */
function Emphasized({ value }: { value: string }) {
  const i = value.indexOf(" · ");
  if (i < 0) return <>{value}</>;
  return (
    <>
      <span className="font-semibold">{value.slice(0, i)}</span>
      <span className="font-normal">{value.slice(i)}</span>
    </>
  );
}

/** 히어로 왼쪽 열 — 지금 맡고 있는 역할. 자세한 설명(DESC)은 About 에만 둔다. */
const HERO_ROLES = 4;

function CurrentRoles({ lang }: { lang: Lang }) {
  const items = roles(lang, HERO_ROLES).filter((r) => r.org || r.title);
  const continuity = continuityNote(lang);
  if (!items.length && !continuity) return null;
  const label = t(lang, "ROLES-TITLE");

  return (
    <div className="mt-8 lg:col-span-4 lg:col-start-1 lg:row-start-1 lg:mt-0">
      {label && <p className="t-micro text-accent">{label}</p>}
      {items.length > 0 && (
        <ul className={"space-y-5" + (label ? " mt-6" : "")}>
          {items.map((r) => (
            <li key={r.n}>
              {r.org && <p className="t-meta text-ink-soft">{r.org}</p>}
              {r.title && <p className="mt-0.5">{r.title}</p>}
            </li>
          ))}
        </ul>
      )}

      {/*
        역할 4개가 "지금 무엇인가"를 말한다면 이 한 줄은 "얼마나 오래"를 말한다.
        둘은 같은 층의 사실이라 같은 칸에 세운다. 문장은 데이터에서 온다
        (`continuityNote` — featured 커뮤니티 항목의 둘째 문장). 값이 없으면 이 요소는 없다.
      */}
      {continuity && (
        <p className="t-meta mt-7 border-l border-rule pl-5 text-ink-soft">
          {continuity}
        </p>
      )}
    </div>
  );
}

/**
 * 첫 화면 — 위쪽을 크게 비우고 시작한다.
 *
 * 레퍼런스의 히어로는 h1 아래를 **왼쪽 인물 사진 / 오른쪽 본문**으로 나눈다.
 * 우리는 사진을 넣지 않으므로 왼쪽을 비워 두면 그 칸이 "여백"이 아니라 **"빠진 것"** 으로 읽힌다
 * (실제로 그렇게 읽혔다 — 사용자 지적, 2026-09-18).
 * 장식(도형·그라디언트·이니셜)으로 때우지 않고 **이미 카피에 있는 사실**을 넣었다 —
 * 지금 맡고 있는 역할 4개(`ROLE-n-ORG` / `-TITLE`). 채용담당자가 가장 먼저 찾는 정보이고,
 * 그때까지 About 페이지에만 있었다. 비대칭(레퍼런스 §5)은 그대로다: 왼쪽 4열 / 오른쪽 7열.
 *
 * DOM 순서는 [보조문장 + CTA] → [역할] 이다. 좁은 화면에서 CTA 가 역할 목록 아래로
 * 밀려나지 않게 하기 위해서다. 큰 화면에서는 두 칸이 같은 행에 나란히 놓인다.
 */
function Masthead({ lang }: { lang: Lang }) {
  const h1 = t(lang, "HERO-1");
  const sub = t(lang, "HERO-2");
  const cta1 = t(lang, "HERO-CTA-1");
  const cta2 = t(lang, "HERO-CTA-2");

  return (
    <section className="stagger pt-[clamp(2.75rem,11vh,7rem)]">
      {h1 && (
        <h1 className="t-display measure-display">
          <Emphasized value={h1} />
        </h1>
      )}

      <div className={"bay " + HEAD_GAP}>
        <div className="lg:col-span-7 lg:col-start-6 lg:row-start-1">
          {sub && <p className="t-lead">{sub}</p>}
          {(cta1 || cta2) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {cta1 && <PrimaryAction href="#systems">{cta1}</PrimaryAction>}
              {cta2 && <GhostAction href="#contact">{cta2}</GhostAction>}
            </div>
          )}

          {/*
            CTA 아래가 208px 비어 있었다(실측). 왼쪽 열은 역할 4개 + 연속성으로 차 있는데
            오른쪽은 문단 하나와 버튼에서 끝나, `00_purpose.md` 가 경고한 "사진이 빠진 자리"로 읽혔다.
            장식으로 덮지 않고 **아래 하네스 도식의 축소판**을 넣는다 — 같은 `harnessCensus()` 를 읽고
            마디의 위치와 끊김만 남긴 것이라, 스크롤하기 전에 구조가 한 번 보이고
            아래에서 같은 모양이 수치와 함께 펼쳐진다.
          */}
          <div className="mt-[clamp(2.5rem,7vh,4.5rem)]">
            <HarnessRail lang={lang} />
          </div>
        </div>

        <CurrentRoles lang={lang} />
      </div>
    </section>
  );
}

function withProtocol(url: string): string {
  return /^https?:\/\//i.test(url) ? url : "https://" + url;
}

/**
 * 링크 카피는 "레이블 · 주소" 한 줄로 온다 ("소스 보기 · github.com/yt-hwang/personal-website").
 * 주소 부분이 없으면 링크를 만들지 않는다 — 빈 <a href=""> 를 만들지 않기 위해.
 */
function splitLink(
  single: string,
  label: string,
  url: string,
): { label: string; url: string } {
  if (label && url) return { label, url: withProtocol(url) };
  if (!single) return { label: "", url: "" };
  const i = single.indexOf("·");
  if (i < 0) return { label: "", url: "" };
  const l = single.slice(0, i).trim();
  const u = single.slice(i + 1).trim();
  if (!l || !u || !/[a-z]+\.[a-z]/i.test(u)) return { label: "", url: "" };
  return { label: l, url: withProtocol(u) };
}

/**
 * 저장소 링크는 `NEXT_PUBLIC_REPO_URL` 이 설정돼 있을 때만 앵커가 된다.
 * 저장소가 없을 때 주장을 검증하러 온 방문자가 404를 맞는 일이 없게 한다 (닐슨 5).
 */
function repoLink(lang: Lang): { label: string; url: string } {
  const env = (process.env.NEXT_PUBLIC_REPO_URL ?? "").trim();
  if (!env) return { label: "", url: "" };
  const fromCopy = splitLink(
    t(lang, "SELFDEMO-LINK"),
    t(lang, "SELFDEMO-LINK.label"),
    t(lang, "SELFDEMO-LINK.url"),
  );
  const label = fromCopy.label || t(lang, "SELFDEMO-LINK");
  if (!label) return { label: "", url: "" };
  return { label, url: withProtocol(env) };
}

/**
 * 일하는 방식 한 덩어리.
 *
 * **왼쪽 칸에 이름표가 있을 때만 본문을 오른쪽으로 민다.** 이름표 카피(`METHOD-n.title`)가
 * 아직 없어서, 예전에는 본문만 5~12열에 놓이고 왼쪽 네 칸이 네 덩어리 내내 통째로 비어 있었다 —
 * 사진 자리로 읽히는 세로 구멍이었다. 지금은 이름표가 없으면 본문이 왼쪽에서 시작하고,
 * 남는 공간은 오른쪽 바깥(페이지 가장자리)으로 간다. 그건 구멍이 아니라 여백이다.
 * 이름표 슬롯이 생기면 자동으로 [라벨 1~3열][본문 5~12열] 두 칸으로 갈린다 —
 * 프로젝트 상세 페이지의 블록과 같은 모양이라 사이트 전체가 한 가지 규칙만 쓴다(닐슨 4).
 */
function MethodBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bay border-t border-rule py-6 lg:py-8">
      {title && (
        <h3 className="t-micro text-accent lg:col-span-3">{title}</h3>
      )}
      <div
        className={
          title ? "lg:col-span-8 lg:col-start-5" : "lg:col-span-9"
        }
      >
        {children}
      </div>
    </div>
  );
}

function MethodSection({ lang }: { lang: Lang }) {
  const intro = t(lang, "METHOD-INTRO");
  const patterns = [1, 2, 3]
    .map((n) => ({
      key: n,
      // 이름표 슬롯은 `SEC4-TITLE` 처럼 대문자 접미사를 쓴다. 점 표기(`METHOD-1.title`)도
      // 받아두는 이유는 SELFDEMO-LINK 가 그 형태를 쓰고 있어 혼용될 수 있기 때문이다.
      title: t(lang, "METHOD-" + n + "-TITLE") || t(lang, "METHOD-" + n + ".title"),
      body: t(lang, "METHOD-" + n + ".body") || t(lang, "METHOD-" + n),
    }))
    .filter((p) => p.title || p.body);
  const selfDemo = t(lang, "SELFDEMO");
  const repo = repoLink(lang);
  const heading = pick(lang, "SEC4-TITLE", "SECTION.method");

  if (!intro && !patterns.length && !selfDemo && !heading) return null;

  return (
    <Section id="method" label={t(lang, "NAV-METHOD")} heading={heading} lead={intro}>
      {/*
        도식이 세 패턴 위에 선다. 산문 셋을 먼저 읽히면 "그래서 공통점이 뭔데"가 끝까지 안 풀린다 —
        모양을 먼저 보여주고 그 다음에 각 마디를 문장으로 푼다.
      */}
      <HarnessFlow lang={lang} />

      {patterns.length > 0 && (
        <ol className="mt-[clamp(2rem,5vh,3.25rem)]">
          {patterns.map((p) => (
            <li key={p.key}>
              <MethodBlock title={p.title}>
                {p.body && <p className="measure">{p.body}</p>}
              </MethodBlock>
            </li>
          ))}
        </ol>
      )}

      {(selfDemo || repo.url) && (
        <MethodBlock title={t(lang, "SELFDEMO-TITLE")}>
          {selfDemo &&
            paragraphs(selfDemo).map((para, i) => (
              <p key={i} className={"measure" + (i > 0 ? " mt-4" : "")}>
                {para}
              </p>
            ))}
          {repo.url && (
            <p className="mt-6">
              <OutLink href={repo.url} lang={lang}>
                {repo.label}
              </OutLink>
            </p>
          )}
        </MethodBlock>
      )}
    </Section>
  );
}

/**
 * featured 카드는 그리드에서 빠지고 이 단독 블록이 소비한다 (IA 4.3).
 * 프로젝트 판과 같은 조판을 쓰되, 카피 슬롯(`AKDS-SEC`)과 하이라이트가 더 실린다.
 */
function FeaturedBlock({ p, lang }: { p: Project; lang: Lang }) {
  const title = text(p.title, lang);
  const tagline = text(p.tagline, lang);
  const role = text(p.role, lang);
  const body = t(lang, "AKDS-SEC");
  const highlights = list(p.highlights, lang).slice(0, 3);
  const links = renderableLinks(p);

  return (
    <article className="bay border-t border-rule py-7 sm:py-9">
      {/*
        카드와 같은 해부도를 쓴다 — 왼쪽 칸은 **정체와 사실과 행동**(이름·역할·메타·링크),
        오른쪽 칸은 **서술과 근거**(한 줄 설명·본문·하이라이트).
        링크를 오른쪽 맨 아래에서 왼쪽 칸으로 옮긴 이유는 그쪽이 짧아서 바닥에
        사진 자리 모양의 빈 사각형이 남았기 때문이다. 옮기니 두 칸의 높이가 맞는다.
      */}
      <div className="lg:col-span-5">
        {/*
          그룹 라벨을 여기서는 렌더하지 않는다 — 이 블록은 그룹 하나를 통째로 쓰는 단독 섹션이라
          sticky 마이크로 라벨과 섹션 제목이 바로 위에서 이미 같은 말을 하고 있다(닐슨 6 은 sticky 라벨이 만족한다).
        */}
        {title && <h3 className="t-title">{title}</h3>}
        {role && <p className="t-meta mt-3 text-ink">{role}</p>}
        <MetaLine
          items={[
            statusLabel(lang, p.status),
            periodLabel(p),
            teamLabel(lang, p.agent_team.count),
            stackLabel(p.stack, 4),
          ]}
          className="mt-6"
        />
        {(hasDetailPage(p) || links.length > 0) && (
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-2">
            {hasDetailPage(p) && (
              <GoLink href={href(lang, "/projects/" + p.slug)}>
                {ui(lang, "UI.detail")}
              </GoLink>
            )}
            <ExternalLinks links={links} lang={lang} />
          </div>
        )}
      </div>

      <div className="lg:col-span-6 lg:col-start-7">
        {tagline && <p className="t-lead">{tagline}</p>}
        {body &&
          paragraphs(body).map((para, i) => (
            <p key={i} className="measure mt-5">
              {para}
            </p>
          ))}
        {highlights.length > 0 && (
          <ul className="mt-8 space-y-3">
            {highlights.map((h) => (
              <li key={h} className="measure border-l border-rule pl-5">
                {h}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

function GroupSection({
  group,
  lang,
  gloss,
}: {
  group: GroupId;
  lang: Lang;
  gloss?: string;
}) {
  const items = projectsInGroup(group);
  if (!items.length) return null;
  const g = groupMeta(group);
  return (
    <Section
      id={g.anchor}
      label={t(lang, g.navSlot)}
      heading={pick(lang, g.titleSlot, "SECTION." + group)}
      lead={t(lang, g.leadSlot)}
    >
      {gloss && (
        <div className="mb-[clamp(1.75rem,4vh,2.75rem)]">
          <Gloss lang={lang} body={gloss} />
        </div>
      )}
      <ProjectList items={items} lang={lang} />
    </Section>
  );
}

export function HomePage({ lang }: { lang: Lang }) {
  const featured = featuredProjects();

  return (
    <>
      <Masthead lang={lang} />

      {/*
        **방법이 목록보다 먼저 온다** (2026-09-22).
        시스템 6개를 먼저 보여준 뒤 "사실 다 같은 구조"라고 말하면 늦는다 —
        앞에 두면 뒤의 6개가 나열이 아니라 **반복의 증거**로 읽힌다.
        앵커(`#method` / `#systems` / `#apps`)와 헤더 내비 순서는 그대로다.
      */}
      <MethodSection lang={lang} />

      <GroupSection
        group={GRID_GROUPS[0]}
        lang={lang}
        gloss={ui(lang, "UI.glossHarness")}
      />

      <GroupSection group={GRID_GROUPS[1]} lang={lang} />

      {featured.length > 0 && (
        <Section
          id="community"
          label={t(lang, "NAV-COMMUNITY")}
          heading={pick(lang, "SEC6-TITLE", "SECTION.community")}
          lead={t(lang, "GRP-C")}
        >
          {featured.map((p) => (
            <FeaturedBlock key={p.slug} p={p} lang={lang} />
          ))}
        </Section>
      )}

      <Section
        id="contact"
        label={t(lang, "NAV-CONTACT")}
        heading={pick(lang, "SEC7-TITLE", "SECTION.contact")}
        lead={t(lang, "CONTACT")}
      >
        {/*
          연락 수단을 오른쪽 6열에 두면 섹션 제목 아래 왼쪽이 세로로 길게 비어
          인물 사진 자리처럼 읽혔다. 왼쪽으로 붙이면 남는 공간이 페이지 바깥쪽 여백이 된다.
        */}
        <div className="bay">
          <div className="lg:col-span-6">
            <ContactChannels lang={lang} />
            <p className="mt-10">
              <GoLink href={href(lang, "/about")}>
                {t(lang, "NAV-ABOUT") || ui(lang, "UI.about")}
              </GoLink>
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}

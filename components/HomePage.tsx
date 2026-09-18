import { paragraphs, pick, t } from "@/lib/copy";
import {
  GRID_GROUPS,
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

const SECTION_GAP = "mt-[clamp(6rem,17vh,11rem)]";
const HEAD_GAP = "mt-[clamp(2.25rem,6vh,4rem)]";
const BODY_GAP = "mt-[clamp(3rem,8vh,5.5rem)]";

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
          className="sticky top-[var(--header-h)] z-10 bg-bg py-3.5"
        >
          <span data-section-marker="true" className="t-micro text-accent">
            {mark}
          </span>
        </p>
      )}

      <div className={"bay " + (mark ? HEAD_GAP : "pt-10")}>
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
      <p className="measure border-l border-rule pl-5 lg:col-span-6 lg:col-start-7">
        <span className="t-micro mr-3 text-accent">{ui(lang, "UI.terms")}</span>
        {body}
      </p>
    </div>
  );
}

/**
 * 증명 항목은 카피가 "값 · 라벨" 한 줄로 온다 ("6 · 에이전트 시스템").
 * 분리자가 없으면 전체를 라벨로 쓴다. 코드가 숫자를 지어내지 않는다.
 */
function splitProof(raw: string): { value: string; label: string } {
  const i = raw.indexOf("·");
  if (i < 0) return { value: "", label: raw };
  return { value: raw.slice(0, i).trim(), label: raw.slice(i + 1).trim() };
}

/** 검증 가능한 사실 네 개. 칸을 나눈 표가 아니라 왼쪽부터 흐르는 한 줄이다. */
function Ledger({ lang, className = "" }: { lang: Lang; className?: string }) {
  const items = [1, 2, 3, 4]
    .map((n) => {
      const id = "PROOF-" + n;
      const value = t(lang, id + ".value");
      const label = t(lang, id + ".label");
      if (value || label) return { key: id, value, label };
      return { key: id, ...splitProof(t(lang, id)) };
    })
    .filter((i) => i.value || i.label);

  if (!items.length) return null;

  return (
    <ul className={"flex flex-wrap gap-x-14 gap-y-8 " + className}>
      {items.map((i) => (
        <li key={i.key}>
          {i.value && <p className="t-sub">{i.value}</p>}
          {i.label && (
            <p className="t-micro mt-1.5 text-ink-soft">{i.label}</p>
          )}
        </li>
      ))}
    </ul>
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

/** 첫 화면 — 위쪽을 크게 비우고 시작한다. 본문은 오른쪽 열에만 둔다(레퍼런스 §5). */
function Masthead({ lang }: { lang: Lang }) {
  const h1 = t(lang, "HERO-1");
  const sub = t(lang, "HERO-2");
  const cta1 = t(lang, "HERO-CTA-1");
  const cta2 = t(lang, "HERO-CTA-2");

  return (
    <section className="stagger pt-[clamp(4.5rem,19vh,12rem)]">
      {h1 && (
        <h1 className="t-display measure-display">
          <Emphasized value={h1} />
        </h1>
      )}

      <div className={"bay " + HEAD_GAP}>
        <div className="lg:col-span-7 lg:col-start-6">
          {sub && <p className="t-lead">{sub}</p>}
          {(cta1 || cta2) && (
            <div className="mt-9 flex flex-wrap gap-3">
              {cta1 && <PrimaryAction href="#systems">{cta1}</PrimaryAction>}
              {cta2 && <GhostAction href="#contact">{cta2}</GhostAction>}
            </div>
          )}
        </div>
      </div>

      <Ledger lang={lang} className="mt-[clamp(4rem,12vh,7.5rem)]" />
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

function MethodSection({ lang }: { lang: Lang }) {
  const intro = t(lang, "METHOD-INTRO");
  const patterns = [1, 2, 3]
    .map((n) => ({
      key: n,
      title: t(lang, "METHOD-" + n + ".title"),
      body: t(lang, "METHOD-" + n + ".body") || t(lang, "METHOD-" + n),
    }))
    .filter((p) => p.title || p.body);
  const selfDemo = t(lang, "SELFDEMO");
  const repo = repoLink(lang);
  const heading = pick(lang, "SEC4-TITLE", "SECTION.method");

  if (!intro && !patterns.length && !selfDemo && !heading) return null;

  return (
    <Section id="method" label={t(lang, "NAV-METHOD")} heading={heading} lead={intro}>
      {patterns.length > 0 && (
        <ol>
          {patterns.map((p) => (
            <li key={p.key} className="bay border-t border-rule py-9 lg:py-12">
              <div className="lg:col-span-8 lg:col-start-5">
                {p.title && <h3 className="t-sub">{p.title}</h3>}
                {p.body && (
                  <p className={"measure" + (p.title ? " mt-4" : "")}>
                    {p.body}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {(selfDemo || repo.url) && (
        <div className="bay border-t border-rule py-9 lg:py-12">
          <div className="lg:col-span-8 lg:col-start-5">
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
          </div>
        </div>
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
    <article className="bay border-t border-rule py-10 sm:py-14">
      <div className="lg:col-span-4">
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
      </div>

      <div className="lg:col-span-7 lg:col-start-6">
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
        <div className="mb-[clamp(2.5rem,6vh,4rem)]">
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

      <GroupSection
        group={GRID_GROUPS[0]}
        lang={lang}
        gloss={ui(lang, "UI.glossHarness")}
      />

      <MethodSection lang={lang} />

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
        <div className="bay">
          <div className="lg:col-span-6 lg:col-start-7">
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

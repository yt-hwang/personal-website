import { paragraphs, pick, t } from "@/lib/copy";
import type { Lang } from "@/lib/types";
import { ui } from "@/lib/ui";

import { ContactChannels } from "./ContactChannels";

/**
 * About — 산문 한 덩어리가 아니라 **구조화된 슬롯**으로 짠다.
 *
 * 머리는 `ABOUT-LEAD`(선언문 한 줄, 홈 히어로와 같은 64px) + `ABOUT-SUB`(보조문장 18px) 두 층이다.
 *
 * 페이지의 주인공은 "지금 맡고 있는 역할 4개"다. 한 역할은 세 층으로 쌓는다.
 *   기관명(ROLE-n-ORG)   강조색 마이크로 라벨 — 어디에서
 *   직함(ROLE-n-TITLE)   디스플레이 세리프, 가장 크게 — 어떤 위치로
 *   설명(ROLE-n-DESC)    본문 16px — 무엇을
 * 세 층이 서로 다른 서체·크기를 쓰므로 한눈에 갈린다.
 * 직함은 이전 디자인에서 강조색이었는데 검정으로 되돌렸다 —
 * 강조색은 링크와 마이크로 라벨에만 쓴다(레퍼런스 §6). 크기만으로 이미 충분히 세다.
 *
 * 역할 수는 코드에 고정돼 있지 않다. 카피에 ROLE-5-* 가 생기면 그대로 한 줄 더 붙는다.
 * 세 슬롯이 전부 비면 그 항목은 렌더하지 않는다 (닐슨 5 — 빈 칸을 만들지 않는다).
 *
 * 섹션 번호(01/02/03)는 걷어냈다. 섹션의 정체는 번호가 아니라 제목이 말한다.
 */

const MAX_ROLES = 12;

type Role = { n: number; org: string; title: string; desc: string };

function readRoles(lang: Lang): Role[] {
  const out: Role[] = [];
  for (let n = 1; n <= MAX_ROLES; n++) {
    const org = t(lang, "ROLE-" + n + "-ORG");
    const title = t(lang, "ROLE-" + n + "-TITLE");
    const desc = t(lang, "ROLE-" + n + "-DESC");
    if (!org && !title && !desc) continue;
    out.push({ n, org, title, desc });
  }
  return out;
}

/** 홈과 같은 섹션 조판 — 규칙선 하나, 큰 여백, 왼쪽 제목 / 오른쪽 본문의 비대칭. */
function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-[clamp(5rem,15vh,10rem)]">
      <div className="h-px w-full bg-rule" />
      <div className="bay pt-10">
        {heading && <h2 className="t-title lg:col-span-4">{heading}</h2>}
        <div className="lg:col-span-7 lg:col-start-6">{children}</div>
      </div>
    </section>
  );
}

function Prose({ value }: { value: string }) {
  if (!value) return null;
  return (
    <>
      {paragraphs(value).map((para, i) => (
        <p key={i} className={"measure" + (i > 0 ? " mt-5" : "")}>
          {para}
        </p>
      ))}
    </>
  );
}

export function AboutPage({ lang }: { lang: Lang }) {
  const heading =
    pick(lang, "ABOUT-TITLE", "NAV-ABOUT") || ui(lang, "UI.about");
  const lead = t(lang, "ABOUT-LEAD");
  const sub = t(lang, "ABOUT-SUB");
  const roles = readRoles(lang);

  const bgTitle = t(lang, "BG-TITLE");
  const bg = t(lang, "ABOUT-BG");
  const sideTitle = t(lang, "SIDE-TITLE");
  const side = t(lang, "ABOUT-SIDE");
  const contactTitle = t(lang, "CONTACT-TITLE");
  const contact = t(lang, "ABOUT-CONTACT");
  const repoNote = t(lang, "ABOUT-REPO-NOTE");

  return (
    <article className="pt-[clamp(4.5rem,19vh,12rem)]">
      {/*
        머리는 홈 히어로와 같은 조판이다 — 선언문 한 줄을 .t-display 로 크게 놓고,
        보조문장은 오른쪽 열에만 둔다(레퍼런스 §5 비대칭).
        `ABOUT-SUB` 가 비면 보조문장 블록을 통째로 만들지 않는다(닐슨 5).
      */}
      <header className="stagger">
        <p className="t-micro text-accent">{heading}</p>
        {lead && <h1 className="t-display measure-display mt-5">{lead}</h1>}
        {sub && (
          <div className="bay mt-[clamp(2.25rem,6vh,4rem)]">
            <p className="t-lead lg:col-span-7 lg:col-start-6">{sub}</p>
          </div>
        )}
      </header>

      {roles.length > 0 && (
        <Section heading={t(lang, "ROLES-TITLE")}>
          {/*
            역할 목록은 프로젝트 판과 같은 리듬을 쓴다 — 규칙선 하나, 큰 여백, 큰 세리프 이름.
            이미지가 없으므로 여기서도 **글자가 덩어리를 진다**.
          */}
          <ul>
            {roles.map((r) => (
              <li key={r.n} className="border-t border-rule py-9 first:border-t-0 first:pt-0 lg:py-11">
                {r.org && <p className="t-micro text-accent">{r.org}</p>}
                {r.title && <p className="t-title mt-3">{r.title}</p>}
                {r.desc && <p className="measure mt-5">{r.desc}</p>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {bg && (
        <Section heading={bgTitle}>
          <Prose value={bg} />
        </Section>
      )}

      {side && (
        <Section heading={sideTitle}>
          <Prose value={side} />
        </Section>
      )}

      {(contact || repoNote) && (
        <Section heading={contactTitle}>
          <Prose value={contact} />
          <ContactChannels lang={lang} prefer="about" className="mt-8" />
          {repoNote && (
            <p className="measure mt-8 border-l border-rule pl-5">{repoNote}</p>
          )}
        </Section>
      )}
    </article>
  );
}

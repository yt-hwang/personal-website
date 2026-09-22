import { Fragment } from "react";

import { harnessCensus } from "@/lib/projects";
import type { HarnessStage } from "@/lib/projects";
import type { Lang } from "@/lib/types";
import { ui } from "@/lib/ui";

/**
 * 하네스 도식 — 이 사이트에서 유일한 그래픽이다.
 *
 * ── 이 그래픽이 어느 필드를 읽는가 (통과 기준)
 * `content/projects/*.json` 의 `agent_team.members[]` 의 `role`·`name` 하나뿐이다.
 * 단계 분류는 `lib/projects.ts` 의 `stageOf()` 가 role 문자열에서 판정하고,
 * 수치는 `harnessCensus()` 가 센다. **컴포넌트가 숫자를 지어내지 않는다.**
 * 프로젝트 JSON 이 하나 늘면 눈금과 수치가 저절로 따라온다.
 *
 * ── 왜 SVG 가 아니라 HTML + CSS 인가
 * 마디는 전부 **글자**이고 연결선만 1px 규칙선이다. SVG 로 그리면 (a) 라벨이 이중언어라
 * 줄바꿈·글자폭이 언어마다 달라지고, (b) `<text>` 는 스크린리더에서 순서가 뒤집히기 쉽고,
 * (c) 360px 에서 viewBox 를 다시 잡아야 한다. HTML 로 깔면 세 문제가 전부 사라지고
 * 사이트의 기존 시각 언어(가는 규칙선 + 마이크로 라벨)를 그대로 쓴다. 새 의존성 0, 클라이언트 JS 0.
 *
 * ── 게이트를 "선"이 아니라 "끊긴 경로"로 그린다
 * 검증 마디까지는 선이 이어지고, 게이트 다음 실행 마디로 가는 선은 **아예 그려지지 않는다.**
 * 모션을 전부 끈 정지 화면에서도 "여기서 안 넘어간다"가 읽혀야 하기 때문이다.
 * 끊긴 자리는 세 경로로 동시에 말한다 — 강조색 점(색) · 끊긴 선(형태) · 라벨 문장(문자).
 * 셋 중 둘이 사라져도(색맹·모션 끔·스크린리더) 같은 사실이 남는다.
 *
 * ── 애니메이션은 새 정보를 지지 않는다
 * 스크롤 진입 시 연결선이 왼쪽에서 오른쪽으로 **한 번** 그려지고 끊긴 자리에서 선다.
 * 이미 정지 화면에 있는 사실을 되풀이할 뿐이다. 루프 없음(WCAG 2.2.2), `no-preference` 게이트 안,
 * `@supports (animation-timeline: scroll())` 안.
 */

/** 실행 마디는 데이터에 수치가 없다 — 그게 요점이다. 통과했을 때만 일어나는 일이라서. */
const STAGE_SLOT: Record<HarnessStage, string> = {
  orchestrate: "UI.stageOrchestrate",
  propose: "UI.stagePropose",
  verify: "UI.stageVerify",
  gate: "UI.stageGate",
};

function Connector({ broken = false }: { broken?: boolean }) {
  // 끊긴 구간은 선 자체를 만들지 않는다. 빈 칸이 곧 "여기서 멈춘다"는 표시다.
  if (broken) return <span aria-hidden="true" className="hidden lg:block" />;
  return (
    <span
      aria-hidden="true"
      data-flow-line="true"
      className="hidden h-px flex-1 self-start bg-rule lg:mt-10 lg:block"
    />
  );
}

/** 마디 하나. 값이 없는 수치는 요소를 만들지 않는다 (닐슨 5). */
function Node({
  label,
  agents,
  systems,
  unit,
  systemsLabel,
  gate = false,
}: {
  label: string;
  agents?: number;
  systems?: number;
  unit: string;
  systemsLabel: string;
  gate?: boolean;
}) {
  return (
    <div data-flow-node="true" className="min-w-0 lg:flex-none">
      {/* 눈금. 연결선이 이 눈금의 중앙 높이에 맞춰 붙는다(`lg:mt-5`). */}
      <span
        aria-hidden="true"
        className={"block h-20 w-px " + (gate ? "bg-accent" : "bg-ink-soft")}
      />
      <p className={"t-micro mt-5 " + (gate ? "text-accent" : "text-ink-soft")}>
        {label}
      </p>
      {typeof agents === "number" && agents > 0 && (
        <p className="t-figure mt-3">{agents}</p>
      )}
      {typeof agents === "number" && agents > 0 && (
        <p className="t-meta mt-1 text-ink-soft">{unit}</p>
      )}
      {typeof systems === "number" && systems > 0 && (
        <p className="t-meta text-ink-soft">
          {systems} {systemsLabel}
        </p>
      )}
    </div>
  );
}

/**
 * 히어로용 축소판 — 마디의 **위치와 끊김만** 남기고 수치와 라벨을 뺀다.
 * 스크롤하기 전에 구조가 한 번 보이고, 아래 본 도식에서 같은 모양이 수치와 함께 펼쳐진다.
 * 같은 `harnessCensus()` 를 읽으므로 마디 수가 데이터와 어긋날 수 없다. 장식이 아니다.
 */
export function HarnessRail({ lang }: { lang: Lang }) {
  const census = harnessCensus();
  const nodes = census.stages.filter((s) => s.agents > 0);
  if (nodes.length < 2) return null;
  const stop = ui(lang, "UI.flowStop");

  return (
    <div data-rail="true" className="w-full">
      <div className="flex items-center">
        {nodes.map((n, i) => (
          <Fragment key={n.stage}>
            <span
              aria-hidden="true"
              className={
                "block h-4 w-px shrink-0 " +
                (n.stage === "gate" ? "bg-accent" : "bg-ink-soft")
              }
            />
            {i < nodes.length - 1 && (
              <span
                aria-hidden="true"
                data-rail-line="true"
                className="h-px flex-1 bg-rule"
              />
            )}
          </Fragment>
        ))}
        {/* 끊긴 구간 — 선을 그리지 않는다. 벽 하나와 점 하나만 둔다. */}
        <span aria-hidden="true" className="block h-6 w-0.5 shrink-0 bg-accent" />
        <span aria-hidden="true" className="w-20 shrink-0" />
        <span
          aria-hidden="true"
          className="block size-1.5 shrink-0 rounded-full bg-accent"
        />
        <span aria-hidden="true" className="w-6 shrink-0" />
        <span aria-hidden="true" className="block h-4 w-px shrink-0 bg-ink-soft" />
      </div>
      {/*
        라벨은 **끊긴 지점 아래**에 놓는다. 왼쪽 끝에 두면 레일의 시작이 멈춤 지점인 것처럼 읽힌다
        (실제로 그렇게 보였다). 끊김은 오른쪽 끝이므로 라벨도 오른쪽으로 맞춘다.
      */}
      {stop && <p className="t-meta mt-3 pr-1 text-right text-accent">{stop}</p>}
    </div>
  );
}

export function HarnessFlow({ lang }: { lang: Lang }) {
  const census = harnessCensus();
  if (census.systems === 0 || census.agents === 0) return null;

  const unit = ui(lang, "UI.stageAgentUnit");
  const systemsLabel = ui(lang, "UI.stageSystemUnit");
  const stopLabel = ui(lang, "UI.flowStop");
  const executeLabel = ui(lang, "UI.stageExecute");
  const caption = ui(lang, "UI.flowCaption");

  const byStage = new Map(census.stages.map((s) => [s.stage, s]));
  const ordered: HarnessStage[] = [
    "orchestrate",
    "propose",
    "verify",
    "gate",
  ];
  const nodes = ordered
    .map((stage) => ({ stage, ...byStage.get(stage) }))
    .filter((n) => (n.agents ?? 0) > 0);

  if (!nodes.length) return null;

  return (
    <figure
      data-flow="true"
      className="border-t border-rule pt-10 lg:pt-16"
      // 도식 전체를 한 덩어리로 읽히게 한다. 아래 figcaption 이 같은 사실을 문장으로 말한다.
      aria-labelledby="flow-caption"
    >
      {/*
        큰 화면: [마디 연결선 마디 …] 한 줄. 좁은 화면: 세로로 쌓인다.
        연결선은 `lg:` 에서만 나타난다 — 360px 에서 가로선은 조판을 흔들기만 하고 뜻을 더하지 않는다.
        세로 배치에서도 "게이트 다음이 끊겨 있다"는 사실은 강조색 점과 라벨 문장이 그대로 진다.

        **격자가 아니라 flex 다.** 마디 수는 데이터에 따라 변한다(수치가 0인 단계는 렌더하지 않는다).
        고정 열 수를 쓰면 마디가 하나 늘거나 줄 때 연결선이 폭 0으로 찌그러진다 —
        실제로 그랬다(`repeat(4,auto)_1fr_auto` 6열에 9개를 넣어 연결선 2개가 폭 0이 됐다).
        flex 면 연결선이 `flex-1` 로 남는 자리를 나눠 가지므로 마디 수와 무관하게 성립한다.
      */}
      <div className="flex flex-col gap-y-9 lg:min-h-[15rem] lg:flex-row lg:items-start lg:gap-x-5">
        {nodes.map((n, i) => (
          <Fragment key={n.stage}>
            <Node
              label={ui(lang, STAGE_SLOT[n.stage])}
              agents={n.agents}
              systems={n.systems}
              unit={unit}
              systemsLabel={systemsLabel}
              gate={n.stage === "gate"}
            />
            {i < nodes.length - 1 && <Connector />}
          </Fragment>
        ))}

        {/*
          **끊긴 구간.** 선을 그리지 않는다. 대신 게이트 바로 뒤에 **벽**(세로 강조색 막대)을 세우고,
          비어 있는 간격을 지나 점 하나와 라벨을 둔다. 마디와 같은 뼈대(눈금 → 라벨)를 쓰기 때문에
          "있어야 할 자리에 연결이 없다"가 모양만으로 읽힌다.
          색 · 형태(없는 선 + 벽) · 문자 세 경로가 같은 사실을 말한다.
        */}
        <div
          data-flow-break="true"
          className="lg:w-56 lg:shrink-0 lg:self-start"
        >
          <div className="flex items-center gap-5">
            <span aria-hidden="true" className="block h-20 w-0.5 bg-accent" />
            <span
              aria-hidden="true"
              className="block size-2.5 shrink-0 rounded-full bg-accent"
            />
          </div>
          <p className="t-micro mt-3 text-accent lg:mt-5">{stopLabel}</p>
        </div>

        {/* 실행 마디 — 수치가 없다. 통과했을 때만 일어나는 일이라서 셀 것이 없다. */}
        <Node
          label={executeLabel}
          unit={unit}
          systemsLabel={systemsLabel}
        />
      </div>

      {caption && (
        <figcaption
          id="flow-caption"
          className="measure t-meta mt-10 border-l border-rule pl-5 text-ink-soft"
        >
          {caption
            .replace("{systems}", String(census.systems))
            .replace("{agents}", String(census.agents))
            .replace("{gated}", String(census.gatedSystems))}
        </figcaption>
      )}
    </figure>
  );
}

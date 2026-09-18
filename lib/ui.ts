import { t } from "./copy";
import type { Lang } from "./types";

/**
 * UI 마이크로 라벨 — 문장이 아니라 조작 레이블·용어 풀이다.
 * 전부 content/copy/{lang}/ 의 동명 슬롯으로 덮어쓸 수 있고, 덮어쓰면 그 값이 이긴다.
 * 여기 없는 모든 문장(히어로·그룹 설명·본문·About)은 코드가 쓰지 않는다.
 *
 * `UI.gloss*` 는 닐슨 2원칙(현실 세계와의 일치) 때문에 들어왔다 —
 * "하네스"·"오케스트레이터"·"게이트키퍼"가 처음 나오는 자리에 한 줄 설명을 붙인다.
 * 카피 파일에 같은 이름의 슬롯이 생기면 그쪽이 이긴다(04 노트 §7 참고).
 */
const UI: Record<Lang, Record<string, string>> = {
  ko: {
    "UI.skip": "본문으로 건너뛰기",
    "UI.footerNav": "사이트 목적지",
    "UI.detail": "상세 보기",
    "UI.detailNone": "상세 비공개",
    "UI.teamExpand": "전체 보기",
    "UI.teamCollapse": "접기",
    "UI.prev": "이전",
    "UI.next": "다음",
    "UI.home": "홈",
    "UI.about": "소개",
    "UI.back": "돌아가기",
    "UI.notFoundTitle": "페이지를 찾을 수 없습니다",
    "UI.notFoundGo": "여기로 갈 수 있습니다",
    "UI.backHome": "홈으로",
    "UI.role": "역할",
    "UI.period": "기간",
    "UI.stack": "스택",
    "UI.team": "팀 구성",
    "UI.highlights": "하이라이트",
    "UI.links": "링크",
    "UI.disclosure": "공개 범위",
    "UI.bodyProblem": "문제",
    "UI.bodyWork": "한 일",
    "UI.bodyStructure": "구조",
    "UI.bodyResult": "결과",
    "UI.teamUnit": "인 팀",
    "UI.orchestrator": "오케스트레이터",
    "UI.gatekeeper": "게이트키퍼",
    "UI.newTab": "새 탭에서 열립니다",
    "UI.terms": "용어",
    "UI.glossHarness":
      "하네스 — AI 에이전트에게 역할·권한·금지 사항을 미리 정해두고 그 규칙대로만 움직이게 묶어놓은 설정 묶음입니다.",
    "UI.glossOrchestrator": "팀을 소집하고 최종 결정을 내리는 역할",
    "UI.glossGatekeeper": "혼자서 진행을 멈출 수 있는 역할",
    "UI.emailLabel": "이메일",
    "UI.githubLabel": "GitHub",
    "UI.linkedinLabel": "LinkedIn",
  },
  en: {
    "UI.skip": "Skip to content",
    "UI.footerNav": "Site destinations",
    "UI.detail": "Details",
    "UI.detailNone": "Details withheld",
    "UI.teamExpand": "Show all",
    "UI.teamCollapse": "Show fewer",
    "UI.prev": "Previous",
    "UI.next": "Next",
    "UI.home": "Home",
    "UI.about": "About",
    "UI.back": "Back",
    "UI.notFoundTitle": "Page not found",
    "UI.notFoundGo": "You can go to",
    "UI.backHome": "Back to home",
    "UI.role": "Role",
    "UI.period": "Period",
    "UI.stack": "Stack",
    "UI.team": "Team",
    "UI.highlights": "Highlights",
    "UI.links": "Links",
    "UI.disclosure": "Disclosure",
    "UI.bodyProblem": "Problem",
    "UI.bodyWork": "What I did",
    "UI.bodyStructure": "How it works",
    "UI.bodyResult": "Where it stands",
    "UI.teamUnit": " agents",
    "UI.orchestrator": "Orchestrator",
    "UI.gatekeeper": "Gatekeeper",
    "UI.newTab": "opens in a new tab",
    "UI.terms": "Terms",
    "UI.glossHarness":
      "A harness is the set of configuration that fixes each AI agent's role, authority, and prohibitions in advance, so the agents can only act within those rules.",
    "UI.glossOrchestrator": "The role that convenes the team and makes the final call",
    "UI.glossGatekeeper": "The one role that can halt the work on its own",
    "UI.emailLabel": "Email",
    "UI.githubLabel": "GitHub",
    "UI.linkedinLabel": "LinkedIn",
  },
};

export function ui(lang: Lang, key: string): string {
  return t(lang, key) || UI[lang][key] || "";
}

export function teamBadge(lang: Lang, count: number): string {
  return count + ui(lang, "UI.teamUnit");
}

import { t } from "./copy";
import type { Lang } from "./types";

/**
 * UI 마이크로 라벨 — 문장이 아니라 조작 레이블이다.
 * 전부 content/copy/{lang}/ 의 동명 슬롯으로 덮어쓸 수 있고, 덮어쓰면 그 값이 이긴다.
 * 여기 없는 모든 문장(히어로·그룹 설명·본문·About)은 코드가 쓰지 않는다.
 */
const UI: Record<Lang, Record<string, string>> = {
  ko: {
    "UI.skip": "본문으로 건너뛰기",
    "UI.detail": "상세 보기",
    "UI.detailNone": "상세 비공개",
    "UI.teamExpand": "전체 보기",
    "UI.teamCollapse": "접기",
    "UI.prev": "이전",
    "UI.next": "다음",
    "UI.home": "홈",
    "UI.about": "소개",
    "UI.notFoundTitle": "페이지를 찾을 수 없습니다",
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
    "UI.gatekeeper": "게이트키퍼",
    "UI.langSwitch": "English로 보기",
  },
  en: {
    "UI.skip": "Skip to content",
    "UI.detail": "Details",
    "UI.detailNone": "Details withheld",
    "UI.teamExpand": "Show all",
    "UI.teamCollapse": "Show fewer",
    "UI.prev": "Previous",
    "UI.next": "Next",
    "UI.home": "Home",
    "UI.about": "About",
    "UI.notFoundTitle": "Page not found",
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
    "UI.gatekeeper": "Gatekeeper",
    "UI.langSwitch": "View in Korean",
  },
};

export function ui(lang: Lang, key: string): string {
  return t(lang, key) || UI[lang][key] || "";
}

export function teamBadge(lang: Lang, count: number): string {
  return lang === "ko"
    ? count + ui(lang, "UI.teamUnit")
    : count + ui(lang, "UI.teamUnit");
}

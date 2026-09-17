import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bot,
  ChevronDown,
  Github,
  Linkedin,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

/**
 * 아이콘은 lucide 하나만 쓴다. 이모지·유니코드 기호를 아이콘 대용으로 쓰지 않는다.
 *
 * lucide-react 아이콘은 "use client" 가 없는 순수 SVG 컴포넌트라 서버에서 그대로 렌더된다 —
 * 이 파일을 import 해도 클라이언트 번들이 늘지 않는다.
 *
 * 장식으로 쓰지 않는다. 아래 9개는 전부 "이게 무슨 링크·무슨 역할인가"를 보조한다.
 *   ExternalIcon  외부 사이트로 나가는 링크        (일관 표식, 닐슨 4)
 *   ForwardIcon   같은 사이트 안의 상세로 들어가는 링크
 *   BackIcon      돌아가기                        (닐슨 3)
 *   MailIcon      메일 보내기
 *   RepoIcon      코드 저장소 (GitHub)
 *   ProfileIcon   직업 프로필 (LinkedIn)
 *   LockIcon      상세 비공개                     (닐슨 5 — 죽은 링크 대신 상태를 보인다)
 *   VetoIcon      단독 거부권을 가진 역할
 *   AgentIcon     구성원이 사람이 아니라 AI 에이전트임
 *   ToggleIcon    펼침/접힘
 *
 * 버전을 0.577 로 고정한 이유는 이 파일 맨 아래 주석 참고.
 */

const STROKE = 1.75;

type Props = { className?: string };

export function ExternalIcon({ className = "size-3.5" }: Props) {
  return <ArrowUpRight aria-hidden className={className} strokeWidth={STROKE} />;
}

export function ForwardIcon({ className = "size-3.5" }: Props) {
  return <ArrowRight aria-hidden className={className} strokeWidth={STROKE} />;
}

export function BackIcon({ className = "size-3.5" }: Props) {
  return <ArrowLeft aria-hidden className={className} strokeWidth={STROKE} />;
}

export function MailIcon({ className = "size-4" }: Props) {
  return <Mail aria-hidden className={className} strokeWidth={STROKE} />;
}

export function RepoIcon({ className = "size-4" }: Props) {
  return <Github aria-hidden className={className} strokeWidth={STROKE} />;
}

export function ProfileIcon({ className = "size-4" }: Props) {
  return <Linkedin aria-hidden className={className} strokeWidth={STROKE} />;
}

export function LockIcon({ className = "size-3.5" }: Props) {
  return <Lock aria-hidden className={className} strokeWidth={STROKE} />;
}

export function VetoIcon({ className = "size-3.5" }: Props) {
  return <ShieldCheck aria-hidden className={className} strokeWidth={STROKE} />;
}

export function AgentIcon({ className = "size-4" }: Props) {
  return <Bot aria-hidden className={className} strokeWidth={STROKE} />;
}

export function ToggleIcon({ className = "size-3.5" }: Props) {
  return <ChevronDown aria-hidden className={className} strokeWidth={STROKE} />;
}

/*
 * 왜 lucide-react 를 0.577.x 로 고정했는가.
 *
 * lucide-react 1.x 는 아이콘 기반 컴포넌트(dist/esm/Icon.mjs)에 "use client" 를 달았다.
 * 기본값을 컨텍스트로 넘기기 위해서인데, 그러면 아이콘 하나만 써도 클라이언트 경계가 생겨
 * 11KB 짜리 클라이언트 청크가 전 페이지에 붙는다(빌드 산출물에서 실제로 확인했다).
 * 0.577.0 은 "use client" 가 DynamicIcon(우리가 쓰지 않는 모듈)에만 있어
 * 아이콘이 서버에서 순수 SVG 로 렌더되고 클라이언트 JS 가 0바이트 늘어난다.
 * 덤으로 이 버전에는 브랜드 아이콘(Github/Linkedin)이 아직 남아 있어
 * 연락 수단을 알아보기 쉬운 마크로 표시할 수 있다.
 *
 * 1.x 로 올리려면 아이콘을 __iconNode 데이터에서 직접 SVG 로 그리는 래퍼가 먼저 필요하다.
 */

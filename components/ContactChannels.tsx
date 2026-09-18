import { pick } from "@/lib/copy";
import type { Lang } from "@/lib/types";
import { ui } from "@/lib/ui";

import { MailIcon, ProfileIcon, RepoIcon } from "./Icon";
import { OutLink } from "./Links";

/**
 * 연락 수단의 값은 카피 슬롯에서만 온다. 코드가 주소를 만들지 않는다.
 * [[NEEDS:]] 가 남은 슬롯은 copy 로더에서 비워지므로 항목 자체가 자동으로 사라진다
 * (닐슨 5 — 없는 값으로 빈 칸이나 죽은 링크를 만들지 않는다).
 *
 * 이메일은 난독화하지 않는다. 주소를 그대로 보여주고 mailto: 를 건다.
 * 주소처럼 보이지 않는 값은 링크로 만들지 않고 글자로만 둔다.
 */

type Kind = "email" | "profile" | "repo";

const CHANNELS: {
  key: string;
  kind: Kind;
  labelKey: string;
  homeSlot: string;
  aboutSlot: string;
}[] = [
  {
    key: "email",
    kind: "email",
    labelKey: "UI.emailLabel",
    homeSlot: "CONTACT-EMAIL",
    aboutSlot: "ABOUT-CONTACT-EMAIL",
  },
  {
    key: "linkedin",
    kind: "profile",
    labelKey: "UI.linkedinLabel",
    homeSlot: "CONTACT-LINKEDIN",
    aboutSlot: "ABOUT-CONTACT-LINKEDIN",
  },
  {
    key: "github",
    kind: "repo",
    labelKey: "UI.githubLabel",
    homeSlot: "CONTACT-GITHUB",
    aboutSlot: "ABOUT-CONTACT-GITHUB",
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HOSTISH_RE = /^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i;
const SPLIT_RE = /\s[—–-]\s/;

/** "주소 — 덧붙임" 한 줄에서 주소와 설명을 가른다. 구분자가 없으면 전체가 주소 후보다. */
function parseChannel(raw: string): { value: string; note: string } {
  const i = raw.search(SPLIT_RE);
  if (i < 0) return { value: raw.trim(), note: "" };
  return {
    value: raw.slice(0, i).trim(),
    note: raw.slice(i).replace(SPLIT_RE, "").trim(),
  };
}

function hrefFor(kind: Kind, value: string): string {
  if (kind === "email") return EMAIL_RE.test(value) ? "mailto:" + value : "";
  if (!HOSTISH_RE.test(value)) return "";
  return /^https?:\/\//i.test(value) ? value : "https://" + value;
}

function ChannelIcon({ kind }: { kind: Kind }) {
  if (kind === "email") return <MailIcon />;
  if (kind === "repo") return <RepoIcon />;
  return <ProfileIcon />;
}

export function ContactChannels({
  lang,
  prefer = "home",
  className = "",
}: {
  lang: Lang;
  prefer?: "home" | "about";
  className?: string;
}) {
  const items = CHANNELS.map((c) => {
    const ids =
      prefer === "about" ? [c.aboutSlot, c.homeSlot] : [c.homeSlot, c.aboutSlot];
    const raw = pick(lang, ...ids);
    if (!raw) return null;
    const { value, note } = parseChannel(raw);
    if (!value) return null;
    return { ...c, value, note, href: hrefFor(c.kind, value) };
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  if (!items.length) return null;

  return (
    <dl className={"grid gap-x-8 gap-y-5 sm:grid-cols-[minmax(0,7rem)_minmax(0,1fr)] " + className}>
      {items.map((i) => (
        <div key={i.key} className="contents">
          <dt className="t-micro flex items-center gap-2.5 self-start text-ink-soft sm:pt-0.5">
            <ChannelIcon kind={i.kind} />
            {ui(lang, i.labelKey)}
          </dt>
          <dd className="min-w-0">
            {i.href ? (
              i.kind === "email" ? (
                <a
                  href={i.href}
                  className="font-mono text-accent underline decoration-accent/40 decoration-from-font underline-offset-[0.3em] hover:decoration-accent"
                >
                  {i.value}
                </a>
              ) : (
                <OutLink
                  href={i.href}
                  lang={lang}
                  className="font-mono"
                >
                  {i.value}
                </OutLink>
              )
            ) : (
              <span className="font-mono text-ink">
                {i.value}
              </span>
            )}
            {i.note && (
              <p className="measure-tight mt-2 text-ink-soft">
                {i.note}
              </p>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

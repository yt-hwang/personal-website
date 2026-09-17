import { pick } from "@/lib/copy";
import type { Lang } from "@/lib/types";

/**
 * 연락 수단은 카피 슬롯에서만 온다. 코드가 주소를 만들지 않는다.
 * 이메일은 스팸 방지 난독화 형태로 오므로 mailto: 링크로 바꾸지 않고 그대로 보여준다.
 * [[NEEDS:]] 가 남은 슬롯은 copy 로더 단계에서 비워지므로 자동으로 사라진다.
 */
const CHANNELS = [
  ["CONTACT-EMAIL", "ABOUT-CONTACT-EMAIL"],
  ["CONTACT-LINKEDIN", "ABOUT-CONTACT-LINKEDIN"],
  ["CONTACT-GITHUB", "ABOUT-CONTACT-GITHUB"],
];

export function ContactChannels({
  lang,
  className = "",
}: {
  lang: Lang;
  className?: string;
}) {
  const items = CHANNELS.map((ids) => ({
    key: ids[0],
    value: pick(lang, ...ids),
  })).filter((i) => i.value);

  if (!items.length) return null;

  return (
    <ul className={"space-y-1.5 text-sm text-text-muted " + className}>
      {items.map((i) => (
        <li key={i.key}>{i.value}</li>
      ))}
    </ul>
  );
}

import { localized } from "@/lib/projects";
import type { Lang, ProjectLink } from "@/lib/types";

import { OutLink } from "./Links";

/** 링크가 없으면 영역 자체를 렌더하지 않는다. 빈 <a href=""> 를 만들지 않는다. */
export function ExternalLinks({
  links,
  lang,
}: {
  links: ProjectLink[];
  lang: Lang;
}) {
  if (!links.length) return null;
  return (
    <>
      {links.map((l) => {
        const label = localized(l.label, lang);
        if (!label) return null;
        return (
          <OutLink key={l.url} href={l.url} lang={lang}>
            {label}
          </OutLink>
        );
      })}
    </>
  );
}

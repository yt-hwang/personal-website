import { localized } from "@/lib/projects";
import type { Lang, ProjectLink } from "@/lib/types";

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
          <a
            key={l.url}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            {label}
            <span aria-hidden="true"> ↗</span>
          </a>
        );
      })}
    </>
  );
}

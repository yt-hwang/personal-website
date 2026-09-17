import { paragraphs, pick, t } from "@/lib/copy";
import type { Lang } from "@/lib/types";
import { ui } from "@/lib/ui";

export function AboutPage({ lang }: { lang: Lang }) {
  const heading =
    pick(lang, "ABOUT-TITLE", "NAV-ABOUT") || ui(lang, "UI.about");
  const blocks = [1, 2, 3].map((n) => t(lang, "ABOUT-" + n)).filter(Boolean);

  return (
    <article className="max-w-2xl py-10 sm:py-14">
      <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
        {heading}
      </h1>

      {blocks.length > 0 && (
        <div className="mt-8 space-y-5">
          {blocks.flatMap((b, bi) =>
            paragraphs(b).map((para, i) => (
              <p
                key={bi + "-" + i}
                className="text-[0.9375rem] leading-relaxed text-text-muted"
              >
                {para}
              </p>
            )),
          )}
        </div>
      )}
    </article>
  );
}

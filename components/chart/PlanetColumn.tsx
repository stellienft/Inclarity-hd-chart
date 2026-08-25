import { formatGateLine } from "@/lib/human-design/calculate/gate-line";
import {
  PLANET_GLYPHS,
  PLANET_IDS,
  PLANET_LABELS,
  type PlanetaryActivationSet,
} from "@/lib/human-design/types/activation";

export interface PlanetColumnProps {
  activations: PlanetaryActivationSet;
  side: "design" | "personality";
}

/**
 * One of the two planetary activation columns that flank the BodyGraph.
 *
 * Each row is a filled chip carrying the body's glyph and its gate.line, in
 * the brand's two browns: the lighter taupe for Design, the darker for
 * Personality. The two columns mirror each other — Design reads glyph-then-
 * value on the left, Personality value-then-glyph on the right — so the pair
 * frames the chart rather than repeating the same shape twice. The heading sits
 * centred over both, since the rows below it are mirrored rather than aligned.
 *
 * Values are always the calculated activations; there are no placeholder rows
 * anywhere in this component. The markup stays a real table so the columns are
 * navigable as data rather than as decoration.
 */
export function PlanetColumn({ activations, side }: PlanetColumnProps) {
  const isDesign = side === "design";
  const chip = isDesign ? "bg-ochre-deep" : "bg-dusk";

  return (
    <section
      aria-labelledby={`${side}-column-heading`}
      className="print-compact w-full"
      data-testid={`${side}-column`}
    >
      {/*
        Centred over its own column and set BOLD.
        The brand guide sets display type in Light, and this is the one place
        the product departs from it: at 11px in caps with 0.18em of tracking,
        Light was thinner than the chips it labels and read as a caption rather
        than as the column's name. Client-directed; see docs/BRAND.md. The
        weight comes from a class in globals.css rather than `font-bold`,
        because the unlayered h3 rule there wins against a Tailwind utility.
      */}
      <h3
        id={`${side}-column-heading`}
        className="brand-column-heading mb-2 text-center font-display text-[9px] uppercase tracking-[0.12em] text-dusk sm:mb-3 sm:text-[11px] sm:tracking-[0.18em]"
      >
        {isDesign ? "Design" : "Personality"}
      </h3>

      <table className="w-full border-separate border-spacing-y-1 text-[10px] sm:text-sm">
        <caption className="sr-only">
          {isDesign
            ? "Design (unconscious) planetary activations, gate and line"
            : "Personality (conscious) planetary activations, gate and line"}
        </caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Body</th>
            <th scope="col">Gate and line</th>
          </tr>
        </thead>
        <tbody>
          {PLANET_IDS.map((planet) => {
            const activation = activations[planet];

            /*
              The glyphs run larger than the values beside them, not equal to
              them. They come from a fallback face — Bricolage Grotesque has no
              astrological block — and at a matched size they render optically
              smaller than the digits and lose their internal detail: Mercury's
              horns and Pluto's bowl both close up.
            */
            const glyph = (
              <span
                aria-hidden="true"
                className="inline-block w-4 text-center text-[13px] leading-none sm:w-5 sm:text-[17px]"
              >
                {PLANET_GLYPHS[planet]}
              </span>
            );
            const value = (
              <>
                <span className="sr-only">{PLANET_LABELS[planet]}: </span>
                {formatGateLine(activation)}
                {activation.retrograde ? (
                  <>
                    <span aria-hidden="true" className="ml-0.5 text-[8px] opacity-80 sm:text-[10px]">
                      ℞
                    </span>
                    <span className="sr-only"> retrograde</span>
                  </>
                ) : null}
              </>
            );

            return (
              <tr key={planet}>
                {isDesign ? (
                  <>
                    <th
                      scope="row"
                      className={`w-6 rounded-l-md ${chip} py-1 pl-1.5 text-left font-extralight text-white sm:w-10 sm:py-1.5 sm:pl-2.5`}
                    >
                      {glyph}
                    </th>
                    <td
                      className={`rounded-r-md ${chip} py-1 pr-1.5 text-right font-light tabular-nums text-white sm:py-1.5 sm:pr-2.5`}
                    >
                      {value}
                    </td>
                  </>
                ) : (
                  <>
                    <td
                      className={`rounded-l-md ${chip} py-1 pl-1.5 text-left font-light tabular-nums text-white sm:py-1.5 sm:pl-2.5`}
                    >
                      {value}
                    </td>
                    <th
                      scope="row"
                      className={`w-6 rounded-r-md ${chip} py-1 pr-1.5 text-right font-extralight text-white sm:w-10 sm:py-1.5 sm:pr-2.5`}
                    >
                      {glyph}
                    </th>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

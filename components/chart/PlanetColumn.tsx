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
 * frames the chart rather than repeating the same shape twice.
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
      <h3
        id={`${side}-column-heading`}
        className={`mb-2 font-display text-[9px] font-light uppercase tracking-[0.12em] text-dusk sm:mb-3 sm:text-[11px] sm:tracking-[0.18em] ${
          isDesign ? "text-left" : "text-right"
        }`}
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

            const glyph = (
              <span
                aria-hidden="true"
                className="inline-block w-3 text-center text-[10px] leading-none sm:w-4 sm:text-[13px]"
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
                      className={`w-5 rounded-l-md ${chip} py-1 pl-1.5 text-left font-extralight text-white sm:w-9 sm:py-1.5 sm:pl-2.5`}
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
                      className={`w-5 rounded-r-md ${chip} py-1 pr-1.5 text-right font-extralight text-white sm:w-9 sm:py-1.5 sm:pr-2.5`}
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

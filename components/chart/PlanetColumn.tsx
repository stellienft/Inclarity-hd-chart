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
  const chip = isDesign ? "bg-design" : "bg-ink";

  return (
    <section
      aria-labelledby={`${side}-column-heading`}
      className="print-compact w-full"
      data-testid={`${side}-column`}
    >
      <h3
        id={`${side}-column-heading`}
        className={`mb-3 font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-plum ${
          isDesign ? "text-left" : "text-right"
        }`}
      >
        {isDesign ? "Design" : "Personality"}
      </h3>

      <table className="w-full border-separate border-spacing-y-1 text-sm">
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
                className="inline-block w-4 text-center text-[13px] leading-none"
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
                    <span aria-hidden="true" className="ml-0.5 text-[10px] opacity-80">
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
                      className={`w-9 rounded-l-md ${chip} py-1.5 pl-2.5 text-left font-normal text-white`}
                    >
                      {glyph}
                    </th>
                    <td
                      className={`rounded-r-md ${chip} py-1.5 pr-2.5 text-right font-semibold tabular-nums text-white`}
                    >
                      {value}
                    </td>
                  </>
                ) : (
                  <>
                    <td
                      className={`rounded-l-md ${chip} py-1.5 pl-2.5 text-left font-semibold tabular-nums text-white`}
                    >
                      {value}
                    </td>
                    <th
                      scope="row"
                      className={`w-9 rounded-r-md ${chip} py-1.5 pr-2.5 text-right font-normal text-white`}
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

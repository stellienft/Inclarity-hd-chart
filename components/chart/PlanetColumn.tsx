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
 * Design sits on the left, Personality on the right — the arrangement a
 * trained reader expects. Each row is a pale chip carrying the body's glyph
 * and its gate.line.
 *
 * Values are always the calculated activations; there are no placeholder rows
 * anywhere in this component. The markup stays a real table so the columns are
 * navigable as data rather than as decoration.
 */
export function PlanetColumn({ activations, side }: PlanetColumnProps) {
  const isDesign = side === "design";

  return (
    <section
      aria-labelledby={`${side}-column-heading`}
      className="print-compact w-full"
      data-testid={`${side}-column`}
    >
      <header className="mb-3">
        <h3
          id={`${side}-column-heading`}
          className={`font-display text-[11px] font-semibold uppercase tracking-[0.16em] ${
            isDesign ? "text-design" : "text-ink"
          }`}
        >
          {isDesign ? "Design" : "Personality"}
        </h3>
        <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-plum/60">
          {isDesign ? "Unconscious" : "Conscious"}
        </p>
      </header>

      <table className="w-full border-separate border-spacing-y-1.5 text-sm">
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
            return (
              <tr key={planet}>
                <th
                  scope="row"
                  className="rounded-l-md bg-parchment/70 py-1.5 pl-2.5 text-left font-normal"
                >
                  <span
                    aria-hidden="true"
                    className={`mr-1.5 inline-block w-4 text-center text-[13px] leading-none ${
                      isDesign ? "text-design" : "text-ink"
                    }`}
                  >
                    {PLANET_GLYPHS[planet]}
                  </span>
                  <span className="text-[12px] text-plum">{PLANET_LABELS[planet]}</span>
                </th>
                <td
                  className={`rounded-r-md bg-parchment/70 py-1.5 pr-2.5 text-right font-semibold tabular-nums ${
                    isDesign ? "text-design" : "text-ink"
                  }`}
                >
                  {formatGateLine(activation)}
                  {activation.retrograde ? (
                    <>
                      <span aria-hidden="true" className="ml-1 text-[10px] opacity-70">
                        ℞
                      </span>
                      <span className="sr-only"> retrograde</span>
                    </>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

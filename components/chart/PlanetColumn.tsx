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
 * Design sits on the left in red, Personality on the right in dark grey —
 * the arrangement a trained reader expects. Values are always the calculated
 * activations; there are no placeholder rows anywhere in this component.
 */
export function PlanetColumn({ activations, side }: PlanetColumnProps) {
  const isDesign = side === "design";

  return (
    <section
      aria-labelledby={`${side}-column-heading`}
      className="print-compact w-full"
      data-testid={`${side}-column`}
    >
      <header className="mb-3 border-b border-offgrey pb-2">
        <h3
          id={`${side}-column-heading`}
          className={`font-display text-sm font-semibold uppercase tracking-[0.14em] ${
            isDesign ? "text-design" : "text-ink"
          }`}
        >
          {isDesign ? "Design" : "Personality"}
        </h3>
        <p className="mt-0.5 text-[11px] uppercase tracking-[0.1em] text-plum/70">
          {isDesign ? "Unconscious" : "Conscious"}
        </p>
      </header>

      <table className="w-full border-collapse text-sm">
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
              <tr key={planet} className="border-b border-offgrey/60 last:border-0">
                <th scope="row" className="py-1.5 text-left font-normal">
                  <span
                    aria-hidden="true"
                    className={`mr-2 inline-block w-4 text-base leading-none ${
                      isDesign ? "text-design" : "text-ink"
                    }`}
                    title={PLANET_LABELS[planet]}
                  >
                    {PLANET_GLYPHS[planet]}
                  </span>
                  <span className="text-[13px] text-plum">{PLANET_LABELS[planet]}</span>
                </th>
                <td
                  className={`py-1.5 text-right font-medium tabular-nums ${
                    isDesign ? "text-design" : "text-ink"
                  }`}
                >
                  {formatGateLine(activation)}
                  {activation.retrograde ? (
                    <>
                      <span aria-hidden="true" className="ml-1 text-[11px] opacity-70">
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

import { CENTER_LABELS } from "@/lib/human-design/types/center";
import type { HumanDesignChart } from "@/lib/human-design/types/chart";

/**
 * The chart's information as text.
 *
 * Required by the accessibility brief: everything the BodyGraph conveys
 * visually must also be available in words. This renders the centre states and
 * channel list as real, readable content rather than as alt text — useful to
 * sighted readers too, since it names the centres the SVG deliberately leaves
 * unlabelled.
 */
export function ChartTextSummary({ chart }: { chart: HumanDesignChart }) {
  const definedSet = new Set(chart.centers.defined);

  return (
    <section aria-labelledby="summary-heading" className="print-sheet">
      <h2
        id="summary-heading"
        className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-plum"
      >
        Centres and channels
      </h2>

      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-[11px] font-medium uppercase tracking-[0.12em] text-plum/70">
            The nine centres
          </h3>
          <ul className="mt-2 space-y-1 text-sm">
            {(Object.keys(CENTER_LABELS) as Array<keyof typeof CENTER_LABELS>).map((center) => {
              const defined = definedSet.has(center);
              return (
                <li key={center} className="flex items-center justify-between gap-3">
                  <span className="text-ink">{CENTER_LABELS[center]}</span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      defined
                        ? "bg-plum text-warmwhite"
                        : "border border-offgrey bg-warmwhite text-plum/70"
                    }`}
                  >
                    {defined ? "Defined" : "Undefined"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-medium uppercase tracking-[0.12em] text-plum/70">
            Defined channels ({chart.channels.length})
          </h3>
          {chart.channels.length === 0 ? (
            <p className="mt-2 text-sm text-plum/80">
              No channels are defined, so every centre is open. This is the Reflector
              configuration.
            </p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {chart.channels.map((channel) => (
                <li key={channel.id} className="flex items-baseline gap-2">
                  <span className="font-medium tabular-nums text-ink">{channel.id}</span>
                  <span className="text-plum/80">{channel.name}</span>
                </li>
              ))}
            </ul>
          )}

          {chart.hangingGates.length > 0 ? (
            <>
              <h3 className="mt-5 text-[11px] font-medium uppercase tracking-[0.12em] text-plum/70">
                Activated gates without a partner ({chart.hangingGates.length})
              </h3>
              <p className="mt-1.5 text-sm tabular-nums text-plum/80">
                {chart.hangingGates.join(", ")}
              </p>
              <p className="mt-1 text-xs text-plum/60">
                These gates are activated but their channel is incomplete, so they do not define
                their centre.
              </p>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

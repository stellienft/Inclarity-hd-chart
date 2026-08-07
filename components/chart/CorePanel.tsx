import type { HumanDesignChart } from "@/lib/human-design/types/chart";

interface StatProps {
  label: string;
  value: string;
  hint?: string;
}

function Stat({ label, value, hint }: StatProps) {
  return (
    <div className="print-sheet">
      <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-plum/80">{label}</dt>
      <dd className="mt-1 font-display text-lg leading-snug text-ink sm:text-xl">{value}</dd>
      {hint ? <p className="mt-0.5 text-xs text-plum/70">{hint}</p> : null}
    </div>
  );
}

/**
 * The five core properties, presented plainly and without interpretation.
 *
 * The Incarnation Cross shows its four gate activations and its angle. It does
 * NOT show a cross name: we do not yet hold a verified, lawfully usable naming
 * table, and inventing one would be worse than leaving it out.
 */
export function CorePanel({ chart }: { chart: HumanDesignChart }) {
  return (
    <section aria-labelledby="core-heading" className="print-sheet" data-testid="core-panel">
      <h2 id="core-heading" className="sr-only">
        Your core Human Design properties
      </h2>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
        <Stat label="Energy Type" value={chart.type} />
        <Stat label="Strategy" value={chart.strategy} />
        <Stat label="Authority" value={chart.authority} />
        <Stat label="Profile" value={chart.profile} hint={chart.profileName} />
        <Stat label="Definition" value={chart.definition} />
        <Stat
          label="Incarnation Cross"
          value={chart.incarnationCross.notation}
          hint={`${chart.incarnationCross.angle} — gates only; names are not yet published`}
        />
      </dl>
    </section>
  );
}

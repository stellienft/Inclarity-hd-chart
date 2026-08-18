import { notFound } from "next/navigation";

import { isChartDebugEnabled } from "@/lib/config/site";
import { formatInZone } from "@/lib/birth/timezone";
import { calculateChart } from "@/lib/human-design";
import { formatGateLine } from "@/lib/human-design/calculate/gate-line";
import { PLANET_IDS, PLANET_LABELS } from "@/lib/human-design/types/activation";
import type { LocationResult } from "@/lib/location/types";

export const dynamic = "force-dynamic";

/**
 * Calculation inspector.
 *
 * Shows every intermediate value between birth details and finished chart, so
 * a disputed chart can be traced rather than argued about. Disabled in
 * production unless ENABLE_CHART_DEBUG is explicitly set.
 */

interface SearchParams {
  date?: string;
  time?: string;
  lat?: string;
  lon?: string;
  tz?: string;
  place?: string;
}

const DEFAULTS = {
  date: "1990-03-01",
  time: "14:32",
  lat: "-27.4698",
  lon: "153.0251",
  tz: "Australia/Brisbane",
  place: "Brisbane, Queensland, Australia",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,240px)_1fr] gap-4 border-b border-pebble py-1.5">
      <dt className="text-dusk">{label}</dt>
      <dd className="font-mono text-[13px] break-all text-espresso">{value}</dd>
    </div>
  );
}

export default async function ChartDebugPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  if (!isChartDebugEnabled()) notFound();

  const params = { ...DEFAULTS, ...(await searchParams) };
  const location: LocationResult = {
    displayName: params.place,
    city: params.place.split(",")[0] ?? params.place,
    region: "",
    country: "",
    latitude: Number(params.lat),
    longitude: Number(params.lon),
    timezone: params.tz,
  };

  const { chart, diagnostics } = await calculateChart({
    date: params.date,
    time: params.time,
    location,
  });

  const solver = diagnostics.designSolver;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 text-sm">
      <h1 className="font-display text-2xl text-espresso">Chart calculation inspector</h1>
      <p className="mt-2 text-dusk">
        Development tool. Override with query parameters:{" "}
        <code className="font-mono text-xs">?date=&amp;time=&amp;lat=&amp;lon=&amp;tz=&amp;place=</code>
      </p>

      <section className="mt-10">
        <h2 className="font-display text-lg text-espresso">1 · Birth data conversion</h2>
        <dl className="mt-3">
          <Row label="Local date / time (input)" value={`${params.date} ${params.time}`} />
          <Row label="Requested timezone" value={params.tz} />
          <Row label="Resolved timezone (from coordinates)" value={chart.subject.timezone} />
          <Row label="Coordinates" value={`${location.latitude}, ${location.longitude}`} />
          <Row label="Local ISO with offset" value={chart.subject.birthLocal} />
          <Row label="UTC offset (minutes)" value={String(chart.subject.offsetMinutes)} />
          <Row label="DST ambiguity" value={chart.subject.dstAmbiguity} />
          <Row label="Birth UTC" value={chart.subject.birthUtc} />
          <Row
            label="Birth rendered in birth zone"
            value={formatInZone(new Date(chart.subject.birthUtc), chart.subject.timezone)}
          />
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg text-espresso">2 · Design moment (88° solar arc)</h2>
        <dl className="mt-3">
          <Row label="Birth Sun longitude" value={`${solver.birthSunLongitude.toFixed(9)}°`} />
          <Row label="Target Sun longitude" value={`${solver.targetSunLongitude.toFixed(9)}°`} />
          <Row label="Design UTC (solved)" value={chart.subject.designUtc} />
          <Row label="Design Sun longitude" value={`${solver.designSunLongitude.toFixed(9)}°`} />
          <Row label="Achieved solar arc" value={`${solver.solarArcDeg.toFixed(9)}°`} />
          <Row label="Residual error" value={`${solver.residualDeg.toExponential(3)}°`} />
          <Row label="Elapsed days" value={solver.elapsedDays.toFixed(6)} />
          <Row
            label="Difference from a naive 88 days"
            value={`${(solver.elapsedDays - 88).toFixed(6)} days`}
          />
          <Row label="Bisection iterations" value={String(solver.iterations)} />
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg text-espresso">3 · Raw longitudes and gate mapping</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-left font-mono text-[12px]">
            <thead>
              <tr className="border-b border-dusk/40 text-dusk">
                <th className="py-1.5 pr-4">Body</th>
                <th className="py-1.5 pr-4">Design longitude</th>
                <th className="py-1.5 pr-4">Design</th>
                <th className="py-1.5 pr-4">Personality longitude</th>
                <th className="py-1.5 pr-4">Personality</th>
                <th className="py-1.5">Line decimal (P)</th>
              </tr>
            </thead>
            <tbody>
              {PLANET_IDS.map((planet) => {
                const d = chart.design[planet];
                const p = chart.personality[planet];
                return (
                  <tr key={planet} className="border-b border-pebble">
                    <td className="py-1 pr-4 text-dusk">{PLANET_LABELS[planet]}</td>
                    <td className="py-1 pr-4">{d.longitude.toFixed(6)}°</td>
                    <td className="py-1 pr-4 text-espresso">
                      {formatGateLine(d)}
                      {d.retrograde ? " ℞" : ""}
                    </td>
                    <td className="py-1 pr-4">{p.longitude.toFixed(6)}°</td>
                    <td className="py-1 pr-4 text-espresso">
                      {formatGateLine(p)}
                      {p.retrograde ? " ℞" : ""}
                    </td>
                    <td className="py-1">{p.lineDecimal.toFixed(4)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg text-espresso">4 · Derivation</h2>
        <dl className="mt-3">
          <Row label="Active gates" value={chart.activeGates.map((g) => g.gate).join(", ")} />
          <Row label="Hanging gates" value={chart.hangingGates.join(", ") || "(none)"} />
          <Row label="Active channels" value={chart.channels.map((c) => c.id).join(", ") || "(none)"} />
          <Row label="Defined centres" value={chart.centers.defined.join(", ") || "(none)"} />
          <Row label="Undefined centres" value={chart.centers.undefined.join(", ")} />
          <Row label="Centre graph" value={JSON.stringify(diagnostics.definitionAdjacency)} />
          <Row label="Connected components" value={JSON.stringify(chart.centers.components)} />
          <Row label="Definition" value={chart.definition} />
          <Row label="Sacral defined" value={String(diagnostics.typeDerivation.sacralDefined)} />
          <Row label="Motor reaches Throat" value={String(diagnostics.typeDerivation.motorToThroat)} />
          <Row
            label="Connected motors"
            value={diagnostics.typeDerivation.connectedMotors.join(", ") || "(none)"}
          />
          <Row
            label="Motor → Throat path"
            value={diagnostics.typeDerivation.motorPath?.join(" → ") ?? "(none)"}
          />
          <Row label="Type" value={chart.type} />
          <Row label="Authority" value={chart.authority} />
          <Row label="Authority rule" value={diagnostics.authorityRule} />
          <Row
            label="Profile"
            value={`${chart.profile} (P.Sun line ${chart.personality.sun.line}, D.Sun line ${chart.design.sun.line})`}
          />
          <Row
            label="Incarnation Cross"
            value={`${chart.incarnationCross.angle} ${chart.incarnationCross.notation}`}
          />
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg text-espresso">5 · Calculation metadata</h2>
        <dl className="mt-3">
          <Row label="Ephemeris provider" value={chart.calculationMeta.ephemerisProvider} />
          <Row label="Node convention" value={chart.calculationMeta.nodeConvention} />
          <Row label="Engine version" value={chart.calculationMeta.engineVersion} />
          <Row label="Gate mapping version" value={chart.calculationMeta.gateMappingVersion} />
          <Row
            label="Warnings"
            value={chart.calculationMeta.warnings.join(" | ") || "(none)"}
          />
        </dl>
      </section>
    </main>
  );
}

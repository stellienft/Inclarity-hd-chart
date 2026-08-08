import { DateTime } from "luxon";

import { channelCode } from "@/lib/human-design/constants/channels";
import type { HumanDesignChart } from "@/lib/human-design/types/chart";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)] gap-x-4 gap-y-0.5 py-1 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
      <dt className="text-sm font-semibold text-ink">{label}</dt>
      <dd className="text-sm text-plum">{children}</dd>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-6 font-display text-base font-semibold text-sagedeep first:mt-0">
      {children}
    </h3>
  );
}

function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `UTC${sign}${hh}:${mm}`;
}

/**
 * The chart's data, laid out as a reference sheet rather than a set of
 * headline tiles.
 *
 * Deliberately absent, and called out at the foot rather than left as a silent
 * gap: the Variable fields (Brain, Determination, Cognition, Environment,
 * Motivation, Sense, Trajectory, View) that established calculators print
 * alongside these. Every one of them is read off Colour and Tone, which this
 * engine does not calculate — see docs/HUMAN_DESIGN_CALCULATION.md §8. Printing
 * them would mean inventing values.
 */
export function FoundationChart({ chart }: { chart: HumanDesignChart }) {
  const { subject } = chart;
  const local = DateTime.fromISO(subject.birthLocal, { setZone: true });
  const utc = DateTime.fromISO(subject.birthUtc, { zone: "utc" });
  const design = DateTime.fromISO(subject.designUtc, { zone: "utc" });
  const age = Math.floor(Math.abs(local.diffNow("years").years));

  return (
    <section aria-labelledby="foundation-heading" className="print-sheet" data-testid="core-panel">
      <h2 id="foundation-heading" className="font-display text-2xl text-ink">
        Foundation Chart
      </h2>

      <dl className="mt-5 divide-y divide-offgrey/70">
        <Row label="Name">{subject.name?.trim() || "—"}</Row>
        <Row label="Birth Date (Local)">
          {local.toFormat("dd LLLL yyyy, HH:mm")} ({formatOffset(subject.offsetMinutes)})
        </Row>
        <Row label="Birth Date (UTC)">{utc.toFormat("dd LLLL yyyy, HH:mm")}</Row>
        <Row label="Birth Place">{subject.birthLocation.displayName}</Row>
        <Row label="Geographic Coordinates">
          {subject.birthLocation.latitude.toFixed(4)}, {subject.birthLocation.longitude.toFixed(4)}
        </Row>
        <Row label="Age">{age} years</Row>
      </dl>

      <dl className="mt-5 divide-y divide-offgrey/70">
        <Row label="Type">{chart.type}</Row>
        <Row label="Profile">
          {chart.profile} — {chart.profileName}
        </Row>
        <Row label="Definition">{chart.definition}</Row>
        <Row label="Incarnation Cross">
          {chart.incarnationCross.angle} {chart.incarnationCross.notation}
          <span className="block text-xs text-plum/60">
            Gates only — we do not yet hold a verified cross-name table
          </span>
        </Row>
        <Row label="Inner Authority">{chart.authority}</Row>
        <Row label="Strategy">{chart.strategy}</Row>
        <Row label="Themes">
          {chart.signature} / {chart.notSelfTheme}
        </Row>
      </dl>

      <SectionHeading>Design</SectionHeading>
      <dl className="mt-2 divide-y divide-offgrey/70">
        <Row label="Design Date (UTC)">{design.toFormat("dd LLLL yyyy, HH:mm:ss")}</Row>
        <Row label="Solar arc">
          88° before the birth Sun, solved to{" "}
          {chart.calculationMeta.designSolverResidualDeg.toExponential(1)}°
        </Row>
        <Row label="Elapsed">{chart.calculationMeta.designElapsedDays.toFixed(3)} days</Row>
      </dl>

      <SectionHeading>Channels</SectionHeading>
      <dl className="mt-2 divide-y divide-offgrey/70">
        <Row label={`Channels (${chart.channels.length})`}>
          {chart.channels.length === 0 ? (
            "None — every centre is open"
          ) : (
            <ul className="space-y-0.5">
              {chart.channels.map((channel) => (
                <li key={channel.id} className="tabular-nums">
                  {channelCode(channel.gates[0], channel.gates[1])} — {channel.name}
                </li>
              ))}
            </ul>
          )}
        </Row>
        {chart.hangingGates.length > 0 ? (
          <Row label={`Hanging gates (${chart.hangingGates.length})`}>
            <span className="tabular-nums">{chart.hangingGates.join(", ")}</span>
            <span className="block text-xs text-plum/60">
              Activated, but their channel is incomplete, so they define no centre
            </span>
          </Row>
        ) : null}
      </dl>

      <p className="mt-6 border-t border-offgrey pt-4 text-xs leading-relaxed text-plum/70">
        <span className="font-semibold text-plum">Not shown:</span> the Variable fields — Brain,
        Determination, Cognition, Environment, Motivation, Sense, Trajectory and View — along with
        the four Variable arrows. All of them are read off Colour and Tone, a further subdivision of
        each line that this engine does not yet calculate to a standard we can stand behind. They
        are omitted rather than estimated.
      </p>
    </section>
  );
}

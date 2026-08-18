import { DateTime } from "luxon";

import { channelCode } from "@/lib/human-design/constants/channels";
import { VARIABLE_POSITIONS } from "@/lib/human-design/derive/variable";
import type { HumanDesignChart } from "@/lib/human-design/types/chart";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)] gap-x-4 gap-y-0.5 py-1 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
      <dt className="text-sm font-light text-espresso">{label}</dt>
      <dd className="text-sm text-dusk">{children}</dd>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-6 font-display text-base text-dusk first:mt-0">
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
      <h2 id="foundation-heading" className="font-display text-2xl text-espresso">
        Foundation Chart
      </h2>

      <dl className="mt-5 divide-y divide-pebble/70">
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

      <dl className="mt-5 divide-y divide-pebble/70">
        <Row label="Type">{chart.type}</Row>
        <Row label="Profile">
          {chart.profile} — {chart.profileName}
        </Row>
        <Row label="Definition">{chart.definition}</Row>
        <Row label="Incarnation Cross">
          {chart.incarnationCross.angle} {chart.incarnationCross.notation}
          <span className="block text-xs text-dusk/60">
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
      <dl className="mt-2 divide-y divide-pebble/70">
        <Row label="Design Date (UTC)">{design.toFormat("dd LLLL yyyy, HH:mm:ss")}</Row>
        <Row label="Solar arc">
          88° before the birth Sun, solved to{" "}
          {chart.calculationMeta.designSolverResidualDeg.toExponential(1)}°
        </Row>
        <Row label="Elapsed">{chart.calculationMeta.designElapsedDays.toFixed(3)} days</Row>
      </dl>

      <SectionHeading>Variable</SectionHeading>
      <dl className="mt-2 divide-y divide-pebble/70">
        {VARIABLE_POSITIONS.map((position) => {
          const arrow = chart.variable.arrows[position];
          return (
            <Row key={position} label={arrow.label}>
              <span className="tabular-nums">
                Colour {arrow.color}, Tone {arrow.tone}
              </span>
              {" — "}
              <span aria-hidden="true">{arrow.direction === "left" ? "←" : "→"}</span>{" "}
              {arrow.direction === "left" ? "Left" : "Right"}
              <span className="block text-xs text-dusk/60">
                {arrow.side === "design" ? "Design" : "Personality"}{" "}
                {position === "determination" || position === "motivation" ? "Sun" : "Nodes"}
                {arrow.nearToneBoundary
                  ? " · on the edge of its Tone, so the direction is provisional"
                  : ""}
              </span>
            </Row>
          );
        })}
        <Row label="Notation">
          <span className="tabular-nums">{chart.variable.notation}</span>
          <span className="block text-xs text-dusk/60">
            Design pair, then Personality pair. Tone sets the direction: 1–3 left, 4–6 right.
          </span>
        </Row>
      </dl>

      <SectionHeading>Channels</SectionHeading>
      <dl className="mt-2 divide-y divide-pebble/70">
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
            <span className="block text-xs text-dusk/60">
              Activated, but their channel is incomplete, so they define no centre
            </span>
          </Row>
        ) : null}
      </dl>

      <p className="mt-6 border-t border-pebble pt-4 text-xs leading-relaxed text-dusk/70">
        <span className="font-light text-dusk">Not shown:</span> the named Variable fields —
        Brain, Cognition, Sense, Trajectory and the rest — which read the Colour and Tone above
        off tables published in the Human Design literature. The arrows and their numbers are
        calculated here; the names those numbers map to are not, so they are omitted rather than
        guessed. Also absent are Fixing marks (exaltation and detriment), for the same reason.
      </p>

      <p className="mt-3 text-xs leading-relaxed text-dusk/70">
        A Tone is roughly 38 minutes of the Sun&rsquo;s motion, so the arrows depend on the birth
        time far more sharply than the rest of the chart does. Where one sits close to a boundary,
        the chart says so instead of presenting it as settled.
      </p>
    </section>
  );
}

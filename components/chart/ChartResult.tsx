"use client";

import { BodyGraph } from "@/components/bodygraph/BodyGraph";
import { siteConfig } from "@/lib/config/site";
import type { HumanDesignChart } from "@/lib/human-design/types/chart";

import { ChartTextSummary } from "./ChartTextSummary";
import { FoundationChart } from "./FoundationChart";
import { Orientation } from "./Orientation";
import { PlanetColumn } from "./PlanetColumn";

export interface ChartResultProps {
  chart: HumanDesignChart;
  onReset: () => void;
}

function formatBirthLine(chart: HumanDesignChart): string {
  const [datePart, rest] = chart.subject.birthLocal.split("T");
  const clock = rest?.slice(0, 5) ?? "";
  return `${datePart} at ${clock} · ${chart.subject.birthLocation.displayName}`;
}

export function ChartResult({ chart, onReset }: ChartResultProps) {
  const name = chart.subject.name?.trim();

  return (
    <div className="space-y-14">
      {/* ---- Header ---- */}
      <header className="print-sheet border-b border-pebble pb-8">
        <p className="font-display text-xs uppercase tracking-[0.2em] text-dusk/70">
          {siteConfig.brand} · Human Design Chart
        </p>
        <h1 className="mt-3 font-display text-3xl text-espresso sm:text-4xl">
          {name ? name : "Your Human Design"}
        </h1>
        <p className="mt-2 text-sm text-dusk">{formatBirthLine(chart)}</p>
      </header>

      {/* ---- Anything the engine wants the reader to know ---- */}
      {chart.calculationMeta.warnings.length > 0 ? (
        <div
          role="note"
          className="print-sheet rounded-md border border-ochre/40 bg-ochre/5 px-5 py-4"
        >
          <h2 className="font-display text-sm font-light text-espresso">
            Worth knowing about this chart
          </h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-dusk">
            {chart.calculationMeta.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/*
        The BodyGraph leads. It is the thing a reader recognises and the reason
        they came; the Foundation Chart below it is the reference detail they
        consult second.
      */}
      <section aria-labelledby="bodygraph-heading" className="print-sheet">
        <h2 id="bodygraph-heading" className="sr-only">
          Your BodyGraph with Design and Personality activations
        </h2>

        {/*
          Design | BodyGraph | Personality at EVERY width. The columns flank
          the chart on a phone just as they do on a desktop and on paper —
          stacking them below would break the arrangement a Human Design reader
          expects. The side columns size to their content so the chart keeps
          whatever is left.
        */}
        <div className="print-grid grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-1.5 sm:gap-4 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,3.1fr)_minmax(0,0.62fr)] lg:gap-6">
          <div data-col="design">
            <PlanetColumn activations={chart.design} side="design" />
          </div>

          <div data-col="graph">
            {/* The BodyGraph is the hero: it takes the full column width. */}
            <div className="mx-auto w-full max-w-[46rem]">
              <BodyGraph
                chart={chart}
                className="h-auto w-full"
                title={
                  name ? `${name}'s Human Design BodyGraph` : "Human Design BodyGraph"
                }
              />
            </div>
          </div>

          <div data-col="personality">
            <PlanetColumn activations={chart.personality} side="personality" />
          </div>
        </div>

        <p className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-dusk/80">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="inline-block h-1 w-6 rounded-full bg-espresso" />
            Personality (conscious)
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="inline-block h-1 w-6 rounded-full bg-ochre-deep" />
            Design (unconscious)
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-1 w-6 rounded-full bg-ochre-deep"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg,#4A403A 0 4px,transparent 4px 8px)",
              }}
            />
            Both
          </span>
        </p>
      </section>

      <FoundationChart chart={chart} />

      <ChartTextSummary chart={chart} />

      <Orientation />

      {/* ---- Call to action ---- */}
      <section
        aria-labelledby="cta-heading"
        className="no-print rounded-lg bg-pebble px-6 py-8 sm:px-10 sm:py-10"
      >
        <h2 id="cta-heading" className="font-display text-xl text-espresso sm:text-2xl">
          Want to explore your chart more deeply?
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-dusk">
          Your chart contains much more than a set of labels. In a personalised Inclarity Space
          session, we explore how these mechanics show up within the context of your life.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <a
            href={siteConfig.bookingUrl}
            className="rounded-md bg-dusk px-6 py-3 font-display text-base font-light text-linen transition-opacity hover:opacity-90"
          >
            Explore a 1:1
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md border border-dusk px-6 py-3 font-display text-base font-light text-dusk transition-colors hover:bg-dusk/5"
          >
            Print or save as PDF
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-md px-6 py-3 font-display text-base font-light text-dusk underline underline-offset-4 hover:opacity-80"
          >
            Create another chart
          </button>
        </div>
      </section>

      {/* ---- Print-only footer ---- */}
      <div className="print-only border-t border-pebble pt-4 text-[8pt] text-dusk">
        <p>
          {siteConfig.brand} — Human Design Chart Generator · {siteConfig.bookingUrl}
        </p>
        <p className="mt-1">{siteConfig.disclaimer}</p>
        <p className="mt-1">
          Engine {chart.calculationMeta.engineVersion} · {chart.calculationMeta.ephemerisProvider} ·{" "}
          {chart.calculationMeta.gateMappingVersion}
        </p>
      </div>
    </div>
  );
}

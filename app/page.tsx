"use client";

import { useEffect, useRef, useState } from "react";

import { ChartResult } from "@/components/chart/ChartResult";
import { BirthForm } from "@/components/form/BirthForm";
import { siteConfig } from "@/lib/config/site";
import type { HumanDesignChart } from "@/lib/human-design/types/chart";

export default function HomePage() {
  const [chart, setChart] = useState<HumanDesignChart | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chart) resultRef.current?.focus();
  }, [chart]);

  return (
    <div className="min-h-screen">
      <main id="main" className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        {chart ? (
          <div ref={resultRef} tabIndex={-1} className="outline-none">
            <ChartResult chart={chart} onReset={() => setChart(null)} />
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">
            <p className="font-display text-xs uppercase tracking-[0.2em] text-plum/70">
              {siteConfig.brand}
            </p>
            <h1 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
              Create your Human Design chart
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-plum">
              Enter your birth details to generate your Human Design BodyGraph and explore the
              mechanics that shape your design.
            </p>

            <div className="mt-12">
              <BirthForm onChart={setChart} />
            </div>
          </div>
        )}
      </main>

      <footer className="no-print mt-8 border-t border-offgrey">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
          <p className="max-w-3xl text-xs leading-relaxed text-plum/70">{siteConfig.disclaimer}</p>
          <p className="mt-3 text-xs text-plum/60">
            {siteConfig.privacyNote}
          </p>
          <p className="mt-4 font-display text-xs uppercase tracking-[0.2em] text-plum/50">
            {siteConfig.brand}
          </p>
        </div>
      </footer>
    </div>
  );
}

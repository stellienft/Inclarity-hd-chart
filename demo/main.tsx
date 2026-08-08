/**
 * Standalone browser build of the chart generator.
 *
 * This exists so the generator can be shared as a single self-contained page.
 * It imports the REAL engine and the REAL components — `calculateChart`,
 * `BodyGraph`, `ChartResult` are the same modules the Next.js app uses, so what
 * you test here is what the app produces.
 *
 * Two things differ from the deployed app, both forced by running with no
 * server:
 *
 *   1. Calculation runs in the browser instead of in `/api/chart`.
 *   2. Birth-place search uses the built-in offline gazetteer instead of the
 *      Open-Meteo geocoder, so it covers ~70 major cities rather than the
 *      world. The timezone logic is identical either way.
 */
import { StrictMode, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { ChartResult } from "@/components/chart/ChartResult";
import { calculateChart } from "@/lib/human-design";
import type { HumanDesignChart } from "@/lib/human-design/types/chart";
import { searchStaticCities, STATIC_CITY_COUNT } from "@/lib/location/static-cities";
import type { LocationResult } from "@/lib/location/types";


function LocationPicker({
  value,
  onChange,
  error,
}: {
  value: LocationResult | null;
  onChange: (l: LocationResult | null) => void;
  error?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();
  const results = useMemo(
    () => (trimmed.length < 2 ? [] : searchStaticCities(trimmed)),
    [trimmed],
  );

  useEffect(() => {
    function onDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function select(location: LocationResult) {
    setQuery(location.displayName);
    onChange(location);
    setOpen(false);
    setActiveIndex(-1);
  }

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor="place" className="block text-sm font-medium text-ink">
        Birth place
      </label>
      <input
        id="place"
        type="text"
        role="combobox"
        autoComplete="off"
        aria-expanded={open && results.length > 0}
        aria-controls="place-listbox"
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `place-option-${activeIndex}` : undefined}
        aria-describedby="place-help"
        placeholder="Brisbane, Queensland, Australia"
        className={`mt-1.5 w-full rounded-md border bg-white px-3 py-2.5 text-ink placeholder:text-plum/40 ${
          error ? "border-design" : "border-offgrey"
        }`}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
          if (value) onChange(null);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (results.length === 0) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((i) => (i + 1) % results.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
          } else if (event.key === "Enter") {
            const chosen = results[activeIndex];
            if (chosen) {
              event.preventDefault();
              select(chosen);
            }
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      <p id="place-help" className="mt-1.5 text-xs text-plum/70" aria-live="polite">
        {value
          ? `Selected: ${value.displayName} · timezone ${value.timezone}`
          : `This shared build searches ${STATIC_CITY_COUNT} major cities offline. The live app searches worldwide.`}
      </p>
      {error ? (
        <p role="alert" className="mt-1 text-sm text-design">
          {error}
        </p>
      ) : null}

      {open && results.length > 0 ? (
        <ul
          id="place-listbox"
          role="listbox"
          aria-label="Birth place suggestions"
          className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border border-offgrey bg-white py-1 shadow-lg"
        >
          {results.map((result, index) => (
            <li
              key={result.displayName}
              id={`place-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={`cursor-pointer px-3 py-2 text-sm ${
                index === activeIndex ? "bg-parchment text-ink" : "text-ink"
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => {
                event.preventDefault();
                select(result);
              }}
            >
              <span className="block">{result.displayName}</span>
              <span className="block text-xs text-plum/70">{result.timezone}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function App() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [chart, setChart] = useState<HumanDesignChart | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chart) resultRef.current?.focus();
  }, [chart]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!date) next.date = "Please enter your birth date.";
    if (!time) next.time = "Please enter your birth time.";
    if (!location) next.location = "Please search for and select your birth place.";
    setErrors(next);
    if (Object.keys(next).length > 0 || !location) return;

    setBusy(true);
    try {
      const { chart: result } = await calculateChart({
        ...(name.trim() ? { name: name.trim() } : {}),
        date,
        time,
        location,
      });
      setChart(result);
    } catch (cause) {
      setErrors({
        form: cause instanceof Error ? cause.message : "The chart could not be calculated.",
      });
    } finally {
      setBusy(false);
    }
  }

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
              Inclarity Space
            </p>
            <h1 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
              Create your Human Design chart
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-plum">
              Enter your birth details to generate your Human Design BodyGraph and explore the
              mechanics that shape your design.
            </p>

            <form onSubmit={onSubmit} noValidate className="mt-12 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-ink">
                  Name <span className="font-normal text-plum/60">(optional)</span>
                </label>
                <input
                  id="name"
                  type="text"
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="How you'd like the chart addressed"
                  className="mt-1.5 w-full rounded-md border border-offgrey bg-white px-3 py-2.5 text-ink placeholder:text-plum/40"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-ink">
                    Birth date
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={date}
                    min="1800-01-01"
                    max="2100-12-31"
                    onChange={(e) => setDate(e.target.value)}
                    aria-invalid={errors.date ? true : undefined}
                    className={`mt-1.5 w-full rounded-md border bg-white px-3 py-2.5 text-ink ${
                      errors.date ? "border-design" : "border-offgrey"
                    }`}
                  />
                  {errors.date ? (
                    <p role="alert" className="mt-1 text-sm text-design">
                      {errors.date}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-ink">
                    Birth time
                  </label>
                  <input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    aria-invalid={errors.time ? true : undefined}
                    aria-describedby="time-help"
                    className={`mt-1.5 w-full rounded-md border bg-white px-3 py-2.5 text-ink ${
                      errors.time ? "border-design" : "border-offgrey"
                    }`}
                  />
                  <p id="time-help" className="mt-1.5 text-xs text-plum/70">
                    Your birth time can affect the details of your chart. Use the most accurate
                    time available to you.
                  </p>
                  {errors.time ? (
                    <p role="alert" className="mt-1 text-sm text-design">
                      {errors.time}
                    </p>
                  ) : null}
                </div>
              </div>

              <LocationPicker
                value={location}
                onChange={setLocation}
                {...(errors.location ? { error: errors.location } : {})}
              />

              {errors.form ? (
                <p
                  role="alert"
                  className="rounded-md border border-design/30 bg-design/5 px-4 py-3 text-sm text-design"
                >
                  {errors.form}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-md bg-plum px-6 py-3 font-display text-base font-medium text-warmwhite transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {busy ? "Calculating…" : "Generate my chart"}
                </button>
                <p className="text-xs text-plum/70">
                  Everything runs in your browser. Nothing is sent anywhere or stored.
                </p>
              </div>
            </form>

            <div className="mt-10 rounded-md border border-offgrey bg-parchment/50 px-5 py-4">
              <h2 className="font-display text-sm font-semibold text-ink">Try one</h2>
              <p className="mt-1.5 text-sm text-plum">
                9 April 1948, 00:05, Montreal — the founder of Human Design. The engine returns
                Manifestor, Splenic authority, 5/1 profile and cross gates 51/57 | 61/62, matching
                his published chart.
              </p>
              <button
                type="button"
                className="mt-3 text-sm font-medium text-plum underline underline-offset-4"
                onClick={() => {
                  setName("Ra Uru Hu");
                  setDate("1948-04-09");
                  setTime("00:05");
                  const montreal = searchStaticCities("Montreal")[0];
                  if (montreal) setLocation(montreal);
                  setErrors({});
                }}
              >
                Fill these details in
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="no-print mt-8 border-t border-offgrey">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
          <p className="max-w-3xl text-xs leading-relaxed text-plum/70">
            Human Design is a framework for personal reflection and experimentation. It is not
            scientifically validated and should not replace medical, psychological, legal or
            financial advice.
          </p>
          <p className="mt-3 max-w-3xl text-xs text-plum/60">
            Shared preview of the Inclarity Space chart generator. The calculation engine is
            identical to the live application; birth-place search is limited to{" "}
            {STATIC_CITY_COUNT} major cities because this page runs without a server.
          </p>
        </div>
      </footer>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

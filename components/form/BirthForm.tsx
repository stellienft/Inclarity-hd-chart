"use client";

import { useState } from "react";

import { siteConfig } from "@/lib/config/site";
import type { HumanDesignChart } from "@/lib/human-design/types/chart";
import type { LocationResult } from "@/lib/location/types";

import { LocationSearch } from "./LocationSearch";

export interface BirthFormProps {
  onChart: (chart: HumanDesignChart) => void;
}

interface FieldErrors {
  date?: string;
  time?: string;
  location?: string;
  email?: string;
  form?: string;
}

/**
 * Deliberately permissive: one @, something either side, a dot in the domain.
 *
 * The only address this can reject with confidence is one that is obviously
 * mistyped. Anything stricter starts refusing addresses that are perfectly
 * valid — plus-tags, new TLDs, unicode domains — and the cost of a false
 * rejection here is a visitor who cannot submit at all.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BirthForm({ onChart }: BirthFormProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!date) next.date = "Please enter your birth date.";
    if (!time) next.time = "Please enter your birth time.";
    if (!location) next.location = "Please search for and select your birth place.";
    // Optional, like the name — but if something has been typed, it has to look
    // like an address, or the visitor never finds out it was wrong.
    if (email.trim() && !EMAIL.test(email.trim())) {
      next.email = "Please enter a valid email address, or leave it blank.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate() || !location) return;

    setSubmitting(true);
    setErrors({});

    try {
      const response = await fetch("/api/chart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...(name.trim() ? { name: name.trim() } : {}),
          date,
          time,
          location,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        setErrors({
          form: payload?.error?.message ?? "Something went wrong calculating your chart.",
        });
        return;
      }

      onChart((await response.json()) as HumanDesignChart);
    } catch {
      setErrors({ form: "Could not reach the server. Please check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6" data-testid="birth-form">
      <div>
        <label htmlFor="name" className="block text-sm font-light text-espresso">
          Name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          maxLength={80}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1.5 w-full rounded-md border border-pebble bg-white px-3 py-2.5 text-espresso placeholder:text-dusk/40"
          placeholder="How you'd like the chart addressed"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="block text-sm font-light text-espresso">
            Birth date
          </label>
          <input
            id="date"
            type="date"
            required
            value={date}
            min="1800-01-01"
            max="2100-12-31"
            onChange={(event) => setDate(event.target.value)}
            aria-invalid={errors.date ? true : undefined}
            aria-describedby={errors.date ? "date-error" : undefined}
            className={`mt-1.5 w-full rounded-md border bg-white px-3 py-2.5 text-espresso ${
              errors.date ? "border-ochre-deep" : "border-pebble"
            }`}
          />
          {errors.date ? (
            <p id="date-error" role="alert" className="mt-1 text-sm text-dusk">
              {errors.date}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-light text-espresso">
            Birth time
          </label>
          <input
            id="time"
            type="time"
            required
            value={time}
            onChange={(event) => setTime(event.target.value)}
            aria-invalid={errors.time ? true : undefined}
            aria-describedby={`time-help${errors.time ? " time-error" : ""}`}
            className={`mt-1.5 w-full rounded-md border bg-white px-3 py-2.5 text-espresso ${
              errors.time ? "border-ochre-deep" : "border-pebble"
            }`}
          />
          <p id="time-help" className="mt-1.5 text-xs text-dusk/70">
            Your birth time can affect the details of your chart. Use the most accurate time
            available to you.
          </p>
          {errors.time ? (
            <p id="time-error" role="alert" className="mt-1 text-sm text-dusk">
              {errors.time}
            </p>
          ) : null}
        </div>
      </div>

      <LocationSearch
        value={location}
        onChange={setLocation}
        {...(errors.location ? { error: errors.location } : {})}
      />

      {/*
        The address is held in the form and goes NOWHERE — it is not added to
        the request, so nothing about a visitor leaves the browser that did not
        before. Give it a destination and the privacy note in lib/config/site.ts
        has to be rewritten to match, since it currently promises that nothing
        is saved.
      */}
      <div>
        <label htmlFor="email" className="block text-sm font-light text-espresso">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={`mt-1.5 w-full rounded-md border bg-white px-3 py-2.5 text-espresso placeholder:text-dusk/40 ${
            errors.email ? "border-ochre-deep" : "border-pebble"
          }`}
          placeholder="you@example.com"
        />
        {errors.email ? (
          <p id="email-error" role="alert" className="mt-1 text-sm text-dusk">
            {errors.email}
          </p>
        ) : null}
      </div>

      {errors.form ? (
        <p role="alert" className="rounded-md border border-ochre-deep/30 bg-ochre-deep/5 px-4 py-3 text-sm text-dusk">
          {errors.form}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-dusk px-6 py-3 font-display text-base font-light text-linen transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Calculating…" : "Generate my chart"}
        </button>
        <p className="text-xs text-dusk/70">{siteConfig.privacyNote}</p>
      </div>

      <p aria-live="polite" className="sr-only">
        {submitting ? "Calculating your chart" : ""}
      </p>
    </form>
  );
}

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
  form?: string;
}

export function BirthForm({ onChart }: BirthFormProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!date) next.date = "Please enter your birth date.";
    if (!time) next.time = "Please enter your birth time.";
    if (!location) next.location = "Please search for and select your birth place.";
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
        <label htmlFor="name" className="block text-sm font-medium text-ink">
          Name <span className="font-normal text-plum/60">(optional)</span>
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          maxLength={80}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1.5 w-full rounded-md border border-offgrey bg-white px-3 py-2.5 text-ink placeholder:text-plum/40"
          placeholder="How you'd like the chart addressed"
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
            required
            value={date}
            min="1800-01-01"
            max="2100-12-31"
            onChange={(event) => setDate(event.target.value)}
            aria-invalid={errors.date ? true : undefined}
            aria-describedby={errors.date ? "date-error" : undefined}
            className={`mt-1.5 w-full rounded-md border bg-white px-3 py-2.5 text-ink ${
              errors.date ? "border-design" : "border-offgrey"
            }`}
          />
          {errors.date ? (
            <p id="date-error" role="alert" className="mt-1 text-sm text-design">
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
            required
            value={time}
            onChange={(event) => setTime(event.target.value)}
            aria-invalid={errors.time ? true : undefined}
            aria-describedby={`time-help${errors.time ? " time-error" : ""}`}
            className={`mt-1.5 w-full rounded-md border bg-white px-3 py-2.5 text-ink ${
              errors.time ? "border-design" : "border-offgrey"
            }`}
          />
          <p id="time-help" className="mt-1.5 text-xs text-plum/70">
            Your birth time can affect the details of your chart. Use the most accurate time
            available to you.
          </p>
          {errors.time ? (
            <p id="time-error" role="alert" className="mt-1 text-sm text-design">
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

      {errors.form ? (
        <p role="alert" className="rounded-md border border-design/30 bg-design/5 px-4 py-3 text-sm text-design">
          {errors.form}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-plum px-6 py-3 font-display text-base font-medium text-warmwhite transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Calculating…" : "Generate my chart"}
        </button>
        <p className="text-xs text-plum/70">{siteConfig.privacyNote}</p>
      </div>

      <p aria-live="polite" className="sr-only">
        {submitting ? "Calculating your chart" : ""}
      </p>
    </form>
  );
}

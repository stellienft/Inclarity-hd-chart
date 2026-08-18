"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { LocationResult } from "@/lib/location/types";

export interface LocationSearchProps {
  value: LocationResult | null;
  onChange: (location: LocationResult | null) => void;
  error?: string;
}

const DEBOUNCE_MS = 250;

/**
 * Birth place autocomplete.
 *
 * Implemented as a WAI-ARIA combobox with a listbox popup: arrow keys move
 * through options, Enter selects, Escape closes, and the active option is
 * announced through aria-activedescendant.
 *
 * Queries are debounced and every in-flight request is aborted when superseded,
 * so fast typing issues one useful request rather than one per keystroke.
 */
export function LocationSearch({ value, onChange, error }: LocationSearchProps) {
  const inputId = useId();
  const listId = `${inputId}-listbox`;
  const statusId = `${inputId}-status`;
  const errorId = `${inputId}-error`;

  const [query, setQuery] = useState(value?.displayName ?? "");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Suppresses the search that would otherwise fire from setting the input
  // text when an option is chosen.
  const skipNextSearch = useRef(false);

  const trimmed = query.trim();
  const tooShort = trimmed.length < 2;

  /*
    No state is set synchronously in this effect body — doing so triggers
    cascading renders. A too-short query simply schedules no work, and the
    listbox is gated on `tooShort` at render time, so any stale results are
    never shown. Every setState below runs inside the debounced callback.
  */
  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    if (tooShort) return;

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/locations?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as { results?: LocationResult[] };
        if (controller.signal.aborted) return;
        setResults(payload.results ?? []);
        setOpen(true);
        setActiveIndex(-1);
        setSearched(true);
      } catch (cause) {
        if ((cause as Error)?.name !== "AbortError") {
          setResults([]);
          setSearched(true);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      // Supersede any in-flight request for a query the visitor has moved on from.
      controller.abort();
    };
  }, [trimmed, tooShort]);

  useEffect(() => {
    function onDocumentPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocumentPointerDown);
    return () => document.removeEventListener("mousedown", onDocumentPointerDown);
  }, []);

  function select(location: LocationResult) {
    skipNextSearch.current = true;
    setQuery(location.displayName);
    onChange(location);
    setOpen(false);
    setActiveIndex(-1);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && !open && results.length > 0) {
      setOpen(true);
      return;
    }
    if (!open || results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1));
    } else if (event.key === "Enter") {
      const chosen = results[activeIndex];
      if (chosen) {
        event.preventDefault();
        select(chosen);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  const describedBy = [statusId, error ? errorId : null].filter(Boolean).join(" ");

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={inputId} className="block text-sm font-light text-espresso">
        Birth place
      </label>

      <input
        id={inputId}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-expanded={open && !tooShort && results.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? true : undefined}
        aria-activedescendant={activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
        placeholder="Brisbane, Queensland, Australia"
        className={`mt-1.5 w-full rounded-md border bg-white px-3 py-2.5 text-espresso placeholder:text-dusk/40 ${
          error ? "border-ochre-deep" : "border-pebble"
        }`}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          if (value) onChange(null);
        }}
        onKeyDown={onKeyDown}
        onFocus={() => {
          if (results.length > 0) setOpen(true);
        }}
      />

      <p id={statusId} className="mt-1.5 text-xs text-dusk/70" aria-live="polite">
        {loading && !tooShort
          ? "Searching…"
          : value
            ? `Selected: ${value.displayName} · timezone ${value.timezone}`
            : !tooShort && searched && results.length === 0
              ? "No matching places found. Try a larger nearby city."
              : "Start typing a town or city, then choose from the list."}
      </p>

      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-sm text-dusk">
          {error}
        </p>
      ) : null}

      {open && !tooShort && results.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Birth place suggestions"
          className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border border-pebble bg-white py-1 shadow-lg"
        >
          {results.map((result, index) => (
            <li
              key={`${result.latitude},${result.longitude},${result.displayName}`}
              id={`${listId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={`cursor-pointer px-3 py-2 text-sm ${
                index === activeIndex ? "bg-pebble text-espresso" : "text-espresso"
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => {
                event.preventDefault();
                select(result);
              }}
            >
              <span className="block">{result.displayName}</span>
              <span className="block text-xs text-dusk/70">{result.timezone}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

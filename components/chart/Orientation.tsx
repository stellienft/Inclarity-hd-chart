/**
 * "A place to begin".
 *
 * Orientation statements only: what each property describes, not what it says
 * about the person. Deliberately short — this product is a calculator, not an
 * automated reading service, and pages of generated interpretation would push
 * the actual BodyGraph off the screen.
 */
const ENTRIES: ReadonlyArray<{ term: string; definition: string }> = [
  { term: "Energy Type", definition: "How your energy operates." },
  { term: "Strategy", definition: "How you engage with life." },
  { term: "Authority", definition: "How you make aligned decisions." },
  { term: "Definition", definition: "How your energy processes itself." },
  { term: "Profile", definition: "How you learn and interact with life." },
];

export function Orientation() {
  return (
    <section aria-labelledby="orientation-heading" className="print-sheet">
      <h2
        id="orientation-heading"
        className="font-display text-xl text-ink sm:text-2xl"
      >
        A place to begin
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-plum">
        These are starting points for observation rather than conclusions. Human Design is
        something to test against your own experience over time.
      </p>

      <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {ENTRIES.map(({ term, definition }) => (
          <div key={term} className="border-t border-offgrey pt-3">
            <dt className="font-display text-base text-ink">{term}</dt>
            <dd className="mt-1 text-sm text-plum">{definition}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

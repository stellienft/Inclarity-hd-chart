/**
 * Application configuration.
 *
 * The booking destination is environment-driven so the call to action can be
 * repointed without a code change.
 */
export const siteConfig = {
  brand: "Inclarity Space",
  product: "Human Design Chart Generator",
  bookingUrl: process.env.NEXT_PUBLIC_INCLARITY_BOOKING_URL ?? "https://inclarity.space",
  disclaimer:
    "Human Design is a framework for personal reflection and experimentation. It is not " +
    "scientifically validated and should not replace medical, psychological, legal or " +
    "financial advice.",
  privacyNote:
    "Your birth details are used to calculate your chart and are not stored. Nothing is " +
    "saved to a database and your date, time and place of birth are never sent to analytics.",
} as const;

/** The debug inspector is a development tool and must stay out of public builds. */
export function isChartDebugEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ENABLE_CHART_DEBUG === "true";
}

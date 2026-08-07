/**
 * `tz-lookup` ships no types. It exports a single function mapping a
 * coordinate pair to an IANA timezone identifier, and throws for
 * out-of-range input.
 */
declare module "tz-lookup" {
  export default function tzLookup(latitude: number, longitude: number): string;
}

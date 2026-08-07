export interface LocationResult {
  /** "Brisbane, Queensland, Australia" */
  displayName: string;
  city: string;
  region: string;
  country: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  /** IANA timezone identifier. */
  timezone: string;
}

export interface LocationProvider {
  readonly id: string;
  search(query: string, signal?: AbortSignal): Promise<LocationResult[]>;
}

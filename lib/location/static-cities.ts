import type { LocationResult } from "./types";

/**
 * A small built-in gazetteer.
 *
 * This is NOT the primary location source — Open-Meteo's geocoding API is. It
 * exists so the application still works when the geocoder is unreachable
 * (network restrictions, outage, rate limit) and so tests and CI never depend
 * on a third-party service.
 *
 * Timezones here are indicative only: `resolveTimezone` re-derives the
 * authoritative IANA zone from the coordinates server-side regardless of what
 * a provider returns.
 */
interface CitySeed {
  city: string;
  region: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

const CITIES: readonly CitySeed[] = [
  { city: "Brisbane", region: "Queensland", country: "Australia", countryCode: "AU", latitude: -27.4698, longitude: 153.0251, timezone: "Australia/Brisbane" },
  { city: "Sydney", region: "New South Wales", country: "Australia", countryCode: "AU", latitude: -33.8688, longitude: 151.2093, timezone: "Australia/Sydney" },
  { city: "Melbourne", region: "Victoria", country: "Australia", countryCode: "AU", latitude: -37.8136, longitude: 144.9631, timezone: "Australia/Melbourne" },
  { city: "Perth", region: "Western Australia", country: "Australia", countryCode: "AU", latitude: -31.9523, longitude: 115.8613, timezone: "Australia/Perth" },
  { city: "Adelaide", region: "South Australia", country: "Australia", countryCode: "AU", latitude: -34.9285, longitude: 138.6007, timezone: "Australia/Adelaide" },
  { city: "Hobart", region: "Tasmania", country: "Australia", countryCode: "AU", latitude: -42.8821, longitude: 147.3272, timezone: "Australia/Hobart" },
  { city: "Canberra", region: "Australian Capital Territory", country: "Australia", countryCode: "AU", latitude: -35.2809, longitude: 149.13, timezone: "Australia/Sydney" },
  { city: "Darwin", region: "Northern Territory", country: "Australia", countryCode: "AU", latitude: -12.4634, longitude: 130.8456, timezone: "Australia/Darwin" },
  { city: "Gold Coast", region: "Queensland", country: "Australia", countryCode: "AU", latitude: -28.0167, longitude: 153.4, timezone: "Australia/Brisbane" },
  { city: "Auckland", region: "Auckland", country: "New Zealand", countryCode: "NZ", latitude: -36.8485, longitude: 174.7633, timezone: "Pacific/Auckland" },
  { city: "Wellington", region: "Wellington", country: "New Zealand", countryCode: "NZ", latitude: -41.2865, longitude: 174.7762, timezone: "Pacific/Auckland" },
  { city: "London", region: "England", country: "United Kingdom", countryCode: "GB", latitude: 51.5074, longitude: -0.1278, timezone: "Europe/London" },
  { city: "Manchester", region: "England", country: "United Kingdom", countryCode: "GB", latitude: 53.4808, longitude: -2.2426, timezone: "Europe/London" },
  { city: "Edinburgh", region: "Scotland", country: "United Kingdom", countryCode: "GB", latitude: 55.9533, longitude: -3.1883, timezone: "Europe/London" },
  { city: "Dublin", region: "Leinster", country: "Ireland", countryCode: "IE", latitude: 53.3498, longitude: -6.2603, timezone: "Europe/Dublin" },
  { city: "New York", region: "New York", country: "United States", countryCode: "US", latitude: 40.7128, longitude: -74.006, timezone: "America/New_York" },
  { city: "Los Angeles", region: "California", country: "United States", countryCode: "US", latitude: 34.0522, longitude: -118.2437, timezone: "America/Los_Angeles" },
  { city: "Chicago", region: "Illinois", country: "United States", countryCode: "US", latitude: 41.8781, longitude: -87.6298, timezone: "America/Chicago" },
  { city: "Denver", region: "Colorado", country: "United States", countryCode: "US", latitude: 39.7392, longitude: -104.9903, timezone: "America/Denver" },
  { city: "Phoenix", region: "Arizona", country: "United States", countryCode: "US", latitude: 33.4484, longitude: -112.074, timezone: "America/Phoenix" },
  { city: "Honolulu", region: "Hawaii", country: "United States", countryCode: "US", latitude: 21.3069, longitude: -157.8583, timezone: "Pacific/Honolulu" },
  { city: "Toronto", region: "Ontario", country: "Canada", countryCode: "CA", latitude: 43.6532, longitude: -79.3832, timezone: "America/Toronto" },
  { city: "Montreal", region: "Quebec", country: "Canada", countryCode: "CA", latitude: 45.5019, longitude: -73.5674, timezone: "America/Toronto" },
  { city: "Vancouver", region: "British Columbia", country: "Canada", countryCode: "CA", latitude: 49.2827, longitude: -123.1207, timezone: "America/Vancouver" },
  { city: "Paris", region: "Île-de-France", country: "France", countryCode: "FR", latitude: 48.8566, longitude: 2.3522, timezone: "Europe/Paris" },
  { city: "Berlin", region: "Berlin", country: "Germany", countryCode: "DE", latitude: 52.52, longitude: 13.405, timezone: "Europe/Berlin" },
  { city: "Munich", region: "Bavaria", country: "Germany", countryCode: "DE", latitude: 48.1351, longitude: 11.582, timezone: "Europe/Berlin" },
  { city: "Amsterdam", region: "North Holland", country: "Netherlands", countryCode: "NL", latitude: 52.3676, longitude: 4.9041, timezone: "Europe/Amsterdam" },
  { city: "Madrid", region: "Madrid", country: "Spain", countryCode: "ES", latitude: 40.4168, longitude: -3.7038, timezone: "Europe/Madrid" },
  { city: "Barcelona", region: "Catalonia", country: "Spain", countryCode: "ES", latitude: 41.3874, longitude: 2.1686, timezone: "Europe/Madrid" },
  { city: "Rome", region: "Lazio", country: "Italy", countryCode: "IT", latitude: 41.9028, longitude: 12.4964, timezone: "Europe/Rome" },
  { city: "Lisbon", region: "Lisbon", country: "Portugal", countryCode: "PT", latitude: 38.7223, longitude: -9.1393, timezone: "Europe/Lisbon" },
  { city: "Stockholm", region: "Stockholm", country: "Sweden", countryCode: "SE", latitude: 59.3293, longitude: 18.0686, timezone: "Europe/Stockholm" },
  { city: "Oslo", region: "Oslo", country: "Norway", countryCode: "NO", latitude: 59.9139, longitude: 10.7522, timezone: "Europe/Oslo" },
  { city: "Copenhagen", region: "Capital Region", country: "Denmark", countryCode: "DK", latitude: 55.6761, longitude: 12.5683, timezone: "Europe/Copenhagen" },
  { city: "Zurich", region: "Zurich", country: "Switzerland", countryCode: "CH", latitude: 47.3769, longitude: 8.5417, timezone: "Europe/Zurich" },
  { city: "Vienna", region: "Vienna", country: "Austria", countryCode: "AT", latitude: 48.2082, longitude: 16.3738, timezone: "Europe/Vienna" },
  { city: "Warsaw", region: "Masovia", country: "Poland", countryCode: "PL", latitude: 52.2297, longitude: 21.0122, timezone: "Europe/Warsaw" },
  { city: "Athens", region: "Attica", country: "Greece", countryCode: "GR", latitude: 37.9838, longitude: 23.7275, timezone: "Europe/Athens" },
  { city: "Moscow", region: "Moscow", country: "Russia", countryCode: "RU", latitude: 55.7558, longitude: 37.6173, timezone: "Europe/Moscow" },
  { city: "Istanbul", region: "Istanbul", country: "Türkiye", countryCode: "TR", latitude: 41.0082, longitude: 28.9784, timezone: "Europe/Istanbul" },
  { city: "Tokyo", region: "Tokyo", country: "Japan", countryCode: "JP", latitude: 35.6762, longitude: 139.6503, timezone: "Asia/Tokyo" },
  { city: "Seoul", region: "Seoul", country: "South Korea", countryCode: "KR", latitude: 37.5665, longitude: 126.978, timezone: "Asia/Seoul" },
  { city: "Beijing", region: "Beijing", country: "China", countryCode: "CN", latitude: 39.9042, longitude: 116.4074, timezone: "Asia/Shanghai" },
  { city: "Shanghai", region: "Shanghai", country: "China", countryCode: "CN", latitude: 31.2304, longitude: 121.4737, timezone: "Asia/Shanghai" },
  { city: "Hong Kong", region: "Hong Kong", country: "China", countryCode: "HK", latitude: 22.3193, longitude: 114.1694, timezone: "Asia/Hong_Kong" },
  { city: "Singapore", region: "Singapore", country: "Singapore", countryCode: "SG", latitude: 1.3521, longitude: 103.8198, timezone: "Asia/Singapore" },
  { city: "Bangkok", region: "Bangkok", country: "Thailand", countryCode: "TH", latitude: 13.7563, longitude: 100.5018, timezone: "Asia/Bangkok" },
  { city: "Mumbai", region: "Maharashtra", country: "India", countryCode: "IN", latitude: 19.076, longitude: 72.8777, timezone: "Asia/Kolkata" },
  { city: "Delhi", region: "Delhi", country: "India", countryCode: "IN", latitude: 28.7041, longitude: 77.1025, timezone: "Asia/Kolkata" },
  { city: "Bengaluru", region: "Karnataka", country: "India", countryCode: "IN", latitude: 12.9716, longitude: 77.5946, timezone: "Asia/Kolkata" },
  { city: "Kathmandu", region: "Bagmati", country: "Nepal", countryCode: "NP", latitude: 27.7172, longitude: 85.324, timezone: "Asia/Kathmandu" },
  { city: "Dubai", region: "Dubai", country: "United Arab Emirates", countryCode: "AE", latitude: 25.2048, longitude: 55.2708, timezone: "Asia/Dubai" },
  { city: "Tel Aviv", region: "Tel Aviv", country: "Israel", countryCode: "IL", latitude: 32.0853, longitude: 34.7818, timezone: "Asia/Jerusalem" },
  { city: "Jakarta", region: "Jakarta", country: "Indonesia", countryCode: "ID", latitude: -6.2088, longitude: 106.8456, timezone: "Asia/Jakarta" },
  { city: "Manila", region: "Metro Manila", country: "Philippines", countryCode: "PH", latitude: 14.5995, longitude: 120.9842, timezone: "Asia/Manila" },
  { city: "Cairo", region: "Cairo", country: "Egypt", countryCode: "EG", latitude: 30.0444, longitude: 31.2357, timezone: "Africa/Cairo" },
  { city: "Johannesburg", region: "Gauteng", country: "South Africa", countryCode: "ZA", latitude: -26.2041, longitude: 28.0473, timezone: "Africa/Johannesburg" },
  { city: "Cape Town", region: "Western Cape", country: "South Africa", countryCode: "ZA", latitude: -33.9249, longitude: 18.4241, timezone: "Africa/Johannesburg" },
  { city: "Lagos", region: "Lagos", country: "Nigeria", countryCode: "NG", latitude: 6.5244, longitude: 3.3792, timezone: "Africa/Lagos" },
  { city: "Nairobi", region: "Nairobi", country: "Kenya", countryCode: "KE", latitude: -1.2921, longitude: 36.8219, timezone: "Africa/Nairobi" },
  { city: "São Paulo", region: "São Paulo", country: "Brazil", countryCode: "BR", latitude: -23.5505, longitude: -46.6333, timezone: "America/Sao_Paulo" },
  { city: "Rio de Janeiro", region: "Rio de Janeiro", country: "Brazil", countryCode: "BR", latitude: -22.9068, longitude: -43.1729, timezone: "America/Sao_Paulo" },
  { city: "Buenos Aires", region: "Buenos Aires", country: "Argentina", countryCode: "AR", latitude: -34.6037, longitude: -58.3816, timezone: "America/Argentina/Buenos_Aires" },
  { city: "Santiago", region: "Santiago", country: "Chile", countryCode: "CL", latitude: -33.4489, longitude: -70.6693, timezone: "America/Santiago" },
  { city: "Lima", region: "Lima", country: "Peru", countryCode: "PE", latitude: -12.0464, longitude: -77.0428, timezone: "America/Lima" },
  { city: "Bogotá", region: "Bogotá", country: "Colombia", countryCode: "CO", latitude: 4.711, longitude: -74.0721, timezone: "America/Bogota" },
  { city: "Mexico City", region: "Mexico City", country: "Mexico", countryCode: "MX", latitude: 19.4326, longitude: -99.1332, timezone: "America/Mexico_City" },
];

function toResult(seed: CitySeed): LocationResult {
  return {
    displayName: `${seed.city}, ${seed.region}, ${seed.country}`,
    city: seed.city,
    region: seed.region,
    country: seed.country,
    countryCode: seed.countryCode,
    latitude: seed.latitude,
    longitude: seed.longitude,
    timezone: seed.timezone,
  };
}

/** Diacritic- and case-insensitive prefix/substring match. */
function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function searchStaticCities(query: string, limit = 8): LocationResult[] {
  const needle = fold(query);
  if (needle.length === 0) return [];

  const scored: Array<{ seed: CitySeed; score: number }> = [];
  for (const seed of CITIES) {
    const city = fold(seed.city);
    const full = fold(`${seed.city} ${seed.region} ${seed.country}`);

    let score = -1;
    if (city === needle) score = 0;
    else if (city.startsWith(needle)) score = 1;
    else if (full.includes(needle)) score = 2;

    if (score >= 0) scored.push({ seed, score });
  }

  return scored
    .sort((a, b) => a.score - b.score || a.seed.city.localeCompare(b.seed.city))
    .slice(0, limit)
    .map(({ seed }) => toResult(seed));
}

export const STATIC_CITY_COUNT = CITIES.length;

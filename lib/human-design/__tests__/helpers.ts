import { getGateStartLongitude } from "../constants/gates";
import { positionsToActivationSet } from "../calculate/activations";
import type { PlanetaryActivationSet } from "../types/activation";
import type { ActiveGate } from "../types/channel";
import { getGateCenter } from "../constants/gates";

/**
 * Build a synthetic activation set that lands on a chosen list of gates.
 *
 * Used to construct charts with an exactly known gate composition so the
 * derivation logic can be tested independently of the ephemeris. Gates are
 * repeated cyclically to fill all thirteen slots when fewer are supplied.
 *
 * Note the Sun/Earth and Node pair are opposition-locked by
 * `positionsToActivationSet`, so this helper sets only the seven bodies that
 * are independently placeable plus the Sun and North Node.
 */
export function activationSetForGates(gates: number[]): PlanetaryActivationSet {
  if (gates.length === 0) throw new Error("at least one gate required");
  const at = (index: number, line = 1): number => {
    const gate = gates[index % gates.length] as number;
    return getGateStartLongitude(gate) + (line - 1) * 0.9375 + 0.1;
  };

  return positionsToActivationSet({
    sun: { longitude: at(0), retrograde: false },
    northNode: { longitude: at(1), retrograde: true },
    moon: { longitude: at(2), retrograde: false },
    mercury: { longitude: at(3), retrograde: false },
    venus: { longitude: at(4), retrograde: false },
    mars: { longitude: at(5), retrograde: false },
    jupiter: { longitude: at(6), retrograde: false },
    saturn: { longitude: at(7), retrograde: false },
    uranus: { longitude: at(8), retrograde: false },
    neptune: { longitude: at(9), retrograde: false },
    pluto: { longitude: at(10), retrograde: false },
  });
}

/**
 * Build an ActiveGate list directly from gate numbers, bypassing the
 * activation machinery entirely. This lets a test state "these exact gates are
 * active" with no risk of an incidental extra gate creeping in via the
 * Sun/Earth opposition.
 */
export function activeGatesFrom(
  personalityGates: number[],
  designGates: number[] = [],
): ActiveGate[] {
  const map = new Map<number, ActiveGate>();

  const add = (gate: number, side: "personality" | "design"): void => {
    let entry = map.get(gate);
    if (!entry) {
      entry = {
        gate,
        center: getGateCenter(gate),
        personality: false,
        design: false,
        sources: [],
      };
      map.set(gate, entry);
    }
    entry[side] = true;
    entry.sources.push({ side, planet: "sun", line: 1 });
  };

  for (const gate of personalityGates) add(gate, "personality");
  for (const gate of designGates) add(gate, "design");

  return [...map.values()].sort((a, b) => a.gate - b.gate);
}

import type { HdType } from "../constants/strategies";
import { MOTOR_CENTERS, type CenterId } from "../types/center";
import type { ActiveChannel } from "../types/channel";

export interface TypeDerivation {
  type: HdType;
  sacralDefined: boolean;
  motorToThroat: boolean;
  /** The motor centres that reach the Throat, for the debug view. */
  connectedMotors: CenterId[];
  /** A shortest motor -> Throat path through defined channels, if one exists. */
  motorPath: CenterId[] | null;
  anyCenterDefined: boolean;
}

export function isSacralDefined(definedCenters: readonly CenterId[]): boolean {
  return definedCenters.includes("sacral");
}

/**
 * Does any motor centre reach the Throat through DEFINED channels?
 *
 * The connection may be direct (e.g. 34-20, Sacral to Throat) or indirect
 * (e.g. Sacral -2-14- G -1-8- Throat). What matters is that a path exists in
 * the definition graph — not that a single channel spans the gap. Reducing
 * this to "is the Throat coloured" is wrong: a Throat defined only by
 * Ajna-Throat channels has no motor behind it.
 *
 * The Throat itself is never treated as a motor.
 */
export function findMotorToThroatConnection(
  definedCenters: readonly CenterId[],
  activeChannels: readonly ActiveChannel[],
): { connected: boolean; motors: CenterId[]; path: CenterId[] | null } {
  if (!definedCenters.includes("throat")) {
    return { connected: false, motors: [], path: null };
  }

  const adjacency = new Map<CenterId, CenterId[]>();
  for (const center of definedCenters) adjacency.set(center, []);
  for (const channel of activeChannels) {
    const [a, b] = channel.centers;
    adjacency.get(a)?.push(b);
    adjacency.get(b)?.push(a);
  }

  // Breadth-first from the Throat so the first motor found is the nearest,
  // and the recorded path is a shortest one.
  const previous = new Map<CenterId, CenterId | null>([["throat", null]]);
  const queue: CenterId[] = ["throat"];
  const reachable = new Set<CenterId>(["throat"]);

  while (queue.length > 0) {
    const current = queue.shift() as CenterId;
    for (const neighbour of adjacency.get(current) ?? []) {
      if (reachable.has(neighbour)) continue;
      reachable.add(neighbour);
      previous.set(neighbour, current);
      queue.push(neighbour);
    }
  }

  const motors = MOTOR_CENTERS.filter((motor) => reachable.has(motor));
  if (motors.length === 0) return { connected: false, motors: [], path: null };

  // Rebuild the path from the nearest motor back to the Throat.
  let nearest = motors[0] as CenterId;
  let bestLength = Infinity;
  let bestPath: CenterId[] | null = null;

  for (const motor of motors) {
    const path: CenterId[] = [];
    let cursor: CenterId | null | undefined = motor;
    while (cursor) {
      path.push(cursor);
      cursor = previous.get(cursor) ?? null;
    }
    if (path.length < bestLength) {
      bestLength = path.length;
      bestPath = path;
      nearest = motor;
    }
  }
  void nearest;

  return { connected: true, motors, path: bestPath };
}

/**
 * Derive Type from the definition graph.
 *
 *   Reflector             no centre defined at all
 *   Generator family      Sacral defined
 *                           -> Manifesting Generator when a motor also reaches
 *                              the Throat (the Sacral itself counts as that
 *                              motor when it is the one connected)
 *                           -> Generator otherwise
 *   Manifestor            Sacral undefined, a motor reaches the Throat
 *   Projector             Sacral undefined, at least one centre defined,
 *                         no motor reaches the Throat
 */
export function deriveType(
  definedCenters: readonly CenterId[],
  activeChannels: readonly ActiveChannel[],
): TypeDerivation {
  const anyCenterDefined = definedCenters.length > 0;
  const sacralDefined = isSacralDefined(definedCenters);
  const { connected, motors, path } = findMotorToThroatConnection(definedCenters, activeChannels);

  const base = {
    sacralDefined,
    motorToThroat: connected,
    connectedMotors: motors,
    motorPath: path,
    anyCenterDefined,
  };

  if (!anyCenterDefined) return { ...base, type: "Reflector" };
  if (sacralDefined) {
    return { ...base, type: connected ? "Manifesting Generator" : "Generator" };
  }
  if (connected) return { ...base, type: "Manifestor" };
  return { ...base, type: "Projector" };
}

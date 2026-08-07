import type { DefinitionType } from "../constants/strategies";
import type { CenterId } from "../types/center";
import type { ActiveChannel } from "../types/channel";

export interface DefinitionGraph {
  /** Defined centres grouped into connected components, largest first. */
  components: CenterId[][];
  definition: DefinitionType;
  /** Adjacency used to build the components — retained for the debug view. */
  adjacency: Record<string, CenterId[]>;
}

const DEFINITION_BY_COMPONENT_COUNT: Record<number, DefinitionType> = {
  0: "No Definition",
  1: "Single Definition",
  2: "Split Definition",
  3: "Triple Split Definition",
  4: "Quadruple Split Definition",
};

/**
 * Build the definition graph and count its connected components.
 *
 *   nodes = defined centres
 *   edges = defined channels
 *
 * The number of connected components IS the definition. This is derived by
 * traversal rather than by enumerating centre combinations, so it stays
 * correct for every possible chart.
 *
 * Five or more components is geometrically impossible in the nine-centre
 * BodyGraph (it would need at least five disjoint channels among nine centres
 * while every channel consumes two centres), but the count is clamped rather
 * than asserted so an unexpected chart degrades gracefully instead of
 * throwing at request time.
 */
export function deriveDefinition(
  definedCenters: readonly CenterId[],
  activeChannels: readonly ActiveChannel[],
): DefinitionGraph {
  const adjacency = new Map<CenterId, Set<CenterId>>();
  for (const center of definedCenters) adjacency.set(center, new Set());

  for (const channel of activeChannels) {
    const [a, b] = channel.centers;
    adjacency.get(a)?.add(b);
    adjacency.get(b)?.add(a);
  }

  const seen = new Set<CenterId>();
  const components: CenterId[][] = [];

  for (const center of definedCenters) {
    if (seen.has(center)) continue;

    const component: CenterId[] = [];
    const stack: CenterId[] = [center];
    seen.add(center);

    while (stack.length > 0) {
      const current = stack.pop() as CenterId;
      component.push(current);
      for (const neighbour of adjacency.get(current) ?? []) {
        if (seen.has(neighbour)) continue;
        seen.add(neighbour);
        stack.push(neighbour);
      }
    }

    components.push(component.sort());
  }

  components.sort((a, b) => b.length - a.length || (a[0] ?? "").localeCompare(b[0] ?? ""));

  const definition =
    DEFINITION_BY_COMPONENT_COUNT[components.length] ?? "Quadruple Split Definition";

  const adjacencyRecord: Record<string, CenterId[]> = {};
  for (const [center, neighbours] of adjacency) {
    adjacencyRecord[center] = [...neighbours].sort();
  }

  return { components, definition, adjacency: adjacencyRecord };
}

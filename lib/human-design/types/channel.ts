import type { CenterId } from "./center";
import type { PlanetId, Side } from "./activation";

export type CircuitId = "individual" | "tribal" | "collective";

export type CircuitGroup =
  | "knowing"
  | "centering"
  | "integration"
  | "ego"
  | "defense"
  | "understanding"
  | "sensing";

export interface ChannelDefinition {
  /** Stable id, always "lowGate-highGate", e.g. "10-20". */
  id: string;
  gates: [number, number];
  centers: [CenterId, CenterId];
  name: string;
  circuit: CircuitId;
  circuitGroup: CircuitGroup;
}

export interface GateDefinition {
  gate: number;
  center: CenterId;
  name: string;
}

/** Which sides activated a particular gate. */
export interface GateActivationSides {
  personality: boolean;
  design: boolean;
}

export interface ActiveGate extends GateActivationSides {
  gate: number;
  center: CenterId;
  /** Every body that landed on this gate, for tooltips and the debug view. */
  sources: Array<{ side: Side; planet: PlanetId; line: number }>;
}

export interface ActiveChannel {
  id: string;
  gates: [number, number];
  centers: [CenterId, CenterId];
  name: string;
  circuit: CircuitId;
  circuitGroup: CircuitGroup;
  /** Per-gate activation sides, keyed by gate number. */
  activation: Record<number, GateActivationSides>;
}

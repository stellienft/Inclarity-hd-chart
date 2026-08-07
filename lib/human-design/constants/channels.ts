import type { ChannelDefinition } from "../types/channel";
import { getGateCenter } from "./gates";

/**
 * The 36 channels of the BodyGraph.
 *
 * Centres are NOT hard-coded here — they are derived from GATE_DEFINITIONS at
 * module load, so a gate can never disagree with its channel about which
 * centre it belongs to. `lib/human-design/__tests__/constants.test.ts`
 * asserts that every channel joins two *different* centres and that the full
 * set covers all 36 recognised gate pairs exactly once.
 *
 * Channel names are the standard descriptive names in general circulation
 * within the Human Design community. No proprietary description text is
 * reproduced.
 */
interface ChannelSeed {
  gates: [number, number];
  name: string;
  circuit: ChannelDefinition["circuit"];
  circuitGroup: ChannelDefinition["circuitGroup"];
}

const CHANNEL_SEEDS: readonly ChannelSeed[] = [
  { gates: [1, 8], name: "Inspiration", circuit: "individual", circuitGroup: "knowing" },
  { gates: [2, 14], name: "The Beat", circuit: "individual", circuitGroup: "knowing" },
  { gates: [3, 60], name: "Mutation", circuit: "individual", circuitGroup: "knowing" },
  { gates: [4, 63], name: "Logic", circuit: "collective", circuitGroup: "understanding" },
  { gates: [5, 15], name: "Rhythm", circuit: "collective", circuitGroup: "sensing" },
  { gates: [6, 59], name: "Mating", circuit: "tribal", circuitGroup: "defense" },
  { gates: [7, 31], name: "The Alpha", circuit: "collective", circuitGroup: "understanding" },
  { gates: [9, 52], name: "Concentration", circuit: "collective", circuitGroup: "understanding" },
  { gates: [10, 20], name: "Awakening", circuit: "individual", circuitGroup: "integration" },
  { gates: [10, 34], name: "Exploration", circuit: "individual", circuitGroup: "integration" },
  { gates: [10, 57], name: "Perfected Form", circuit: "individual", circuitGroup: "integration" },
  { gates: [11, 56], name: "Curiosity", circuit: "collective", circuitGroup: "sensing" },
  { gates: [12, 22], name: "Openness", circuit: "individual", circuitGroup: "knowing" },
  { gates: [13, 33], name: "The Prodigal", circuit: "collective", circuitGroup: "sensing" },
  { gates: [16, 48], name: "The Wavelength", circuit: "collective", circuitGroup: "understanding" },
  { gates: [17, 62], name: "Acceptance", circuit: "collective", circuitGroup: "understanding" },
  { gates: [18, 58], name: "Judgement", circuit: "collective", circuitGroup: "understanding" },
  { gates: [19, 49], name: "Synthesis", circuit: "tribal", circuitGroup: "defense" },
  { gates: [20, 34], name: "Charisma", circuit: "individual", circuitGroup: "integration" },
  { gates: [20, 57], name: "The Brain Wave", circuit: "individual", circuitGroup: "integration" },
  { gates: [21, 45], name: "Money", circuit: "tribal", circuitGroup: "ego" },
  { gates: [23, 43], name: "Structuring", circuit: "individual", circuitGroup: "knowing" },
  { gates: [24, 61], name: "Awareness", circuit: "individual", circuitGroup: "knowing" },
  { gates: [25, 51], name: "Initiation", circuit: "individual", circuitGroup: "centering" },
  { gates: [26, 44], name: "Surrender", circuit: "tribal", circuitGroup: "ego" },
  { gates: [27, 50], name: "Preservation", circuit: "tribal", circuitGroup: "defense" },
  { gates: [28, 38], name: "Struggle", circuit: "individual", circuitGroup: "knowing" },
  { gates: [29, 46], name: "Discovery", circuit: "collective", circuitGroup: "sensing" },
  { gates: [30, 41], name: "Recognition", circuit: "collective", circuitGroup: "sensing" },
  { gates: [32, 54], name: "Transformation", circuit: "tribal", circuitGroup: "ego" },
  { gates: [34, 57], name: "Power", circuit: "individual", circuitGroup: "integration" },
  { gates: [35, 36], name: "Transitoriness", circuit: "collective", circuitGroup: "sensing" },
  { gates: [37, 40], name: "Community", circuit: "tribal", circuitGroup: "ego" },
  { gates: [39, 55], name: "Emoting", circuit: "individual", circuitGroup: "knowing" },
  { gates: [42, 53], name: "Maturation", circuit: "collective", circuitGroup: "understanding" },
  { gates: [47, 64], name: "Abstraction", circuit: "collective", circuitGroup: "sensing" },
] as const;

export function channelId(a: number, b: number): string {
  const [low, high] = a < b ? [a, b] : [b, a];
  return `${low}-${high}`;
}

export const CHANNEL_DEFINITIONS: readonly ChannelDefinition[] = CHANNEL_SEEDS.map((seed) => {
  const [a, b] = seed.gates;
  const [low, high] = a < b ? [a, b] : [b, a];
  return {
    id: channelId(a, b),
    gates: [low, high] as [number, number],
    centers: [getGateCenter(low), getGateCenter(high)] as ChannelDefinition["centers"],
    name: seed.name,
    circuit: seed.circuit,
    circuitGroup: seed.circuitGroup,
  };
});

const byId = new Map<string, ChannelDefinition>();
for (const channel of CHANNEL_DEFINITIONS) byId.set(channel.id, channel);

export function getChannelDefinition(id: string): ChannelDefinition | undefined {
  return byId.get(id);
}

/** Channels that a given gate participates in. */
const byGate = new Map<number, ChannelDefinition[]>();
for (const channel of CHANNEL_DEFINITIONS) {
  for (const gate of channel.gates) {
    const list = byGate.get(gate) ?? [];
    list.push(channel);
    byGate.set(gate, list);
  }
}

export function getChannelsForGate(gate: number): readonly ChannelDefinition[] {
  return byGate.get(gate) ?? [];
}

/** The gate on the other end of a channel. */
export function partnerGate(channel: ChannelDefinition, gate: number): number {
  const [a, b] = channel.gates;
  if (gate === a) return b;
  if (gate === b) return a;
  throw new Error(`Gate ${gate} is not part of channel ${channel.id}`);
}

import { CHANNEL_DEFINITIONS } from "../constants/channels";
import { getGateCenter } from "../constants/gates";
import { PLANET_IDS, type PlanetaryActivationSet, type Side } from "../types/activation";
import type { ActiveChannel, ActiveGate } from "../types/channel";

/**
 * Collect every gate activated by either imprint.
 *
 * A gate is active if ANY of the 26 activations (13 Personality + 13 Design)
 * lands in it. The per-side flags are retained because the BodyGraph must
 * render Personality and Design differently, but they play no part in deciding
 * whether a channel is defined.
 */
export function deriveActiveGates(
  personality: PlanetaryActivationSet,
  design: PlanetaryActivationSet,
): ActiveGate[] {
  const byGate = new Map<number, ActiveGate>();

  const ingest = (set: PlanetaryActivationSet, side: Side): void => {
    for (const planet of PLANET_IDS) {
      const activation = set[planet];
      let entry = byGate.get(activation.gate);
      if (!entry) {
        entry = {
          gate: activation.gate,
          center: getGateCenter(activation.gate),
          personality: false,
          design: false,
          sources: [],
        };
        byGate.set(activation.gate, entry);
      }
      entry[side] = true;
      entry.sources.push({ side, planet, line: activation.line });
    }
  };

  ingest(personality, "personality");
  ingest(design, "design");

  return [...byGate.values()].sort((a, b) => a.gate - b.gate);
}

/**
 * A channel is defined when BOTH of its gates are active.
 *
 * It does not matter which imprint supplied each gate — Personality+Design,
 * Personality+Personality and Design+Design all define the channel equally.
 */
export function deriveActiveChannels(activeGates: readonly ActiveGate[]): ActiveChannel[] {
  const sidesByGate = new Map<number, ActiveGate>();
  for (const gate of activeGates) sidesByGate.set(gate.gate, gate);

  const channels: ActiveChannel[] = [];

  for (const definition of CHANNEL_DEFINITIONS) {
    const [a, b] = definition.gates;
    const gateA = sidesByGate.get(a);
    const gateB = sidesByGate.get(b);
    if (!gateA || !gateB) continue;

    channels.push({
      id: definition.id,
      gates: definition.gates,
      centers: definition.centers,
      name: definition.name,
      circuit: definition.circuit,
      circuitGroup: definition.circuitGroup,
      activation: {
        [a]: { personality: gateA.personality, design: gateA.design },
        [b]: { personality: gateB.personality, design: gateB.design },
      },
    });
  }

  return channels;
}

/**
 * Gates that are active but whose channel partner is not — "hanging gates".
 *
 * These colour the gate on the BodyGraph but do NOT define their centre.
 */
export function deriveHangingGates(
  activeGates: readonly ActiveGate[],
  activeChannels: readonly ActiveChannel[],
): number[] {
  const inChannel = new Set<number>();
  for (const channel of activeChannels) {
    inChannel.add(channel.gates[0]);
    inChannel.add(channel.gates[1]);
  }
  return activeGates.map((g) => g.gate).filter((gate) => !inChannel.has(gate));
}

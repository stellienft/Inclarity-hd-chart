import { describe, expect, it } from "vitest";

import { deriveAuthority } from "../derive/authority";
import { deriveDefinedCenters } from "../derive/centers";
import { deriveActiveChannels, deriveHangingGates } from "../derive/channels";
import { deriveDefinition } from "../derive/definition";
import { deriveCrossAngle } from "../derive/incarnation-cross";
import { deriveType, findMotorToThroatConnection, isSacralDefined } from "../derive/type";
import { activeGatesFrom } from "./helpers";

/** Convenience: gates -> {channels, centers, type, authority, definition}. */
function chartFrom(personalityGates: number[], designGates: number[] = []) {
  const activeGates = activeGatesFrom(personalityGates, designGates);
  const channels = deriveActiveChannels(activeGates);
  const centers = deriveDefinedCenters(channels);
  const definition = deriveDefinition(centers.defined, channels);
  const type = deriveType(centers.defined, channels);
  const authority = deriveAuthority(centers.defined, channels, type.type);
  return {
    activeGates,
    channels,
    centers,
    definition,
    type,
    authority,
    hanging: deriveHangingGates(activeGates, channels),
  };
}

describe("channel derivation", () => {
  it("defines a channel only when both gates are active", () => {
    expect(chartFrom([34]).channels).toHaveLength(0);
    expect(chartFrom([20]).channels).toHaveLength(0);
    expect(chartFrom([34, 20]).channels.map((c) => c.id)).toEqual(["20-34"]);
  });

  it("defines a channel across the Personality/Design split", () => {
    const { channels } = chartFrom([34], [20]);
    expect(channels.map((c) => c.id)).toEqual(["20-34"]);
    expect(channels[0]?.activation[34]).toEqual({ personality: true, design: false });
    expect(channels[0]?.activation[20]).toEqual({ personality: false, design: true });
  });

  it("records dual activation when both sides hit the same gate", () => {
    const { channels } = chartFrom([34, 20], [34]);
    expect(channels[0]?.activation[34]).toEqual({ personality: true, design: true });
  });

  it("reports hanging gates", () => {
    const { hanging } = chartFrom([34, 20, 41]);
    expect(hanging).toEqual([41]);
  });
});

describe("centre derivation", () => {
  it("does NOT define a centre from a hanging gate", () => {
    // Gate 34 sits in the Sacral, but alone it defines nothing.
    const { centers } = chartFrom([34]);
    expect(centers.defined).toEqual([]);
    expect(centers.undefined).toHaveLength(9);
  });

  it("defines both centres of a completed channel", () => {
    const { centers } = chartFrom([34, 20]);
    expect([...centers.defined].sort()).toEqual(["sacral", "throat"]);
  });

  it("leaves a centre undefined when only one of its gates completes elsewhere", () => {
    // 4-63 defines Ajna+Head. Gate 17 (Ajna) hangs; Throat stays undefined.
    const { centers } = chartFrom([4, 63, 17]);
    expect([...centers.defined].sort()).toEqual(["ajna", "head"]);
    expect(centers.undefined).toContain("throat");
  });
});

describe("definition (connected components)", () => {
  it("reports No Definition when nothing is defined", () => {
    expect(chartFrom([34]).definition.definition).toBe("No Definition");
    expect(chartFrom([]).definition.definition).toBe("No Definition");
  });

  it("reports Single Definition for one connected component", () => {
    const { definition } = chartFrom([34, 20]);
    expect(definition.definition).toBe("Single Definition");
    expect(definition.components).toHaveLength(1);
  });

  it("merges channels that share a centre into one component", () => {
    // 34-20 (Sacral-Throat) + 20-57 (Throat-Spleen) share the Throat.
    const { definition } = chartFrom([34, 20, 57]);
    expect(definition.definition).toBe("Single Definition");
    expect(definition.components[0]).toHaveLength(3);
  });

  it("reports Split Definition for two disjoint components", () => {
    // 34-20 (Sacral-Throat) and 4-63 (Ajna-Head) share nothing.
    const { definition } = chartFrom([34, 20, 4, 63]);
    expect(definition.definition).toBe("Split Definition");
    expect(definition.components).toHaveLength(2);
  });

  it("reports Triple Split Definition for three disjoint components", () => {
    // 34-20 (Sacral-Throat), 4-63 (Ajna-Head), 19-49 (Root-Solar Plexus).
    const { definition } = chartFrom([34, 20, 4, 63, 19, 49]);
    expect(definition.definition).toBe("Triple Split Definition");
    expect(definition.components).toHaveLength(3);
  });

  it("reports Quadruple Split Definition for four disjoint components", () => {
    // Sacral-Throat, Ajna-Head, Root-Solar Plexus, G-Heart.
    const { definition } = chartFrom([34, 20, 4, 63, 19, 49, 25, 51]);
    expect(definition.definition).toBe("Quadruple Split Definition");
    expect(definition.components).toHaveLength(4);
  });
});

describe("motor-to-Throat connectivity", () => {
  it("is false when the Throat is undefined", () => {
    const { channels, centers } = chartFrom([4, 63]);
    expect(findMotorToThroatConnection(centers.defined, channels).connected).toBe(false);
  });

  it("is false when the Throat is defined only from a non-motor centre", () => {
    // 17-62 defines Ajna+Throat. The Ajna is an awareness centre, not a motor.
    const { channels, centers } = chartFrom([17, 62]);
    expect(centers.defined).toContain("throat");
    expect(findMotorToThroatConnection(centers.defined, channels).connected).toBe(false);
  });

  it("is true for a direct motor-to-Throat channel", () => {
    const { channels, centers } = chartFrom([34, 20]);
    const result = findMotorToThroatConnection(centers.defined, channels);
    expect(result.connected).toBe(true);
    expect(result.motors).toContain("sacral");
  });

  it("is true for an INDIRECT motor-to-Throat path", () => {
    // Sacral -(2-14)- G -(1-8)- Throat. No single channel spans the gap.
    const { channels, centers } = chartFrom([2, 14, 1, 8]);
    const result = findMotorToThroatConnection(centers.defined, channels);
    expect(result.connected).toBe(true);
    expect(result.motors).toEqual(["sacral"]);
    expect(result.path).toEqual(["sacral", "g", "throat"]);
  });

  it("does not connect through an undefined centre", () => {
    // 2-14 defines G+Sacral; 1-8 is absent, so the Throat is never reached.
    const { channels, centers } = chartFrom([2, 14]);
    expect(findMotorToThroatConnection(centers.defined, channels).connected).toBe(false);
  });
});

describe("type derivation", () => {
  it("Reflector — no centre defined", () => {
    expect(chartFrom([34, 41, 17]).type.type).toBe("Reflector");
  });

  it("Generator — Sacral defined, no motor reaches the Throat", () => {
    // 34-57 defines Sacral+Spleen. Throat undefined.
    const result = chartFrom([34, 57]);
    expect(isSacralDefined(result.centers.defined)).toBe(true);
    expect(result.type.type).toBe("Generator");
  });

  it("Manifesting Generator — Sacral defined and a motor reaches the Throat", () => {
    const result = chartFrom([34, 20]);
    expect(result.type.type).toBe("Manifesting Generator");
    expect(result.type.motorToThroat).toBe(true);
  });

  it("Manifesting Generator via an indirect motor path", () => {
    expect(chartFrom([2, 14, 1, 8]).type.type).toBe("Manifesting Generator");
  });

  it("Manifestor — Sacral undefined, motor reaches the Throat", () => {
    // 21-45 defines Heart+Throat. Heart is a motor; Sacral is undefined.
    const result = chartFrom([21, 45]);
    expect(result.type.type).toBe("Manifestor");
    expect(result.type.sacralDefined).toBe(false);
    expect(result.type.connectedMotors).toEqual(["heart"]);
  });

  it("Projector — centres defined, Sacral undefined, no motor to Throat", () => {
    expect(chartFrom([17, 62]).type.type).toBe("Projector");
    expect(chartFrom([4, 63]).type.type).toBe("Projector");
  });

  it("Projector with a defined Throat but no motor behind it", () => {
    // A defined Throat alone does NOT make a Manifestor.
    const result = chartFrom([17, 62, 11, 56]);
    expect(result.centers.defined).toContain("throat");
    expect(result.type.type).toBe("Projector");
  });
});

describe("authority derivation", () => {
  it("Emotional — Solar Plexus defined, overriding everything below it", () => {
    // 19-49 defines Root+Solar Plexus, plus a Sacral and Spleen definition.
    const result = chartFrom([19, 49, 34, 57]);
    expect(result.centers.defined).toContain("solarPlexus");
    expect(result.centers.defined).toContain("sacral");
    expect(result.centers.defined).toContain("spleen");
    expect(result.authority.authority).toBe("Emotional");
  });

  it("Sacral — Sacral defined, Solar Plexus undefined", () => {
    const result = chartFrom([34, 57]);
    expect(result.authority.authority).toBe("Sacral");
  });

  it("Sacral outranks Splenic", () => {
    const result = chartFrom([34, 57]);
    expect(result.centers.defined).toContain("spleen");
    expect(result.authority.authority).toBe("Sacral");
  });

  it("Splenic — Spleen defined, no Solar Plexus or Sacral", () => {
    // 18-58 defines Spleen+Root.
    const result = chartFrom([18, 58]);
    expect(result.authority.authority).toBe("Splenic");
    expect(result.type.type).toBe("Projector");
  });

  it("Ego Manifested — Heart to Throat, making a Manifestor", () => {
    const result = chartFrom([21, 45]);
    expect(result.type.type).toBe("Manifestor");
    expect(result.authority.authority).toBe("Ego Manifested");
  });

  it("Ego Projected — Heart defined without reaching the Throat", () => {
    // 25-51 defines G+Heart. No Throat connection, so a Projector.
    const result = chartFrom([25, 51]);
    expect(result.type.type).toBe("Projector");
    expect(result.authority.authority).toBe("Ego Projected");
  });

  it("Self-Projected — only the G among the authority centres", () => {
    // 1-8 defines G+Throat.
    const result = chartFrom([1, 8]);
    expect(result.type.type).toBe("Projector");
    expect(result.authority.authority).toBe("Self-Projected");
    expect(result.authority.supportingChannels).toEqual(["1-8"]);
    expect(result.authority.warning).toBeUndefined();
  });

  it.each([
    ["1-8", [1, 8]],
    ["7-31", [7, 31]],
    ["13-33", [13, 33]],
    ["10-20", [10, 20]],
  ])("Self-Projected via the %s channel", (id, gates) => {
    const result = chartFrom(gates as number[]);
    expect(result.authority.authority).toBe("Self-Projected");
    expect(result.authority.supportingChannels).toContain(id);
  });

  it("Mental / Environmental — only Head, Ajna and/or Throat defined", () => {
    // 17-62 (Ajna-Throat) + 4-63 (Ajna-Head). No motor, no G.
    const result = chartFrom([17, 62, 4, 63]);
    expect(result.type.type).toBe("Projector");
    expect(result.authority.authority).toBe("Mental / Environmental");
  });

  it("Lunar — Reflector", () => {
    const result = chartFrom([34, 41]);
    expect(result.type.type).toBe("Reflector");
    expect(result.authority.authority).toBe("Lunar");
  });

  it("never returns Ego for a chart with a defined Spleen", () => {
    // 26-44 defines Heart+Spleen: Spleen outranks Ego.
    const result = chartFrom([26, 44]);
    expect(result.centers.defined).toContain("heart");
    expect(result.centers.defined).toContain("spleen");
    expect(result.authority.authority).toBe("Splenic");
  });

  it("respects the full hierarchy order", () => {
    const order = [
      { gates: [19, 49], expected: "Emotional" },
      { gates: [34, 57], expected: "Sacral" },
      { gates: [18, 58], expected: "Splenic" },
      { gates: [21, 45], expected: "Ego Manifested" },
      { gates: [25, 51], expected: "Ego Projected" },
      { gates: [1, 8], expected: "Self-Projected" },
      { gates: [17, 62], expected: "Mental / Environmental" },
    ];
    for (const { gates, expected } of order) {
      expect(chartFrom(gates).authority.authority).toBe(expected);
    }
  });
});

describe("incarnation cross angle", () => {
  it.each([
    [1, 3, "Right Angle"],
    [2, 4, "Right Angle"],
    [3, 5, "Right Angle"],
    [4, 6, "Right Angle"],
    [4, 1, "Juxtaposition"],
    [5, 1, "Left Angle"],
    [5, 2, "Left Angle"],
    [6, 2, "Left Angle"],
    [6, 3, "Left Angle"],
  ])("profile %i/%i is %s", (p, d, expected) => {
    expect(deriveCrossAngle(p as number, d as number)).toBe(expected);
  });
});

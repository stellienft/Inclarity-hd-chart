import { describe, expect, it } from "vitest";

import { CHANNEL_DEFINITIONS } from "@/lib/human-design/constants/channels";
import { CENTER_IDS } from "@/lib/human-design/types/center";

import { ARTWORK_INK, ARTWORK_VIEWBOX, CENTRE_REGION, CHANNEL_REGION, INTEGRATION_GROUP } from "./artwork";
import { GRAPH_BOX } from "./geometry";

describe("the reference artwork", () => {
  it("is the whole drawing, unedited", () => {
    // 74 subpaths: the outer contour, nine centre interiors, and 64 regions
    // between the strokes.
    expect(ARTWORK_INK.match(/M/g) ?? []).toHaveLength(74);
    expect(ARTWORK_INK.startsWith("M462.3,1369.7")).toBe(true);
  });

  it("is drawn in the same space as the geometry", () => {
    // The graph's own coordinates, not the frame — the graph is scaled down
    // inside the frame, and every number in geometry.ts stays in this space.
    expect(ARTWORK_VIEWBOX.width).toBe(GRAPH_BOX.width);
    expect(ARTWORK_VIEWBOX.height).toBe(GRAPH_BOX.height);
  });

  it("has a region for all nine centres", () => {
    expect(Object.keys(CENTRE_REGION).sort()).toEqual([...CENTER_IDS].sort());
    for (const [centre, d] of Object.entries(CENTRE_REGION)) {
      expect(d.startsWith("M"), `${centre} is not a path`).toBe(true);
    }
  });

  /**
   * Every channel is accounted for exactly once: either the drawing gives it a
   * track of its own, or it is one of the four the drawing merges. A channel
   * appearing in both, or in neither, means the mapping has drifted.
   */
  it("accounts for all 36 channels exactly once", () => {
    const mapped = new Set(Object.keys(CHANNEL_REGION));
    const merged = new Set(INTEGRATION_GROUP);

    expect(mapped.size + merged.size).toBe(36);
    for (const id of merged) expect(mapped.has(id), `${id} is in both`).toBe(false);

    for (const { id } of CHANNEL_DEFINITIONS) {
      expect(mapped.has(id) || merged.has(id), `${id} is in neither`).toBe(true);
    }
    expect(CHANNEL_DEFINITIONS).toHaveLength(36);
  });

  it("gives every mapped channel at least one region, and no region twice", () => {
    const seen = new Map<string, string>();
    for (const [id, regions] of Object.entries(CHANNEL_REGION)) {
      expect(regions.length, `${id} has no region`).toBeGreaterThan(0);
      for (const d of regions) {
        expect(seen.has(d), `${id} reuses the region already given to ${seen.get(d)}`).toBe(false);
        seen.set(d, id);
      }
    }
    // A centre's interior must never be mistaken for a channel track.
    for (const d of Object.values(CENTRE_REGION)) {
      expect(seen.has(d), "a centre interior is being used as a channel").toBe(false);
    }
  });
});

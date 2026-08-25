import { describe, expect, it } from "vitest";

import { CHANNEL_DEFINITIONS } from "@/lib/human-design/constants/channels";
import { CENTER_IDS } from "@/lib/human-design/types/center";

import {
  ARTWORK_INK,
  ARTWORK_VIEWBOX,
  CENTRE_REGION,
  CHANNEL_BRIDGE,
  CHANNEL_REGION,
  INTEGRATION_GROUP,
} from "./artwork";
import { GRAPH_BOX } from "./geometry";

describe("the reference artwork", () => {
  /**
   * The line work outlines what can be painted, and nothing else.
   *
   * The file has 74 subpaths — an outer contour and 73 regions — and only 44 of
   * those regions are a centre or a channel. Outlining the other 29 drew the
   * gaps the artwork leaves between neighbouring channels, and a gap is the
   * same width as a track (Head to Ajna: tracks of 14.9, 15.7 and 15.1, gaps of
   * 17.3 and 14.3), so three channels drew as five identical bars. Deriving the
   * ink from the two maps is what keeps the two in step.
   *
   * The 45th fillable region is the one bridge, which is not in the file — see
   * CHANNEL_BRIDGE. It is outlined with the rest so the channel it completes
   * reads as one line, and every bridge has to be one of its own channel's
   * regions or the two would drift apart.
   */
  it("outlines exactly the regions the chart can fill", () => {
    const fillable = [
      ...Object.values(CENTRE_REGION),
      ...Object.values(CHANNEL_REGION).flat(),
    ];
    expect(ARTWORK_INK.match(/M/g) ?? []).toHaveLength(fillable.length);
    expect(fillable).toHaveLength(44 + Object.values(CHANNEL_BRIDGE).flat().length);

    for (const [id, spans] of Object.entries(CHANNEL_BRIDGE)) {
      for (const d of spans) {
        expect(CHANNEL_REGION[id], `${id}'s bridge is not one of its regions`).toContain(d);
      }
    }
    for (const d of fillable) expect(ARTWORK_INK).toContain(d);
    expect(ARTWORK_INK.startsWith("M337.6,155.4")).toBe(true);
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

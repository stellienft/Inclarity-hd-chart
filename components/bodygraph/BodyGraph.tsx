import { CHANNEL_DEFINITIONS } from "@/lib/human-design/constants/channels";
import { GATE_DEFINITIONS } from "@/lib/human-design/constants/gates";
import type { HumanDesignChart } from "@/lib/human-design/types/chart";
import { CENTER_LABELS, type CenterId } from "@/lib/human-design/types/center";

import {
  BODY_SILHOUETTE_PATH,
  CENTERS,
  VIEWBOX,
  channelHalfPath,
  channelMidpoint,
  channelPath,
  gateLabelPoint,
  getGatePoint,
  shapeToPath,
} from "./geometry";
import {
  BODY_SILHOUETTE_FILL,
  CENTER_DEFINED_FILL,
  CENTER_DEFINED_STROKE,
  CENTER_STROKE,
  CENTER_UNDEFINED_FILL,
  CHANNEL_TRACK_EDGE,
  CHANNEL_TRACK_FILL,
  DESIGN_COLOR,
  GATE_MARKER_RADIUS,
  GATE_MARKER_RING,
  GATE_MARKER_RING_WIDTH,
  GATE_MARKER_TEXT,
  ON_DEFINED_TEXT,
  ON_UNDEFINED_TEXT,
  PERSONALITY_COLOR,
  STROKE_WIDTH,
  describeActivation,
  type ActivationStyle,
} from "./styles";

export interface BodyGraphProps {
  chart: HumanDesignChart;
  /** Rendered as the SVG's accessible title. */
  title?: string;
  className?: string;
}

function styleFor(personality: boolean, design: boolean): ActivationStyle {
  if (personality && design) return "both";
  if (personality) return "personality";
  if (design) return "design";
  return "none";
}

/** A circle split down the middle, for a gate carrying both imprints. */
function SplitGateMarker({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <>
      <path
        d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} Z`}
        fill={PERSONALITY_COLOR}
      />
      <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z`} fill={DESIGN_COLOR} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={GATE_MARKER_RING}
        strokeWidth={GATE_MARKER_RING_WIDTH}
      />
    </>
  );
}

/**
 * The BodyGraph.
 *
 * Original SVG geometry — nothing here is traced from another provider's
 * artwork. All 9 centres, all 64 gates and all 36 channels are always
 * rendered; activation only changes how they are painted, so the chart reads
 * as a complete map rather than a sparse one.
 *
 * Accessibility: colour is never load-bearing on its own. Every channel and
 * gate carries a <title> naming its activation state in words, the SVG has a
 * title/description pair, and `ChartTextSummary` (rendered alongside on the
 * results page) states the same information as prose.
 */
export function BodyGraph({ chart, title, className }: BodyGraphProps) {
  const gateState = new Map<number, { personality: boolean; design: boolean }>();
  for (const gate of chart.activeGates) {
    gateState.set(gate.gate, { personality: gate.personality, design: gate.design });
  }

  const activeChannelById = new Map(chart.channels.map((channel) => [channel.id, channel]));
  const definedCenters = new Set<CenterId>(chart.centers.defined);

  const accessibleTitle = title ?? "Human Design BodyGraph";
  const description =
    `${chart.type}, ${chart.authority} authority, profile ${chart.profile}, ` +
    `${chart.definition}. Defined centres: ` +
    `${chart.centers.defined.map((c) => CENTER_LABELS[c]).join(", ") || "none"}. ` +
    `Defined channels: ${chart.channels.map((c) => c.id).join(", ") || "none"}.`;

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      className={className}
      role="img"
      aria-labelledby="bodygraph-title bodygraph-desc"
      preserveAspectRatio="xMidYMid meet"
    >
      <title id="bodygraph-title">{accessibleTitle}</title>
      <desc id="bodygraph-desc">{description}</desc>

      {/* ---- Decorative body silhouette ---- */}
      <path d={BODY_SILHOUETTE_PATH} fill={BODY_SILHOUETTE_FILL} aria-hidden="true" />

      {/* ---- Channels, beneath the centres ---- */}
      <g strokeLinecap="round" fill="none">
        {CHANNEL_DEFINITIONS.map((definition) => {
          const [gateA, gateB] = definition.gates;
          const a = getGatePoint(gateA);
          const b = getGatePoint(gateB);
          const active = activeChannelById.get(definition.id);

          if (!active) {
            // Two strokes: a faint wider edge, then white on top. That reads as
            // an empty "track" both over the pale silhouette and over the page.
            const d = channelPath(a, b);
            return (
              <g key={definition.id} data-channel={definition.id} data-active="false">
                <path d={d} stroke={CHANNEL_TRACK_EDGE} strokeWidth={STROKE_WIDTH.channelTrackEdge} />
                <path d={d} stroke={CHANNEL_TRACK_FILL} strokeWidth={STROKE_WIDTH.channelTrack} />
              </g>
            );
          }

          const sidesA = active.activation[gateA] ?? { personality: false, design: false };
          const sidesB = active.activation[gateB] ?? { personality: false, design: false };
          const styleA = styleFor(sidesA.personality, sidesA.design);
          const styleB = styleFor(sidesB.personality, sidesB.design);
          const mid = channelMidpoint(a, b);

          /**
           * Each half is painted for the gate that owns it, so a channel
           * activated from both imprints is visibly split rather than
           * flattened to one colour. A gate carrying both Personality and
           * Design is drawn as a design-coloured stroke with a dashed
           * personality overlay, so the distinction survives greyscale
           * printing.
           */
          const half = (from: typeof a, style: ActivationStyle, gate: number) => {
            const d = channelHalfPath(from, from === a ? b : a, mid);
            const key = `${definition.id}-${gate}`;

            if (style === "both") {
              return (
                <g key={key}>
                  <path d={d} stroke={DESIGN_COLOR} strokeWidth={STROKE_WIDTH.channelActive} />
                  <path
                    d={d}
                    stroke={PERSONALITY_COLOR}
                    strokeWidth={STROKE_WIDTH.channelActive}
                    strokeDasharray="7 7"
                  />
                </g>
              );
            }
            return (
              <path
                key={key}
                d={d}
                stroke={style === "design" ? DESIGN_COLOR : PERSONALITY_COLOR}
                strokeWidth={STROKE_WIDTH.channelActive}
              />
            );
          };

          return (
            <g key={definition.id} data-channel={definition.id} data-active="true">
              <title>
                {`Channel ${definition.id} — ${definition.name}. `}
                {`Gate ${gateA}: ${describeActivation(styleA)}. `}
                {`Gate ${gateB}: ${describeActivation(styleB)}.`}
              </title>
              {half(a, styleA, gateA)}
              {half(b, styleB, gateB)}
            </g>
          );
        })}
      </g>

      {/* ---- Centres ---- */}
      <g>
        {CENTERS.map((centre) => {
          const defined = definedCenters.has(centre.id);
          return (
            <path
              key={centre.id}
              d={shapeToPath(centre.shape)}
              fill={defined ? CENTER_DEFINED_FILL : CENTER_UNDEFINED_FILL}
              stroke={defined ? CENTER_DEFINED_STROKE : CENTER_STROKE}
              strokeWidth={STROKE_WIDTH.centre}
              data-center={centre.id}
              data-defined={defined ? "true" : "false"}
            >
              <title>
                {`${CENTER_LABELS[centre.id]} centre — ${defined ? "defined" : "undefined"}`}
              </title>
            </path>
          );
        })}
      </g>

      {/* ---- Gates ---- */}
      <g fontSize={10.5} fontWeight={600} textAnchor="middle" dominantBaseline="central">
        {GATE_DEFINITIONS.map(({ gate, center, name }) => {
          const state = gateState.get(gate);
          const style = styleFor(state?.personality ?? false, state?.design ?? false);
          const at = gateLabelPoint(gate, center);
          const defined = definedCenters.has(center);
          const active = style !== "none";

          return (
            <g key={gate} data-gate={gate} data-activation={style}>
              <title>
                {`Gate ${gate} — ${name}, ${CENTER_LABELS[center]} centre, ${describeActivation(style)}`}
              </title>

              {/*
                An activated gate becomes a filled marker with a white numeral;
                an inactive one is a plain numeral. Shape, not just colour,
                distinguishes them.
              */}
              {active ? (
                style === "both" ? (
                  <SplitGateMarker cx={at.x} cy={at.y} r={GATE_MARKER_RADIUS} />
                ) : (
                  <circle
                    cx={at.x}
                    cy={at.y}
                    r={GATE_MARKER_RADIUS}
                    fill={style === "design" ? DESIGN_COLOR : PERSONALITY_COLOR}
                    stroke={GATE_MARKER_RING}
                    strokeWidth={GATE_MARKER_RING_WIDTH}
                  />
                )
              ) : null}

              <text
                x={at.x}
                y={at.y}
                fill={
                  active
                    ? GATE_MARKER_TEXT
                    : defined
                      ? ON_DEFINED_TEXT
                      : ON_UNDEFINED_TEXT
                }
                fontWeight={active ? 700 : 500}
                aria-hidden="true"
              >
                {gate}
              </text>
            </g>
          );
        })}
      </g>

      {/*
        Centre names are deliberately NOT drawn inside the shapes. Conventional
        BodyGraphs do not label them, and at this scale the names collide with
        the gate markers in the four triangular centres. The naming is carried
        instead by each centre's <title>, by the SVG description, and by the
        labelled centre list rendered beside the chart — all available to
        screen readers and sighted readers alike.
      */}
    </svg>
  );
}

export default BodyGraph;

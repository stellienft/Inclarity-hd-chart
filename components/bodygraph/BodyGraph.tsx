import { CHANNEL_DEFINITIONS } from "@/lib/human-design/constants/channels";
import { GATE_DEFINITIONS } from "@/lib/human-design/constants/gates";
import type { HumanDesignChart } from "@/lib/human-design/types/chart";
import { CENTER_LABELS, type CenterId } from "@/lib/human-design/types/center";

import { CENTERS, VIEWBOX, getGatePoint, gateLabelPoint, shapeToPath } from "./geometry";
import {
  CENTER_DEFINED_FILL,
  CENTER_DEFINED_TEXT,
  CENTER_STROKE,
  CENTER_UNDEFINED_FILL,
  CHANNEL_INACTIVE,
  DESIGN_COLOR,
  PALETTE,
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

      {/* ---- Channels, drawn beneath the centres ---- */}
      <g strokeLinecap="round">
        {CHANNEL_DEFINITIONS.map((definition) => {
          const [gateA, gateB] = definition.gates;
          const a = getGatePoint(gateA);
          const b = getGatePoint(gateB);
          const active = activeChannelById.get(definition.id);

          if (!active) {
            return (
              <line
                key={definition.id}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={CHANNEL_INACTIVE}
                strokeWidth={STROKE_WIDTH.channelInactive}
                data-channel={definition.id}
                data-active="false"
              />
            );
          }

          const sidesA = active.activation[gateA] ?? { personality: false, design: false };
          const sidesB = active.activation[gateB] ?? { personality: false, design: false };
          const styleA = styleFor(sidesA.personality, sidesA.design);
          const styleB = styleFor(sidesB.personality, sidesB.design);

          const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

          /**
           * Each half of the channel is painted for the gate that owns it, so
           * a channel activated from both imprints is visibly split rather
           * than flattened to one colour. A gate carrying both Personality and
           * Design is drawn as a design-coloured stroke with a dashed
           * personality overlay, keeping both readable in print and greyscale.
           */
          const half = (
            from: { x: number; y: number },
            to: { x: number; y: number },
            style: ActivationStyle,
            gate: number,
          ) => {
            const key = `${definition.id}-${gate}`;
            if (style === "both") {
              return (
                <g key={key}>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={DESIGN_COLOR}
                    strokeWidth={STROKE_WIDTH.channelActive}
                  />
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={PERSONALITY_COLOR}
                    strokeWidth={STROKE_WIDTH.channelActive}
                    strokeDasharray="7 7"
                  />
                </g>
              );
            }
            return (
              <line
                key={key}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
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
              {half(a, mid, styleA, gateA)}
              {half(b, mid, styleB, gateB)}
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
              fill={defined ? CENTER_DEFINED_FILL[centre.id] : CENTER_UNDEFINED_FILL}
              stroke={CENTER_STROKE}
              strokeWidth={STROKE_WIDTH.centre}
              strokeLinejoin="round"
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

      {/* ---- Gate numbers ---- */}
      <g fontSize={11} fontWeight={600} textAnchor="middle" dominantBaseline="middle">
        {GATE_DEFINITIONS.map(({ gate, center, name }) => {
          const state = gateState.get(gate);
          const style = styleFor(state?.personality ?? false, state?.design ?? false);
          const point = gateLabelPoint(gate, center);
          const anchor = getGatePoint(gate);
          const defined = definedCenters.has(center);
          const active = style !== "none";
          // Centres whose fill is dark enough to need light text on top.
          const onDarkFill = defined && CENTER_DEFINED_TEXT[center] === "#FFFFFF";

          const dotFill =
            style === "design"
              ? DESIGN_COLOR
              : style === "none"
                ? "#FFFFFF"
                : PERSONALITY_COLOR;

          return (
            <g key={gate} data-gate={gate} data-activation={style}>
              <title>
                {`Gate ${gate} — ${name}, ${CENTER_LABELS[center]} centre, ${describeActivation(style)}`}
              </title>

              {/* Activation dot on the centre boundary. */}
              <circle
                cx={anchor.x}
                cy={anchor.y}
                r={active ? 4.5 : 3}
                fill={dotFill}
                stroke={style === "both" ? DESIGN_COLOR : CENTER_STROKE}
                strokeWidth={style === "both" ? 3 : STROKE_WIDTH.gateDot}
              />

              {/*
                Gate numbers sit inside the centre, so their colour is chosen
                for CONTRAST against that centre's fill first. The Personality
                and Design distinction is carried by the boundary dot and by
                the <title> text, never by the number's colour alone.
              */}
              <text
                x={point.x}
                y={point.y}
                fill={onDarkFill
                  ? style === "design"
                    ? "#F4CFCF"
                    : "#FFFFFF"
                  : style === "design"
                    ? DESIGN_COLOR
                    : active || defined
                      ? PALETTE.ink
                      : "#9A928C"}
                fontWeight={active ? 700 : 500}
                /*
                  An inactive number on a DEFINED centre still has to clear its
                  fill, so it uses the centre's ink at reduced opacity rather
                  than the pale grey used against the warm-white background.
                */
                fillOpacity={active ? 1 : defined ? 0.62 : 1}
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
        the gate numbers in the four triangular centres. The naming is carried
        instead by each centre's <title>, by the SVG description, and by the
        labelled centre list rendered beside the chart — all of which are
        available to screen readers and to sighted readers alike.
      */}
    </svg>
  );
}

export default BodyGraph;

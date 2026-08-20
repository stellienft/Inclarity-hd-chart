import { CHANNEL_DEFINITIONS } from "@/lib/human-design/constants/channels";
import { GATE_DEFINITIONS } from "@/lib/human-design/constants/gates";
import type { HumanDesignChart } from "@/lib/human-design/types/chart";
import { CENTER_LABELS, type CenterId } from "@/lib/human-design/types/center";

import { VARIABLE_POSITIONS, type VariableArrow } from "@/lib/human-design/derive/variable";

import {
  CENTERS,
  VARIABLE_SLOTS,
  VIEWBOX,
  channelHalfPath,
  channelMidpoint,
  gateLabelPoint,
  GRAPH_BOX,
  getGatePoint,
  graphTransformAttr,
  variableArrowPath,
} from "./geometry";
import { ARTWORK_INK, CENTRE_REGION, CHANNEL_REGION, MERGED_CORRIDOR } from "./artwork";
import { FIGURE_ARTWORK_PATH, figureTransformAttr } from "./figure";
import {
  CENTER_DEFINED_FILL,
  BODY_SILHOUETTE_FILL,
  CENTER_UNDEFINED_FILL,
  ARTWORK_INK_COLOR,
  ARTWORK_INK_OPACITY,
  ARTWORK_INK_WIDTH,
  FLOOD_WIDTH,
  CHANNEL_TRACK_FILL,
  DESIGN_COLOR,
  markerRadius,
  GATE_MARKER_RING,
  GATE_MARKER_RING_WIDTH,
  GATE_MARKER_TEXT,
  GATE_NUMERAL_SIZE,
  GATE_NUMERAL_WEIGHT,
  ON_DEFINED_TEXT,
  ON_UNDEFINED_TEXT,
  PERSONALITY_COLOR,
  STROKE_WIDTH,
  activationColor,
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

const DIRECTION_MEANING = {
  left: "active, focused",
  right: "passive, receptive",
} as const;

/**
 * One Variable arrow: the glyph, its Colour, and its Tone as a subscript.
 *
 * The number is Colour — what the variable is. The subscript is Tone — why the
 * arrow points where it does. Direction is carried by the glyph's shape, not
 * by which side of the head it sits on, so an arrow can point back toward the
 * chart; that is a real result, not a drawing error.
 *
 * An arrow whose Tone is within a whisker of its boundary is drawn with a
 * DASHED shaft. That is a second, non-colour signal that the direction is
 * provisional, and the <title> says so in words.
 */
function VariableArrowGlyph({ arrow, color }: { arrow: VariableArrow; color: string }) {
  const slot = VARIABLE_SLOTS[arrow.position];
  const source = arrow.side === "design" ? "Design" : "Personality";

  return (
    <g data-variable={arrow.position} data-direction={arrow.direction}>
      <title>
        {`${arrow.label} (${source}): Colour ${arrow.color}, Tone ${arrow.tone}. `}
        {`Arrow points ${arrow.direction} — ${DIRECTION_MEANING[arrow.direction]}.`}
        {arrow.nearToneBoundary
          ? " This Tone sits on the edge of its band, so the direction is provisional."
          : ""}
      </title>

      <path
        d={variableArrowPath(slot.arrow, arrow.direction)}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...(arrow.nearToneBoundary ? { strokeDasharray: "7 6" } : {})}
        aria-hidden="true"
      />

      <text
        x={slot.value.x}
        y={slot.value.y}
        textAnchor={slot.textAnchor}
        dominantBaseline="central"
        fill={color}
        aria-hidden="true"
      >
        <tspan fontSize={29} fontWeight={400}>
          {arrow.color}
        </tspan>
        <tspan fontSize={19} fontWeight={400} dy={9}>
          {arrow.tone}
        </tspan>
      </text>
    </g>
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
    `Defined channels: ${chart.channels.map((c) => c.id).join(", ") || "none"}. ` +
    `Variable arrows: ` +
    `${VARIABLE_POSITIONS.map((position) => {
      const arrow = chart.variable.arrows[position];
      return `${arrow.label} colour ${arrow.color} tone ${arrow.tone}, pointing ${arrow.direction}`;
    }).join("; ")}.`;

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

      {/*
        Decorative silhouette — supplied artwork, used verbatim and placed by
        transform. Its holes (the hair slivers and the two arm gaps) are cut by
        winding direction, so it takes the DEFAULT nonzero fill rule; evenodd
        inverts them.
      */}
      <g data-figure="silhouette" transform={figureTransformAttr()} aria-hidden="true">
        <path d={FIGURE_ARTWORK_PATH} fill={BODY_SILHOUETTE_FILL} />
      </g>

      {/* ---- The graph, scaled down inside the frame so the figure reads ---- */}
      <g transform={graphTransformAttr()}>

      {/* ---- Variable: the four arrows either side of the head ---- */}
      <g data-testid="variable-arrows">
        {VARIABLE_POSITIONS.map((position) => {
          const arrow = chart.variable.arrows[position];
          return (
            <VariableArrowGlyph
              key={position}
              arrow={arrow}
              color={arrow.side === "design" ? DESIGN_COLOR : PERSONALITY_COLOR}
            />
          );
        })}
      </g>

      {/*
        ---- The drawing ----

        Centre and channel fills go down first, then the artwork's own ink on
        top of them. The ink is the client's file as one path: filled with the
        default nonzero rule it covers everything except its holes, so the
        fills beneath show through exactly the regions the drawing leaves open.
      */}
      <g>
        {CENTERS.map((centre) => {
          const defined = definedCenters.has(centre.id);
          return (
            <path
              key={centre.id}
              d={CENTRE_REGION[centre.id]}
              fill={defined ? CENTER_DEFINED_FILL : CENTER_UNDEFINED_FILL}
              data-center-shape={centre.id}
              data-defined={defined ? "true" : "false"}
            >
              <title>
                {`${CENTER_LABELS[centre.id]} centre — ${defined ? "defined" : "undefined"}`}
              </title>
            </path>
          );
        })}
      </g>

      {/*
        ---- Channels, in two passes ----

        Everything with a track of its own goes down first, because an inactive
        track is filled WHITE and would otherwise paint over the channels that
        SHARE it: 10-20 and 10-57 both run along 20-57's band, and 20-57 sorts
        after them.
      */}
      <g strokeLinecap="butt" fill="none">
        {CHANNEL_DEFINITIONS.map((definition) => {
          const [gateA, gateB] = definition.gates;
          const a = getGatePoint(gateA);
          const b = getGatePoint(gateB);
          const active = activeChannelById.get(definition.id);
          const regions = CHANNEL_REGION[definition.id];
          const corridor = MERGED_CORRIDOR[definition.id];

          const sidesA = active?.activation[gateA] ?? { personality: false, design: false };
          const sidesB = active?.activation[gateB] ?? { personality: false, design: false };
          const styleA = styleFor(sidesA.personality, sidesA.design);
          const styleB = styleFor(sidesB.personality, sidesB.design);

          const label = (
            <title>
              {`Channel ${definition.id} — ${definition.name}. `}
              {active
                ? `Gate ${gateA}: ${describeActivation(styleA)}. Gate ${gateB}: ${describeActivation(styleB)}.`
                : "Not defined."}
            </title>
          );

          /*
           * A channel the artwork draws as its own track is FILLED in place.
           * Filling is what makes a fragmented channel work: where another
           * channel crosses one, the drawing splits its track into pieces, and
           * 37-40 is a single fragment out by the Solar Plexus that an
           * approximate arc misses entirely.
           *
           * The clipped strokes on top only place the seam where the two gates
           * meet, for a channel whose halves are activated differently. If the
           * arc misses, the base fill still shows it as defined.
           */
          if (regions) {
            const clipId = `track-${definition.id}`;
            const base = active
              ? activationColor(styleA === "none" ? styleB : styleA)
              : CHANNEL_TRACK_FILL;
            const mid = channelMidpoint(a, b, definition.id);
            const half = (from: typeof a, style: ActivationStyle, gate: number) => {
              const d = channelHalfPath(from, from === a ? b : a, mid, definition.id);
              const key = `${definition.id}-${gate}`;
              if (style === "both") {
                return (
                  <g key={key}>
                    <path d={d} stroke={DESIGN_COLOR} strokeWidth={FLOOD_WIDTH} />
                    <path
                      d={d}
                      stroke={PERSONALITY_COLOR}
                      strokeWidth={FLOOD_WIDTH}
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
                  strokeWidth={FLOOD_WIDTH}
                />
              );
            };

            return (
              <g
                key={definition.id}
                data-channel={definition.id}
                data-active={active ? "true" : "false"}
              >
                {label}
                {regions.map((d, index) => (
                  <path key={index} d={d} fill={base} />
                ))}
                {active && styleA !== styleB ? (
                  <>
                    <clipPath id={clipId}>
                      {regions.map((d, index) => (
                        <path key={index} d={d} />
                      ))}
                    </clipPath>
                    <g clipPath={`url(#${clipId})`}>
                      {half(a, styleA, gateA)}
                      {half(b, styleB, gateB)}
                    </g>
                  </>
                ) : null}
              </g>
            );
          }

          if (corridor || !active) {
            // Drawn in the second pass, or not drawn at all.
            return (
              <g
                key={definition.id}
                data-channel={definition.id}
                data-active={active ? "true" : "false"}
              >
                {corridor ? null : label}
              </g>
            );
          }

          /*
           * 10-34 and 20-34: merged into the web at the G's left vertex with no
           * band of their own, so they are stroked over the artwork. Their radii
           * were swept until they cross nothing.
           */
          const mid = channelMidpoint(a, b, definition.id);
          const stroke = (from: typeof a, style: ActivationStyle, gate: number) => (
            <path
              key={`${definition.id}-${gate}`}
              d={channelHalfPath(from, from === a ? b : a, mid, definition.id)}
              stroke={style === "design" ? DESIGN_COLOR : PERSONALITY_COLOR}
              strokeWidth={STROKE_WIDTH.channelActive}
            />
          );
          return (
            <g key={definition.id} data-channel={definition.id} data-active="true">
              {label}
              {stroke(a, styleA, gateA)}
              {stroke(b, styleB, gateB)}
            </g>
          );
        })}
      </g>

      {/*
        Second pass: the two channels that share 20-57's band. 10-20 is the part
        of it above gate 10, 10-57 the part below, so each is the band clipped
        to a half-plane at gate 10's height. That puts them exactly on the line
        the drawing draws, rather than on a chord cutting across the arcs
        beneath — which is what an arc between those points does, at any radius.
      */}
      <g>
        {CHANNEL_DEFINITIONS.filter((d) => MERGED_CORRIDOR[d.id]).map((definition) => {
          const active = activeChannelById.get(definition.id);
          const [gateA, gateB] = definition.gates;
          const corridor = MERGED_CORRIDOR[definition.id]!;
          const sidesA = active?.activation[gateA] ?? { personality: false, design: false };
          const sidesB = active?.activation[gateB] ?? { personality: false, design: false };
          const styleA = styleFor(sidesA.personality, sidesA.design);
          const styleB = styleFor(sidesB.personality, sidesB.design);

          if (!active) return null;

          const clipId = `corridor-${definition.id}`;
          const seam = (corridor.from + corridor.to) / 2;
          // The upper half belongs to whichever gate sits higher.
          const aIsUpper = getGatePoint(gateA).y < getGatePoint(gateB).y;

          return (
            <g key={definition.id} data-corridor={definition.id}>
              <title>
                {`Channel ${definition.id} — ${definition.name}. `}
                {`Gate ${gateA}: ${describeActivation(styleA)}. `}
                {`Gate ${gateB}: ${describeActivation(styleB)}.`}
              </title>
              <clipPath id={clipId}>
                <path d={corridor.region} />
              </clipPath>
              <g clipPath={`url(#${clipId})`}>
                <rect
                  x={0}
                  y={corridor.from}
                  width={GRAPH_BOX.width}
                  height={seam - corridor.from}
                  fill={activationColor(aIsUpper ? styleA : styleB)}
                />
                <rect
                  x={0}
                  y={seam}
                  width={GRAPH_BOX.width}
                  height={corridor.to - seam}
                  fill={activationColor(aIsUpper ? styleB : styleA)}
                />
              </g>
            </g>
          );
        })}
      </g>


      {/*
        The artwork's own line work, over the fills. Stroked rather than filled:
        filling made every line as thick as the gap the file leaves between its
        two edges, and that weight is baked in. Its outer contour is dropped —
        stroking that drew a ring right round the chart.
      */}
      <path
        d={ARTWORK_INK}
        fill="none"
        stroke={ARTWORK_INK_COLOR}
        strokeOpacity={ARTWORK_INK_OPACITY}
        strokeWidth={ARTWORK_INK_WIDTH}
        strokeLinejoin="round"
        aria-hidden="true"
      />

      {/* ---- Gates ---- */}
      <g fontSize={GATE_NUMERAL_SIZE} textAnchor="middle" dominantBaseline="central">
        {GATE_DEFINITIONS.map(({ gate, center, name }) => {
          const state = gateState.get(gate);
          const style = styleFor(state?.personality ?? false, state?.design ?? false);
          const at = gateLabelPoint(gate, center);
          const defined = definedCenters.has(center);
          const active = style !== "none";

          return (
            <g
              key={gate}
              data-gate={gate}
              data-activation={style}
              data-center={center}
              data-marker-radius={markerRadius(center)}
            >
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
                  <SplitGateMarker cx={at.x} cy={at.y} r={markerRadius(center)} />
                ) : (
                  <circle
                    cx={at.x}
                    cy={at.y}
                    r={markerRadius(center)}
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
                fontWeight={active ? GATE_NUMERAL_WEIGHT.active : GATE_NUMERAL_WEIGHT.inactive}
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
      </g>
    </svg>
  );
}

export default BodyGraph;

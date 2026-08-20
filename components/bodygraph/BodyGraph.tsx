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
  channelHalfPlane,
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

  /**
   * How one gate is activated, whichever channel is asking.
   *
   * Read from the gate rather than from the channel, because a gate is
   * activated on its own account: four of the sixty-four (10, 20, 34 and 57)
   * belong to three channels each, and any gate at all can be activated while
   * its partner is not.
   */
  const gateStyle = (gate: number): ActivationStyle => {
    const state = gateState.get(gate);
    return styleFor(state?.personality ?? false, state?.design ?? false);
  };

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

        Everything with a track of its own goes down first, so it cannot paint
        over the channels that SHARE its band: 10-20 and 10-57 both run along
        20-57's, and 20-57 sorts after them.

        Each END of a channel is painted separately, from its own gate's
        activation. A gate can be activated while its partner is not — a hanging
        gate — and every published chart colours that gate's half of the channel
        anyway; only when BOTH ends are activated is the channel defined, which
        is what `data-active` and the centre states report. Painting only
        defined channels left a chart with two of them looking like a chart with
        none, and hid activations the planetary columns were listing.
      */}
      <g strokeLinecap="butt" fill="none">
        {CHANNEL_DEFINITIONS.map((definition) => {
          const [gateA, gateB] = definition.gates;
          const a = getGatePoint(gateA);
          const b = getGatePoint(gateB);
          const defined = activeChannelById.get(definition.id);
          const regions = CHANNEL_REGION[definition.id];
          const corridor = MERGED_CORRIDOR[definition.id];

          const styleA = gateStyle(gateA);
          const styleB = gateStyle(gateB);

          const label = (
            <title>
              {`Channel ${definition.id} — ${definition.name}. `}
              {defined
                ? `Defined. Gate ${gateA}: ${describeActivation(styleA)}. Gate ${gateB}: ${describeActivation(styleB)}.`
                : styleA !== "none" || styleB !== "none"
                  ? `Not defined — gate ${styleA !== "none" ? gateA : gateB} is activated ` +
                    `(${describeActivation(styleA !== "none" ? styleA : styleB)}) but ` +
                    `gate ${styleA !== "none" ? gateB : gateA} is not.`
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
           * The regions go down once unfilled, whatever the state, so the
           * drawing keeps one path per region for anything measuring it.
           */
          if (regions) {
            const mid = channelMidpoint(a, b, definition.id);
            const bothSame = styleA === styleB && styleA !== "none";

            /* One end's share of the track: its own regions, clipped to its
               half of the drawing. A gate carrying both imprints takes the
               Design fill with the Personality dashed over it, the same
               two-tone language the split gate markers use. */
            const end = (from: typeof a, to: typeof b, style: ActivationStyle, gate: number) => {
              if (style === "none") return null;
              const planeId = `half-${definition.id}-${gate}`;
              const trackId = `track-${definition.id}-${gate}`;
              return (
                <g key={gate} data-half={gate}>
                  <clipPath id={planeId}>
                    <rect {...channelHalfPlane(from, to, mid)} />
                  </clipPath>
                  <g clipPath={`url(#${planeId})`}>
                    {regions.map((d, index) => (
                      <path
                        key={index}
                        d={d}
                        fill={style === "both" ? DESIGN_COLOR : activationColor(style)}
                      />
                    ))}
                    {style === "both" ? (
                      <>
                        <clipPath id={trackId}>
                          {regions.map((d, index) => (
                            <path key={index} d={d} />
                          ))}
                        </clipPath>
                        <g clipPath={`url(#${trackId})`}>
                          <path
                            d={channelHalfPath(from, to, mid, definition.id)}
                            stroke={PERSONALITY_COLOR}
                            strokeWidth={FLOOD_WIDTH}
                            strokeDasharray="7 7"
                          />
                        </g>
                      </>
                    ) : null}
                  </g>
                </g>
              );
            };

            return (
              <g
                key={definition.id}
                data-channel={definition.id}
                data-active={defined ? "true" : "false"}
              >
                {label}
                {regions.map((d, index) => (
                  <path key={index} d={d} fill={CHANNEL_TRACK_FILL} />
                ))}
                {/* Both ends the same needs no seam, and an unclipped fill
                    cannot be thrown off by a fragment sitting across the
                    dividing line. */}
                {bothSame
                  ? regions.map((d, index) => (
                      <path
                        key={`on-${index}`}
                        d={d}
                        data-half="both"
                        fill={activationColor(styleA)}
                      />
                    ))
                  : [end(a, b, styleA, gateA), end(b, a, styleB, gateB)]}
              </g>
            );
          }

          if (corridor || (styleA === "none" && styleB === "none")) {
            // Drawn in the second pass, or not drawn at all.
            return (
              <g
                key={definition.id}
                data-channel={definition.id}
                data-active={defined ? "true" : "false"}
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
          const stroke = (from: typeof a, to: typeof b, style: ActivationStyle, gate: number) =>
            style === "none" ? null : (
              <path
                key={`${definition.id}-${gate}`}
                data-half={gate}
                d={channelHalfPath(from, to, mid, definition.id)}
                stroke={style === "design" ? DESIGN_COLOR : PERSONALITY_COLOR}
                strokeWidth={STROKE_WIDTH.channelActive}
              />
            );
          return (
            <g
              key={definition.id}
              data-channel={definition.id}
              data-active={defined ? "true" : "false"}
            >
              {label}
              {stroke(a, b, styleA, gateA)}
              {stroke(b, a, styleB, gateB)}
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
          const [gateA, gateB] = definition.gates;
          const corridor = MERGED_CORRIDOR[definition.id]!;
          const styleA = gateStyle(gateA);
          const styleB = gateStyle(gateB);

          if (styleA === "none" && styleB === "none") return null;

          const clipId = `corridor-${definition.id}`;
          const seam = (corridor.from + corridor.to) / 2;
          // The upper half belongs to whichever gate sits higher.
          const aIsUpper = getGatePoint(gateA).y < getGatePoint(gateB).y;
          const upper = aIsUpper ? styleA : styleB;
          const lower = aIsUpper ? styleB : styleA;

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
                {upper === "none" ? null : (
                  <rect
                    data-half={aIsUpper ? gateA : gateB}
                    x={0}
                    y={corridor.from}
                    width={GRAPH_BOX.width}
                    height={seam - corridor.from}
                    fill={activationColor(upper)}
                  />
                )}
                {lower === "none" ? null : (
                  <rect
                    data-half={aIsUpper ? gateB : gateA}
                    x={0}
                    y={seam}
                    width={GRAPH_BOX.width}
                    height={corridor.to - seam}
                    fill={activationColor(lower)}
                  />
                )}
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

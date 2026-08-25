import { CHANNEL_DEFINITIONS } from "@/lib/human-design/constants/channels";
import { GATE_DEFINITIONS } from "@/lib/human-design/constants/gates";
import type { HumanDesignChart } from "@/lib/human-design/types/chart";
import { CENTER_LABELS, type CenterId } from "@/lib/human-design/types/center";

import { VARIABLE_POSITIONS, type VariableArrow } from "@/lib/human-design/derive/variable";

import {
  CENTERS,
  VARIABLE_SLOTS,
  VIEWBOX,
  channelHalfPlane,
  channelMidpoint,
  gateLabelPoint,
  GRAPH_BOX,
  getGatePoint,
  graphTransformAttr,
  variableArrowPath,
} from "./geometry";
import {
  ARTWORK_INK,
  CENTRE_REGION,
  CHANNEL_BRIDGE,
  CHANNEL_REGION,
  MERGED_ROUTE,
} from "./artwork";
import { FIGURE_ARTWORK_PATH, figureTransformAttr } from "./figure";
import {
  CENTER_DEFINED_FILL,
  BODY_SILHOUETTE_FILL,
  CENTER_UNDEFINED_FILL,
  ARTWORK_INK_COLOR,
  ARTWORK_INK_OPACITY,
  ARTWORK_INK_WIDTH,
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

          if (!regions) {
            // One of the integration four: painted by its route, in the pass
            // below. The title stays here, so every channel carries its state
            // in words whether or not anything is drawn for it.
            return (
              <g
                key={definition.id}
                data-channel={definition.id}
                data-active={defined ? "true" : "false"}
              >
                {label}
              </g>
            );
          }

          const mid = channelMidpoint(a, b, definition.id);
          const bothSame = styleA === styleB && styleA !== "none";

          /*
           * One end's share of the track: its own regions, clipped to its half
           * of the drawing.
           *
           * A gate carrying BOTH imprints splits its half again, into two solid
           * blocks — Personality out at the gate, Design in toward the middle.
           * A dashed Personality stroke used to be laid over a Design fill
           * instead, and at channel width that reads as a barber's pole: the
           * repeating stripe is a texture, not a colour, and on the long arcs it
           * looked like a third thing rather than the two imprints. Two solid
           * blocks keep the whole drawing to exactly two colours.
           */
          const end = (from: typeof a, to: typeof b, style: ActivationStyle, gate: number) => {
            if (style === "none") return null;
            const planeId = `half-${definition.id}-${gate}`;
            const fill = (colour: string, key: string) =>
              regions.map((d, index) => <path key={`${key}-${index}`} d={d} fill={colour} />);
            const quarter = { x: (from.x + mid.x) / 2, y: (from.y + mid.y) / 2 };
            const outerId = `outer-${definition.id}-${gate}`;
            const innerId = `inner-${definition.id}-${gate}`;
            return (
              <g key={gate} data-half={gate}>
                <clipPath id={planeId}>
                  <rect {...channelHalfPlane(from, to, mid)} />
                </clipPath>
                <g clipPath={`url(#${planeId})`}>
                  {style === "both" ? (
                    <>
                      <clipPath id={outerId}>
                        <rect {...channelHalfPlane(from, mid, quarter)} />
                      </clipPath>
                      <clipPath id={innerId}>
                        <rect {...channelHalfPlane(mid, from, quarter)} />
                      </clipPath>
                      <g clipPath={`url(#${outerId})`}>{fill(PERSONALITY_COLOR, "p")}</g>
                      <g clipPath={`url(#${innerId})`}>{fill(DESIGN_COLOR, "d")}</g>
                    </>
                  ) : (
                    fill(activationColor(style), "s")
                  )}
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
              {/* Both ends the same needs no seam, and an unclipped fill cannot
                  be thrown off by a fragment sitting across the dividing line.
                  "both" still needs the split, so it is not counted as same. */}
              {bothSame && styleA !== "both"
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
        })}
      </g>

      {/*
        Second pass: the integration group, which the drawing merges into one
        web and gives no track of its own.

        Each of the four takes a ROUTE through the regions it shares — spans of
        20-57's band, of the mouth it shares with 34-57 on the Spleen's upper
        edge, and of 34-57's track in from the Sacral. Every span names the gate
        whose half it is and the y range of the region to take. Two of them used
        to be stroked as circular arcs between their gates instead, and those
        arcs belong to no track in the drawing: gate 10 or gate 20 activated on
        its own put a stray line down the middle of the chart.

        They paint after the tracks because they share them.
      */}
      <g>
        {CHANNEL_DEFINITIONS.filter((d) => MERGED_ROUTE[d.id]).map((definition) => {
          const [gateA, gateB] = definition.gates;
          const spans = MERGED_ROUTE[definition.id]!;
          const styleA = gateStyle(gateA);
          const styleB = gateStyle(gateB);
          const styleOf = (gate: number) => (gate === gateA ? styleA : styleB);

          if (styleA === "none" && styleB === "none") return null;

          const band = (
            span: (typeof spans)[number],
            index: number,
            from: number,
            to: number,
            colour: string,
          ) => (
            <rect
              key={`${index}-${from}`}
              data-half={span.gate}
              x={0}
              y={from}
              width={GRAPH_BOX.width}
              height={to - from}
              fill={colour}
            />
          );

          return (
            <g key={definition.id} data-corridor={definition.id} aria-hidden="true">
              {spans.map((span, index) => {
                const style = styleOf(span.gate);
                if (style === "none") return null;
                const clipId = `route-${definition.id}-${index}`;
                /* A gate carrying both imprints splits its span into two solid
                   blocks rather than being striped, so the drawing stays to two
                   colours. Personality goes on the half nearer that gate. */
                const seam = (span.from + span.to) / 2;
                const gateIsAbove = getGatePoint(span.gate).y <= seam;
                return (
                  <g key={clipId}>
                    <clipPath id={clipId}>
                      <path d={span.region} />
                    </clipPath>
                    <g clipPath={`url(#${clipId})`}>
                      {style === "both"
                        ? [
                            band(
                              span,
                              index,
                              span.from,
                              seam,
                              gateIsAbove ? PERSONALITY_COLOR : DESIGN_COLOR,
                            ),
                            band(
                              span,
                              index,
                              seam,
                              span.to,
                              gateIsAbove ? DESIGN_COLOR : PERSONALITY_COLOR,
                            ),
                          ]
                        : band(span, index, span.from, span.to, activationColor(style))}
                    </g>
                  </g>
                );
              })}
            </g>
          );
        })}
      </g>

      {/*
        ---- Bridges, over the ink ----

        A bridge is the one kind of region here the client did not draw: a piece
        of track added so a channel reads as one continuous line where the
        drawing cuts it. It is outlined with everything else, but it is painted
        AGAIN here, after the ink, so an activated channel covers the outline of
        whatever it crosses instead of being ruled through by it — which is what
        makes the crossing read as over rather than under. See CHANNEL_BRIDGE.
      */}
      <g fill="none">
        {CHANNEL_DEFINITIONS.filter((d) => CHANNEL_BRIDGE[d.id]).map((definition) => {
          const [gateA, gateB] = definition.gates;
          const styleA = gateStyle(gateA);
          const styleB = gateStyle(gateB);
          if (styleA === "none" && styleB === "none") return null;

          const a = getGatePoint(gateA);
          const b = getGatePoint(gateB);
          const mid = channelMidpoint(a, b, definition.id);
          const spans = CHANNEL_BRIDGE[definition.id]!;

          const end = (from: typeof a, to: typeof b, style: ActivationStyle, gate: number) => {
            if (style === "none") return null;
            const planeId = `bridge-${definition.id}-${gate}`;
            const fill = (colour: string, key: string) =>
              spans.map((d, index) => <path key={`${key}-${index}`} d={d} fill={colour} />);
            const quarter = { x: (from.x + mid.x) / 2, y: (from.y + mid.y) / 2 };
            const outerId = `bridge-outer-${definition.id}-${gate}`;
            const innerId = `bridge-inner-${definition.id}-${gate}`;
            return (
              <g key={gate} data-half={gate}>
                <clipPath id={planeId}>
                  <rect {...channelHalfPlane(from, to, mid)} />
                </clipPath>
                <g clipPath={`url(#${planeId})`}>
                  {style === "both" ? (
                    <>
                      <clipPath id={outerId}>
                        <rect {...channelHalfPlane(from, mid, quarter)} />
                      </clipPath>
                      <clipPath id={innerId}>
                        <rect {...channelHalfPlane(mid, from, quarter)} />
                      </clipPath>
                      <g clipPath={`url(#${outerId})`}>{fill(PERSONALITY_COLOR, "p")}</g>
                      <g clipPath={`url(#${innerId})`}>{fill(DESIGN_COLOR, "d")}</g>
                    </>
                  ) : (
                    fill(activationColor(style), "s")
                  )}
                </g>
              </g>
            );
          };

          return (
            <g key={definition.id} data-bridge={definition.id}>
              {styleA === styleB && styleA !== "both"
                ? spans.map((d, index) => (
                    <path key={index} d={d} fill={activationColor(styleA)} />
                  ))
                : [end(a, b, styleA, gateA), end(b, a, styleB, gateB)]}
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

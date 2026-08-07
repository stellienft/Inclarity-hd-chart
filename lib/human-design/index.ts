import { createDefaultEphemerisProvider } from "./astronomy/astronomy-engine-provider";
import type { EphemerisProvider } from "./astronomy/types";
import { localBirthToUtc, pre1970DataWarning, type BirthInput } from "../birth/timezone";
import type { LocationResult } from "../location/types";
import { calculateActivations } from "./calculate/activations";
import { solveDesignMoment, type DesignMomentResult } from "./calculate/design-date";
import { GATE_MAPPING_VERSION } from "./constants/gates";
import {
  NOT_SELF_THEME_BY_TYPE,
  SIGNATURE_BY_TYPE,
  STRATEGY_BY_TYPE,
} from "./constants/strategies";
import { deriveAuthority } from "./derive/authority";
import { deriveDefinedCenters } from "./derive/centers";
import { deriveActiveChannels, deriveActiveGates, deriveHangingGates } from "./derive/channels";
import { deriveDefinition } from "./derive/definition";
import { deriveIncarnationCross } from "./derive/incarnation-cross";
import { deriveProfile } from "./derive/profile";
import { deriveType, type TypeDerivation } from "./derive/type";
import type { HumanDesignChart } from "./types/chart";

export const ENGINE_VERSION = "1.0.0";

export interface CalculateChartInput {
  name?: string;
  /** "YYYY-MM-DD" local to the birth place. */
  date: string;
  /** "HH:mm" local to the birth place. */
  time: string;
  location: LocationResult;
}

export interface CalculateChartOptions {
  provider?: EphemerisProvider;
}

/**
 * Diagnostics that the debug view needs but a normal chart response should not
 * carry. Returned alongside the chart rather than embedded in it.
 */
export interface ChartDiagnostics {
  designSolver: DesignMomentResult;
  typeDerivation: TypeDerivation;
  definitionAdjacency: Record<string, string[]>;
  authorityRule: string;
  authorityWarning?: string;
}

export async function calculateChart(
  input: CalculateChartInput,
  options: CalculateChartOptions = {},
): Promise<{ chart: HumanDesignChart; diagnostics: ChartDiagnostics }> {
  const provider = options.provider ?? createDefaultEphemerisProvider();
  const warnings: string[] = [];

  // --- A. Birth data -> UTC ------------------------------------------------
  const birthInput: BirthInput = {
    localDate: input.date,
    localTime: input.time,
    location: input.location,
  };
  const conversion = localBirthToUtc(birthInput);

  if (conversion.ambiguity === "skipped") {
    warnings.push(
      "The birth time given did not exist locally — the clocks moved forward that " +
        "day. The chart uses the instant the clocks jumped to.",
    );
  } else if (conversion.ambiguity === "repeated") {
    warnings.push(
      "The birth time given occurred twice locally — the clocks moved back that " +
        "day. The chart uses the first (pre-transition) occurrence.",
    );
  }
  const pre1970 = pre1970DataWarning(conversion.timezone, conversion.birthUtc);
  if (pre1970) warnings.push(pre1970);

  if (conversion.timezone !== input.location.timezone) {
    warnings.push(
      `Timezone resolved from coordinates as ${conversion.timezone}, which differs ` +
        `from the supplied ${input.location.timezone}. The coordinate-derived zone was used.`,
    );
  }

  // --- B. Astronomy: the two moments --------------------------------------
  const designSolver = await solveDesignMoment(provider, conversion.birthUtc);

  const [personality, design] = await Promise.all([
    calculateActivations(provider, conversion.birthUtc),
    calculateActivations(provider, designSolver.designUtc),
  ]);

  // --- C. Human Design derivation -----------------------------------------
  const activeGates = deriveActiveGates(personality, design);
  const channels = deriveActiveChannels(activeGates);
  const hangingGates = deriveHangingGates(activeGates, channels);
  const centers = deriveDefinedCenters(channels);
  const definitionGraph = deriveDefinition(centers.defined, channels);
  const typeDerivation = deriveType(centers.defined, channels);
  const authorityDerivation = deriveAuthority(centers.defined, channels, typeDerivation.type);
  const profile = deriveProfile(personality, design);
  const incarnationCross = deriveIncarnationCross(personality, design);

  if (authorityDerivation.warning) warnings.push(authorityDerivation.warning);

  const chart: HumanDesignChart = {
    subject: {
      ...(input.name ? { name: input.name } : {}),
      birthLocal: conversion.birthLocalIso,
      birthUtc: conversion.birthUtc.toISOString(),
      designUtc: designSolver.designUtc.toISOString(),
      birthLocation: { ...input.location, timezone: conversion.timezone },
      timezone: conversion.timezone,
      offsetMinutes: conversion.offsetMinutes,
      dstAmbiguity: conversion.ambiguity,
    },
    personality,
    design,
    activeGates,
    hangingGates,
    channels,
    centers: {
      defined: centers.defined,
      undefined: centers.undefined,
      components: definitionGraph.components,
    },
    type: typeDerivation.type,
    strategy: STRATEGY_BY_TYPE[typeDerivation.type],
    signature: SIGNATURE_BY_TYPE[typeDerivation.type],
    notSelfTheme: NOT_SELF_THEME_BY_TYPE[typeDerivation.type],
    authority: authorityDerivation.authority,
    authorityRule: authorityDerivation.rule,
    profile: profile.profile,
    profileName: profile.name,
    definition: definitionGraph.definition,
    incarnationCross,
    calculationMeta: {
      ephemerisProvider: provider.id,
      engineVersion: ENGINE_VERSION,
      gateMappingVersion: GATE_MAPPING_VERSION,
      nodeConvention: provider.nodeConvention,
      designSolverResidualDeg: designSolver.residualDeg,
      designElapsedDays: designSolver.elapsedDays,
      calculatedAt: new Date().toISOString(),
      warnings,
    },
  };

  return {
    chart,
    diagnostics: {
      designSolver,
      typeDerivation,
      definitionAdjacency: definitionGraph.adjacency,
      authorityRule: authorityDerivation.rule,
      ...(authorityDerivation.warning ? { authorityWarning: authorityDerivation.warning } : {}),
    },
  };
}

export type { HumanDesignChart } from "./types/chart";
export * from "./constants/strategies";

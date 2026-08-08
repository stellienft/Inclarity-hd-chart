import type { Authority, DefinitionType, HdType } from "../constants/strategies";
import type { LocationResult } from "../../location/types";
import type { PlanetaryActivationSet } from "./activation";
import type { CenterId } from "./center";
import type { ActiveChannel, ActiveGate } from "./channel";
import type { IncarnationCross } from "../derive/incarnation-cross";
import type { AmbiguityKind } from "../../birth/timezone";
import type { Variable } from "../derive/variable";

export interface ChartSubject {
  name?: string;
  /** Local birth time with the birth place's offset. */
  birthLocal: string;
  birthUtc: string;
  designUtc: string;
  birthLocation: LocationResult;
  timezone: string;
  offsetMinutes: number;
  dstAmbiguity: AmbiguityKind;
}

export interface CalculationMeta {
  ephemerisProvider: string;
  engineVersion: string;
  gateMappingVersion: string;
  nodeConvention: string;
  /** Residual of the 88-degree solve, in degrees. */
  designSolverResidualDeg: number;
  designElapsedDays: number;
  calculatedAt: string;
  /** Non-fatal issues worth surfacing rather than hiding. */
  warnings: string[];
}

export interface HumanDesignChart {
  subject: ChartSubject;
  personality: PlanetaryActivationSet;
  design: PlanetaryActivationSet;
  activeGates: ActiveGate[];
  hangingGates: number[];
  channels: ActiveChannel[];
  centers: {
    defined: CenterId[];
    undefined: CenterId[];
    /** Connected components of the definition graph. */
    components: CenterId[][];
  };
  type: HdType;
  strategy: string;
  signature: string;
  notSelfTheme: string;
  authority: Authority;
  authorityRule: string;
  profile: string;
  profileName: string;
  definition: DefinitionType;
  incarnationCross: IncarnationCross;
  /** The four arrows either side of the head. */
  variable: Variable;
  calculationMeta: CalculationMeta;
}

import { CENTER_IDS, type CenterId } from "../types/center";
import type { ActiveChannel } from "../types/channel";

export interface CenterDerivation {
  defined: CenterId[];
  undefined: CenterId[];
}

/**
 * A centre is defined ONLY by completed channels.
 *
 * An activated gate sitting alone in a centre — a hanging gate — colours the
 * gate but leaves the centre open. This is the single most commonly
 * mis-implemented rule in amateur Human Design software, so it is expressed
 * here with no reference to the gate list at all: only `activeChannels` can
 * define a centre.
 */
export function deriveDefinedCenters(activeChannels: readonly ActiveChannel[]): CenterDerivation {
  const defined = new Set<CenterId>();

  for (const channel of activeChannels) {
    defined.add(channel.centers[0]);
    defined.add(channel.centers[1]);
  }

  return {
    defined: CENTER_IDS.filter((center) => defined.has(center)),
    undefined: CENTER_IDS.filter((center) => !defined.has(center)),
  };
}

import type { Authority, HdType } from "../constants/strategies";
import type { CenterId } from "../types/center";
import type { ActiveChannel } from "../types/channel";

/**
 * ============================================================================
 *  INNER AUTHORITY
 * ============================================================================
 *
 * Authority is a strict hierarchy applied to the DEFINED CENTRES, with the
 * Ego/Self-Projected split resolved by Type. It is emphatically NOT a set of
 * independent "if centre X is defined" tests — the order is what makes it
 * correct.
 *
 *   1. Solar Plexus defined                     -> Emotional
 *   2. else Sacral defined                      -> Sacral
 *   3. else Spleen defined                      -> Splenic
 *   4. else Heart/Ego defined                   -> Ego Manifested (Manifestor)
 *                                                  Ego Projected  (otherwise)
 *   5. else G/Identity defined                  -> Self-Projected
 *   6. else at least one centre defined         -> Mental / Environmental
 *   7. else (nothing defined)                   -> Lunar
 *
 * WHY STEP 5 NEEDS NO EXPLICIT "G CONNECTS TO THROAT" TEST
 *   Self-Projected Authority is conventionally described as a defined G
 *   connected to the Throat. That condition is implied by the hierarchy rather
 *   than needing separate enforcement: the G centre has ten channels, and six
 *   of them (10-34, 10-57, 2-14, 5-15, 29-46, 25-51) terminate in the Sacral,
 *   Spleen or Heart. If any of those defined the G, the corresponding centre
 *   would also be defined and an earlier branch would already have fired. So
 *   by the time control reaches step 5, the only channels that can be defining
 *   the G are the four G-to-Throat channels: 1-8, 7-31, 13-33 and 10-20.
 *
 *   Rather than rely on that reasoning silently, `deriveAuthority` verifies it
 *   at runtime and reports the connecting channels. If the invariant were ever
 *   violated the result is flagged rather than quietly guessed at.
 *
 * STEP 4's MANIFESTED/PROJECTED SPLIT
 *   Both are "Ego Authority". The distinction is whether the Ego reaches the
 *   Throat, which is exactly the motor-to-Throat test that already made the
 *   person a Manifestor rather than a Projector. Splitting on Type therefore
 *   keeps the two derivations consistent by construction.
 */

const G_TO_THROAT_CHANNELS = new Set(["1-8", "7-31", "13-33", "10-20"]);

export interface AuthorityDerivation {
  authority: Authority;
  /** Which hierarchy branch fired, for the debug view. */
  rule: string;
  /** Channels connecting the G to the Throat, when Self-Projected. */
  supportingChannels: string[];
  /**
   * Set when the derivation relied on an invariant that did not hold. Surfaced
   * rather than silently absorbed, per the project's "never hide uncertainty"
   * rule.
   */
  warning?: string;
}

export function deriveAuthority(
  definedCenters: readonly CenterId[],
  activeChannels: readonly ActiveChannel[],
  type: HdType,
): AuthorityDerivation {
  const defined = new Set<CenterId>(definedCenters);

  if (defined.size === 0) {
    return {
      authority: "Lunar",
      rule: "No centre defined (Reflector) -> Lunar",
      supportingChannels: [],
    };
  }

  if (defined.has("solarPlexus")) {
    return {
      authority: "Emotional",
      rule: "Solar Plexus defined -> Emotional",
      supportingChannels: [],
    };
  }

  if (defined.has("sacral")) {
    return {
      authority: "Sacral",
      rule: "Solar Plexus undefined, Sacral defined -> Sacral",
      supportingChannels: [],
    };
  }

  if (defined.has("spleen")) {
    return {
      authority: "Splenic",
      rule: "Solar Plexus and Sacral undefined, Spleen defined -> Splenic",
      supportingChannels: [],
    };
  }

  if (defined.has("heart")) {
    const manifested = type === "Manifestor";
    return {
      authority: manifested ? "Ego Manifested" : "Ego Projected",
      rule:
        "Solar Plexus, Sacral and Spleen undefined, Heart defined -> Ego " +
        `(${manifested ? "Manifested" : "Projected"}, from type ${type})`,
      supportingChannels: [],
    };
  }

  if (defined.has("g")) {
    const connecting = activeChannels
      .filter((channel) => G_TO_THROAT_CHANNELS.has(channel.id))
      .map((channel) => channel.id);

    const derivation: AuthorityDerivation = {
      authority: "Self-Projected",
      rule: "Only G defined among the authority centres -> Self-Projected",
      supportingChannels: connecting,
    };

    if (connecting.length === 0) {
      derivation.warning =
        "G centre is defined with no G-to-Throat channel, which the Self-Projected " +
        "hierarchy does not anticipate. Reported as Self-Projected, but this chart " +
        "should be checked against a reference calculator.";
    }

    return derivation;
  }

  return {
    authority: "Mental / Environmental",
    rule:
      "No Solar Plexus, Sacral, Spleen, Heart or G definition; only Head, Ajna, " +
      "Throat and/or Root defined -> Mental / Environmental",
    supportingChannels: [],
  };
}

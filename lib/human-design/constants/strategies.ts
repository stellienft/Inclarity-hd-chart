export const HD_TYPES = [
  "Manifestor",
  "Generator",
  "Manifesting Generator",
  "Projector",
  "Reflector",
] as const;

export type HdType = (typeof HD_TYPES)[number];

/**
 * Type -> Strategy. Kept deliberately free of interpretation copy: this is
 * label data, not guidance. Orientation copy lives in the presentation layer.
 */
export const STRATEGY_BY_TYPE: Record<HdType, string> = {
  Manifestor: "To Inform",
  Generator: "To Respond",
  "Manifesting Generator": "To Respond",
  Projector: "Wait for the Invitation",
  Reflector: "Wait a Lunar Cycle",
};

export const SIGNATURE_BY_TYPE: Record<HdType, string> = {
  Manifestor: "Peace",
  Generator: "Satisfaction",
  "Manifesting Generator": "Satisfaction",
  Projector: "Success",
  Reflector: "Surprise",
};

export const NOT_SELF_THEME_BY_TYPE: Record<HdType, string> = {
  Manifestor: "Anger",
  Generator: "Frustration",
  "Manifesting Generator": "Frustration",
  Projector: "Bitterness",
  Reflector: "Disappointment",
};

export const AUTHORITIES = [
  "Emotional",
  "Sacral",
  "Splenic",
  "Ego Manifested",
  "Ego Projected",
  "Self-Projected",
  "Mental / Environmental",
  "Lunar",
] as const;

export type Authority = (typeof AUTHORITIES)[number];

export const DEFINITION_TYPES = [
  "No Definition",
  "Single Definition",
  "Split Definition",
  "Triple Split Definition",
  "Quadruple Split Definition",
] as const;

export type DefinitionType = (typeof DEFINITION_TYPES)[number];

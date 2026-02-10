// CONSTANTS & REFERENCE DATA

export const SOIL_TYPES = {
  type_a: {
    label: "Type A (Clay, Silty Clay)",
    swellPct: 25,
    weightBankLbCY: 3100,
    weightLooseLbCY: 2500,
    slopeRatio: "0.75:1",
    slopeDeg: 53,
  },
  type_b: {
    label: "Type B (Silt, Sandy Loam, Medium Clay)",
    swellPct: 25,
    weightBankLbCY: 3200,
    weightLooseLbCY: 2550,
    slopeRatio: "1:1",
    slopeDeg: 45,
  },
  type_c: {
    label: "Type C (Sand, Gravel, Loose Fill)",
    swellPct: 30,
    weightBankLbCY: 2900,
    weightLooseLbCY: 2400,
    slopeRatio: "1.5:1",
    slopeDeg: 34,
  },
  rock: {
    label: "Rock / Hard Material",
    swellPct: 50,
    weightBankLbCY: 4000,
    weightLooseLbCY: 2700,
    slopeRatio: "vertical",
    slopeDeg: 90,
  },
} as const;

export const SURFACE_TYPES = {
  asphalt: {
    label: "Asphalt",
    sawCutTimeFtPerMin: 3,
    removalTimeSFPerHr: 200,
    patchCostPerSF: 0,
    thicknessIn: 4,
  },
  concrete: {
    label: "Concrete",
    sawCutTimeFtPerMin: 1.5,
    removalTimeSFPerHr: 100,
    patchCostPerSF: 0,
    thicknessIn: 6,
  },
  dirt: {
    label: "Dirt/Unpaved",
    sawCutTimeFtPerMin: 0,
    removalTimeSFPerHr: 0,
    patchCostPerSF: 0,
    thicknessIn: 0,
  },
} as const;

export const EXCAVATOR_SIZES = {
  mini: {
    label: "Mini Excavator (Cat 304-308)",
    bucketCY: 0.28,
    cyclesPerHr: 120,
    reachFt: 16,
  },
  small: {
    label: "Small Excavator (Cat 311-316)",
    bucketCY: 0.55,
    cyclesPerHr: 100,
    reachFt: 22,
  },
  medium: {
    label: "Medium Excavator (Cat 320-330)",
    bucketCY: 1.15,
    cyclesPerHr: 90,
    reachFt: 32,
  },
  large: {
    label: "Large Excavator (Cat 336-352)",
    bucketCY: 1.9,
    cyclesPerHr: 80,
    reachFt: 40,
  },
} as const;

export const TRUCK_SIZES = {
  "10cy": { label: "10 CY End Dump", capacityCY: 10, loadTimeMin: 8 },
  "14cy": { label: "14 CY End Dump", capacityCY: 14, loadTimeMin: 10 },
  "16cy": { label: "16 CY Super 10", capacityCY: 16, loadTimeMin: 12 },
  "20cy": { label: "20 CY Transfer", capacityCY: 20, loadTimeMin: 15 },
} as const;

export const TRENCH_WIDTHS_GDS = [
  { maxOD: 3, widthIn: 12 },
  { maxOD: 16, addIn: 12 },
  { maxOD: 34, addIn: 18 },
  { maxOD: 63, addIn: 24 },
] as const;

export const PIPE_SIZES = [
  1, 1.25, 1.5, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30,
  32, 34, 36, 42, 48, 54, 60,
] as const;

export const LOCATION_TYPES = {
  city: { label: "City / Urban", handDigPct: 30, trafficControl: true },
  highway: {
    label: "Highway / Major Road",
    handDigPct: 15,
    trafficControl: true,
  },
  rural: { label: "Rural", handDigPct: 10, trafficControl: false },
  remote: { label: "Remote", handDigPct: 5, trafficControl: false },
} as const;

export const SHORING_TYPES = {
  none: {
    label: "No Shoring",
    installTimePerPanelMin: 0,
    panelHeightFt: 0,
  },
  shored: {
    label: "Shored (Trench Box/Shields)",
    installTimePerPanelMin: 20,
    panelHeightFt: 8,
  },
  sloped: { label: "Sloped", installTimePerPanelMin: 0, panelHeightFt: 0 },
  benched: { label: "Benched", installTimePerPanelMin: 0, panelHeightFt: 0 },
} as const;

export const EXC_SHAPES = {
  square: "Square",
  rectangle: "Rectangle",
  nonstandard: "Non-Standard (5+ sides)",
} as const;

export const DEFAULT_SETTINGS = {
  jobEfficiency: 83,
  handDigRateCYPerHr: 0.5,
  compactionTimeSFPerHr: 400,
  compactionTestTimeMin: 15,
  beddingDepthMultiplier: 0.333,
  beddingMinIn: 4,
  shadingAbovePipeIn: 12,
  warningTapeAbovePipeIn: 18,
  clearanceUnderPipeIn: 24,
  pipeClearanceIn: 6,
  zeroSackCureHrs: 24,
  liftHeightIn: 8,
  truckRoundTripMin: 60,
  // Crew Roster
  crewForeman: 1,
  crewOperators: 1,
  crewPipelayers: 1,
  crewLaborers: 2,
  crewTruckDriver: 0,
  bucketFillFactor: 0.85,
  shoringPanelWidthFt: 4,
  shoringPanelHeightFt: 8,
  compactionLiftIn: 8,
  backfillPlacementCYPerHr: 15,
  paveSawCutBuffer: 12,
} as const satisfies Record<string, number>;

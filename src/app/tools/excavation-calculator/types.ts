import type {
  SOIL_TYPES,
  SURFACE_TYPES,
  EXCAVATOR_SIZES,
  TRUCK_SIZES,
  LOCATION_TYPES,
  SHORING_TYPES,
  EXC_SHAPES,
  DEFAULT_SETTINGS,
} from "./constants";

// ─── Key types derived from constants ────────────────────────

export type SoilTypeKey = keyof typeof SOIL_TYPES;
export type SurfaceTypeKey = keyof typeof SURFACE_TYPES;
export type ExcavatorSizeKey = keyof typeof EXCAVATOR_SIZES;
export type TruckSizeKey = keyof typeof TRUCK_SIZES;
export type LocationTypeKey = keyof typeof LOCATION_TYPES;
export type ShoringTypeKey = keyof typeof SHORING_TYPES;
export type ExcShapeKey = keyof typeof EXC_SHAPES;
export type ExcType = "trench" | "bellhole";
export type DepthMode = "total" | "centerline" | "topOfPipe";
export type SpoilsAction = "reuse" | "offhaul" | "partial";

// Settings

export type Settings = {
  [K in keyof typeof DEFAULT_SETTINGS]: number;
};

// Supporting data types

export interface DepthSegment {
  lengthFt: number;
  depthFt: number;
}

export interface CongestionItem {
  type: string;
  lengthFt: number;
  depthFt: number;
}

export interface NsSide {
  label: string;
  lengthFt: number;
}

// Calculator input (serializable, DB-ready) 

export interface CalculatorInput {
  // Project metadata
  projectDesc: string;
  projectLine: string;
  projectLocation: string;

  // Excavation params
  excType: ExcType;
  surfaceType: SurfaceTypeKey;
  locationType: LocationTypeKey;
  soilType: SoilTypeKey;
  shoringType: ShoringTypeKey;
  excShape: ExcShapeKey;
  pipeOD: number;

  // Dimensions
  lengthFt: number;
  widthFt: number;
  depthFt: number;
  depthMode: DepthMode;
  useAutoWidth: boolean;
  multiDepth: boolean;
  depthSegments: DepthSegment[];

  // Non-standard sides
  nsSides: NsSide[];

  // Congestion
  hasCongestion: boolean;
  congestionItems: CongestionItem[];

  // Equipment
  excavatorSize: ExcavatorSizeKey;
  truckSize: TruckSizeKey;

  // Spoils
  spoilsAction: SpoilsAction;

  // Hand dig override
  handDigOverride: boolean;
  handDigPctManual: number;

  // Settings
  settings: Settings;
}

// Calculation results

export interface CalculationResults {
  // Volumes
  bankVolCY: number;
  bankVolCF: number;
  looseVolCY: number;
  swellFactor: number;
  loadFactor: number;
  surfaceCutCY: number;
  surfaceAreaSF: number;
  perimeterFt: number;

  // Depth
  depthInputLabel: string;
  depthInputFt: number;
  computedExcDepthFt: number;
  clearanceUnderIn: number;

  // Pipe Zone
  beddingVolCY: number;
  shadingVolCY: number;
  pipeZoneVolCY: number;
  beddingDepthIn: number;
  pipeZoneDepthFt: number;

  // Backfill
  finalBackfillCY: number;
  totalBackfillCY: number;
  importBeddingCY: number;
  importShadingCY: number;
  importFinalCY: number;

  // Time
  handDigHrs: number;
  machineDigHrs: number;
  totalExcHrs: number;
  sawCutTimeHrs: number;
  surfaceRemovalHrs: number;
  shoringInstallHrs: number;
  totalCompactionHrs: number;
  compactionTestHrs: number;
  beddingCureHrs: number;
  offhaulTimeHrs: number;
  backfillPlacementHrs: number;

  // Phase Subtotals
  excPhaseHrs: number;
  shoringPhaseHrs: number;
  backfillPhaseHrs: number;

  totalFieldHrs: number;
  crewDays: number;
  totalCalendarDays: number;

  // Man-Hours & Crew
  totalCrewOnSite: number;
  handDiggerCount: number;
  totalManHrs: number;
  adjustedManHrs: number;
  truckDriverHrs: number;

  // Hand Dig
  calculatedHandDigPct: number;
  activeHandDigPct: number;
  handDigAreaSqIn: number;

  // Spoils
  spoilsReuseCY: number;
  spoilsOffhaulCY: number;
  offhaulTruckLoads: number;

  // Shoring
  shoringSF: number;
  shoringPanels: number;

  // Compaction
  numLifts: number;

  // Congestion
  congestionTimeFactor: number;
  congestionNotes: string[];

  // Dimensions used
  effectiveLength: number;
  effectiveWidth: number;
  effectiveDepth: number;
}

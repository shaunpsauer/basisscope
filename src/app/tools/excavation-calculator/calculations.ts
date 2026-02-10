import {
  SOIL_TYPES,
  SURFACE_TYPES,
  EXCAVATOR_SIZES,
  TRUCK_SIZES,
  SHORING_TYPES,
} from "./constants";
import type {
  CalculatorInput,
  CalculationResults,
  DepthSegment,
} from "./types";

// Utility functions

export function getMinTrenchWidth(pipeOD: number): number {
  if (pipeOD < 3) return 12;
  if (pipeOD <= 16) return pipeOD + 12;
  if (pipeOD <= 34) return pipeOD + 18;
  return pipeOD + 24;
}

export function toFt(inches: number): number {
  return inches / 12;
}

export function toIn(feet: number): number {
  return feet * 12;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function calcVolumeRect(
  lengthFt: number,
  widthFt: number,
  depthFt: number,
): number {
  return lengthFt * widthFt * depthFt;
}

function calcVolumeTrapezoid(
  lengthFt: number,
  bottomWidthFt: number,
  depthFt: number,
  slopeRatio: number,
): number {
  const topWidthFt = bottomWidthFt + 2 * depthFt * slopeRatio;
  const avgWidth = (bottomWidthFt + topWidthFt) / 2;
  return lengthFt * avgWidth * depthFt;
}

function cfToCY(cf: number): number {
  return cf / 27;
}

// Parse slope ratio strings reliably instead of relying on parseFloat
function parseSlopeRatio(ratioStr: string): number {
  if (ratioStr === "vertical") return 0; // vertical walls = no horizontal run
  const parts = ratioStr.split(":");
  if (parts.length === 2) {
    const horizontal = parseFloat(parts[0]);
    const vertical = parseFloat(parts[1]);
    if (!isNaN(horizontal) && !isNaN(vertical) && vertical !== 0) {
      return horizontal / vertical;
    }
  }
  return 1.5; // safe fallback
}

// Per-segment helpers for multi-depth

function computeSegmentExcDepth(
  seg: DepthSegment,
  pipeODft: number,
  clearanceUnderFt: number,
  fallbackDepthFt: number,
): number {
  const rawDepth = seg.depthFt || fallbackDepthFt;
  if (seg.depthMode === "topOfPipe")
    return rawDepth + pipeODft + clearanceUnderFt;
  if (seg.depthMode === "centerline")
    return rawDepth + pipeODft / 2 + clearanceUnderFt;
  return rawDepth; // "total"
}

function getSegmentWidth(
  seg: DepthSegment,
  autoWidthFt: number,
  isTrench: boolean,
): number {
  if (isTrench && seg.useAutoWidth) return autoWidthFt;
  return seg.widthFt || autoWidthFt; // fallback to auto if 0
}

// Main calculation function

export function calculateResults(input: CalculatorInput): CalculationResults {
  const {
    excType,
    surfaceType,
    soilType,
    shoringType,
    excShape,
    pipeOD,
    lengthFt,
    depthFt,
    depthMode,
    useAutoWidth,
    multiDepth,
    depthSegments,
    nsSides,
    hasCongestion,
    congestionItems,
    excavatorSize,
    truckSize,
    spoilsAction,
    handDigOverride,
    handDigPctManual,
    settings,
  } = input;

  const autoWidthIn = getMinTrenchWidth(pipeOD);
  const effectiveWidthFt =
    excType === "trench" && useAutoWidth ? toFt(autoWidthIn) : input.widthFt;

  const soil = SOIL_TYPES[soilType];
  const surface = SURFACE_TYPES[surfaceType];
  const exc = EXCAVATOR_SIZES[excavatorSize];
  const truck = TRUCK_SIZES[truckSize];
  const shoring = SHORING_TYPES[shoringType];
  const swellFactor = 1 + soil.swellPct / 100;
  const eff = settings.jobEfficiency / 100;

  // FIX #8: Use reliable slope ratio parser
  const slopeR = parseSlopeRatio(soil.slopeRatio);

  // Depth Mode Computation
  const clearanceUnderFt = settings.clearanceUnderPipeIn / 12;
  const pipeODft_raw = pipeOD / 12;
  let computedExcDepthFt = depthFt;
  let depthInputLabel = "Total Depth";

  if (depthMode === "topOfPipe") {
    computedExcDepthFt = depthFt + pipeODft_raw + clearanceUnderFt;
    depthInputLabel = "Depth to Top of Pipe";
  } else if (depthMode === "centerline") {
    computedExcDepthFt = depthFt + pipeODft_raw / 2 + clearanceUnderFt;
    depthInputLabel = "Depth to Centerline";
  }

  // Volume Calculations (Bank)
  let bankVolCF = 0;
  let perimeterFt = 0;
  let surfaceAreaSF = 0;
  let floorAreaSF = 0;
  let effectiveLength = lengthFt;
  let effectiveWidth = effectiveWidthFt;
  let effectiveDepth = computedExcDepthFt;

  const autoWidthFt = toFt(autoWidthIn);
  const isTrench = excType === "trench";

  // Shared multi-depth loop — works for both trenches and bell holes.
  // Each segment carries its own width, depthMode, and useAutoWidth.
  if (multiDepth && depthSegments.length > 0) {
    let sumLenWidth = 0; // for weighted-average effectiveWidth
    let sumLenDepth = 0; // for weighted-average effectiveDepth

    depthSegments.forEach((seg) => {
      const segLen = seg.lengthFt || 0;
      const segDepth = computeSegmentExcDepth(
        seg,
        pipeODft_raw,
        clearanceUnderFt,
        depthFt,
      );
      const segWidth = getSegmentWidth(seg, autoWidthFt, isTrench);

      // Volume
      if (shoringType === "sloped") {
        bankVolCF += calcVolumeTrapezoid(segLen, segWidth, segDepth, slopeR);
      } else if (shoringType === "benched") {
        const benchW = segDepth * 0.5;
        const topW = segWidth + 2 * benchW;
        const avgW = (segWidth + topW) / 2;
        bankVolCF += segLen * avgW * segDepth;
      } else {
        bankVolCF += calcVolumeRect(segLen, segWidth, segDepth);
      }

      // Surface area per segment
      if (shoringType === "sloped") {
        const topW = segWidth + 2 * segDepth * slopeR;
        surfaceAreaSF += segLen * topW;
      } else if (shoringType === "benched") {
        const topW = segWidth + 2 * segDepth * 0.5;
        surfaceAreaSF += segLen * topW;
      } else {
        surfaceAreaSF += segLen * segWidth;
      }

      // Floor area (bottom of excavation, for pipe zone calcs)
      floorAreaSF += segLen * segWidth;

      // Accumulators for weighted averages
      sumLenWidth += segLen * segWidth;
      sumLenDepth += segLen * segDepth;
    });

    effectiveLength = depthSegments.reduce(
      (s, seg) => s + (seg.lengthFt || 0),
      0,
    );
    effectiveWidth = effectiveLength > 0 ? sumLenWidth / effectiveLength : effectiveWidthFt;
    effectiveDepth = effectiveLength > 0 ? sumLenDepth / effectiveLength : computedExcDepthFt;

    // Perimeter uses weighted-average width (reasonable approximation)
    perimeterFt = isTrench
      ? 2 * (effectiveLength + effectiveWidth)
      : 2 * (effectiveLength + effectiveWidth); // bell hole treated similarly

  } else if (isTrench) {
    // Single-depth trench
    if (shoringType === "sloped") {
      bankVolCF = calcVolumeTrapezoid(
        effectiveLength,
        effectiveWidth,
        computedExcDepthFt,
        slopeR,
      );
      const topWidth = effectiveWidth + 2 * computedExcDepthFt * slopeR;
      surfaceAreaSF = effectiveLength * topWidth;
    } else if (shoringType === "benched") {
      const benchWidth = computedExcDepthFt * 0.5;
      const topWidth = effectiveWidth + 2 * benchWidth;
      const avgWidth = (effectiveWidth + topWidth) / 2;
      bankVolCF = effectiveLength * avgWidth * computedExcDepthFt;
      surfaceAreaSF = effectiveLength * topWidth;
    } else {
      bankVolCF = calcVolumeRect(
        effectiveLength,
        effectiveWidth,
        computedExcDepthFt,
      );
      surfaceAreaSF = effectiveLength * effectiveWidth;
    }
    floorAreaSF = effectiveLength * effectiveWidth;
    perimeterFt = 2 * (effectiveLength + effectiveWidth);
  } else {
    // Single-depth bell hole
    if (excShape === "square") {
      bankVolCF = calcVolumeRect(lengthFt, lengthFt, computedExcDepthFt);
      surfaceAreaSF = lengthFt * lengthFt;
      floorAreaSF = lengthFt * lengthFt;
      perimeterFt = 4 * lengthFt;
      effectiveWidth = lengthFt;
    } else if (excShape === "rectangle") {
      bankVolCF = calcVolumeRect(
        lengthFt,
        effectiveWidth,
        computedExcDepthFt,
      );
      surfaceAreaSF = lengthFt * effectiveWidth;
      floorAreaSF = lengthFt * effectiveWidth;
      perimeterFt = 2 * (lengthFt + effectiveWidth);
    } else {
      const totalPerim = nsSides.reduce(
        (s, side) => s + (side.lengthFt || 0),
        0,
      );
      const approxArea = totalPerim * effectiveWidth * 0.25;
      bankVolCF = approxArea * computedExcDepthFt;
      surfaceAreaSF = approxArea;
      floorAreaSF = approxArea;
      perimeterFt = totalPerim;
    }
  }

  // Hand Dig % — volumetric cross-section approach
  // Keyhole shape: semicircle (above pipe center) + rectangle (below center)
  // then subtract the pipe cylinder volume
  const bufferR = pipeOD / 2 + settings.pipeClearanceIn; // buffer radius (in)
  const hBelow = pipeOD / 2 + settings.clearanceUnderPipeIn; // rect below center (in)
  const keyholeAreaSqIn =
    (Math.PI * bufferR * bufferR) / 2 + 2 * bufferR * hBelow;
  const pipeAreaSqIn = Math.PI * (pipeOD / 2) * (pipeOD / 2);
  const handDigAreaSqIn = keyholeAreaSqIn - pipeAreaSqIn;
  const handDigVolCF = (handDigAreaSqIn / 144) * effectiveLength;
  const calculatedHandDigPct =
    bankVolCF > 0
      ? Math.min(100, Math.round((handDigVolCF / bankVolCF) * 100))
      : 0;
  const activeHandDigPct = handDigOverride
    ? handDigPctManual
    : calculatedHandDigPct;

  // Surface cut volume
  const surfaceCutCF = surfaceAreaSF * (surface.thicknessIn / 12);
  const surfaceCutCY = cfToCY(surfaceCutCF);

  const bankVolCY = cfToCY(bankVolCF);
  const looseVolCY = bankVolCY * swellFactor;

  // Pipe zone calculations (per GDS A-03)
  const pipeODft = pipeOD / 12;
  const beddingDepthFt = Math.max(
    settings.beddingMinIn / 12,
    (pipeOD * settings.beddingDepthMultiplier) / 12,
  );
  const shadingAboveFt = settings.shadingAbovePipeIn / 12;
  const pipeZoneDepthFt = beddingDepthFt + pipeODft + shadingAboveFt;

  // FIX #1: Use floorAreaSF instead of effectiveWidth * effectiveWidth for bell holes
  const pipeZoneVolCF = floorAreaSF * pipeZoneDepthFt;
  const pipeZoneVolCY = cfToCY(pipeZoneVolCF);

  // Bedding material (0-sack slurry)
  const beddingVolCF = floorAreaSF * beddingDepthFt;
  const beddingVolCY = cfToCY(beddingVolCF);

  // Shading material
  const shadingVolCF = floorAreaSF * (pipeODft + shadingAboveFt);
  const shadingVolCY = cfToCY(shadingVolCF);

  // Final backfill
  const finalBackfillDepthFt = effectiveDepth - pipeZoneDepthFt;
  const finalBackfillCF = Math.max(0, floorAreaSF * finalBackfillDepthFt);
  const finalBackfillCY = cfToCY(finalBackfillCF);

  // Total backfill needed
  const totalBackfillCY = beddingVolCY + shadingVolCY + finalBackfillCY;

  // Crew-based production rates
  const handDiggerCount = settings.crewPipelayers + settings.crewLaborers;
  const totalCrewOnSite =
    settings.crewForeman +
    settings.crewOperators +
    settings.crewPipelayers +
    settings.crewLaborers +
    settings.crewTruckDriver;

  // Excavation Time
  const machineDigRate =
    exc.bucketCY * settings.bucketFillFactor * exc.cyclesPerHr * eff;
  const handDigPct = activeHandDigPct / 100;
  const machineDigPct = 1 - handDigPct;
  const handDigVolCY = bankVolCY * handDigPct;
  const machineDigVolCY = bankVolCY * machineDigPct;
  const handDigHrs =
    handDigVolCY / (settings.handDigRateCYPerHr * handDiggerCount);
  const machineDigHrs = machineDigVolCY / machineDigRate;
  const totalExcHrs = handDigHrs + machineDigHrs;

  // Surface removal time
  const sawCutLF = perimeterFt;
  const sawCutTimeHrs =
    surface.sawCutTimeFtPerMin > 0
      ? sawCutLF / surface.sawCutTimeFtPerMin / 60
      : 0;
  const surfaceRemovalHrs =
    surface.removalTimeSFPerHr > 0
      ? surfaceAreaSF / surface.removalTimeSFPerHr
      : 0;

  // Spoils Management
  let offhaulTruckLoads = 0;
  let offhaulTimeHrs = 0;
  let spoilsReuseCY = 0;
  let spoilsOffhaulCY = 0;

  if (spoilsAction === "offhaul") {
    spoilsOffhaulCY = looseVolCY;
    offhaulTruckLoads = Math.ceil(spoilsOffhaulCY / truck.capacityCY);
    const loadTime = (offhaulTruckLoads * truck.loadTimeMin) / 60;
    const travelTime = (offhaulTruckLoads * settings.truckRoundTripMin) / 60;
    offhaulTimeHrs = loadTime + travelTime;
  } else if (spoilsAction === "reuse") {
    spoilsReuseCY = finalBackfillCY;
    spoilsOffhaulCY = Math.max(
      0,
      looseVolCY - finalBackfillCY * swellFactor,
    );
    if (spoilsOffhaulCY > 0) {
      offhaulTruckLoads = Math.ceil(spoilsOffhaulCY / truck.capacityCY);
      offhaulTimeHrs =
        (offhaulTruckLoads *
          (truck.loadTimeMin + settings.truckRoundTripMin)) /
        60;
    }
  } else {
    // FIX #2: Partial spoils — multiply by swellFactor, not divide
    spoilsReuseCY = finalBackfillCY * 0.5;
    spoilsOffhaulCY = looseVolCY - spoilsReuseCY * swellFactor;
    offhaulTruckLoads = Math.ceil(
      Math.max(0, spoilsOffhaulCY) / truck.capacityCY,
    );
    offhaulTimeHrs =
      (offhaulTruckLoads *
        (truck.loadTimeMin + settings.truckRoundTripMin)) /
      60;
  }

  // Shoring Calculations
  let shoringSF = 0;
  let shoringPanels = 0;
  let shoringInstallHrs = 0;

  if (shoringType === "shored") {
    // FIX #5: For trenches, only shore the two long walls (ends are open).
    // For bell holes, shore all 4 walls.
    let wallAreaSF: number;
    if (excType === "trench") {
      wallAreaSF = 2 * effectiveLength * effectiveDepth;
    } else {
      wallAreaSF =
        2 * effectiveLength * effectiveDepth +
        2 * effectiveWidth * effectiveDepth;
    }
    shoringSF = wallAreaSF;
    const panelSF =
      settings.shoringPanelWidthFt * settings.shoringPanelHeightFt;
    shoringPanels = Math.ceil(shoringSF / panelSF);
    shoringInstallHrs =
      (shoringPanels * shoring.installTimePerPanelMin) / 60;
  }

  // FIX #3: Compaction lifts — subtract full pipe zone depth, not just shading
  const compactableDepthIn = Math.max(
    0,
    (effectiveDepth - pipeZoneDepthFt) * 12,
  );
  const numLifts = Math.ceil(compactableDepthIn / settings.compactionLiftIn);
  const compactionAreaSF = surfaceAreaSF || effectiveLength * effectiveWidth;
  const compactionHrsPerLift =
    compactionAreaSF / settings.compactionTimeSFPerHr;
  const totalCompactionHrs = numLifts * compactionHrsPerLift;
  const compactionTestCount = numLifts;
  const compactionTestHrs =
    (compactionTestCount * settings.compactionTestTimeMin) / 60;

  // Zero-sack cure time
  const beddingCureHrs = settings.zeroSackCureHrs;

  // Congestion adjustments
  let congestionTimeFactor = 1.0;
  const congestionNotes: string[] = [];
  if (hasCongestion && congestionItems.length > 0) {
    congestionTimeFactor += congestionItems.length * 0.15;
    congestionItems.forEach((item) => {
      congestionNotes.push(
        `${item.type}: ${item.lengthFt}' long at ${item.depthFt}' deep`,
      );
    });
  }

  // Import Material Needed
  const importBeddingCY = beddingVolCY;
  const importShadingCY = shadingVolCY;
  const importFinalCY =
    spoilsAction === "offhaul"
      ? finalBackfillCY
      : Math.max(0, finalBackfillCY - spoilsReuseCY);

  // Backfill Placement Time
  const backfillPlacementHrs =
    totalBackfillCY / (settings.backfillPlacementCYPerHr * eff);

  // Phase Subtotals
  const excPhaseHrs = round1(
    sawCutTimeHrs +
      surfaceRemovalHrs +
      totalExcHrs * congestionTimeFactor +
      offhaulTimeHrs,
  );

  const shoringPhaseHrs = round1(shoringInstallHrs);

  const backfillPhaseHrs = round1(
    backfillPlacementHrs + totalCompactionHrs + compactionTestHrs,
  );

  // Total Timeline
  const totalFieldHrs = round1(
    excPhaseHrs + shoringPhaseHrs + backfillPhaseHrs,
  );

  const crewDays = Math.ceil(totalFieldHrs / 8);
  const totalCalendarDays = crewDays + (beddingVolCY > 0 ? 1 : 0);

  // Man-Hours
  const totalManHrs = round1(totalFieldHrs * totalCrewOnSite);
  const truckDriverHrs =
    settings.crewTruckDriver > 0
      ? round1(offhaulTimeHrs * settings.crewTruckDriver)
      : 0;
  const adjustedManHrs = round1(
    (totalFieldHrs - offhaulTimeHrs) *
      (totalCrewOnSite - settings.crewTruckDriver) +
      offhaulTimeHrs * totalCrewOnSite,
  );

  return {
    bankVolCY: round2(bankVolCY),
    bankVolCF: round1(bankVolCF),
    looseVolCY: round2(looseVolCY),
    swellFactor,
    loadFactor: round2(1 / swellFactor),
    surfaceCutCY: round2(surfaceCutCY),
    surfaceAreaSF: round1(surfaceAreaSF),
    perimeterFt: round1(perimeterFt),

    depthInputLabel,
    depthInputFt: round2(depthFt),
    computedExcDepthFt: round2(computedExcDepthFt),
    clearanceUnderIn: settings.clearanceUnderPipeIn,

    beddingVolCY: round2(beddingVolCY),
    shadingVolCY: round2(shadingVolCY),
    pipeZoneVolCY: round2(pipeZoneVolCY),
    beddingDepthIn: round1(beddingDepthFt * 12),
    pipeZoneDepthFt: round2(pipeZoneDepthFt),

    finalBackfillCY: round2(finalBackfillCY),
    totalBackfillCY: round2(totalBackfillCY),
    importBeddingCY: round2(importBeddingCY),
    importShadingCY: round2(importShadingCY),
    importFinalCY: round2(importFinalCY),

    handDigHrs: round1(handDigHrs),
    machineDigHrs: round1(machineDigHrs),
    totalExcHrs: round1(totalExcHrs * congestionTimeFactor),
    sawCutTimeHrs: round1(sawCutTimeHrs),
    surfaceRemovalHrs: round1(surfaceRemovalHrs),
    shoringInstallHrs: round1(shoringInstallHrs),
    totalCompactionHrs: round1(totalCompactionHrs),
    compactionTestHrs: round1(compactionTestHrs),
    beddingCureHrs,
    offhaulTimeHrs: round1(offhaulTimeHrs),
    backfillPlacementHrs: round1(backfillPlacementHrs),

    excPhaseHrs,
    shoringPhaseHrs,
    backfillPhaseHrs,

    totalFieldHrs,
    crewDays,
    totalCalendarDays,

    totalCrewOnSite,
    handDiggerCount,
    totalManHrs,
    adjustedManHrs,
    truckDriverHrs,

    calculatedHandDigPct,
    activeHandDigPct,
    handDigAreaSqIn: round1(handDigAreaSqIn),

    spoilsReuseCY: round2(spoilsReuseCY),
    spoilsOffhaulCY: round2(spoilsOffhaulCY),
    offhaulTruckLoads,

    shoringSF: round1(shoringSF),
    shoringPanels,

    numLifts,

    congestionTimeFactor,
    congestionNotes,

    effectiveLength: round1(effectiveLength),
    effectiveWidth: round2(effectiveWidth),
    effectiveDepth: round2(effectiveDepth),
  };
}
import {
  SOIL_TYPES,
  SURFACE_TYPES,
  EXCAVATOR_SIZES,
  TRUCK_SIZES,
  SHORING_TYPES,
} from "./constants";
import type { CalculatorInput, CalculationResults } from "./types";

// ─── Utility functions ───────────────────────────────────────

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

// ─── Main calculation function ───────────────────────────────

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

  // ── Depth Mode Computation
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

  // ── Hand Dig % Calculation
  const handDigZoneIn =
    settings.clearanceUnderPipeIn +
    settings.pipeClearanceIn +
    pipeOD +
    settings.pipeClearanceIn;
  const excDepthIn = computedExcDepthFt * 12;
  const calculatedHandDigPct =
    excDepthIn > 0
      ? Math.min(100, Math.round((handDigZoneIn / excDepthIn) * 100))
      : 0;
  const activeHandDigPct = handDigOverride
    ? handDigPctManual
    : calculatedHandDigPct;

  // ── Volume Calculations (Bank)
  let bankVolCF = 0;
  let perimeterFt = 0;
  let surfaceAreaSF = 0;
  let effectiveLength = lengthFt;
  let effectiveWidth = effectiveWidthFt;
  let effectiveDepth = computedExcDepthFt;

  if (excType === "trench") {
    if (multiDepth && depthSegments.length > 0) {
      depthSegments.forEach((seg) => {
        const segLen = seg.lengthFt || 0;
        let segDepth = seg.depthFt || depthFt;
        if (depthMode === "topOfPipe") {
          segDepth = segDepth + pipeODft_raw + clearanceUnderFt;
        } else if (depthMode === "centerline") {
          segDepth = segDepth + pipeODft_raw / 2 + clearanceUnderFt;
        }
        if (shoringType === "sloped") {
          const slopeR = parseFloat(soil.slopeRatio) || 1.5;
          bankVolCF += calcVolumeTrapezoid(
            segLen,
            effectiveWidth,
            segDepth,
            slopeR,
          );
        } else {
          bankVolCF += calcVolumeRect(segLen, effectiveWidth, segDepth);
        }
      });
      effectiveLength = depthSegments.reduce(
        (s, seg) => s + (seg.lengthFt || 0),
        0,
      );
      effectiveDepth =
        depthSegments.reduce((s, seg) => {
          let segD = seg.depthFt || depthFt;
          if (depthMode === "topOfPipe")
            segD = segD + pipeODft_raw + clearanceUnderFt;
          else if (depthMode === "centerline")
            segD = segD + pipeODft_raw / 2 + clearanceUnderFt;
          return s + segD * (seg.lengthFt || 0);
        }, 0) / (effectiveLength || 1);
    } else {
      if (shoringType === "sloped") {
        const slopeR = parseFloat(soil.slopeRatio) || 1.5;
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
    }
    perimeterFt = 2 * (effectiveLength + effectiveWidth);
  } else {
    // Bell hole
    if (excShape === "square") {
      bankVolCF = calcVolumeRect(lengthFt, lengthFt, computedExcDepthFt);
      surfaceAreaSF = lengthFt * lengthFt;
      perimeterFt = 4 * lengthFt;
      effectiveWidth = lengthFt;
    } else if (excShape === "rectangle") {
      bankVolCF = calcVolumeRect(
        lengthFt,
        effectiveWidth,
        computedExcDepthFt,
      );
      surfaceAreaSF = lengthFt * effectiveWidth;
      perimeterFt = 2 * (lengthFt + effectiveWidth);
    } else {
      const totalPerim = nsSides.reduce(
        (s, side) => s + (side.lengthFt || 0),
        0,
      );
      const approxArea = totalPerim * effectiveWidth * 0.25;
      bankVolCF = approxArea * computedExcDepthFt;
      surfaceAreaSF = approxArea;
      perimeterFt = totalPerim;
    }
  }

  // Surface cut volume
  const surfaceCutCF = surfaceAreaSF * (surface.thicknessIn / 12);
  const surfaceCutCY = cfToCY(surfaceCutCF);

  const bankVolCY = cfToCY(bankVolCF);
  const looseVolCY = bankVolCY * swellFactor;

  // ── Pipe zone calculations (per GDS A-03)
  const pipeODft = pipeOD / 12;
  const beddingDepthFt = Math.max(
    settings.beddingMinIn / 12,
    (pipeOD * settings.beddingDepthMultiplier) / 12,
  );
  const shadingAboveFt = settings.shadingAbovePipeIn / 12;
  const pipeZoneDepthFt = beddingDepthFt + pipeODft + shadingAboveFt;
  const pipeZoneVolCF =
    (excType === "trench" ? effectiveLength : effectiveWidth) *
    effectiveWidth *
    pipeZoneDepthFt;
  const pipeZoneVolCY = cfToCY(pipeZoneVolCF);

  // ── Bedding material (0-sack slurry)
  const beddingVolCF =
    (excType === "trench" ? effectiveLength : effectiveWidth) *
    effectiveWidth *
    beddingDepthFt;
  const beddingVolCY = cfToCY(beddingVolCF);

  // ── Shading material
  const shadingVolCF =
    (excType === "trench" ? effectiveLength : effectiveWidth) *
    effectiveWidth *
    (pipeODft + shadingAboveFt);
  const shadingVolCY = cfToCY(shadingVolCF);

  // ── Final backfill
  const finalBackfillDepthFt = effectiveDepth - pipeZoneDepthFt;
  const finalBackfillCF = Math.max(
    0,
    (excType === "trench" ? effectiveLength : effectiveWidth) *
      effectiveWidth *
      finalBackfillDepthFt,
  );
  const finalBackfillCY = cfToCY(finalBackfillCF);

  // Total backfill needed
  const totalBackfillCY = beddingVolCY + shadingVolCY + finalBackfillCY;

  // ── Crew-based production rates
  const handDiggerCount = settings.crewPipelayers + settings.crewLaborers;
  const totalCrewOnSite =
    settings.crewForeman +
    settings.crewOperators +
    settings.crewPipelayers +
    settings.crewLaborers +
    settings.crewTruckDriver;

  // ── Excavation Time
  const machineDigRate =
    exc.bucketCY * settings.bucketFillFactor * exc.cyclesPerHr * eff;
  const handDigPct = activeHandDigPct / 100;
  const machineDigPct = 1 - handDigPct;
  const handDigVolCY = bankVolCY * handDigPct;
  const machineDigVolCY = bankVolCY * machineDigPct;
  const handDigHrs =
    handDigVolCY / ((settings.handDigRateCFPerHr * handDiggerCount) / 27);
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

  // ── Spoils Management
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
    // partial
    spoilsReuseCY = finalBackfillCY * 0.5;
    spoilsOffhaulCY = looseVolCY - spoilsReuseCY / swellFactor;
    offhaulTruckLoads = Math.ceil(
      Math.max(0, spoilsOffhaulCY) / truck.capacityCY,
    );
    offhaulTimeHrs =
      (offhaulTruckLoads *
        (truck.loadTimeMin + settings.truckRoundTripMin)) /
      60;
  }

  // ── Shoring Calculations
  let shoringSF = 0;
  let shoringPanels = 0;
  let shoringInstallHrs = 0;

  if (shoringType === "shored") {
    const wallAreaSF =
      2 * effectiveLength * effectiveDepth +
      2 * effectiveWidth * effectiveDepth;
    shoringSF = wallAreaSF;
    const panelSF =
      settings.shoringPanelWidthFt * settings.shoringPanelHeightFt;
    shoringPanels = Math.ceil(shoringSF / panelSF);
    shoringInstallHrs =
      (shoringPanels * shoring.installTimePerPanelMin) / 60;
  }

  // ── Compaction Time
  const numLifts = Math.ceil(
    (effectiveDepth * 12 - settings.shadingAbovePipeIn) /
      settings.compactionLiftIn,
  );
  const compactionAreaSF = surfaceAreaSF || effectiveLength * effectiveWidth;
  const compactionHrsPerLift =
    compactionAreaSF / settings.compactionTimeSFPerHr;
  const totalCompactionHrs = numLifts * compactionHrsPerLift;
  const compactionTestCount = numLifts;
  const compactionTestHrs =
    (compactionTestCount * settings.compactionTestTimeMin) / 60;

  // ── Zero-sack cure time
  const beddingCureHrs = settings.zeroSackCureHrs;

  // ── Congestion adjustments
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

  // ── Import Material Needed
  const importBeddingCY = beddingVolCY;
  const importShadingCY = shadingVolCY;
  const importFinalCY =
    spoilsAction === "offhaul"
      ? finalBackfillCY
      : Math.max(0, finalBackfillCY - spoilsReuseCY);

  // ── Backfill Placement Time
  const backfillPlacementHrs =
    totalBackfillCY / (settings.backfillPlacementCYPerHr * eff);

  // ── Phase Subtotals
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

  // ── Total Timeline
  const totalFieldHrs = round1(
    excPhaseHrs + shoringPhaseHrs + backfillPhaseHrs,
  );

  const crewDays = Math.ceil(totalFieldHrs / 8);
  const totalCalendarDays = crewDays + (beddingVolCY > 0 ? 1 : 0);

  // ── Man-Hours
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
    handDigZoneIn,

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

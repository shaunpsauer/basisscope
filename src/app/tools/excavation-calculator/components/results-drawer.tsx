"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Calculator } from "lucide-react";
import {
  EXCAVATOR_SIZES,
  SOIL_TYPES,
  SURFACE_TYPES,
  TRUCK_SIZES,
} from "../constants";
import type {
  CalculationResults,
  ExcavatorSizeKey,
  Settings,
  ShoringTypeKey,
  SoilTypeKey,
  SpoilsAction,
  SurfaceTypeKey,
  TruckSizeKey,
} from "../types";
import { ResultRow } from "./result-row";
import { SectionHeader } from "./section-header";

interface ResultsDrawerProps {
  results: CalculationResults;
  settings: Settings;
  soilType: SoilTypeKey;
  surfaceType: SurfaceTypeKey;
  shoringType: ShoringTypeKey;
  excavatorSize: ExcavatorSizeKey;
  truckSize: TruckSizeKey;
  spoilsAction: SpoilsAction;
  depthMode: string;
  handDigOverride: boolean;
}

export function ResultsDrawer({
  results,
  settings,
  soilType,
  surfaceType,
  shoringType,
  excavatorSize,
  truckSize,
  spoilsAction,
  depthMode,
  handDigOverride,
}: ResultsDrawerProps) {
  return (
    <Sheet>
      {/* Fixed bottom trigger */}
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-0 left-0 right-0 z-50 rounded-none h-auto py-2.5 px-4 flex items-center justify-between text-sm font-medium"
          variant="default"
        >
          <span className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Detailed Results
          </span>
          <span className="font-mono text-xs opacity-70">
            Exc {results.excPhaseHrs} + Shor {results.shoringPhaseHrs} + BF{" "}
            {results.backfillPhaseHrs} = {results.totalFieldHrs} hrs
          </span>
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="max-h-[75vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detailed Calculation Results</SheetTitle>
        </SheetHeader>

        <div className="max-w-2xl mx-auto space-y-1 pb-8 pt-4">
          {/* ═══ PHASE 1: EXCAVATION ═══ */}
          <PhaseHeader label="Phase 1 — Excavation" hours={results.excPhaseHrs} />

          <SectionHeader>Excavation Dimensions</SectionHeader>
          <ResultRow label="Effective Length" value={results.effectiveLength} unit="ft" />
          <ResultRow label="Effective Width" value={results.effectiveWidth} unit="ft" />
          {depthMode !== "total" && (
            <>
              <ResultRow label={results.depthInputLabel} value={results.depthInputFt} unit="ft" />
              <ResultRow label="Clearance Under Pipe" value={results.clearanceUnderIn} unit="in" />
            </>
          )}
          <ResultRow label="Excavation Depth" value={results.computedExcDepthFt} unit="ft" highlight />
          <ResultRow label="Surface Area" value={results.surfaceAreaSF} unit="SF" />
          <ResultRow label="Perimeter" value={results.perimeterFt} unit="ft" />

          <SectionHeader>Material Removed</SectionHeader>
          <ResultRow label="Bank Volume" value={results.bankVolCY} unit="CY" highlight />
          <ResultRow label="Bank Volume" value={results.bankVolCF} unit="CF" />
          <ResultRow label={`Swell Factor (${SOIL_TYPES[soilType].swellPct}%)`} value={results.swellFactor} unit="x" />
          <ResultRow label="Load Factor" value={results.loadFactor} unit="" />
          <ResultRow label="Loose Volume (Spoils)" value={results.looseVolCY} unit="CY" highlight />
          {surfaceType !== "dirt" && (
            <ResultRow label={`Surface Cut (${SURFACE_TYPES[surfaceType].label})`} value={results.surfaceCutCY} unit="CY" />
          )}

          {surfaceType !== "dirt" && (
            <>
              <SectionHeader>Surface Work</SectionHeader>
              <ResultRow label="Saw Cut Time" value={results.sawCutTimeHrs} unit="hrs" />
              <ResultRow label="Surface Removal" value={results.surfaceRemovalHrs} unit="hrs" />
            </>
          )}

          <SectionHeader>Dig Time</SectionHeader>
          <ResultRow label="Hand Dig Zone (under + clr + pipe + clr)" value={results.handDigZoneIn} unit="in" />
          <ResultRow
            label={`Hand Dig (${results.activeHandDigPct}% vol x ${results.handDiggerCount} diggers${handDigOverride ? " — manual %" : ""})`}
            value={results.handDigHrs}
            unit="hrs"
          />
          <ResultRow
            label={`Machine Dig (${EXCAVATOR_SIZES[excavatorSize].label.split("(")[0].trim()})`}
            value={results.machineDigHrs}
            unit="hrs"
          />
          {results.congestionTimeFactor > 1 && (
            <ResultRow
              label={`Congestion Factor (${Math.round((results.congestionTimeFactor - 1) * 100)}% slower)`}
              value={results.congestionTimeFactor}
              unit="x"
            />
          )}
          <ResultRow label="Total Dig Time" value={results.totalExcHrs} unit="hrs" highlight />

          <SectionHeader>Spoils & Offhaul</SectionHeader>
          <ResultRow label="Spoils to Offhaul" value={results.spoilsOffhaulCY} unit="LCY" highlight />
          <ResultRow label="Truck Loads" value={results.offhaulTruckLoads} unit="loads" />
          <ResultRow label="Offhaul Time" value={results.offhaulTimeHrs} unit="hrs" />
          <ResultRow label={`Truck: ${TRUCK_SIZES[truckSize].label}`} value={TRUCK_SIZES[truckSize].capacityCY} unit="CY cap" />

          <div className="flex justify-between items-center py-2 mt-1 border-t border-border">
            <span className="text-sm font-bold">Excavation Phase Total</span>
            <span className="text-sm font-bold font-mono">{results.excPhaseHrs} hrs</span>
          </div>

          {/* ═══ PHASE 2: SHORING ═══ */}
          <PhaseHeader label="Phase 2 — Shoring" hours={results.shoringPhaseHrs} />

          {shoringType === "shored" && (
            <>
              <SectionHeader>Trench Box / Shields</SectionHeader>
              <ResultRow label="Shoring Area" value={results.shoringSF} unit="SF" highlight />
              <ResultRow label="Panels Required" value={results.shoringPanels} unit="panels" />
              <ResultRow label="Install Time" value={results.shoringInstallHrs} unit="hrs" />
            </>
          )}

          {shoringType === "sloped" && (
            <>
              <SectionHeader>Sloping</SectionHeader>
              <ResultRow label="Required Slope Ratio" value={SOIL_TYPES[soilType].slopeRatio} unit="" />
              <ResultRow label="Additional width added to volume" value="Yes" unit="" />
              <p className="text-xs text-muted-foreground/60 italic">
                Sloping time included in excavation dig time (additional material)
              </p>
            </>
          )}

          {shoringType === "benched" && (
            <>
              <SectionHeader>Benching</SectionHeader>
              <ResultRow label="Bench width factor" value="0.5x depth" unit="" />
              <p className="text-xs text-muted-foreground/60 italic">
                Benching time included in excavation dig time (additional material)
              </p>
            </>
          )}

          {shoringType === "none" && (
            <p className="text-xs text-muted-foreground/60 italic py-2">
              No shoring selected — verify depth &lt; 5&apos; or soil conditions
              permit per TD-4621M
            </p>
          )}

          <div className="flex justify-between items-center py-2 mt-1 border-t border-border">
            <span className="text-sm font-bold">Shoring Phase Total</span>
            <span className="text-sm font-bold font-mono">{results.shoringPhaseHrs} hrs</span>
          </div>

          {/* ═══ PHASE 3: BACKFILL ═══ */}
          <PhaseHeader label="Phase 3 — Backfill" hours={results.backfillPhaseHrs} />

          <SectionHeader>Pipe Zone (GDS A-03)</SectionHeader>
          <ResultRow label="Bedding Depth" value={results.beddingDepthIn} unit="in" />
          <ResultRow label="Bedding Material (0-sack)" value={results.beddingVolCY} unit="CY" highlight />
          <ResultRow label="Shading Material" value={results.shadingVolCY} unit="CY" highlight />
          <ResultRow label="Pipe Zone Total Depth" value={results.pipeZoneDepthFt} unit="ft" />
          <ResultRow label="Pipe Zone Volume" value={results.pipeZoneVolCY} unit="CY" />

          <SectionHeader>Backfill Materials</SectionHeader>
          <ResultRow label="Import Bedding (sand/0-sack)" value={results.importBeddingCY} unit="CY" />
          <ResultRow label="Import Shading" value={results.importShadingCY} unit="CY" />
          <ResultRow label="Final Backfill" value={results.finalBackfillCY} unit="CY" />
          {spoilsAction !== "offhaul" && (
            <ResultRow label="Reused Native Fill" value={results.spoilsReuseCY} unit="CY" />
          )}
          <ResultRow label="Import Final Fill" value={results.importFinalCY} unit="CY" />
          <ResultRow label="Total Backfill Needed" value={results.totalBackfillCY} unit="CY" highlight />

          <SectionHeader>Placement Time</SectionHeader>
          <ResultRow label="Backfill Placement" value={results.backfillPlacementHrs} unit="hrs" />
          <ResultRow label={`Rate: ${settings.backfillPlacementCYPerHr} CY/hr (adj. for efficiency)`} value="" unit="" />

          <SectionHeader>Compaction</SectionHeader>
          <ResultRow label="Number of Lifts" value={results.numLifts} unit="lifts" />
          <ResultRow label={`Lift Height: ${settings.compactionLiftIn}"`} value="" unit="" />
          <ResultRow label="Compaction Time" value={results.totalCompactionHrs} unit="hrs" />
          <ResultRow label="Testing Time" value={results.compactionTestHrs} unit="hrs" />

          <SectionHeader>Cure & Wait Times</SectionHeader>
          <ResultRow label="0-Sack Slurry Cure" value={results.beddingCureHrs} unit="hrs" highlight />
          <p className="text-xs text-muted-foreground/60 italic pb-1">
            Per GDS A-03 &sect;6.2.A — 24hr minimum dry time before placing final fill
          </p>

          <div className="flex justify-between items-center py-2 mt-1 border-t border-border">
            <span className="text-sm font-bold">Backfill Phase Total</span>
            <span className="text-sm font-bold font-mono">{results.backfillPhaseHrs} hrs</span>
          </div>

          {/* ═══ COMBINED TOTAL ═══ */}
          <PhaseHeader label="Combined Total" />

          <div className="bg-muted border rounded-md p-3 space-y-1.5">
            <ResultRow label="Excavation" value={results.excPhaseHrs} unit="hrs" />
            <ResultRow label="Shoring" value={results.shoringPhaseHrs} unit="hrs" />
            <ResultRow label="Backfill" value={results.backfillPhaseHrs} unit="hrs" />
            <Separator className="my-1" />
            <ResultRow label="Total Production Hours" value={results.totalFieldHrs} unit="hrs" highlight />
            <ResultRow label="Crew Days (8hr shifts)" value={results.crewDays} unit="days" />
            <ResultRow label="+1 day for bedding cure" value={results.beddingVolCY > 0 ? "Yes" : "No"} unit="" />
            <ResultRow label="Est. Calendar Days" value={results.totalCalendarDays} unit="days" highlight />
          </div>

          <SectionHeader>Crew & Man-Hours</SectionHeader>
          <div className="bg-muted border rounded-md p-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground pb-1">
              <span>Role</span>
              <span>Count</span>
            </div>
            {settings.crewForeman > 0 && (
              <ResultRow label="Foreman (overhead)" value={settings.crewForeman} unit="" />
            )}
            {settings.crewOperators > 0 && (
              <ResultRow label="Operator" value={settings.crewOperators} unit="" />
            )}
            {settings.crewPipelayers > 0 && (
              <ResultRow label="Pipelayer" value={settings.crewPipelayers} unit="" />
            )}
            {settings.crewLaborers > 0 && (
              <ResultRow label="Laborers" value={settings.crewLaborers} unit="" />
            )}
            {settings.crewTruckDriver > 0 && (
              <ResultRow label="Truck Driver (dedicated)" value={settings.crewTruckDriver} unit="" />
            )}
            <Separator className="my-1" />
            <ResultRow label="Total crew on site" value={results.totalCrewOnSite} unit="people" />
            <ResultRow label="Hand diggers" value={results.handDiggerCount} unit="people" />
            <Separator className="my-1" />
            <ResultRow label="Total Man-Hours" value={results.adjustedManHrs} unit="man-hrs" highlight />
            <p className="text-xs text-muted-foreground/60 italic">
              = production hrs x crew on site (truck driver only charged during offhaul)
            </p>
          </div>

          {results.congestionNotes.length > 0 && (
            <>
              <SectionHeader>Congestion Notes</SectionHeader>
              {results.congestionNotes.map((note, i) => (
                <div key={i} className="text-sm text-muted-foreground py-0.5">
                  &bull; {note}
                </div>
              ))}
            </>
          )}

          <SectionHeader>Soil Reference (Cat Handbook Ed. 50)</SectionHeader>
          <ResultRow label="Soil Type" value={SOIL_TYPES[soilType].label} unit="" />
          <ResultRow label="Swell %" value={SOIL_TYPES[soilType].swellPct} unit="%" />
          <ResultRow label="Bank Weight" value={SOIL_TYPES[soilType].weightBankLbCY} unit="lb/BCY" />
          <ResultRow label="Loose Weight" value={SOIL_TYPES[soilType].weightLooseLbCY} unit="lb/LCY" />
          {shoringType === "sloped" && (
            <ResultRow label="Slope Ratio" value={SOIL_TYPES[soilType].slopeRatio} unit="" />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Phase header sub-component ──────────────────────────────

function PhaseHeader({ label, hours }: { label: string; hours?: number }) {
  return (
    <div className="flex items-center gap-2 pt-4 pb-2">
      <span className="text-xs font-bold uppercase tracking-widest text-foreground">
        {label}
      </span>
      <div className="flex-1 h-px bg-foreground" />
      {hours !== undefined && (
        <span className="text-sm font-semibold font-mono">{hours} hrs</span>
      )}
    </div>
  );
}

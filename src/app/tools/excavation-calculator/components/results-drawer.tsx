"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
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

// Shared sub-components

/** Single result row — label on left, value+unit on right */
function Row({
  label,
  value,
  unit,
  bold,
}: {
  label: string;
  value: string | number;
  unit?: string;
  bold?: boolean;
}) {
  return (
    <div className={`flex justify-between items-center py-1 ${bold ? "font-semibold" : ""}`}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-mono tabular-nums">
        {value}
        {unit ? <span className="text-muted-foreground ml-1">{unit}</span> : null}
      </span>
    </div>
  );
}

/** Highlighted metric — larger value with badge-style unit */
function Metric({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number;
  unit: string;
}) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-base font-semibold font-mono tabular-nums">{value}</span>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-normal">
          {unit}
        </Badge>
      </div>
    </div>
  );
}

/** Phase total bar shown at bottom of each tab */
function PhaseTotal({ label, hours }: { label: string; hours: number }) {
  return (
    <div className="flex justify-between items-center rounded-md bg-muted px-3 py-2.5 mt-3">
      <span className="text-sm font-bold">{label}</span>
      <span className="text-base font-bold font-mono tabular-nums">{hours} hrs</span>
    </div>
  );
}

// Props

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

// Main component

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
      <DrawerContent className="max-h-[85vh] flex flex-col">
        <DrawerHeader className="flex-none pb-0">
          <div className="flex items-center justify-between">
            <DrawerTitle>Calculation Results</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* Tabbed phases */}
        <Tabs defaultValue="excavation" className="flex flex-col min-h-0 flex-1 overflow-hidden">
          <TabsList className="grid grid-cols-4 flex-none mx-4 mt-2 mb-0 w-[calc(100%-2rem)]">
            <TabsTrigger value="excavation" className="text-xs">Excavation</TabsTrigger>
            <TabsTrigger value="shoring" className="text-xs">Shoring</TabsTrigger>
            <TabsTrigger value="backfill" className="text-xs">Backfill</TabsTrigger>
            <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-2" data-vaul-no-drag>
            {/* TAB 1: EXCAVATION */}
            <TabsContent value="excavation" className="mt-0 pb-4" forceMount={undefined}>
              <Accordion type="multiple" defaultValue={["dimensions", "volumes", "dig-time", "spoils"]}>
                {/* Dimensions */}
                <AccordionItem value="dimensions">
                  <AccordionTrigger className="text-xs uppercase tracking-wider text-muted-foreground py-2">
                    Excavation Dimensions
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <Row label="Effective Length" value={results.effectiveLength} unit="ft" />
                    <Row label="Effective Width" value={results.effectiveWidth} unit="ft" />
                    {depthMode !== "total" && (
                      <>
                        <Row label={results.depthInputLabel} value={results.depthInputFt} unit="ft" />
                        <Row label="Clearance Under Pipe" value={results.clearanceUnderIn} unit="in" />
                      </>
                    )}
                    <Separator className="my-1.5" />
                    <Metric label="Excavation Depth" value={results.computedExcDepthFt} unit="ft" />
                    <Row label="Surface Area" value={results.surfaceAreaSF} unit="SF" />
                    <Row label="Perimeter" value={results.perimeterFt} unit="ft" />
                  </AccordionContent>
                </AccordionItem>

                {/* Material Removed */}
                <AccordionItem value="volumes">
                  <AccordionTrigger className="text-xs uppercase tracking-wider text-muted-foreground py-2">
                    Material Removed
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <Metric label="Bank Volume" value={results.bankVolCY} unit="BCY" />
                    <Row label={`Swell Factor (${SOIL_TYPES[soilType].swellPct}%)`} value={results.swellFactor} unit="×" />
                    <Row label="Load Factor" value={results.loadFactor} />
                    <Metric label="Loose Volume (Spoils)" value={results.looseVolCY} unit="LCY" />
                    {surfaceType !== "dirt" && (
                      <>
                        <Separator className="my-1.5" />
                        <Row label={`Surface Cut (${SURFACE_TYPES[surfaceType].label})`} value={results.surfaceCutCY} unit="CY" />
                        <Row label="Saw Cut Time" value={results.sawCutTimeHrs} unit="hrs" />
                        <Row label="Surface Removal" value={results.surfaceRemovalHrs} unit="hrs" />
                      </>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* Dig Time */}
                <AccordionItem value="dig-time">
                  <AccordionTrigger className="text-xs uppercase tracking-wider text-muted-foreground py-2">
                    Dig Time
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <Row label="Hand Dig Cross-Section" value={results.handDigAreaSqIn} unit="sq in" />
                    <Row
                      label={`Hand Dig (${results.activeHandDigPct}% vol × ${results.handDiggerCount} diggers${handDigOverride ? " — manual" : ""})`}
                      value={results.handDigHrs}
                      unit="hrs"
                    />
                    <Row
                      label={`Machine Dig (${EXCAVATOR_SIZES[excavatorSize].label.split("(")[0].trim()})`}
                      value={results.machineDigHrs}
                      unit="hrs"
                    />
                    {results.congestionTimeFactor > 1 && (
                      <Row
                        label={`Congestion Factor (${Math.round((results.congestionTimeFactor - 1) * 100)}% slower)`}
                        value={results.congestionTimeFactor}
                        unit="×"
                      />
                    )}
                    <Separator className="my-1.5" />
                    <Metric label="Total Dig Time" value={results.totalExcHrs} unit="hrs" />
                  </AccordionContent>
                </AccordionItem>

                {/* Spoils & Offhaul */}
                <AccordionItem value="spoils">
                  <AccordionTrigger className="text-xs uppercase tracking-wider text-muted-foreground py-2">
                    Spoils &amp; Offhaul
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <Metric label="Spoils to Offhaul" value={results.spoilsOffhaulCY} unit="LCY" />
                    <Row label="Truck Loads" value={results.offhaulTruckLoads} unit="loads" />
                    <Row label="Offhaul Time" value={results.offhaulTimeHrs} unit="hrs" />
                    <Row label={`Truck: ${TRUCK_SIZES[truckSize].label}`} value={TRUCK_SIZES[truckSize].capacityCY} unit="CY cap" />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <PhaseTotal label="Excavation" hours={results.excPhaseHrs} />
            </TabsContent>

            {/* TAB 2: SHORING */}
            <TabsContent value="shoring" className="mt-0 pb-4">
              {shoringType === "shored" && (
                <Card>
                  <CardContent className="pt-4 pb-3 space-y-0">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Trench Box / Shields</p>
                    <Metric label="Shoring Area" value={results.shoringSF} unit="SF" />
                    <Row label="Panels Required" value={results.shoringPanels} unit="panels" />
                    <Row label="Install Time" value={results.shoringInstallHrs} unit="hrs" />
                  </CardContent>
                </Card>
              )}

              {shoringType === "sloped" && (
                <Card>
                  <CardContent className="pt-4 pb-3 space-y-0">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Sloping</p>
                    <Row label="Required Slope Ratio" value={SOIL_TYPES[soilType].slopeRatio} />
                    <Row label="Additional width in volume" value="Yes" />
                    <p className="text-xs text-muted-foreground italic mt-2">
                      Sloping time included in excavation dig time (additional material)
                    </p>
                  </CardContent>
                </Card>
              )}

              {shoringType === "benched" && (
                <Card>
                  <CardContent className="pt-4 pb-3 space-y-0">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Benching</p>
                    <Row label="Bench width factor" value="0.5× depth" />
                    <p className="text-xs text-muted-foreground italic mt-2">
                      Benching time included in excavation dig time (additional material)
                    </p>
                  </CardContent>
                </Card>
              )}

              {shoringType === "none" && (
                <Card>
                  <CardContent className="pt-4 pb-3">
                    <p className="text-sm text-muted-foreground italic">
                      No shoring selected — verify depth &lt; 5&apos; or soil conditions permit per TD-4621M
                    </p>
                  </CardContent>
                </Card>
              )}

              <PhaseTotal label="Shoring" hours={results.shoringPhaseHrs} />
            </TabsContent>

            {/* TAB 3: BACKFILL */}
            <TabsContent value="backfill" className="mt-0 pb-4">
              <Accordion type="multiple" defaultValue={["pipe-zone", "materials", "placement", "compaction"]}>
                {/* Pipe Zone */}
                <AccordionItem value="pipe-zone">
                  <AccordionTrigger className="text-xs uppercase tracking-wider text-muted-foreground py-2">
                    Pipe Zone (GDS A-03)
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <Row label="Bedding Depth" value={results.beddingDepthIn} unit="in" />
                    <Metric label="Bedding Material (0-sack)" value={results.beddingVolCY} unit="CY" />
                    <Metric label="Shading Material" value={results.shadingVolCY} unit="CY" />
                    <Separator className="my-1.5" />
                    <Row label="Pipe Zone Total Depth" value={results.pipeZoneDepthFt} unit="ft" />
                    <Row label="Pipe Zone Volume" value={results.pipeZoneVolCY} unit="CY" />
                  </AccordionContent>
                </AccordionItem>

                {/* Materials */}
                <AccordionItem value="materials">
                  <AccordionTrigger className="text-xs uppercase tracking-wider text-muted-foreground py-2">
                    Backfill Materials
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <Row label="Import Bedding (sand/0-sack)" value={results.importBeddingCY} unit="CY" />
                    <Row label="Import Shading" value={results.importShadingCY} unit="CY" />
                    <Row label="Final Backfill" value={results.finalBackfillCY} unit="CY" />
                    {spoilsAction !== "offhaul" && (
                      <Row label="Reused Native Fill" value={results.spoilsReuseCY} unit="CY" />
                    )}
                    <Row label="Import Final Fill" value={results.importFinalCY} unit="CY" />
                    <Separator className="my-1.5" />
                    <Metric label="Total Backfill Needed" value={results.totalBackfillCY} unit="CY" />
                  </AccordionContent>
                </AccordionItem>

                {/* Placement */}
                <AccordionItem value="placement">
                  <AccordionTrigger className="text-xs uppercase tracking-wider text-muted-foreground py-2">
                    Placement Time
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <Row label="Backfill Placement" value={results.backfillPlacementHrs} unit="hrs" />
                    <p className="text-xs text-muted-foreground italic">
                      Rate: {settings.backfillPlacementCYPerHr} CY/hr (adj. for efficiency)
                    </p>
                  </AccordionContent>
                </AccordionItem>

                {/* Compaction */}
                <AccordionItem value="compaction">
                  <AccordionTrigger className="text-xs uppercase tracking-wider text-muted-foreground py-2">
                    Compaction
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <Row label="Number of Lifts" value={results.numLifts} unit="lifts" />
                    <Row label={`Lift Height`} value={settings.compactionLiftIn} unit="in" />
                    <Row label="Compaction Time" value={results.totalCompactionHrs} unit="hrs" />
                    <Row label="Testing Time" value={results.compactionTestHrs} unit="hrs" />
                    <Separator className="my-1.5" />
                    <Metric label="0-Sack Slurry Cure" value={results.beddingCureHrs} unit="hrs" />
                    <p className="text-xs text-muted-foreground italic">
                      Per GDS A-03 §6.2.A — 24hr minimum dry time before placing final fill
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <PhaseTotal label="Backfill" hours={results.backfillPhaseHrs} />
            </TabsContent>

            {/* TAB 4: SUMMARY */}
            <TabsContent value="summary" className="mt-0 pb-4 space-y-3">
              {/* Combined totals card */}
              <Card>
                <CardContent className="pt-4 pb-3 space-y-0">
                  <Row label="Excavation" value={results.excPhaseHrs} unit="hrs" />
                  <Row label="Shoring" value={results.shoringPhaseHrs} unit="hrs" />
                  <Row label="Backfill" value={results.backfillPhaseHrs} unit="hrs" />
                  <Separator className="my-2" />
                  <Metric label="Total Production Hours" value={results.totalFieldHrs} unit="hrs" />
                  <Row label="Crew Days (8hr shifts)" value={results.crewDays} unit="days" />
                  <Row label="+1 day for bedding cure" value={results.beddingVolCY > 0 ? "Yes" : "No"} />
                  <Separator className="my-2" />
                  <Metric label="Est. Calendar Days" value={results.totalCalendarDays} unit="days" />
                </CardContent>
              </Card>

              {/* Crew roster card */}
              <Card>
                <CardContent className="pt-4 pb-3 space-y-0">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Crew &amp; Man-Hours</p>
                  {settings.crewForeman > 0 && <Row label="Foreman (overhead)" value={settings.crewForeman} />}
                  {settings.crewOperators > 0 && <Row label="Operator" value={settings.crewOperators} />}
                  {settings.crewPipelayers > 0 && <Row label="Pipelayer" value={settings.crewPipelayers} />}
                  {settings.crewLaborers > 0 && <Row label="Laborers" value={settings.crewLaborers} />}
                  {settings.crewTruckDriver > 0 && <Row label="Truck Driver (dedicated)" value={settings.crewTruckDriver} />}
                  <Separator className="my-2" />
                  <Row label="Total crew on site" value={results.totalCrewOnSite} unit="people" />
                  <Row label="Hand diggers" value={results.handDiggerCount} unit="people" />
                  <Separator className="my-2" />
                  <Metric label="Total Man-Hours" value={results.adjustedManHrs} unit="man-hrs" />
                  <p className="text-xs text-muted-foreground italic mt-1">
                    Production hrs × crew on site (truck driver only charged during offhaul)
                  </p>
                </CardContent>
              </Card>

              {/* Congestion notes */}
              {results.congestionNotes.length > 0 && (
                <Card>
                  <CardContent className="pt-4 pb-3">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Congestion Notes</p>
                    {results.congestionNotes.map((note, i) => (
                      <p key={i} className="text-sm text-muted-foreground py-0.5">• {note}</p>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Soil reference card */}
              <Card>
                <CardContent className="pt-4 pb-3 space-y-0">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Soil Reference (Cat Handbook Ed. 50)
                  </p>
                  <Row label="Soil Type" value={SOIL_TYPES[soilType].label} />
                  <Row label="Swell %" value={SOIL_TYPES[soilType].swellPct} unit="%" />
                  <Row label="Bank Weight" value={SOIL_TYPES[soilType].weightBankLbCY} unit="lb/BCY" />
                  <Row label="Loose Weight" value={SOIL_TYPES[soilType].weightLooseLbCY} unit="lb/LCY" />
                  {shoringType === "sloped" && (
                    <Row label="Slope Ratio" value={SOIL_TYPES[soilType].slopeRatio} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <DrawerFooter className="flex-none pt-0 pb-3">
          <DrawerClose asChild>
            <Button variant="outline" size="sm" className="w-full">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
  );
}
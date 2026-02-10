"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import {
  EXCAVATOR_SIZES,
  SOIL_TYPES,
  SURFACE_TYPES,
  TRUCK_SIZES,
} from "../constants";
import type { ExcavationFormValues } from "../schema";
import type { CalculationResults, Settings } from "../types";

interface ResultsDrawerProps {
  results: CalculationResults;
  settings: Settings;
}

/** Label/value row used throughout the drawer */
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
    <div
      className={`flex justify-between py-1.5 border-b border-border/50 ${bold ? "font-medium" : ""}`}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-mono tabular-nums">
        {value}
        {unit && <span className="text-muted-foreground ml-1">{unit}</span>}
      </span>
    </div>
  );
}

export function ResultsDrawer({ results, settings }: ResultsDrawerProps) {
  const { watch } = useFormContext<ExcavationFormValues>();

  const soilType = watch("soilType");
  const surfaceType = watch("surfaceType");
  const shoringType = watch("shoringType");
  const excavatorSize = watch("excavatorSize");
  const truckSize = watch("truckSize");
  const spoilsAction = watch("spoilsAction");
  const handDigOverride = watch("handDigOverride");
  const projectDesc = watch("projectDesc");
  const projectLine = watch("projectLine");

  return (
    <DrawerContent className="max-h-[85vh] flex flex-col">
      <DrawerHeader className="flex-none pb-0">
        <div className="flex items-center justify-between">
          <div>
            <DrawerTitle>Excavation Results</DrawerTitle>
            {(projectDesc || projectLine) && (
              <DrawerDescription>
                {[projectDesc, projectLine].filter(Boolean).join(" · ")}
              </DrawerDescription>
            )}
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </div>
      </DrawerHeader>

      <Tabs
        defaultValue="summary"
        className="flex flex-col min-h-0 flex-1 overflow-hidden"
      >
        <TabsList className="grid grid-cols-4 flex-none mx-4 mt-2 mb-0 w-[calc(100%-2rem)]">
          <TabsTrigger value="summary" className="text-xs">
            Summary
          </TabsTrigger>
          <TabsTrigger value="volumes" className="text-xs">
            Volumes
          </TabsTrigger>
          <TabsTrigger value="labor" className="text-xs">
            Labor
          </TabsTrigger>
          <TabsTrigger value="equipment" className="text-xs">
            Equipment
          </TabsTrigger>
        </TabsList>

        <div
          className="flex-1 min-h-0 overflow-y-auto px-4 pt-2"
          data-vaul-no-drag
        >
          {/* ── SUMMARY TAB ── */}
          <TabsContent value="summary" className="mt-0 pb-4 space-y-4">
            {/* Metric cards grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold tabular-nums">
                    {results.bankVolCY}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Volume (CY)
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold tabular-nums">
                    {results.totalFieldHrs}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Hours
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold tabular-nums">
                    {results.offhaulTruckLoads}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Truck Loads
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold tabular-nums">
                    {results.totalCalendarDays}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Est. Days
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key parameters */}
            <div>
              <Row label="Excavation Phase" value={results.excPhaseHrs} unit="hrs" />
              <Row label="Shoring Phase" value={results.shoringPhaseHrs} unit="hrs" />
              <Row label="Backfill Phase" value={results.backfillPhaseHrs} unit="hrs" />
              <Separator className="my-2" />
              <Row label="Crew Days (8hr)" value={results.crewDays} unit="days" bold />
              <Row label="Crew On Site" value={results.totalCrewOnSite} unit="people" />
              <Row label="Man-Hours" value={results.adjustedManHrs} unit="man-hrs" bold />
            </div>

            {/* Soil reference */}
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">
                Soil Reference
              </p>
              <Row label="Type" value={SOIL_TYPES[soilType].label} />
              <Row label="Swell" value={SOIL_TYPES[soilType].swellPct} unit="%" />
              <Row
                label="Bank Weight"
                value={SOIL_TYPES[soilType].weightBankLbCY}
                unit="lb/BCY"
              />
            </div>

            {/* Congestion notes */}
            {results.congestionNotes.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">
                  Congestion Notes
                </p>
                {results.congestionNotes.map((note, i) => (
                  <p key={i} className="text-sm text-muted-foreground py-0.5">
                    • {note}
                  </p>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── VOLUMES TAB ── */}
          <TabsContent value="volumes" className="mt-0 pb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Item</TableHead>
                  <TableHead className="text-xs text-right">Qty</TableHead>
                  <TableHead className="text-xs text-right">Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="font-medium">
                  <TableCell>Bank Volume</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {results.bankVolCY}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    BCY
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">
                    Swell Factor ({SOIL_TYPES[soilType].swellPct}%)
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {results.swellFactor}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">×</TableCell>
                </TableRow>
                <TableRow className="font-medium">
                  <TableCell>Loose Volume</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {results.looseVolCY}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    LCY
                  </TableCell>
                </TableRow>
                {surfaceType !== "dirt" && (
                  <TableRow>
                    <TableCell className="text-muted-foreground">
                      Surface Cut ({SURFACE_TYPES[surfaceType].label})
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {results.surfaceCutCY}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      CY
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell className="text-muted-foreground">
                    Bedding Material (0-sack)
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {results.beddingVolCY}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    CY
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">
                    Shading Material
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {results.shadingVolCY}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    CY
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">
                    Final Backfill
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {results.finalBackfillCY}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    CY
                  </TableCell>
                </TableRow>
                <TableRow className="font-medium">
                  <TableCell>Total Backfill</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {results.totalBackfillCY}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    CY
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">
                    Spoils to Offhaul
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {results.spoilsOffhaulCY}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    LCY
                  </TableCell>
                </TableRow>
                {spoilsAction !== "offhaul" && (
                  <TableRow>
                    <TableCell className="text-muted-foreground">
                      Reused Native Fill
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {results.spoilsReuseCY}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      CY
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>

          {/* ── LABOR TAB ── */}
          <TabsContent value="labor" className="mt-0 pb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Task</TableHead>
                  <TableHead className="text-xs text-right">Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surfaceType !== "dirt" && (
                  <>
                    <TableRow>
                      <TableCell className="text-muted-foreground">
                        Saw Cut
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {results.sawCutTimeHrs}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">
                        Surface Removal
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {results.surfaceRemovalHrs}
                      </TableCell>
                    </TableRow>
                  </>
                )}
                <TableRow>
                  <TableCell className="text-muted-foreground">
                    Hand Dig ({results.activeHandDigPct}%
                    {handDigOverride ? " manual" : ""})
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {results.handDigHrs}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">
                    Machine Dig
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {results.machineDigHrs}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">
                    Total Dig Time
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums font-medium">
                    {results.totalExcHrs}
                  </TableCell>
                </TableRow>
                {shoringType === "shored" && (
                  <TableRow>
                    <TableCell className="text-muted-foreground">
                      Shoring Install/Remove
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {results.shoringInstallHrs}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell className="text-muted-foreground">
                    Backfill Placement
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {results.backfillPlacementHrs}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">
                    Compaction
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {results.totalCompactionHrs}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">
                    Compaction Testing
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {results.compactionTestHrs}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">
                    Offhaul Time
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {results.offhaulTimeHrs}
                  </TableCell>
                </TableRow>
                <TableRow className="border-t-2 font-bold">
                  <TableCell>Total Field Hours</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {results.totalFieldHrs}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* Crew roster */}
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">
                Crew &amp; Man-Hours
              </p>
              {settings.crewForeman > 0 && (
                <Row label="Foreman" value={settings.crewForeman} />
              )}
              {settings.crewOperators > 0 && (
                <Row label="Operator" value={settings.crewOperators} />
              )}
              {settings.crewPipelayers > 0 && (
                <Row label="Pipelayer" value={settings.crewPipelayers} />
              )}
              {settings.crewLaborers > 0 && (
                <Row label="Laborers" value={settings.crewLaborers} />
              )}
              {settings.crewTruckDriver > 0 && (
                <Row label="Truck Driver" value={settings.crewTruckDriver} />
              )}
              <Separator className="my-2" />
              <Row label="Total crew" value={results.totalCrewOnSite} unit="people" />
              <Row label="Hand diggers" value={results.handDiggerCount} unit="people" />
              <Row
                label="Total Man-Hours"
                value={results.adjustedManHrs}
                unit="man-hrs"
                bold
              />
            </div>
          </TabsContent>

          {/* ── EQUIPMENT TAB ── */}
          <TabsContent value="equipment" className="mt-0 pb-4 space-y-4">
            {/* Excavator */}
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">
                Excavator
              </p>
              <Row label="Model" value={EXCAVATOR_SIZES[excavatorSize].label} />
              <Row
                label="Bucket Capacity"
                value={EXCAVATOR_SIZES[excavatorSize].bucketCY}
                unit="CY"
              />
              <Row
                label="Cycles/hr"
                value={EXCAVATOR_SIZES[excavatorSize].cyclesPerHr}
              />
              <Row
                label="Reach"
                value={EXCAVATOR_SIZES[excavatorSize].reachFt}
                unit="ft"
              />
              <Row
                label="Fill Factor"
                value={`${Math.round(settings.bucketFillFactor * 100)}%`}
              />
            </div>

            {/* Truck */}
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">
                Haul Truck
              </p>
              <Row label="Model" value={TRUCK_SIZES[truckSize].label} />
              <Row
                label="Capacity"
                value={TRUCK_SIZES[truckSize].capacityCY}
                unit="CY"
              />
              <Row label="Truck Loads" value={results.offhaulTruckLoads} unit="loads" />
              <Row label="Offhaul Time" value={results.offhaulTimeHrs} unit="hrs" />
              <Row
                label="Round Trip"
                value={settings.truckRoundTripMin}
                unit="min"
              />
            </div>

            {/* Shoring */}
            {shoringType !== "none" && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">
                  Shoring
                </p>
                {shoringType === "shored" && (
                  <>
                    <Row label="Shoring Area" value={results.shoringSF} unit="SF" />
                    <Row
                      label="Panels Required"
                      value={results.shoringPanels}
                      unit="panels"
                    />
                    <Row
                      label="Install Time"
                      value={results.shoringInstallHrs}
                      unit="hrs"
                    />
                  </>
                )}
                {shoringType === "sloped" && (
                  <>
                    <Row
                      label="Slope Ratio"
                      value={SOIL_TYPES[soilType].slopeRatio}
                    />
                    <p className="text-xs text-muted-foreground italic">
                      Sloping time included in dig time
                    </p>
                  </>
                )}
                {shoringType === "benched" && (
                  <>
                    <Row label="Bench Factor" value="0.5× depth" />
                    <p className="text-xs text-muted-foreground italic">
                      Benching time included in dig time
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Spoils */}
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">
                Spoils Handling
              </p>
              <Row
                label="Action"
                value={
                  spoilsAction === "reuse"
                    ? "Reuse on-site"
                    : spoilsAction === "offhaul"
                      ? "Full offhaul"
                      : "Partial reuse (50%)"
                }
              />
              <Row
                label="Spoils to Offhaul"
                value={results.spoilsOffhaulCY}
                unit="LCY"
              />
              {spoilsAction !== "offhaul" && (
                <Row
                  label="Reused Native"
                  value={results.spoilsReuseCY}
                  unit="CY"
                />
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <DrawerFooter className="flex-none pt-0 pb-3">
        <DrawerClose asChild>
          <Button variant="outline" size="sm" className="w-full">
            Close
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  );
}

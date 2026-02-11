"use client";

import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { useFormContext } from "react-hook-form";
import { round1 } from "../calculations";
import { EXCAVATOR_SIZES, TRUCK_SIZES } from "../constants";
import type { ExcavationFormValues } from "../schema";
import type {
  CalculationResults,
  ExcavatorSizeKey,
  Settings,
  SpoilsAction,
  TruckSizeKey,
} from "../types";

interface EquipmentSpoilsSectionProps {
  settings: Settings;
  results: CalculationResults;
}

export function EquipmentSpoilsSection({
  settings,
  results,
}: EquipmentSpoilsSectionProps) {
  const { watch, setValue } = useFormContext<ExcavationFormValues>();

  const excavatorSize = watch("excavatorSize");
  const truckSize = watch("truckSize");
  const spoilsAction = watch("spoilsAction");
  const handDigOverride = watch("handDigOverride");
  const handDigPctManual = watch("handDigPctManual");
  const pipeOD = watch("pipeOD");

  return (
    <div className="space-y-4">
      {/* Excavator size — radio cards */}
      <div>
        <Label className="text-sm font-medium">Excavator</Label>
        <div className="flex overflow-x-auto gap-2 snap-x mt-2 pb-1">
          {(Object.entries(EXCAVATOR_SIZES) as [ExcavatorSizeKey, (typeof EXCAVATOR_SIZES)[ExcavatorSizeKey]][]).map(
            ([k, v]) => (
              <button
                key={k}
                type="button"
                onClick={() => setValue("excavatorSize", k)}
                className={`shrink-0 snap-start border rounded-lg p-3 cursor-pointer text-left transition-colors min-w-[140px] ${
                  excavatorSize === k
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="text-sm font-medium">
                  {v.label.split("(")[0].trim()}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {v.bucketCY} CY bucket · {v.reachFt}&apos; reach
                </div>
              </button>
            ),
          )}
        </div>
      </div>

      {/* Truck size — radio cards */}
      <div>
        <Label className="text-sm font-medium">Haul Truck</Label>
        <div className="flex overflow-x-auto gap-2 snap-x mt-2 pb-1">
          {(Object.entries(TRUCK_SIZES) as [TruckSizeKey, (typeof TRUCK_SIZES)[TruckSizeKey]][]).map(
            ([k, v]) => (
              <button
                key={k}
                type="button"
                onClick={() => setValue("truckSize", k)}
                className={`shrink-0 snap-start border rounded-lg p-3 cursor-pointer text-left transition-colors min-w-[120px] ${
                  truckSize === k
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="text-sm font-medium">{v.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {v.capacityCY} CY · {v.loadTimeMin} min load
                </div>
              </button>
            ),
          )}
        </div>
      </div>

      {/* Spoils action — toggle group */}
      <div>
        <Label className="text-sm font-medium">Spoils Management</Label>
        <ToggleGroup
          type="single"
          variant="outline"
          className="w-full mt-2"
          value={spoilsAction}
          onValueChange={(v) => {
            if (v) setValue("spoilsAction", v as SpoilsAction);
          }}
        >
          <ToggleGroupItem value="reuse" className="flex-1 min-h-[44px]">
            Reuse
          </ToggleGroupItem>
          <ToggleGroupItem value="offhaul" className="flex-1 min-h-[44px]">
            Full Offhaul
          </ToggleGroupItem>
          <ToggleGroupItem value="partial" className="flex-1 min-h-[44px]">
            Partial (50%)
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <Separator />

      {/* Hand dig percentage */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Hand Dig Percentage</Label>
          <Badge
            variant={handDigOverride ? "default" : "outline"}
            className="text-xs"
          >
            {handDigOverride ? "Manual" : "Auto"}
          </Badge>
        </div>

        <div className="px-3 py-2 bg-muted border rounded-md space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Calculated from cross-section:</span>
            <span className="font-mono">{results.calculatedHandDigPct}%</span>
          </div>
          <div className="text-xs text-muted-foreground/60 space-y-0.5">
            <div className="flex justify-between">
              <span>
                Buffer R: {pipeOD}/2 + {settings.pipeClearanceIn}&quot; ={" "}
                {round1(pipeOD / 2 + settings.pipeClearanceIn)}&quot;
              </span>
              <span>Keyhole − pipe = {results.handDigAreaSqIn} sq in</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="handdig-override" className="text-sm">
            Override calculated %
          </Label>
          <Switch
            id="handdig-override"
            checked={handDigOverride}
            onCheckedChange={(v) => {
              setValue("handDigOverride", v);
              if (v) setValue("handDigPctManual", results.calculatedHandDigPct);
            }}
          />
        </div>

        <Collapsible open={handDigOverride}>
          <CollapsibleContent>
            <div className="flex items-center gap-3">
              <Slider
                value={[handDigPctManual]}
                min={0}
                max={100}
                step={1}
                onValueChange={([v]) => setValue("handDigPctManual", v)}
                className="flex-1"
              />
              <span className="text-sm font-mono w-12 text-right font-semibold">
                {handDigPctManual}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Auto-calculated: {results.calculatedHandDigPct}%
            </p>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Active hand dig %:</span>
          <span className="font-mono font-semibold">
            {results.activeHandDigPct}%
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            Hand diggers (current crew logic):
          </span>
          <span className="font-mono font-semibold">
            {results.handDiggerCount}
          </span>
        </div>
      </div>
    </div>
  );
}

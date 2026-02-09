"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Truck } from "lucide-react";
import { EXCAVATOR_SIZES, TRUCK_SIZES } from "../constants";
import { round1 } from "../calculations";
import type {
  CalculationResults,
  ExcavatorSizeKey,
  Settings,
  SpoilsAction,
  TruckSizeKey,
} from "../types";

interface EquipmentSpoilsProps {
  excavatorSize: ExcavatorSizeKey;
  setExcavatorSize: (v: ExcavatorSizeKey) => void;
  truckSize: TruckSizeKey;
  setTruckSize: (v: TruckSizeKey) => void;
  spoilsAction: SpoilsAction;
  setSpoilsAction: (v: SpoilsAction) => void;
  handDigOverride: boolean;
  setHandDigOverride: (v: boolean) => void;
  handDigPctManual: number;
  setHandDigPctManual: (v: number) => void;
  pipeOD: number;
  settings: Settings;
  results: CalculationResults;
}

export function EquipmentSpoils({
  excavatorSize,
  setExcavatorSize,
  truckSize,
  setTruckSize,
  spoilsAction,
  setSpoilsAction,
  handDigOverride,
  setHandDigOverride,
  handDigPctManual,
  setHandDigPctManual,
  pipeOD,
  settings,
  results,
}: EquipmentSpoilsProps) {
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Truck className="w-4 h-4" /> Equipment & Spoils
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm">Excavator</Label>
            <Select
              value={excavatorSize}
              onValueChange={(v) =>
                setExcavatorSize(v as ExcavatorSizeKey)
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EXCAVATOR_SIZES).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Haul Truck</Label>
            <Select
              value={truckSize}
              onValueChange={(v) => setTruckSize(v as TruckSizeKey)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TRUCK_SIZES).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label className="text-sm">Spoils Management</Label>
          <Select
            value={spoilsAction}
            onValueChange={(v) => setSpoilsAction(v as SpoilsAction)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reuse">
                Reuse on-site (offhaul excess)
              </SelectItem>
              <SelectItem value="offhaul">Full offhaul</SelectItem>
              <SelectItem value="partial">Partial reuse (50%)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Hand Dig % */}
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
              <span>Calculated from pipe zone geometry:</span>
              <span className="font-mono">
                {results.calculatedHandDigPct}%
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground/60">
              <span>
                {settings.clearanceUnderPipeIn}&quot; under +{" "}
                {settings.pipeClearanceIn}&quot; clr + {pipeOD}&quot; pipe +{" "}
                {settings.pipeClearanceIn}&quot; clr = {results.handDigZoneIn}
                &quot; zone
              </span>
              <span>
                / {round1(results.computedExcDepthFt * 12)}&quot; depth
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={handDigOverride}
              onCheckedChange={(v) => {
                setHandDigOverride(v);
                if (v) setHandDigPctManual(results.calculatedHandDigPct);
              }}
              id="handdig-override"
            />
            <Label
              htmlFor="handdig-override"
              className="text-sm text-muted-foreground"
            >
              Override calculated %
            </Label>
          </div>
          {handDigOverride && (
            <div className="flex items-center gap-3">
              <Slider
                value={[handDigPctManual]}
                min={0}
                max={100}
                step={1}
                onValueChange={([v]) => setHandDigPctManual(v)}
                className="flex-1"
              />
              <span className="text-sm font-mono w-12 text-right font-semibold">
                {handDigPctManual}%
              </span>
            </div>
          )}
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Active hand dig %:</span>
            <span className="font-mono font-semibold">
              {results.activeHandDigPct}%
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              Hand diggers (pipelayers + laborers):
            </span>
            <span className="font-mono font-semibold">
              {results.handDiggerCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

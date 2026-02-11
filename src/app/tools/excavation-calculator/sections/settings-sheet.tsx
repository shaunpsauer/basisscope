"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { DEFAULT_SETTINGS } from "../constants";
import type { Settings as SettingsType } from "../types";

interface SettingsSheetProps {
  settings: SettingsType;
  onSave: (nextSettings: SettingsType) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({
  settings,
  onSave,
  open,
  onOpenChange,
}: SettingsSheetProps) {
  const [draft, setDraft] = useState<SettingsType>({ ...settings });

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraft({ ...settings });
    }
    onOpenChange(nextOpen);
  };

  const handleCancel = () => {
    setDraft({ ...settings });
    onOpenChange(false);
  };

  const handleSave = () => {
    onSave({ ...draft });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-hidden p-0 gap-0">
        <SheetHeader className="border-b pr-12">
          <SheetTitle>Calculation Parameters</SheetTitle>
          <SheetDescription>
            Adjust defaults used in all calculations
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Job Efficiency */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Job Efficiency
            </Label>
            <Separator className="my-2" />
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Job Efficiency (%)</Label>
                <div className="flex items-center gap-3 mt-1">
                  <Slider
                    value={[draft.jobEfficiency]}
                    min={50}
                    max={100}
                    step={1}
                    onValueChange={([v]) =>
                      setDraft((s) => ({ ...s, jobEfficiency: v }))
                    }
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-10 text-right">
                    {draft.jobEfficiency}%
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-sm">Bucket Fill Factor</Label>
                <div className="flex items-center gap-3 mt-1">
                  <Slider
                    value={[draft.bucketFillFactor * 100]}
                    min={50}
                    max={120}
                    step={5}
                    onValueChange={([v]) =>
                      setDraft((s) => ({
                        ...s,
                        bucketFillFactor: v / 100,
                      }))
                    }
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-12 text-right">
                    {Math.round(draft.bucketFillFactor * 100)}%
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-sm">Hand Dig Rate (CY/hr/person)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  step={0.01}
                  min={0.01}
                  value={draft.handDigRateCYPerHr}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val))
                      setDraft((s) => ({ ...s, handDigRateCYPerHr: val }));
                  }}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Pipe Zone */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pipe Zone (GDS A-03)
            </Label>
            <Separator className="my-2" />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Min Bedding (in)</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={draft.beddingMinIn}
                    onChange={(e) =>
                      setDraft((s) => ({
                        ...s,
                        beddingMinIn: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Shading Above Pipe (in)</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={draft.shadingAbovePipeIn}
                    onChange={(e) =>
                      setDraft((s) => ({
                        ...s,
                        shadingAbovePipeIn: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Clearance Under Pipe (in)</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={draft.clearanceUnderPipeIn}
                    onChange={(e) =>
                      setDraft((s) => ({
                        ...s,
                        clearanceUnderPipeIn: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Pipe Clearance (in)</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={draft.pipeClearanceIn}
                    onChange={(e) =>
                      setDraft((s) => ({
                        ...s,
                        pipeClearanceIn: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Clearance under pipe used for depth-to-pipe calculations.
              </p>
              <div>
                <Label className="text-sm">0-Sack Cure Time (hrs)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={draft.zeroSackCureHrs}
                  onChange={(e) =>
                    setDraft((s) => ({
                      ...s,
                      zeroSackCureHrs: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Compaction */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Compaction
            </Label>
            <Separator className="my-2" />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Rate (SF/hr)</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={draft.compactionTimeSFPerHr}
                    onChange={(e) =>
                      setDraft((s) => ({
                        ...s,
                        compactionTimeSFPerHr: parseFloat(e.target.value) || 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Lift Height (in)</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={draft.compactionLiftIn}
                    onChange={(e) =>
                      setDraft((s) => ({
                        ...s,
                        compactionLiftIn: parseFloat(e.target.value) || 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm">Test Time per Lift (min)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={draft.compactionTestTimeMin}
                  onChange={(e) =>
                    setDraft((s) => ({
                      ...s,
                      compactionTestTimeMin: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Backfill Placement Rate (CY/hr)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={draft.backfillPlacementCYPerHr}
                  onChange={(e) =>
                    setDraft((s) => ({
                      ...s,
                      backfillPlacementCYPerHr: parseFloat(e.target.value) || 1,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Hauling */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Hauling
            </Label>
            <Separator className="my-2" />
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Truck Round Trip (min)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={draft.truckRoundTripMin}
                  onChange={(e) =>
                    setDraft((s) => ({
                      ...s,
                      truckRoundTripMin: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Shoring Panel Size (ft)</Label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="Width"
                    value={draft.shoringPanelWidthFt}
                    onChange={(e) =>
                      setDraft((s) => ({
                        ...s,
                        shoringPanelWidthFt: parseFloat(e.target.value) || 1,
                      }))
                    }
                  />
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="Height"
                    value={draft.shoringPanelHeightFt}
                    onChange={(e) =>
                      setDraft((s) => ({
                        ...s,
                        shoringPanelHeightFt: parseFloat(e.target.value) || 1,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
        <SheetFooter className="border-t">
          <div className="w-full space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setDraft({ ...DEFAULT_SETTINGS })}
            >
              Reset to Defaults
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Settings</Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

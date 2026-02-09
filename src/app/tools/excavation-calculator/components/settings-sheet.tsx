"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Settings } from "lucide-react";
import { DEFAULT_SETTINGS } from "../constants";
import type { Settings as SettingsType } from "../types";

interface SettingsSheetProps {
  settings: SettingsType;
  setSettings: React.Dispatch<React.SetStateAction<SettingsType>>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({
  settings,
  setSettings,
  open,
  onOpenChange,
}: SettingsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Settings className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Calculation Parameters</SheetTitle>
          <SheetDescription>
            Adjust defaults used in all calculations
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          {/* Job Efficiency */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              Job Efficiency
            </Label>
            <Separator className="my-2" />
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Job Efficiency (%)</Label>
                <div className="flex items-center gap-3 mt-1">
                  <Slider
                    value={[settings.jobEfficiency]}
                    min={50}
                    max={100}
                    step={1}
                    onValueChange={([v]) =>
                      setSettings((s) => ({ ...s, jobEfficiency: v }))
                    }
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-10 text-right">
                    {settings.jobEfficiency}%
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-sm">Bucket Fill Factor</Label>
                <div className="flex items-center gap-3 mt-1">
                  <Slider
                    value={[settings.bucketFillFactor * 100]}
                    min={50}
                    max={120}
                    step={5}
                    onValueChange={([v]) =>
                      setSettings((s) => ({
                        ...s,
                        bucketFillFactor: v / 100,
                      }))
                    }
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-12 text-right">
                    {Math.round(settings.bucketFillFactor * 100)}%
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-sm">Hand Dig Rate (CF/hr/person)</Label>
                <Input
                  type="number"
                  value={settings.handDigRateCFPerHr}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      handDigRateCFPerHr: parseFloat(e.target.value) || 1,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Crew Roster */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              Crew Roster
            </Label>
            <Separator className="my-2" />
            <p className="text-xs text-muted-foreground/60 mb-3">
              Gas transmission pipeline crew. Pipelayers + Laborers = hand dig
              capacity. Foreman is on-site overhead (doesn&apos;t directly
              produce).
            </p>
            <div className="space-y-2">
              {[
                {
                  label: "Foreman",
                  desc: "supervision, safety, inspectors",
                  key: "crewForeman" as const,
                  max: 2,
                },
                {
                  label: "Operator",
                  desc: "runs excavator",
                  key: "crewOperators" as const,
                  max: 3,
                },
                {
                  label: "Pipelayer",
                  desc: "pipe zone, hand dig",
                  key: "crewPipelayers" as const,
                  max: 3,
                },
                {
                  label: "Laborers",
                  desc: "hand dig, compaction, shoring",
                  key: "crewLaborers" as const,
                  max: 6,
                },
                {
                  label: "Truck Driver",
                  desc: "0 = shared, 1 = dedicated",
                  key: "crewTruckDriver" as const,
                  max: 2,
                },
              ].map((role) => (
                <div
                  key={role.key}
                  className="flex items-center justify-between py-1.5 px-3 bg-muted rounded-md"
                >
                  <div>
                    <span className="text-sm font-medium">{role.label}</span>
                    <span className="text-xs text-muted-foreground/60 ml-2">
                      {role.desc}
                    </span>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    max={role.max}
                    value={settings[role.key]}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        [role.key]: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-16 text-center"
                  />
                </div>
              ))}
              <div className="flex justify-between items-center pt-1 px-3 text-sm">
                <span className="text-muted-foreground">
                  Total crew on site:
                </span>
                <span className="font-semibold font-mono">
                  {settings.crewForeman +
                    settings.crewOperators +
                    settings.crewPipelayers +
                    settings.crewLaborers +
                    settings.crewTruckDriver}
                </span>
              </div>
              <div className="flex justify-between items-center px-3 text-sm">
                <span className="text-muted-foreground">Hand diggers:</span>
                <span className="font-semibold font-mono">
                  {settings.crewPipelayers + settings.crewLaborers}
                </span>
              </div>
            </div>
          </div>

          {/* Pipe Zone */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              Pipe Zone (GDS A-03)
            </Label>
            <Separator className="my-2" />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Min Bedding (in)</Label>
                  <Input
                    type="number"
                    value={settings.beddingMinIn}
                    onChange={(e) =>
                      setSettings((s) => ({
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
                    value={settings.shadingAbovePipeIn}
                    onChange={(e) =>
                      setSettings((s) => ({
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
                    value={settings.clearanceUnderPipeIn}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        clearanceUnderPipeIn:
                          parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Pipe Clearance (in)</Label>
                  <Input
                    type="number"
                    value={settings.pipeClearanceIn}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        pipeClearanceIn: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground/60">
                Clearance under pipe used for depth-to-pipe calculations. Pipe
                buffer = hand-dig zone around pipe.
              </p>
              <div>
                <Label className="text-sm">0-Sack Cure Time (hrs)</Label>
                <Input
                  type="number"
                  value={settings.zeroSackCureHrs}
                  onChange={(e) =>
                    setSettings((s) => ({
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
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              Compaction
            </Label>
            <Separator className="my-2" />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Rate (SF/hr)</Label>
                  <Input
                    type="number"
                    value={settings.compactionTimeSFPerHr}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        compactionTimeSFPerHr:
                          parseFloat(e.target.value) || 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Lift Height (in)</Label>
                  <Input
                    type="number"
                    value={settings.compactionLiftIn}
                    onChange={(e) =>
                      setSettings((s) => ({
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
                  value={settings.compactionTestTimeMin}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      compactionTestTimeMin:
                        parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">
                  Backfill Placement Rate (CY/hr)
                </Label>
                <Input
                  type="number"
                  value={settings.backfillPlacementCYPerHr}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      backfillPlacementCYPerHr:
                        parseFloat(e.target.value) || 1,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Hauling */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              Hauling
            </Label>
            <Separator className="my-2" />
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Truck Round Trip (min)</Label>
                <Input
                  type="number"
                  value={settings.truckRoundTripMin}
                  onChange={(e) =>
                    setSettings((s) => ({
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
                    placeholder="Width"
                    value={settings.shoringPanelWidthFt}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        shoringPanelWidthFt:
                          parseFloat(e.target.value) || 1,
                      }))
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Height"
                    value={settings.shoringPanelHeightFt}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        shoringPanelHeightFt:
                          parseFloat(e.target.value) || 1,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSettings({ ...DEFAULT_SETTINGS })}
          >
            Reset to Defaults
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calculator, Info } from "lucide-react";
import type { Settings } from "../types";
import { SettingsSheet } from "./settings-sheet";

interface TopBarProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  settingsOpen: boolean;
  onSettingsOpenChange: (open: boolean) => void;
  infoOpen: boolean;
  onInfoOpenChange: (open: boolean) => void;
}

export function TopBar({
  settings,
  setSettings,
  settingsOpen,
  onSettingsOpenChange,
  infoOpen,
  onInfoOpenChange,
}: TopBarProps) {
  return (
    <div className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="max-w-3xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
            <Calculator className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight">
              Excavation Calculator
            </h1>
            <p className="text-xs text-muted-foreground/60">
              GDS A-03 Compliant
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <AlertDialog open={infoOpen} onOpenChange={onInfoOpenChange}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Info className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reference Standards</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>
                      This calculator uses data from the following PG&E and
                      industry references:
                    </p>
                    <p className="font-medium text-foreground">
                      GDS A-03 — Gas Trench Design & Construction (Rev 0a,
                      2020)
                    </p>
                    <p>
                      Trench widths, bedding/shading specs, backfill
                      requirements, compaction standards, and CLSM guidance.
                    </p>
                    <p className="font-medium text-foreground">
                      Bell Hole Sizing Exhibit — GTED (2022)
                    </p>
                    <p>
                      Standard bell hole dimensions, clearances for welding,
                      coating, and shoring boxes.
                    </p>
                    <p className="font-medium text-foreground">
                      TD-4621M — Excavation Safety Manual (Rev 2, 2024)
                    </p>
                    <p>
                      Soil classification (Types A/B/C), shoring requirements,
                      sloping and benching ratios.
                    </p>
                    <p className="font-medium text-foreground">
                      Caterpillar Performance Handbook Ed. 50
                    </p>
                    <p>
                      Material swell factors, load factors, equipment production
                      rates, and material weights.
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction>Close</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <SettingsSheet
            settings={settings}
            setSettings={setSettings}
            open={settingsOpen}
            onOpenChange={onSettingsOpenChange}
          />
        </div>
      </div>
    </div>
  );
}

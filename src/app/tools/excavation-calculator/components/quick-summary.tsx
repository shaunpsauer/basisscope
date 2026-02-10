"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BarChart3, ChevronUp } from "lucide-react";
import type { CalculationResults, ShoringTypeKey } from "../types";

interface QuickSummaryProps {
  results: CalculationResults;
  shoringType: ShoringTypeKey;
}

export function QuickSummary({ results, shoringType }: QuickSummaryProps) {
  return (
    <Card className="border-primary">
      <CardHeader className="py-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Quick Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-3 space-y-2">
        {/* Phase Hours Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1.5 px-3 bg-muted rounded-md">
            <span className="text-sm font-medium">Excavation</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {results.bankVolCY} BCY
              </span>
              <span className="text-lg font-semibold font-mono">
                {results.excPhaseHrs}
                <span className="text-xs text-muted-foreground/60 ml-0.5">
                  hrs
                </span>
              </span>
            </div>
          </div>
          {shoringType === "shored" && (
            <div className="flex items-center justify-between py-1.5 px-3 bg-muted rounded-md">
              <span className="text-sm font-medium">Shoring</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {results.shoringPanels} panels
                </span>
                <span className="text-lg font-semibold font-mono">
                  {results.shoringPhaseHrs}
                  <span className="text-xs text-muted-foreground/60 ml-0.5">
                    hrs
                  </span>
                </span>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between py-1.5 px-3 bg-muted rounded-md">
            <span className="text-sm font-medium">Backfill</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {results.totalBackfillCY} CY
              </span>
              <span className="text-lg font-semibold font-mono">
                {results.backfillPhaseHrs}
                <span className="text-xs text-muted-foreground/60 ml-0.5">
                  hrs
                </span>
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Totals */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-semibold font-mono">
              {results.totalFieldHrs}
            </div>
            <div className="text-xs text-muted-foreground">Total Hrs</div>
          </div>
          <div>
            <div className="text-2xl font-semibold font-mono">
              {results.offhaulTruckLoads}
            </div>
            <div className="text-xs text-muted-foreground">Truck Loads</div>
          </div>
          <div>
            <div className="text-2xl font-semibold font-mono">
              {results.totalCalendarDays}
            </div>
            <div className="text-xs text-muted-foreground">Est. Days</div>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground/50 text-center pt-2 flex items-center justify-center gap-1">
          <ChevronUp className="w-3 h-3" />
          Tap for detailed breakdown
        </p>
      </CardContent>
    </Card>
  );
}

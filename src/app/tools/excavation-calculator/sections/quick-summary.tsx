"use client";

import type { CalculationResults } from "../types";

interface QuickSummaryProps {
  results: CalculationResults;
}

export function QuickSummary({ results }: QuickSummaryProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-3xl mx-auto px-4 py-3">
        {/* Drag handle */}
        <div className="mx-auto w-10 h-1 rounded-full bg-muted-foreground/30 mb-2" />

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-semibold tabular-nums">
              {results.bankVolCY}
            </div>
            <div className="text-xs text-muted-foreground">CY</div>
          </div>
          <div>
            <div className="text-xl font-semibold tabular-nums">
              {results.totalFieldHrs}
            </div>
            <div className="text-xs text-muted-foreground">hrs</div>
          </div>
          <div>
            <div className="text-xl font-semibold tabular-nums">
              {results.offhaulTruckLoads}
            </div>
            <div className="text-xs text-muted-foreground">loads</div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { ChevronDown, Settings2 } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { ExcavationFormValues } from "../schema";

interface StickyHeaderProps {
  onSettingsOpen: () => void;
}

export function StickyHeader({ onSettingsOpen }: StickyHeaderProps) {
  const { register } = useFormContext<ExcavationFormValues>();
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <header className="sticky top-26 z-30 w-full bg-background/95 backdrop-blur border-b">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-2 h-14">
          <Input
            {...register("projectDesc")}
            placeholder="Untitled Excavation"
            className="flex-1 border-transparent bg-transparent shadow-none text-base font-medium placeholder:text-muted-foreground/50 focus-visible:border-input focus-visible:bg-background"
          />
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={onSettingsOpen}
          >
            <Settings2 className="h-[18px] w-[18px]" />
          </Button>
        </div>

        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground pb-1 transition-colors"
            >
              <ChevronDown
                className={`w-3 h-3 transition-transform ${detailsOpen ? "rotate-180" : ""}`}
              />
              {detailsOpen ? "hide details" : "more details"}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-2 gap-2 pb-3">
              <Input
                {...register("projectLine")}
                placeholder="Line (e.g., L-300A)"
                className="h-8 text-sm text-muted-foreground"
              />
              <Input
                {...register("projectLocation")}
                placeholder="Location / MP"
                className="h-8 text-sm text-muted-foreground"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </header>
  );
}

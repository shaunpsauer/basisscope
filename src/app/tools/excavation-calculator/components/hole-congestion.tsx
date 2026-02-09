"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Layers, Plus, Trash2 } from "lucide-react";
import type { CongestionItem } from "../types";

interface HoleCongestionProps {
  hasCongestion: boolean;
  setHasCongestion: (v: boolean) => void;
  congestionItems: CongestionItem[];
  addCongestion: () => void;
  removeCongestion: (i: number) => void;
  updateCongestion: (i: number, field: string, val: string | number) => void;
}

const UTILITY_TYPES = [
  "Gas Line",
  "Water",
  "Sewer",
  "Fiber",
  "Electric",
  "Telecom",
  "Other",
];

export function HoleCongestion({
  hasCongestion,
  setHasCongestion,
  congestionItems,
  addCongestion,
  removeCongestion,
  updateCongestion,
}: HoleCongestionProps) {
  return (
    <Card>
      <CardHeader className="py-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="w-4 h-4" /> Hole Congestion
          </CardTitle>
          <Switch
            checked={hasCongestion}
            onCheckedChange={setHasCongestion}
          />
        </div>
      </CardHeader>
      {hasCongestion && (
        <CardContent className="pt-0 pb-3 space-y-2">
          {congestionItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <Select
                value={item.type}
                onValueChange={(v) => updateCongestion(i, "type", v)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UTILITY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={item.lengthFt}
                onChange={(e) =>
                  updateCongestion(
                    i,
                    "lengthFt",
                    parseFloat(e.target.value) || 0,
                  )
                }
                placeholder="Length"
                className="w-16"
              />
              <span className="text-xs text-muted-foreground/60">ft</span>
              <Input
                type="number"
                value={item.depthFt}
                onChange={(e) =>
                  updateCongestion(
                    i,
                    "depthFt",
                    parseFloat(e.target.value) || 0,
                  )
                }
                placeholder="Depth"
                className="w-16"
              />
              <span className="text-xs text-muted-foreground/60">ft</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => removeCongestion(i)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addCongestion}>
            <Plus className="w-3 h-3 mr-1" /> Add Utility
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

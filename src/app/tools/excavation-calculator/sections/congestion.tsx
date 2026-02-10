"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import type { ExcavationFormValues } from "../schema";

const UTILITY_TYPES = [
  "Gas Line",
  "Water",
  "Sewer",
  "Fiber",
  "Electric",
  "Telecom",
  "Other",
];

export function CongestionSection() {
  const { watch, setValue, getValues } =
    useFormContext<ExcavationFormValues>();

  const hasCongestion = watch("hasCongestion");
  const congestionItems = watch("congestionItems");

  const addCongestion = () => {
    const items = getValues("congestionItems");
    setValue("congestionItems", [
      ...items,
      { type: "Gas Line", lengthFt: 10, depthFt: 3 },
    ]);
  };

  const removeCongestion = (i: number) => {
    const items = getValues("congestionItems");
    setValue(
      "congestionItems",
      items.filter((_, idx) => idx !== i),
    );
  };

  const updateCongestion = (
    i: number,
    field: "type" | "lengthFt" | "depthFt",
    val: string | number,
  ) => {
    const items = [...getValues("congestionItems")];
    items[i] = { ...items[i], [field]: val };
    setValue("congestionItems", items);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Hole Congestion</Label>
        <Switch
          checked={hasCongestion}
          onCheckedChange={(v) => setValue("hasCongestion", v)}
        />
      </div>

      <Collapsible open={hasCongestion}>
        <CollapsibleContent>
          {congestionItems.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No utilities added
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs w-20">Length</TableHead>
                  <TableHead className="text-xs w-20">Depth</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {congestionItems.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="py-1">
                      <Select
                        value={item.type}
                        onValueChange={(v) => updateCongestion(i, "type", v)}
                      >
                        <SelectTrigger className="h-8 text-xs">
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
                    </TableCell>
                    <TableCell className="py-1">
                      <Input
                        type="number"
                        inputMode="decimal"
                        value={item.lengthFt}
                        onChange={(e) =>
                          updateCongestion(
                            i,
                            "lengthFt",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="h-8 w-16"
                      />
                    </TableCell>
                    <TableCell className="py-1">
                      <Input
                        type="number"
                        inputMode="decimal"
                        value={item.depthFt}
                        onChange={(e) =>
                          updateCongestion(
                            i,
                            "depthFt",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="h-8 w-16"
                      />
                    </TableCell>
                    <TableCell className="py-1 pr-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeCongestion(i)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Button variant="outline" size="sm" onClick={addCongestion} className="mt-2">
            <Plus className="w-3 h-3 mr-1" /> Add Utility
          </Button>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

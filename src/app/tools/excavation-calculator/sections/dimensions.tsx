"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
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
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { round2, toFt } from "../calculations";
import { EXC_SHAPES } from "../constants";
import type { ExcavationFormValues } from "../schema";
import type { CalculationResults, Settings } from "../types";

interface DimensionsSectionProps {
  autoWidthIn: number;
  settings: Settings;
  results: CalculationResults;
}

export function DimensionsSection({
  autoWidthIn,
  settings,
  results,
}: DimensionsSectionProps) {
  const { control, watch, setValue, getValues } =
    useFormContext<ExcavationFormValues>();

  const excType = watch("excType");
  const excShape = watch("excShape");
  const depthMode = watch("depthMode");
  const useAutoWidth = watch("useAutoWidth");
  const multiDepth = watch("multiDepth");
  const nsSides = watch("nsSides");
  const pipeOD = watch("pipeOD");
  const depthFt = watch("depthFt");

  const {
    fields: segmentFields,
    append: appendSegment,
    remove: removeSegment,
  } = useFieldArray({ control, name: "depthSegments" });

  // Watch live values separately — segmentFields snapshots don't update on setValue
  const watchedSegments = watch("depthSegments");

  const addNsSide = () => {
    const sides = getValues("nsSides");
    setValue("nsSides", [
      ...sides,
      { label: String.fromCharCode(65 + sides.length), lengthFt: 6 },
    ]);
  };

  const removeNsSide = (i: number) => {
    const sides = getValues("nsSides");
    setValue(
      "nsSides",
      sides.filter((_, idx) => idx !== i),
    );
  };

  return (
    <div className="space-y-4">
      {/* Shape selector */}
      <FormField
        control={control}
        name="excShape"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">Shape</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.entries(EXC_SHAPES).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      {/* Non-standard sides */}
      {excShape === "nonstandard" ? (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Sides</Label>
          <Table>
            <TableBody>
              {nsSides.map((side, i) => (
                <TableRow key={i} className="border-0">
                  <TableCell className="py-1 pl-0 w-10">
                    <Badge variant="outline" className="text-xs w-8 justify-center">
                      {side.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1">
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={side.lengthFt}
                      onChange={(e) => {
                        const updated = [...nsSides];
                        updated[i] = {
                          ...updated[i],
                          lengthFt: parseFloat(e.target.value) || 0,
                        };
                        setValue("nsSides", updated);
                      }}
                      className="h-8 w-20"
                    />
                  </TableCell>
                  <TableCell className="py-1 text-xs text-muted-foreground w-8">
                    ft
                  </TableCell>
                  <TableCell className="py-1 pr-0 w-8">
                    {nsSides.length > 3 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeNsSide(i)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button variant="outline" size="sm" onClick={addNsSide} className="w-full">
            <Plus className="w-3 h-3 mr-1" /> Add Side
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={control}
              name="widthFt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Avg Width (ft)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={field.value}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="min-h-[44px]"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="depthMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Depth Mode</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="total">Total Depth</SelectItem>
                      <SelectItem value="topOfPipe">To Top of Pipe</SelectItem>
                      <SelectItem value="centerline">To Centerline</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Depth mode */}
          <FormField
            control={control}
            name="depthMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Depth Reference</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="total">Total Excavation Depth</SelectItem>
                    <SelectItem value="topOfPipe">Depth to Top of Pipe</SelectItem>
                    <SelectItem value="centerline">Depth to Centerline</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* Length / Width / Depth */}
          <div className="grid grid-cols-3 gap-3">
            <FormField
              control={control}
              name="lengthFt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {excShape === "square" ? "Side (ft)" : "Length (ft)"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={field.value}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="min-h-[44px]"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {excShape !== "square" && (
              <FormField
                control={control}
                name="widthFt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Width (ft)</FormLabel>
                    {excType === "trench" && useAutoWidth ? (
                      <div className="flex items-center h-[44px] border rounded-md px-3 bg-muted">
                        <span className="text-sm font-mono">
                          {round2(toFt(autoWidthIn))}&apos;
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({autoWidthIn}&quot;)
                        </span>
                      </div>
                    ) : (
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="decimal"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          className="min-h-[44px]"
                        />
                      </FormControl>
                    )}
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={control}
              name="depthFt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {depthMode === "total"
                      ? "Depth (ft)"
                      : depthMode === "topOfPipe"
                        ? "To Top (ft)"
                        : "To CL (ft)"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      disabled={multiDepth}
                      value={field.value}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className={`min-h-[44px] ${multiDepth ? "opacity-50" : ""}`}
                    />
                  </FormControl>
                  {multiDepth && (
                    <p className="text-xs text-muted-foreground">
                      Controlled by segments below
                    </p>
                  )}
                </FormItem>
              )}
            />
          </div>

          {/* Computed depth display */}
          {depthMode !== "total" && (
            <div className="flex items-center gap-3 px-3 py-2 bg-muted border rounded-md">
              <div className="flex-1">
                <span className="text-xs text-muted-foreground">
                  {depthMode === "topOfPipe"
                    ? `${depthFt}' + ${pipeOD}" pipe + ${settings.clearanceUnderPipeIn}" clearance`
                    : `${depthFt}' + ${pipeOD / 2}" (½ pipe) + ${settings.clearanceUnderPipeIn}" clearance`}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold font-mono">
                  {results.computedExcDepthFt}&apos;
                </span>
                <span className="text-xs text-muted-foreground ml-1">exc. depth</span>
              </div>
            </div>
          )}

          {/* Auto-width toggle (trench + rectangle only) */}
          {excType === "trench" && excShape !== "square" && (
            <FormField
              control={control}
              name="useAutoWidth"
              render={({ field }) => (
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-width" className="text-sm">
                      Auto-width (GDS A-03)
                    </Label>
                    {field.value && (
                      <p className="text-xs text-muted-foreground">
                        Min width: {autoWidthIn}&quot;
                      </p>
                    )}
                  </div>
                  <Switch
                    id="auto-width"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              )}
            />
          )}
        </>
      )}

      {/* Depth input for non-standard (placed here since it shares with standard) */}
      {excShape === "nonstandard" && (
        <FormField
          control={control}
          name="depthFt"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                {depthMode === "total"
                  ? "Total Depth (ft)"
                  : depthMode === "topOfPipe"
                    ? "Depth to Top of Pipe (ft)"
                    : "Depth to Centerline (ft)"}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="decimal"
                  disabled={multiDepth}
                  value={field.value}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  className={`min-h-[44px] ${multiDepth ? "opacity-50" : ""}`}
                />
              </FormControl>
              {multiDepth && (
                <p className="text-xs text-muted-foreground">
                  Controlled by segments below
                </p>
              )}
            </FormItem>
          )}
        />
      )}

      {excShape === "nonstandard" && depthMode !== "total" && (
        <div className="flex items-center gap-3 px-3 py-2 bg-muted border rounded-md">
          <span className="text-sm font-semibold font-mono">
            {results.computedExcDepthFt}&apos;
          </span>
          <span className="text-xs text-muted-foreground">computed exc. depth</span>
        </div>
      )}

      {/* Multi-depth toggle */}
      <FormField
        control={control}
        name="multiDepth"
        render={({ field }) => (
          <div className="flex items-center justify-between">
            <Label htmlFor="multi-depth" className="text-sm">
              Multi-depth excavation
            </Label>
            <Switch
              id="multi-depth"
              checked={field.value}
              onCheckedChange={(v) => {
                field.onChange(v);
                if (v && segmentFields.length === 0)
                  appendSegment({ lengthFt: 10, depthFt: 5 });
              }}
            />
          </div>
        )}
      />

      {/* Depth segments table */}
      <Collapsible open={multiDepth}>
        <CollapsibleContent>
          <div className="space-y-2 pl-2 border-l-2 border-border">
            {segmentFields.length > 0 && (
              <div className="grid grid-cols-[4rem_1fr_auto_1fr_auto_2rem] gap-x-2 px-0 text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                <span />
                <span>Length</span>
                <span />
                <span>Depth</span>
                <span />
                <span />
              </div>
            )}
            <Table>
              <TableBody>
                {segmentFields.map((field, i) => {
                  const seg = watchedSegments[i] ?? field;
                  return (
                    <TableRow key={field.id} className="border-0">
                      <TableCell className="py-1 pl-0 w-16">
                        <Badge variant="outline" className="text-xs">
                          Seg {i + 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-1">
                        <Input
                          type="number"
                          inputMode="decimal"
                          value={seg.lengthFt}
                          onChange={(e) =>
                            setValue(
                              `depthSegments.${i}.lengthFt`,
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="h-8 w-20"
                        />
                      </TableCell>
                      <TableCell className="py-1 text-xs text-muted-foreground w-8 text-center">
                        ft
                      </TableCell>
                      <TableCell className="py-1">
                        <Input
                          type="number"
                          inputMode="decimal"
                          value={seg.depthFt}
                          onChange={(e) =>
                            setValue(
                              `depthSegments.${i}.depthFt`,
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="h-8 w-20"
                        />
                      </TableCell>
                      <TableCell className="py-1 text-xs text-muted-foreground w-8 text-center">
                        ft
                      </TableCell>
                      <TableCell className="py-1 pr-0 w-8">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeSegment(i)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <Button
              variant="outline"
              size="sm"
              onClick={() => appendSegment({ lengthFt: 10, depthFt: 5 })}
            >
              <Plus className="w-3 h-3 mr-1" /> Add Segment
            </Button>
            <div className="text-xs text-muted-foreground pt-1">
              Total: {watchedSegments.reduce((s, seg) => s + (seg.lengthFt || 0), 0)}&apos;
              ({watchedSegments.length} segment{watchedSegments.length !== 1 ? "s" : ""})
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Computed readout */}
      <div className="text-xs text-muted-foreground">
        Footprint: {results.surfaceAreaSF} ft² · Volume: {results.bankVolCY} CY
      </div>
    </div>
  );
}

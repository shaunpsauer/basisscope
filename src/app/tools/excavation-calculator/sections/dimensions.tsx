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
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
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
  const { control, watch, setValue, getValues, register } =
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

  // useWatch provides reliable re-renders for field-array mutations/edits
  const watchedSegments = useWatch({
    control,
    name: "depthSegments",
  }) ?? [];

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

  // Compute per-segment excavation depth for inline readout
  const computeSegExcDepth = (depth: number, mode: string): number => {
    const safeDepth = Number.isFinite(depth) ? depth : 0;
    const clearFt = settings.clearanceUnderPipeIn / 12;
    const odFt = pipeOD / 12;
    if (mode === "topOfPipe") return round2(safeDepth + odFt + clearFt);
    if (mode === "centerline") return round2(safeDepth + odFt / 2 + clearFt);
    return round2(safeDepth);
  };

  // Inherit values from last segment or main form
  const addSegment = () => {
    const lastSeg = watchedSegments[watchedSegments.length - 1];
    appendSegment({
      lengthFt: lastSeg?.lengthFt ?? getValues("lengthFt"),
      widthFt: lastSeg?.widthFt ?? getValues("widthFt"),
      depthFt: lastSeg?.depthFt ?? getValues("depthFt"),
      depthMode: lastSeg?.depthMode ?? getValues("depthMode"),
      useAutoWidth: lastSeg?.useAutoWidth ?? getValues("useAutoWidth"),
    });
  };

  const showAutoWidth = excType === "trench" && excShape !== "square";

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

          {/* Width + Depth Mode — faded when multiDepth */}
          <div className={multiDepth ? "opacity-40 pointer-events-none" : ""}>
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
        </div>
      ) : (
        /* Standard shapes — entire block faded when multiDepth is on */
        <div className={multiDepth ? "opacity-40 pointer-events-none" : ""}>
          <div className="space-y-4">
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
                        value={field.value}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="min-h-[44px]"
                      />
                    </FormControl>
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
          </div>
        </div>
      )}

      {/* Depth input for non-standard — faded when multiDepth */}
      {excShape === "nonstandard" && (
        <div className={multiDepth ? "opacity-40 pointer-events-none" : ""}>
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
                    value={field.value}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    className="min-h-[44px]"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {depthMode !== "total" && (
            <div className="flex items-center gap-3 px-3 py-2 bg-muted border rounded-md mt-3">
              <span className="text-sm font-semibold font-mono">
                {results.computedExcDepthFt}&apos;
              </span>
              <span className="text-xs text-muted-foreground">computed exc. depth</span>
            </div>
          )}
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
                if (v && watchedSegments.length === 0) {
                  appendSegment({
                    lengthFt: getValues("lengthFt"),
                    widthFt: getValues("widthFt"),
                    depthFt: getValues("depthFt"),
                    depthMode: getValues("depthMode"),
                    useAutoWidth: getValues("useAutoWidth"),
                  });
                }
              }}
            />
          </div>
        )}
      />

      {/* Depth segments — card-based layout */}
      <Collapsible open={multiDepth}>
        <CollapsibleContent>
          <div className="space-y-3 pl-2 border-l-2 border-border">
            {segmentFields.map((field, i) => {
              const seg = watchedSegments[i] ?? field;
              const segExcDepth = computeSegExcDepth(
                seg.depthFt,
                seg.depthMode,
              );

              return (
                <div
                  key={field.id}
                  className="border rounded-lg p-3 space-y-2"
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      Seg {i + 1}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeSegment(i)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* 2×2 grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Length */}
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Length (ft)
                      </Label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        defaultValue={field.lengthFt}
                        {...register(`depthSegments.${i}.lengthFt`, { valueAsNumber: true })}
                        className="h-9 mt-1"
                      />
                    </div>

                    {/* Width */}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Label className="text-xs text-muted-foreground">
                          Width (ft)
                        </Label>
                        {showAutoWidth && (
                          <Badge
                            variant={seg.useAutoWidth ? "default" : "outline"}
                            className="text-[10px] h-4 px-1.5 cursor-pointer select-none"
                            onClick={() =>
                              setValue(
                                `depthSegments.${i}.useAutoWidth`,
                                !seg.useAutoWidth,
                                { shouldDirty: true, shouldTouch: true },
                              )
                            }
                          >
                            Auto
                          </Badge>
                        )}
                      </div>
                      {showAutoWidth && seg.useAutoWidth ? (
                        <div className="flex items-center h-9 mt-1 border rounded-md px-3 bg-muted">
                          <span className="text-sm font-mono">
                            {round2(toFt(autoWidthIn))}&apos;
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({autoWidthIn}&quot;)
                          </span>
                        </div>
                      ) : (
                        <Input
                          type="number"
                          inputMode="decimal"
                          step="any"
                          defaultValue={field.widthFt}
                          {...register(`depthSegments.${i}.widthFt`, { valueAsNumber: true })}
                          className="h-9 mt-1"
                        />
                      )}
                    </div>

                    {/* Depth */}
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Depth (ft)
                      </Label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        defaultValue={field.depthFt}
                        {...register(`depthSegments.${i}.depthFt`, { valueAsNumber: true })}
                        className="h-9 mt-1"
                      />
                    </div>

                    {/* Depth Reference */}
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Depth Ref
                      </Label>
                      <Select
                        value={seg.depthMode}
                        onValueChange={(v) =>
                          setValue(
                            `depthSegments.${i}.depthMode`,
                            v as "total" | "topOfPipe" | "centerline",
                            { shouldDirty: true, shouldTouch: true },
                          )
                        }
                      >
                        <SelectTrigger className="h-9 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="total">Total</SelectItem>
                          <SelectItem value="topOfPipe">Top of Pipe</SelectItem>
                          <SelectItem value="centerline">Centerline</SelectItem>
                        </SelectContent>
                      </Select>
                      {seg.depthMode !== "total" && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          = {segExcDepth}&apos; exc depth
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <Button variant="outline" size="sm" onClick={addSegment}>
              <Plus className="w-3 h-3 mr-1" /> Add Segment
            </Button>

            <div className="text-xs text-muted-foreground pt-1">
              {watchedSegments.length} segment
              {watchedSegments.length !== 1 ? "s" : ""} &middot; Total length:{" "}
              {watchedSegments.reduce(
                (s, seg) => s + (seg.lengthFt || 0),
                0,
              )}
              &apos;
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Computed readout */}
      <div className="text-xs text-muted-foreground">
        Footprint: {results.surfaceAreaSF} ft² &middot; Volume: {results.bankVolCY} CY
      </div>
    </div>
  );
}

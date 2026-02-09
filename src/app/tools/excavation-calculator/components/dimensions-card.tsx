"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ChevronDown, Plus, Ruler, Trash2 } from "lucide-react";
import { round2, toFt } from "../calculations";
import type {
  CalculationResults,
  DepthMode,
  DepthSegment,
  ExcShapeKey,
  ExcType,
  NsSide,
} from "../types";

interface DimensionsCardProps {
  excType: ExcType;
  excShape: ExcShapeKey;
  depthMode: DepthMode;
  setDepthMode: (v: DepthMode) => void;
  lengthFt: number;
  setLengthFt: (v: number) => void;
  widthFt: number;
  setWidthFt: (v: number) => void;
  depthFt: number;
  setDepthFt: (v: number) => void;
  useAutoWidth: boolean;
  setUseAutoWidth: (v: boolean) => void;
  autoWidthIn: number;
  multiDepth: boolean;
  setMultiDepth: (v: boolean) => void;
  depthSegments: DepthSegment[];
  addDepthSegment: () => void;
  removeDepthSegment: (i: number) => void;
  updateDepthSegment: (i: number, field: string, val: string) => void;
  nsSides: NsSide[];
  setNsSides: React.Dispatch<React.SetStateAction<NsSide[]>>;
  addNsSide: () => void;
  removeNsSide: (i: number) => void;
  pipeOD: number;
  settings: { clearanceUnderPipeIn: number };
  results: CalculationResults;
}

export function DimensionsCard({
  excType,
  excShape,
  depthMode,
  setDepthMode,
  lengthFt,
  setLengthFt,
  widthFt,
  setWidthFt,
  depthFt,
  setDepthFt,
  useAutoWidth,
  setUseAutoWidth,
  autoWidthIn,
  multiDepth,
  setMultiDepth,
  depthSegments,
  addDepthSegment,
  removeDepthSegment,
  updateDepthSegment,
  nsSides,
  setNsSides,
  addNsSide,
  removeNsSide,
  pipeOD,
  settings,
  results,
}: DimensionsCardProps) {
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Ruler className="w-4 h-4" /> Dimensions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {excShape === "nonstandard" ? (
          <NonStandardDimensions
            nsSides={nsSides}
            setNsSides={setNsSides}
            addNsSide={addNsSide}
            removeNsSide={removeNsSide}
            widthFt={widthFt}
            setWidthFt={setWidthFt}
            depthMode={depthMode}
            setDepthMode={setDepthMode}
            depthFt={depthFt}
            setDepthFt={setDepthFt}
            results={results}
          />
        ) : (
          <StandardDimensions
            excType={excType}
            excShape={excShape}
            depthMode={depthMode}
            setDepthMode={setDepthMode}
            lengthFt={lengthFt}
            setLengthFt={setLengthFt}
            widthFt={widthFt}
            setWidthFt={setWidthFt}
            depthFt={depthFt}
            setDepthFt={setDepthFt}
            useAutoWidth={useAutoWidth}
            setUseAutoWidth={setUseAutoWidth}
            autoWidthIn={autoWidthIn}
            pipeOD={pipeOD}
            settings={settings}
            results={results}
          />
        )}

        {/* Multi-depth */}
        <div className="flex items-center gap-2">
          <Switch
            checked={multiDepth}
            onCheckedChange={(v) => {
              setMultiDepth(v);
              if (v && depthSegments.length === 0) addDepthSegment();
            }}
            id="multi-depth"
          />
          <Label htmlFor="multi-depth" className="text-sm text-muted-foreground">
            Multi-depth excavation
          </Label>
        </div>

        {multiDepth && (
          <div className="space-y-2 pl-2 border-l-2 border-border">
            {depthSegments.map((seg, i) => (
              <div key={i} className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs shrink-0">
                  Seg {i + 1}
                </Badge>
                <div className="flex items-center gap-1 flex-1">
                  <Input
                    type="number"
                    value={seg.lengthFt}
                    onChange={(e) =>
                      updateDepthSegment(i, "lengthFt", e.target.value)
                    }
                    placeholder="Length"
                    className="w-20"
                  />
                  <span className="text-xs text-muted-foreground/60">
                    ft x
                  </span>
                  <Input
                    type="number"
                    value={seg.depthFt}
                    onChange={(e) =>
                      updateDepthSegment(i, "depthFt", e.target.value)
                    }
                    placeholder="Depth"
                    className="w-20"
                  />
                  <span className="text-xs text-muted-foreground/60">
                    ft deep
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => removeDepthSegment(i)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addDepthSegment}>
              <Plus className="w-3 h-3 mr-1" /> Add Segment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function NonStandardDimensions({
  nsSides,
  setNsSides,
  addNsSide,
  removeNsSide,
  widthFt,
  setWidthFt,
  depthMode,
  setDepthMode,
  depthFt,
  setDepthFt,
  results,
}: {
  nsSides: NsSide[];
  setNsSides: React.Dispatch<React.SetStateAction<NsSide[]>>;
  addNsSide: () => void;
  removeNsSide: (i: number) => void;
  widthFt: number;
  setWidthFt: (v: number) => void;
  depthMode: DepthMode;
  setDepthMode: (v: DepthMode) => void;
  depthFt: number;
  setDepthFt: (v: number) => void;
  results: CalculationResults;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">Non-Standard Sides</Label>
      {nsSides.map((side, i) => (
        <div key={i} className="flex items-center gap-2">
          <Badge variant="outline" className="w-8 justify-center text-xs">
            {side.label}
          </Badge>
          <Input
            type="number"
            value={side.lengthFt}
            onChange={(e) => {
              const updated = [...nsSides];
              updated[i] = {
                ...updated[i],
                lengthFt: parseFloat(e.target.value) || 0,
              };
              setNsSides(updated);
            }}
            className="flex-1"
            placeholder="Length (ft)"
          />
          <span className="text-xs text-muted-foreground/60">ft</span>
          {nsSides.length > 3 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => removeNsSide(i)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={addNsSide}
        className="w-full"
      >
        <Plus className="w-3 h-3 mr-1" /> Add Side
      </Button>
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div>
          <Label className="text-sm">Avg Width (ft)</Label>
          <Input
            type="number"
            value={widthFt}
            onChange={(e) => setWidthFt(parseFloat(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm">Depth Mode</Label>
          <Select
            value={depthMode}
            onValueChange={(v) => setDepthMode(v as DepthMode)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total">Total Depth</SelectItem>
              <SelectItem value="topOfPipe">Depth to Top of Pipe</SelectItem>
              <SelectItem value="centerline">Depth to Centerline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm">
            {depthMode === "total"
              ? "Total Depth (ft)"
              : depthMode === "topOfPipe"
                ? "Depth to Top of Pipe (ft)"
                : "Depth to Centerline (ft)"}
          </Label>
          <Input
            type="number"
            value={depthFt}
            onChange={(e) => setDepthFt(parseFloat(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
        {depthMode !== "total" && (
          <div>
            <Label className="text-sm">Excavation Depth</Label>
            <div className="mt-1 h-9 border rounded-md px-3 flex items-center bg-muted">
              <span className="text-sm font-mono">
                {results.computedExcDepthFt}&apos;
              </span>
              <span className="text-xs text-muted-foreground/60 ml-1">
                computed
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StandardDimensions({
  excType,
  excShape,
  depthMode,
  setDepthMode,
  lengthFt,
  setLengthFt,
  widthFt,
  setWidthFt,
  depthFt,
  setDepthFt,
  useAutoWidth,
  setUseAutoWidth,
  autoWidthIn,
  pipeOD,
  settings,
  results,
}: {
  excType: ExcType;
  excShape: ExcShapeKey;
  depthMode: DepthMode;
  setDepthMode: (v: DepthMode) => void;
  lengthFt: number;
  setLengthFt: (v: number) => void;
  widthFt: number;
  setWidthFt: (v: number) => void;
  depthFt: number;
  setDepthFt: (v: number) => void;
  useAutoWidth: boolean;
  setUseAutoWidth: (v: boolean) => void;
  autoWidthIn: number;
  pipeOD: number;
  settings: { clearanceUnderPipeIn: number };
  results: CalculationResults;
}) {
  return (
    <>
      <div>
        <Label className="text-sm">Depth Reference</Label>
        <Select
          value={depthMode}
          onValueChange={(v) => setDepthMode(v as DepthMode)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="total">Total Excavation Depth</SelectItem>
            <SelectItem value="topOfPipe">Depth to Top of Pipe</SelectItem>
            <SelectItem value="centerline">Depth to Centerline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-sm">
            {excShape === "square" ? "Side (ft)" : "Length (ft)"}
          </Label>
          <Input
            type="number"
            value={lengthFt}
            onChange={(e) => setLengthFt(parseFloat(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
        {excShape !== "square" && (
          <div>
            <Label className="text-sm">Width (ft)</Label>
            {excType === "trench" && useAutoWidth ? (
              <div className="mt-1 h-9 border rounded-md px-3 flex items-center bg-muted">
                <span className="text-sm font-mono">
                  {round2(toFt(autoWidthIn))}&apos;
                </span>
                <span className="text-xs text-muted-foreground/60 ml-1">
                  ({autoWidthIn}&quot;)
                </span>
              </div>
            ) : (
              <Input
                type="number"
                value={widthFt}
                onChange={(e) => setWidthFt(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            )}
          </div>
        )}
        <div>
          <Label className="text-sm">
            {depthMode === "total"
              ? "Depth (ft)"
              : depthMode === "topOfPipe"
                ? "To Top (ft)"
                : "To CL (ft)"}
          </Label>
          <Input
            type="number"
            value={depthFt}
            onChange={(e) => setDepthFt(parseFloat(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
      </div>

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
            <span className="text-xs text-muted-foreground/60 ml-1">
              exc. depth
            </span>
          </div>
        </div>
      )}

      {excType === "trench" && excShape !== "square" && (
        <div className="flex items-center gap-2">
          <Switch
            checked={useAutoWidth}
            onCheckedChange={setUseAutoWidth}
            id="auto-width"
          />
          <Label
            htmlFor="auto-width"
            className="text-sm text-muted-foreground"
          >
            Auto-width per GDS A-03 Table 1 (Pipe OD + clearance)
          </Label>
        </div>
      )}
    </>
  );
}

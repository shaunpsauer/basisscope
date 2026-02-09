"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layers } from "lucide-react";
import {
  EXC_SHAPES,
  LOCATION_TYPES,
  PIPE_SIZES,
  SHORING_TYPES,
  SOIL_TYPES,
  SURFACE_TYPES,
} from "../constants";
import type {
  ExcShapeKey,
  ExcType,
  LocationTypeKey,
  ShoringTypeKey,
  SoilTypeKey,
  SurfaceTypeKey,
} from "../types";

interface ExcavationConfigProps {
  excType: ExcType;
  setExcType: (v: ExcType) => void;
  excShape: ExcShapeKey;
  setExcShape: (v: ExcShapeKey) => void;
  surfaceType: SurfaceTypeKey;
  setSurfaceType: (v: SurfaceTypeKey) => void;
  locationType: LocationTypeKey;
  setLocationType: (v: LocationTypeKey) => void;
  soilType: SoilTypeKey;
  setSoilType: (v: SoilTypeKey) => void;
  shoringType: ShoringTypeKey;
  setShoringType: (v: ShoringTypeKey) => void;
  pipeOD: number;
  setPipeOD: (v: number) => void;
}

export function ExcavationConfig({
  excType,
  setExcType,
  excShape,
  setExcShape,
  surfaceType,
  setSurfaceType,
  locationType,
  setLocationType,
  soilType,
  setSoilType,
  shoringType,
  setShoringType,
  pipeOD,
  setPipeOD,
}: ExcavationConfigProps) {
  return (
    <Card>
      <CardHeader className="py-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Layers className="w-4 h-4" /> Excavation Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-3 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm">Excavation Type</Label>
            <Select
              value={excType}
              onValueChange={(v) => setExcType(v as ExcType)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trench">Trench</SelectItem>
                <SelectItem value="bellhole">Bell Hole</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Shape</Label>
            <Select
              value={excShape}
              onValueChange={(v) => setExcShape(v as ExcShapeKey)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EXC_SHAPES).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm">Surface</Label>
            <Select
              value={surfaceType}
              onValueChange={(v) => setSurfaceType(v as SurfaceTypeKey)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SURFACE_TYPES).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Location</Label>
            <Select
              value={locationType}
              onValueChange={(v) => setLocationType(v as LocationTypeKey)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LOCATION_TYPES).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm">Soil Type</Label>
            <Select
              value={soilType}
              onValueChange={(v) => setSoilType(v as SoilTypeKey)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SOIL_TYPES).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Shoring</Label>
            <Select
              value={shoringType}
              onValueChange={(v) => setShoringType(v as ShoringTypeKey)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SHORING_TYPES).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-sm">Pipe OD (inches)</Label>
          <Select
            value={String(pipeOD)}
            onValueChange={(v) => setPipeOD(parseInt(v))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PIPE_SIZES.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}&quot;
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

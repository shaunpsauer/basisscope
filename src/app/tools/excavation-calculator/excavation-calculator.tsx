"use client";

import { useState } from "react";
import { calculateResults, getMinTrenchWidth } from "./calculations";
import { DEFAULT_SETTINGS } from "./constants";
import type {
  CongestionItem,
  DepthMode,
  DepthSegment,
  ExcavatorSizeKey,
  ExcShapeKey,
  ExcType,
  LocationTypeKey,
  NsSide,
  Settings,
  ShoringTypeKey,
  SoilTypeKey,
  SpoilsAction,
  SurfaceTypeKey,
  TruckSizeKey,
} from "./types";

import { Drawer, DrawerTrigger } from "@/components/ui/drawer";

// Components
import { DimensionsCard } from "./components/dimensions-card";
import { EquipmentSpoils } from "./components/equipment-spoils";
import { ExcavationConfig } from "./components/excavation-config";
import { HoleCongestion } from "./components/hole-congestion";
import { ProjectMetadata } from "./components/project-metadata";
import { QuickSummary } from "./components/quick-summary";
import { ResultsDrawer } from "./components/results-drawer";
import { SettingsSheet } from "./components/settings-sheet";

export function ExcavationCalculator() {
  // UI state
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Settings
  const [settings, setSettings] = useState<Settings>({
    ...DEFAULT_SETTINGS,
  });

  // Project Metadata
  const [projectDesc, setProjectDesc] = useState("");
  const [projectLine, setProjectLine] = useState("");
  const [projectLocation, setProjectLocation] = useState("");

  // Excavation Params
  const [excType, setExcType] = useState<ExcType>("trench");
  const [surfaceType, setSurfaceType] = useState<SurfaceTypeKey>("dirt");
  const [locationType, setLocationType] = useState<LocationTypeKey>("city");
  const [soilType, setSoilType] = useState<SoilTypeKey>("type_b");
  const [shoringType, setShoringType] = useState<ShoringTypeKey>("none");
  const [excShape, setExcShape] = useState<ExcShapeKey>("rectangle");
  const [pipeOD, setPipeOD] = useState(6);

  // Dimensions
  const [lengthFt, setLengthFt] = useState(20);
  const [widthFt, setWidthFt] = useState(0);
  const [depthFt, setDepthFt] = useState(5);
  const [depthMode, setDepthMode] = useState<DepthMode>("total");
  const [useAutoWidth, setUseAutoWidth] = useState(true);
  const [multiDepth, setMultiDepth] = useState(false);
  const [depthSegments, setDepthSegments] = useState<DepthSegment[]>([]);

  // Non-standard sides
  const [nsSides, setNsSides] = useState<NsSide[]>([
    { label: "A", lengthFt: 10 },
    { label: "B", lengthFt: 8 },
    { label: "C", lengthFt: 10 },
    { label: "D", lengthFt: 8 },
    { label: "E", lengthFt: 6 },
  ]);

  // Congestion
  const [hasCongestion, setHasCongestion] = useState(false);
  const [congestionItems, setCongestionItems] = useState<CongestionItem[]>([]);

  // Equipment
  const [excavatorSize, setExcavatorSize] =
    useState<ExcavatorSizeKey>("small");
  const [truckSize, setTruckSize] = useState<TruckSizeKey>("14cy");

  // Spoils
  const [spoilsAction, setSpoilsAction] = useState<SpoilsAction>("reuse");

  // Hand Dig Override
  const [handDigOverride, setHandDigOverride] = useState(false);
  const [handDigPctManual, setHandDigPctManual] = useState(30);

  // Derived values
  const autoWidthIn = getMinTrenchWidth(pipeOD);

  // Run calculations (React Compiler handles memoization)
  const results = calculateResults({
    projectDesc,
    projectLine,
    projectLocation,
    excType,
    surfaceType,
    locationType,
    soilType,
    shoringType,
    excShape,
    pipeOD,
    lengthFt,
    widthFt,
    depthFt,
    depthMode,
    useAutoWidth,
    multiDepth,
    depthSegments,
    nsSides,
    hasCongestion,
    congestionItems,
    excavatorSize,
    truckSize,
    spoilsAction,
    handDigOverride,
    handDigPctManual,
    settings,
  });

  // Helpers: congestion
  const addCongestion = () =>
    setCongestionItems([
      ...congestionItems,
      { type: "Gas Line", lengthFt: 10, depthFt: 3 },
    ]);
  const removeCongestion = (i: number) =>
    setCongestionItems(congestionItems.filter((_, idx) => idx !== i));
  const updateCongestion = (
    i: number,
    field: string,
    val: string | number,
  ) => {
    const items = [...congestionItems];
    items[i] = { ...items[i], [field]: val };
    setCongestionItems(items);
  };

  // Helpers: depth segments
  const addDepthSegment = () =>
    setDepthSegments([...depthSegments, { lengthFt: 10, depthFt: 5 }]);
  const removeDepthSegment = (i: number) =>
    setDepthSegments(depthSegments.filter((_, idx) => idx !== i));
  const updateDepthSegment = (i: number, field: string, val: string) => {
    const segs = [...depthSegments];
    segs[i] = { ...segs[i], [field]: parseFloat(val) || 0 };
    setDepthSegments(segs);
  };

  // Helpers: non-standard sides
  const addNsSide = () =>
    setNsSides([
      ...nsSides,
      { label: String.fromCharCode(65 + nsSides.length), lengthFt: 6 },
    ]);
  const removeNsSide = (i: number) =>
    setNsSides(nsSides.filter((_, idx) => idx !== i));

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* MAIN FORM */}
      <div className="max-w-3xl mx-auto px-4 py-3 space-y-2.5">
        <div className="flex justify-end">
          <SettingsSheet
            settings={settings}
            setSettings={setSettings}
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
          />
        </div>
        <ProjectMetadata
          projectDesc={projectDesc}
          setProjectDesc={setProjectDesc}
          projectLine={projectLine}
          setProjectLine={setProjectLine}
          projectLocation={projectLocation}
          setProjectLocation={setProjectLocation}
        />

        <ExcavationConfig
          excType={excType}
          setExcType={setExcType}
          excShape={excShape}
          setExcShape={setExcShape}
          surfaceType={surfaceType}
          setSurfaceType={setSurfaceType}
          locationType={locationType}
          setLocationType={setLocationType}
          soilType={soilType}
          setSoilType={setSoilType}
          shoringType={shoringType}
          setShoringType={setShoringType}
          pipeOD={pipeOD}
          setPipeOD={setPipeOD}
        />

        <DimensionsCard
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
          multiDepth={multiDepth}
          setMultiDepth={setMultiDepth}
          depthSegments={depthSegments}
          addDepthSegment={addDepthSegment}
          removeDepthSegment={removeDepthSegment}
          updateDepthSegment={updateDepthSegment}
          nsSides={nsSides}
          setNsSides={setNsSides}
          addNsSide={addNsSide}
          removeNsSide={removeNsSide}
          pipeOD={pipeOD}
          settings={settings}
          results={results}
        />

        <HoleCongestion
          hasCongestion={hasCongestion}
          setHasCongestion={setHasCongestion}
          congestionItems={congestionItems}
          addCongestion={addCongestion}
          removeCongestion={removeCongestion}
          updateCongestion={updateCongestion}
        />

        <EquipmentSpoils
          excavatorSize={excavatorSize}
          setExcavatorSize={setExcavatorSize}
          truckSize={truckSize}
          setTruckSize={setTruckSize}
          spoilsAction={spoilsAction}
          setSpoilsAction={setSpoilsAction}
          handDigOverride={handDigOverride}
          setHandDigOverride={setHandDigOverride}
          handDigPctManual={handDigPctManual}
          setHandDigPctManual={setHandDigPctManual}
          pipeOD={pipeOD}
          settings={settings}
          results={results}
        />

        <Drawer>
          <DrawerTrigger asChild>
            <div className="cursor-pointer">
              <QuickSummary results={results} shoringType={shoringType} />
            </div>
          </DrawerTrigger>
          <ResultsDrawer
            results={results}
            settings={settings}
            soilType={soilType}
            surfaceType={surfaceType}
            shoringType={shoringType}
            excavatorSize={excavatorSize}
            truckSize={truckSize}
            spoilsAction={spoilsAction}
            depthMode={depthMode}
            handDigOverride={handDigOverride}
          />
        </Drawer>
      </div>
    </div>
  );
}

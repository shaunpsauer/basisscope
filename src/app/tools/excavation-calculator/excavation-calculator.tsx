"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { Form } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { calculateResults, getMinTrenchWidth } from "./calculations";
import { DEFAULT_SETTINGS } from "./constants";
import { excavationSchema, formDefaults } from "./schema";
import type { ExcavationFormValues } from "./schema";
import type { ExcType, Settings } from "./types";

// Sections
import { ConfigurationSection } from "./sections/configuration";
import { CongestionSection } from "./sections/congestion";
import { DimensionsSection } from "./sections/dimensions";
import { EquipmentSpoilsSection } from "./sections/equipment-spoils";
import { QuickSummary } from "./sections/quick-summary";
import { ResultsDrawer } from "./sections/results-drawer";
import { SettingsSheet } from "./sections/settings-sheet";
import { StickyHeader } from "./sections/sticky-header";

export function ExcavationCalculator() {
  // Form
  const form = useForm<ExcavationFormValues>({
    resolver: zodResolver(excavationSchema),
    defaultValues: formDefaults,
  });

  // Settings (separate state — has its own reset-to-defaults behavior)
  const [settings, setSettings] = useState<Settings>({ ...DEFAULT_SETTINGS });
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Watch all values for live calculation
  const values = form.watch();

  // Derived
  const autoWidthIn = getMinTrenchWidth(values.pipeOD);

  // Run calculations
  const results = calculateResults({
    ...values,
    settings,
  });

  return (
    <Form {...form}>
      <div className="min-h-screen bg-background text-foreground">
        {/* Sticky header */}
        <StickyHeader onSettingsOpen={() => setSettingsOpen(true)} />

        {/* Main scrollable area */}
        <main className="max-w-3xl mx-auto px-4 pt-4 pb-28">
          {/* Exc type tabs */}
          <Tabs
            value={values.excType}
            onValueChange={(v) => form.setValue("excType", v as ExcType)}
            className="mb-4"
          >
            <TabsList className="w-full bg-muted rounded-lg p-1">
              <TabsTrigger value="trench" className="flex-1 min-h-[44px]">
                Trench
              </TabsTrigger>
              <TabsTrigger value="bellhole" className="flex-1 min-h-[44px]">
                Bell Hole
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Accordion sections */}
          <Accordion
            type="multiple"
            defaultValue={["configuration", "dimensions"]}
            className="space-y-0"
          >
            {/* Configuration */}
            <AccordionItem value="configuration">
              <AccordionTrigger className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Configuration
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <ConfigurationSection />
              </AccordionContent>
            </AccordionItem>

            {/* Dimensions */}
            <AccordionItem value="dimensions">
              <AccordionTrigger className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Dimensions
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <DimensionsSection
                  autoWidthIn={autoWidthIn}
                  settings={settings}
                  results={results}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Congestion */}
            <AccordionItem value="congestion">
              <AccordionTrigger className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Congestion
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <CongestionSection />
              </AccordionContent>
            </AccordionItem>

            {/* Equipment & Spoils */}
            <AccordionItem value="equipment">
              <AccordionTrigger className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Equipment &amp; Spoils
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <EquipmentSpoilsSection settings={settings} results={results} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </main>

        {/* Drawer: quick summary trigger + results content */}
        <Drawer>
          <DrawerTrigger asChild>
            <div className="cursor-pointer">
              <QuickSummary results={results} />
            </div>
          </DrawerTrigger>
          <ResultsDrawer results={results} settings={settings} />
        </Drawer>

        {/* Settings sheet */}
        <SettingsSheet
          settings={settings}
          setSettings={setSettings}
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
      </div>
    </Form>
  );
}

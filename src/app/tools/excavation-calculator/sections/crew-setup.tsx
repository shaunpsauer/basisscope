"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Settings } from "../types";

interface CrewSetupSectionProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

export function CrewSetupSection({
  settings,
  setSettings,
}: CrewSetupSectionProps) {
  const totalExcavationCrew = settings.crewOperators + settings.crewLaborers;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Excavation production crew only. Set the roles that directly impact dig
        output and excavation time.
      </p>

      <div className="space-y-2">
        {[
          {
            key: "crewOperators" as const,
            label: "Operator",
            desc: "runs excavator",
            max: 3,
          },
          {
            key: "crewLaborers" as const,
            label: "Laborers",
            desc: "hand dig support",
            max: 8,
          },
        ].map((role) => (
          <div
            key={role.key}
            className="flex items-center justify-between py-1.5 px-3 bg-muted rounded-md"
          >
            <div>
              <Label className="text-sm font-medium">{role.label}</Label>
              <span className="text-xs text-muted-foreground ml-2">
                {role.desc}
              </span>
            </div>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              max={role.max}
              value={settings[role.key]}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  [role.key]: parseInt(e.target.value, 10) || 0,
                }))
              }
              className="w-16 text-center"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-1 px-1 text-sm">
        <span className="text-muted-foreground">Excavation crew total:</span>
        <span className="font-semibold font-mono">{totalExcavationCrew}</span>
      </div>
    </div>
  );
}

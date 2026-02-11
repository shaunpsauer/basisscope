"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useFormContext } from "react-hook-form";
import {
  LOCATION_TYPES,
  PIPE_SIZES,
  SHORING_TYPES,
  SOIL_TYPES,
  SURFACE_TYPES,
} from "../constants";
import type { ExcavationFormValues } from "../schema";

export function ConfigurationSection() {
  const { control } = useFormContext<ExcavationFormValues>();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField
          control={control}
          name="surfaceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Surface</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(SURFACE_TYPES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="locationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Location</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(LOCATION_TYPES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField
          control={control}
          name="soilType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Soil Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(SOIL_TYPES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="shoringType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Shoring</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(SHORING_TYPES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="pipeOD"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">Pipe OD</FormLabel>
            <Select
              onValueChange={(v) => field.onChange(parseInt(v))}
              value={String(field.value)}
            >
              <FormControl>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {PIPE_SIZES.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s}&quot;
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="existingPipePresent"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-md border p-3">
            <div className="space-y-0.5">
              <FormLabel className="text-sm font-medium">
                No existing pipe present
              </FormLabel>
              <p className="text-xs text-muted-foreground">
                Turn on when installing new pipe in open trench
              </p>
            </div>
            <FormControl>
              <Switch
                checked={!field.value}
                onCheckedChange={(checked) => field.onChange(!checked)}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}

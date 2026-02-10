import { z } from "zod";

// ─── Sub-schemas ────────────────────────────────────────────

const depthSegmentSchema = z.object({
  lengthFt: z.number().min(0),
  depthFt: z.number().min(0),
});

const congestionItemSchema = z.object({
  type: z.string(),
  lengthFt: z.number().min(0),
  depthFt: z.number().min(0),
});

const nsSideSchema = z.object({
  label: z.string(),
  lengthFt: z.number().min(0),
});

// ─── Main form schema (no .default() — keeps types required) ─

export const excavationSchema = z.object({
  // Project metadata
  projectDesc: z.string(),
  projectLine: z.string(),
  projectLocation: z.string(),

  // Excavation params
  excType: z.enum(["trench", "bellhole"]),
  surfaceType: z.enum(["asphalt", "concrete", "dirt"]),
  locationType: z.enum(["city", "highway", "rural", "remote"]),
  soilType: z.enum(["type_a", "type_b", "type_c", "rock"]),
  shoringType: z.enum(["none", "shored", "sloped", "benched"]),
  excShape: z.enum(["square", "rectangle", "nonstandard"]),
  pipeOD: z.number().min(1),

  // Dimensions
  lengthFt: z.number().min(0),
  widthFt: z.number().min(0),
  depthFt: z.number().min(0),
  depthMode: z.enum(["total", "centerline", "topOfPipe"]),
  useAutoWidth: z.boolean(),
  multiDepth: z.boolean(),
  depthSegments: z.array(depthSegmentSchema),

  // Non-standard sides
  nsSides: z.array(nsSideSchema),

  // Congestion
  hasCongestion: z.boolean(),
  congestionItems: z.array(congestionItemSchema),

  // Equipment
  excavatorSize: z.enum(["mini", "small", "medium", "large"]),
  truckSize: z.enum(["10cy", "14cy", "16cy", "20cy"]),

  // Spoils
  spoilsAction: z.enum(["reuse", "offhaul", "partial"]),

  // Hand dig override
  handDigOverride: z.boolean(),
  handDigPctManual: z.number().min(0).max(100),
});

export type ExcavationFormValues = z.infer<typeof excavationSchema>;

/** Default values for useForm (matches original useState defaults) */
export const formDefaults: ExcavationFormValues = {
  projectDesc: "",
  projectLine: "",
  projectLocation: "",
  excType: "trench",
  surfaceType: "dirt",
  locationType: "city",
  soilType: "type_b",
  shoringType: "none",
  excShape: "rectangle",
  pipeOD: 6,
  lengthFt: 20,
  widthFt: 0,
  depthFt: 5,
  depthMode: "total",
  useAutoWidth: true,
  multiDepth: false,
  depthSegments: [],
  nsSides: [
    { label: "A", lengthFt: 10 },
    { label: "B", lengthFt: 8 },
    { label: "C", lengthFt: 10 },
    { label: "D", lengthFt: 8 },
    { label: "E", lengthFt: 6 },
  ],
  hasCongestion: false,
  congestionItems: [],
  excavatorSize: "small",
  truckSize: "14cy",
  spoilsAction: "reuse",
  handDigOverride: false,
  handDigPctManual: 30,
};

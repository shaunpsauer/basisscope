"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, FileText } from "lucide-react";

interface ProjectMetadataProps {
  projectDesc: string;
  setProjectDesc: (v: string) => void;
  projectLine: string;
  setProjectLine: (v: string) => void;
  projectLocation: string;
  setProjectLocation: (v: string) => void;
}

export function ProjectMetadata({
  projectDesc,
  setProjectDesc,
  projectLine,
  setProjectLine,
  projectLocation,
  setProjectLocation,
}: ProjectMetadataProps) {
  return (
    <Collapsible defaultOpen={false}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="py-2 cursor-pointer">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" /> Project Metadata
              </CardTitle>
              <ChevronDown className="w-4 h-4 text-muted-foreground/60" />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-3 space-y-2">
            <div>
              <Label className="text-sm">Description</Label>
              <Input
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                placeholder="Project description..."
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Line</Label>
                <Input
                  value={projectLine}
                  onChange={(e) => setProjectLine(e.target.value)}
                  placeholder="e.g., L-300A"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Location</Label>
                <Input
                  value={projectLocation}
                  onChange={(e) => setProjectLocation(e.target.value)}
                  placeholder="Address or MP"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

interface ResultRowProps {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
}

export function ResultRow({ label, value, unit, highlight }: ResultRowProps) {
  return (
    <div
      className={`flex justify-between items-center py-1.5 ${highlight ? "font-semibold" : ""}`}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-mono tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}{" "}
        {unit && (
          <span className="text-muted-foreground/60 text-xs">{unit}</span>
        )}
      </span>
    </div>
  );
}

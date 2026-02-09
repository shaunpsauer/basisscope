interface SectionHeaderProps {
  children: React.ReactNode;
}

export function SectionHeader({ children }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 pt-3 pb-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
        {children}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

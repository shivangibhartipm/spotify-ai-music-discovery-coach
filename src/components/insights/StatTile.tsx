import type { ReactNode } from "react";

import { Card } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

type StatTileProps = {
  label: string;
  value: string | number;
  description: string;
  accent?: "green" | "amber" | "red";
  children?: ReactNode;
};

const accentClasses = {
  green: "text-[var(--color-brand-hover)]",
  amber: "text-amber-300",
  red: "text-red-300",
};

export function StatTile({
  label,
  value,
  description,
  accent = "green",
  children,
}: StatTileProps) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className={cn("mt-4 text-3xl font-black text-white", accentClasses[accent])}>{value}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </Card>
  );
}

import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--color-brand)]/30 bg-[var(--color-brand)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-hover)]",
        className,
      )}
      {...props}
    />
  );
}

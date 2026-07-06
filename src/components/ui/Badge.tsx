import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type Variant = "neutral" | "brand" | "success" | "warning" | "danger";

const VARIANTES: Record<Variant, string> = {
  neutral: "bg-white/8 text-slate-300 border-white/10",
  brand: "bg-indigo-500/15 text-indigo-300 border-indigo-400/25",
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-400/25",
  warning: "bg-amber-500/15 text-amber-300 border-amber-400/25",
  danger: "bg-rose-500/15 text-rose-300 border-rose-400/25",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        VARIANTES[variant],
        className,
      )}
      {...props}
    />
  );
}

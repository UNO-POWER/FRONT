import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "solid" | "glass";
}

export function Card({ variant = "solid", className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border",
        variant === "glass"
          ? "border-white/10 bg-white/5 backdrop-blur-md"
          : "border-line bg-surface-raised",
        className,
      )}
      {...props}
    />
  );
}

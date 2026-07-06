import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const VARIANTES: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 " +
    "hover:from-indigo-400 hover:to-violet-400 hover:-translate-y-0.5 active:translate-y-0",
  secondary:
    "bg-surface-raised text-slate-100 border border-line hover:border-white/20 hover:bg-surface-overlay",
  ghost: "text-slate-300 hover:text-white hover:bg-white/5",
  danger: "bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25",
};

const TAMANOS: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, disabled, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 rounded-xl font-semibold",
        "transition-all duration-200 disabled:pointer-events-none disabled:opacity-45",
        VARIANTES[variant],
        TAMANOS[size],
        className,
      )}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
});

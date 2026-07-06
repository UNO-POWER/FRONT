import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id: idProp, ...props },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const descId = `${id}-desc`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? descId : undefined}
        className={cn(
          "h-11 rounded-xl border bg-surface-raised px-4 text-sm text-slate-100 placeholder:text-slate-500",
          "transition-colors duration-200",
          error
            ? "border-rose-500/60 focus-visible:ring-rose-400"
            : "border-line hover:border-white/20 focus:border-indigo-400/60",
          className,
        )}
        {...props}
      />
      {(error || hint) && (
        <p id={descId} className={cn("text-xs", error ? "text-rose-400" : "text-slate-500")}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
});

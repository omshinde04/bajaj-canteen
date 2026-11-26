import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border border-slate-200 bg-slate-100 text-slate-700",
        indigo: "border border-indigo-200 bg-indigo-50 text-indigo-700 font-bold",
        success: "border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold",
        warning: "border border-amber-200 bg-amber-50 text-amber-700 font-bold",
        destructive: "border border-rose-200 bg-rose-50 text-rose-700 font-bold",
        secondary: "border border-slate-200 bg-slate-50 text-slate-600",
        outline: "border border-slate-300 text-slate-700 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

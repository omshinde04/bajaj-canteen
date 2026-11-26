import * as React from "react";
import { Loader2 } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const loaderVariants = cva("animate-spin text-indigo-600", {
  variants: {
    size: {
      xs: "w-3 h-3",
      sm: "w-4 h-4",
      default: "w-5 h-5",
      lg: "w-8 h-8",
      xl: "w-12 h-12",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export function Spinner({ className, size, ...props }) {
  return <Loader2 className={cn(loaderVariants({ size }), className)} {...props} />;
}

export function LoaderBlock({ text = "Loading data...", className, size = "default" }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 gap-3 text-slate-500", className)}>
      <Spinner size={size} />
      {text && <span className="text-xs font-medium text-slate-500">{text}</span>}
    </div>
  );
}

export function FullscreenLoader({ text = "Loading console..." }) {
  return (
    <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
      <Spinner size="lg" />
      <span className="text-xs font-semibold text-slate-700">{text}</span>
    </div>
  );
}

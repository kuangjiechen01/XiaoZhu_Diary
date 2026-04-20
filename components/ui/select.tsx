import * as React from "react";

import { cn } from "@/lib/utils";

export function Select({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "flex h-12 w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    />
  );
}

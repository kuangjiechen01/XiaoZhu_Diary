import { UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

export function Avatar({
  src,
  fallback,
  className
}: {
  src?: string | null;
  fallback?: string;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={fallback ?? "avatar"}
        className={cn("h-10 w-10 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground",
        className
      )}
    >
      {fallback ? fallback.slice(0, 1) : <UserRound className="h-4 w-4" />}
    </div>
  );
}

import { HeartOff } from "lucide-react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "flex flex-col items-start gap-3 border-dashed bg-white/70",
        className
      )}
    >
      <div className="rounded-full bg-secondary p-3 text-secondary-foreground">
        <HeartOff className="h-5 w-5" />
      </div>
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
      {action}
    </Card>
  );
}

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function ErrorPanel({
  title = "出错了",
  description,
  onRetry
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="border-destructive/20 bg-red-50/60">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-destructive/10 p-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          {onRetry ? (
            <Button variant="outline" size="sm" onClick={onRetry}>
              重试
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

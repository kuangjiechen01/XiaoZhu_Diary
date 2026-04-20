import { LoaderCircle } from "lucide-react";

import { Card } from "@/components/ui/card";

export function LoadingPanel({ label = "正在加载..." }: { label?: string }) {
  return (
    <Card className="flex items-center gap-3">
      <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </Card>
  );
}

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
  backHref,
  className
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  backHref?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="space-y-1">
        {backHref ? (
          <Link
            href={backHref}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 mb-2")}
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Link>
        ) : null}
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary px-4 py-2.5 text-primary-foreground shadow-card hover:opacity-95",
        secondary:
          "bg-secondary px-4 py-2.5 text-secondary-foreground hover:bg-secondary/80",
        ghost: "px-3 py-2 text-foreground hover:bg-secondary/70",
        outline:
          "border border-border bg-card px-4 py-2.5 text-card-foreground hover:bg-secondary/60",
        destructive:
          "bg-destructive px-4 py-2.5 text-destructive-foreground hover:opacity-95"
      },
      size: {
        default: "h-11",
        sm: "h-9 rounded-full px-3 text-xs",
        lg: "h-12 rounded-full px-5",
        icon: "h-10 w-10 rounded-full"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

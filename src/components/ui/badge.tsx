import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary/10 text-secondary-foreground [a&]:hover:bg-secondary/20",
        destructive:
          "border-transparent bg-destructive/10 text-destructive [a&]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border-border/50 text-foreground bg-transparent [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        // Financial status variants
        success:
          "border-transparent bg-success/10 text-success ring-1 ring-success/20",
        warning:
          "border-transparent bg-warning/10 text-warning ring-1 ring-warning/20",
        info:
          "border-transparent bg-info/10 text-info ring-1 ring-info/20",
        // Status-specific variants for financial applications
        active:
          "border-transparent bg-success/10 text-success ring-1 ring-success/20",
        inactive:
          "border-transparent bg-muted text-muted-foreground ring-1 ring-border/50",
        pending:
          "border-transparent bg-warning/10 text-warning ring-1 ring-warning/20",
        paid:
          "border-transparent bg-success/10 text-success ring-1 ring-success/20",
        overdue:
          "border-transparent bg-destructive/10 text-destructive ring-1 ring-destructive/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]",
        secondary:
          "border-transparent bg-[var(--surface-2)] text-[var(--text-secondary)]",
        destructive:
          "border-transparent bg-red-500/20 text-[var(--accent-red)]",
        outline: "text-[var(--text-primary)] border-[var(--border)]",
        success:
          "border-transparent bg-emerald-500/20 text-[var(--accent-green)]",
        warning:
          "border-transparent bg-amber-500/20 text-[var(--accent-amber)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

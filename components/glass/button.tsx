"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { hoverEffects, type HoverEffect } from "@/lib/hover-effects";
import {
  liquidProps,
  resolveVariant,
  type LiquidProps,
} from "@/lib/liquid-glass/material";
import { cn } from "@/lib/utils";

/**
 * Glass UI button (registry `@glass-ui/button`), installed under
 * `components/glass` so the dashboard's own Button stays untouched.
 *
 * Default variant is `liquid`: a glass capsule whose press animation comes
 * from `.lg-control:active` — the material squashes, it does not just dim.
 */
const glassButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        liquid: "text-foreground",
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 active:scale-[0.98] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 active:scale-[0.98] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]",
        outline:
          "border-2 border-foreground/20 bg-transparent text-foreground shadow-xs hover:border-foreground/40 hover:bg-foreground/10 active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 active:scale-[0.98]",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        link: "text-primary underline-offset-4 hover:underline active:opacity-80",
      },
      size: {
        default: "h-11 px-5 has-[>svg]:px-4",
        sm: "h-9 gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-13 px-7 has-[>svg]:px-5",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "liquid",
      size: "default",
    },
  },
);

type Variant = NonNullable<
  VariantProps<typeof glassButtonVariants>["variant"]
>;

export type GlassButtonProps = React.ComponentProps<"button"> &
  Omit<VariantProps<typeof glassButtonVariants>, "variant"> &
  LiquidProps & {
    variant?: Variant | null;
    effect?: HoverEffect;
    asChild?: boolean;
  };

function GlassButton({
  className,
  variant,
  size,
  asChild = false,
  material,
  tint,
  glass,
  webgl,
  effect = "none",
  style,
  ...props
}: GlassButtonProps) {
  const Comp = asChild ? Slot : "button";
  const resolved = resolveVariant<Variant>(variant ?? undefined, material);
  const materialProps =
    resolved.variant === "liquid"
      ? liquidProps({
          role: "control",
          material: resolved.material,
          tint,
          glass,
          webgl,
        })
      : null;

  return (
    <Comp
      data-slot="glass-button"
      {...materialProps}
      className={cn(
        glassButtonVariants({ variant: resolved.variant, size }),
        materialProps?.className,
        hoverEffects({ hover: effect }),
        className,
      )}
      style={{ ...materialProps?.style, ...style }}
      {...props}
    />
  );
}

export { GlassButton, glassButtonVariants };

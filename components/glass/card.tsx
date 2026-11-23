import * as React from "react";

import {
  liquidProps,
  resolveVariant,
  type LiquidProps,
} from "@/lib/liquid-glass/material";
import { cn } from "@/lib/utils";

/**
 * Glass UI card (registry `@glass-ui/card`), installed under `components/glass`
 * so the dashboard's own Card stays untouched. Default is a liquid glass
 * surface; `variant="default"` falls back to the plain card.
 */
function GlassCard({
  className,
  variant,
  material,
  tint,
  glass,
  webgl,
  style,
  ...props
}: React.ComponentProps<"div"> &
  LiquidProps & { variant?: "liquid" | "default" }) {
  const resolved = resolveVariant<"liquid" | "default">(variant, material);
  const base = "flex flex-col gap-6 py-6";
  const own =
    resolved.variant === "liquid"
      ? liquidProps(
          {
            role: "surface",
            material: resolved.material,
            tint,
            glass,
            webgl,
          },
          { className: cn(base, className), style },
        )
      : {
          className: cn(
            base,
            "bg-card text-card-foreground rounded-xl border shadow-sm",
            className,
          ),
          style,
        };

  return <div data-slot="glass-card" {...own} {...props} />;
}

function GlassCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function GlassCardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function GlassCardDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function GlassCardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

function GlassCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardFooter,
  GlassCardHeader,
  GlassCardTitle,
};

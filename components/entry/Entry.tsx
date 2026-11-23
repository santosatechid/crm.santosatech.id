import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { GlassBackground } from "@/components/glass/background";
import { GlassCard } from "@/components/glass/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/shadcn/utils";

/**
 * Entry screens share the landing surface: one glass card on the atmospheric
 * backdrop, centered, with the same label hierarchy and 44pt targets. Nothing
 * here is a separate theme.
 */
const clientName = process.env.NEXT_PUBLIC_CLIENT_NAME || "santosa";

export function EntryScreen({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center px-5 py-12">
      <GlassBackground />
      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex min-h-11 items-center gap-1.5 rounded-full text-[14px] font-medium underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:outline-none"
        >
          <ArrowLeft className="size-4" />
          Kembali ke beranda
        </Link>

        <GlassCard className="mt-5 gap-0 rounded-[28px] p-7 sm:p-8">
          <div className="mb-6 flex items-center gap-2.5">
            <span className="flex size-[26px] items-center justify-center rounded-[9px] bg-primary text-[15px] font-bold text-primary-foreground">
              {clientName.slice(0, 1)}
            </span>
            <span className="text-[17px] font-semibold tracking-[-0.3px]">
              {clientName}
            </span>
          </div>
          {children}
        </GlassCard>
      </div>
    </div>
  );
}

/** The stacked column the form lives in. */
export function EntryForm({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-6">{children}</div>;
}

export function EntryHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h1 className="animate-element animate-delay-100 text-[28px] leading-[1.2] font-semibold tracking-tight text-balance">
        {title}
      </h1>
      <p className="animate-element animate-delay-200 text-muted-foreground mt-2 text-[15px] leading-[22px] text-pretty">
        {description}
      </p>
    </div>
  );
}

/** One labelled field. */
export function EntryField({
  label,
  htmlFor,
  hint,
  delay,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  delay?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", delay)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint}
      </div>
      {children}
    </div>
  );
}

/** A named run of fields — a labelled section in the column, no card chrome. */
export function EntryGroup({
  label,
  delay,
  children,
}: {
  label: string;
  delay?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={label}
      className={cn("animate-element space-y-4", delay)}
    >
      <h2 className="text-[11px] font-semibold tracking-[1.8px] text-white/60 uppercase">
        {label}
      </h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

/** The rule that says what comes next, with its label riding on the line. */
export function EntryDivider({
  label,
  delay = "animate-delay-700",
}: {
  label: string;
  delay?: string;
}) {
  return (
    <div
      className={cn(
        "animate-element flex items-center gap-3",
        delay,
      )}
    >
      <span className="h-px flex-1 bg-white/10" />
      <span className="text-[12px] text-white/60">{label}</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

/** The last line of the screen: a question and the way to answer it. */
export function EntryFooter({
  delay = "animate-delay-900",
  children,
}: {
  delay?: string;
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "animate-element text-center text-[13px] text-white/60 text-pretty",
        delay,
      )}
    >
      {children}
    </p>
  );
}

/** A link inside a sentence — the only place the accent appears as text. */
export function EntryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-primary focus-visible:ring-ring/50 rounded-md font-medium underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:outline-none"
    >
      {children}
    </Link>
  );
}

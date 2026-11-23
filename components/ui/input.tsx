import { cn } from "@/lib/shadcn/utils";
import { type ComponentProps } from "react";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "selection:bg-primary selection:text-primary-foreground file:text-foreground placeholder:text-muted-foreground h-10 w-full min-w-0 rounded-md border border-input bg-secondary px-3 py-2 text-[15px] transition-[color,background-color,border-color,box-shadow] outline-none file:mr-3 file:inline-flex file:h-8 file:items-center file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:text-[13px] file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

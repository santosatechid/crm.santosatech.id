import { type ReactNode } from "react";

export default function PrintLayout({ children }: { children: ReactNode }) {
  return (
    <main className="bg-background min-h-screen px-4 py-8 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-3xl">{children}</div>
    </main>
  );
}

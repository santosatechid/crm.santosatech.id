"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PrintButton({ label = "Cetak / Simpan PDF" }: { label?: string }) {
  return (
    <Button onClick={() => window.print()} variant="outline" size="sm">
      <Printer className="mr-1 h-4 w-4" /> {label}
    </Button>
  );
}

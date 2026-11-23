"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alertDialog";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/result";

type ConfirmActionProps = {
  trigger: string;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  disabled?: boolean;
  onConfirm: () => Promise<ActionResult>;
};

export function ConfirmAction({
  trigger,
  title,
  description,
  confirmLabel = "Lanjutkan",
  destructive = false,
  disabled = false,
  onConfirm,
}: ConfirmActionProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={destructive ? "destructive" : "outline"}
          size="sm"
          disabled={disabled}
        >
          {trigger}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              startTransition(async () => {
                const result = await onConfirm();
                if (result.ok) {
                  toast.success(result.message);
                  router.refresh();
                } else {
                  toast.error(result.message);
                }
              });
            }}
          >
            {pending ? "Memproses..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

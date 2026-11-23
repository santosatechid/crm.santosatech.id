"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { FilePlus2 } from "lucide-react";
import { toast } from "sonner";

import { createInvoiceFromTask } from "@/app/actions/invoices";
import { Button } from "@/components/ui/button";

export function CreateInvoiceFromTaskButton({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await createInvoiceFromTask(taskId);
          if (!result.ok) {
            toast.error(result.message);
            return;
          }
          toast.success(result.message);
          router.push(`/dashboard/invoices/${result.data.id}`);
        })
      }
    >
      <FilePlus2 className="mr-1 h-4 w-4" />
      {pending ? "Membuat invoice..." : "Buat invoice"}
    </Button>
  );
}

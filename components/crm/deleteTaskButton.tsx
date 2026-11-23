"use client";

import { useRouter } from "next/navigation";

import { deleteTask } from "@/app/actions/tasks";
import { ConfirmAction } from "@/components/crm/confirmAction";

export function DeleteTaskButton({ taskId }: { taskId: string }) {
  const router = useRouter();

  return (
    <ConfirmAction
      trigger="Hapus tugas"
      title="Hapus tugas?"
      description="Komentar ikut terhapus. Invoice yang sudah dibuat tetap tersimpan."
      confirmLabel="Hapus"
      destructive
      onConfirm={async () => {
        const result = await deleteTask(taskId);
        if (result.ok) router.push("/dashboard/tasks");
        return result;
      }}
    />
  );
}

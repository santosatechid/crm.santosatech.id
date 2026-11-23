"use client";

import { archiveClient } from "@/app/actions/clients";
import { ConfirmAction } from "@/components/crm/confirmAction";

export function ArchiveClientButton({ clientId }: { clientId: string }) {
  return (
    <ConfirmAction
      trigger="Arsipkan"
      title="Arsipkan klien?"
      description="Klien disembunyikan dari daftar, tetapi invoice dan tugas lama tetap tersimpan."
      confirmLabel="Arsipkan"
      destructive
      onConfirm={() => archiveClient(clientId)}
    />
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { createClientNote, deleteClientNote } from "@/app/actions/clients";
import { Button } from "@/components/ui/button";
import { TextAreaField } from "@/components/crm/formFields";
import { dateInputValue, formatDate } from "@/lib/format";

export type ClientNoteItem = {
  id: string;
  content: string;
  occurredAt: Date;
  authorName: string | null;
};

export function ClientNotes({
  clientId,
  notes,
  canManage,
}: {
  clientId: string;
  notes: ClientNoteItem[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [content, setContent] = useState("");
  const [occurredAt, setOccurredAt] = useState(dateInputValue(new Date()));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await createClientNote({ clientId, content, occurredAt });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setContent("");
      router.refresh();
    });
  };

  const handleDelete = (noteId: string) => {
    startTransition(async () => {
      const result = await deleteClientNote(noteId);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {canManage ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <TextAreaField
            id="note-content"
            label="Catatan interaksi"
            value={content}
            onChange={setContent}
            placeholder="Hasil telepon, meeting, atau catatan lain..."
            required
          />
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="note-date">
                Tanggal
              </label>
              <input
                id="note-date"
                type="date"
                className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                value={occurredAt}
                onChange={(event) => setOccurredAt(event.target.value)}
              />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan..." : "Tambah catatan"}
            </Button>
          </div>
        </form>
      ) : null}

      {notes.length === 0 ? (
        <p className="text-muted-foreground text-sm">Belum ada catatan.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {formatDate(note.occurredAt)} · {note.authorName ?? "Sistem"}
                  </p>
                </div>
                {canManage ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => handleDelete(note.id)}
                    aria-label="Hapus catatan"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

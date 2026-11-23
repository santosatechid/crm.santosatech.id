"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { addTaskComment, deleteTaskComment } from "@/app/actions/tasks";
import { TextAreaField } from "@/components/crm/formFields";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";

export type TaskCommentItem = {
  id: string;
  content: string;
  createdAt: Date;
  authorId: string | null;
  authorName: string | null;
};

export function TaskComments({
  taskId,
  comments,
  currentUserId,
}: {
  taskId: string;
  comments: TaskCommentItem[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [content, setContent] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await addTaskComment({ taskId, content });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setContent("");
      router.refresh();
    });
  };

  const handleDelete = (commentId: string) => {
    startTransition(async () => {
      const result = await deleteTaskComment(commentId);
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
      <form onSubmit={handleSubmit} className="space-y-2">
        <TextAreaField
          id="task-comment"
          label="Komentar"
          value={content}
          onChange={setContent}
          required
        />
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Mengirim..." : "Kirim komentar"}
        </Button>
      </form>

      {comments.length === 0 ? (
        <p className="text-muted-foreground text-sm">Belum ada komentar.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {comment.authorName ?? "Sistem"} · {formatDateTime(comment.createdAt)}
                  </p>
                </div>
                {comment.authorId === currentUserId ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={pending}
                    onClick={() => handleDelete(comment.id)}
                    aria-label="Hapus komentar"
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

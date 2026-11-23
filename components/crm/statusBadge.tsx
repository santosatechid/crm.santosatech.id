import { Badge } from "@/components/ui/badge";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const CLIENT_LABEL: Record<string, string> = {
  PROSPECT: "Prospek",
  ACTIVE: "Aktif",
  INACTIVE: "Tidak Aktif",
};

const INVOICE_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Terkirim",
  PARTIALLY_PAID: "Dibayar Sebagian",
  PAID: "Lunas",
  OVERDUE: "Jatuh Tempo",
  CANCELLED: "Dibatalkan",
};

const INVOICE_VARIANT: Record<string, BadgeVariant> = {
  DRAFT: "outline",
  SENT: "secondary",
  PARTIALLY_PAID: "secondary",
  PAID: "default",
  OVERDUE: "destructive",
  CANCELLED: "outline",
};

const TASK_LABEL: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Selesai",
};

const TASK_VARIANT: Record<string, BadgeVariant> = {
  TODO: "outline",
  IN_PROGRESS: "secondary",
  DONE: "default",
};

const PRIORITY_LABEL: Record<string, string> = {
  LOW: "Rendah",
  MEDIUM: "Sedang",
  HIGH: "Tinggi",
};

const PRIORITY_VARIANT: Record<string, BadgeVariant> = {
  LOW: "outline",
  MEDIUM: "secondary",
  HIGH: "destructive",
};

const SIGNATURE_LABEL: Record<string, string> = {
  PENDING: "Menunggu",
  VIEWED: "Dilihat",
  SIGNED: "Ditandatangani",
  DECLINED: "Ditolak",
  EXPIRED: "Kedaluwarsa",
  REVOKED: "Dicabut",
};

const SIGNATURE_VARIANT: Record<string, BadgeVariant> = {
  PENDING: "secondary",
  VIEWED: "outline",
  SIGNED: "default",
  DECLINED: "destructive",
  EXPIRED: "outline",
  REVOKED: "outline",
};

type StatusKind = "client" | "invoice" | "task" | "priority" | "signature";

function config(kind: StatusKind, value: string): { label: string; variant: BadgeVariant } {
  switch (kind) {
    case "client":
      return { label: CLIENT_LABEL[value] ?? value, variant: value === "ACTIVE" ? "default" : "secondary" };
    case "invoice":
      return { label: INVOICE_LABEL[value] ?? value, variant: INVOICE_VARIANT[value] ?? "outline" };
    case "task":
      return { label: TASK_LABEL[value] ?? value, variant: TASK_VARIANT[value] ?? "outline" };
    case "priority":
      return { label: PRIORITY_LABEL[value] ?? value, variant: PRIORITY_VARIANT[value] ?? "outline" };
    case "signature":
      return { label: SIGNATURE_LABEL[value] ?? value, variant: SIGNATURE_VARIANT[value] ?? "outline" };
  }
}

export function StatusBadge({
  kind,
  value,
}: {
  kind: StatusKind;
  value: string;
}) {
  const { label, variant } = config(kind, value);
  return <Badge variant={variant}>{label}</Badge>;
}

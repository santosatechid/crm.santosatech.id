"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search, Users } from "lucide-react";

import { ClientFormDialog } from "@/components/crm/clientFormDialog";
import { EmptyState } from "@/components/crm/emptyState";
import { StatusBadge } from "@/components/crm/statusBadge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";

export type ClientListItem = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: Date;
  _count: { contacts: number; invoices: number; tasks: number };
};

export function ClientsView({
  clients,
  canManage,
}: {
  clients: ClientListItem[];
  canManage: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return clients.filter((client) => {
      if (status !== "ALL" && client.status !== status) return false;
      if (!needle) return true;
      return [client.name, client.email ?? "", client.phone ?? ""].some((value) =>
        value.toLowerCase().includes(needle),
      );
    });
  }, [clients, query, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            className="pl-8"
            placeholder="Cari nama, email, atau telepon..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua status</SelectItem>
            <SelectItem value="PROSPECT">Prospek</SelectItem>
            <SelectItem value="ACTIVE">Aktif</SelectItem>
            <SelectItem value="INACTIVE">Tidak Aktif</SelectItem>
          </SelectContent>
        </Select>
        {canManage ? <ClientFormDialog trigger="Tambah klien" /> : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum ada klien"
          description="Tambahkan klien pertama untuk mulai membuat tugas dan invoice."
          action={canManage ? <ClientFormDialog trigger={<><Plus className="mr-1 h-4 w-4" />Tambah klien</>} /> : undefined}
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Tugas</TableHead>
                <TableHead>Dibuat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="font-medium hover:underline"
                    >
                      {client.name}
                    </Link>
                    <p className="text-muted-foreground text-xs">
                      {client.email ?? client.phone ?? "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge kind="client" value={client.status} />
                  </TableCell>
                  <TableCell>{client._count.contacts}</TableCell>
                  <TableCell>{client._count.invoices}</TableCell>
                  <TableCell>{client._count.tasks}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(client.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

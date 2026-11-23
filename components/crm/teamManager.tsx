"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  inviteMember,
  removeMember,
  updateMemberRole,
} from "@/app/actions/team";
import { ConfirmAction } from "@/components/crm/confirmAction";
import { SelectField, TextField } from "@/components/crm/formFields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ROLE_LABEL } from "@/lib/permissions";
import { formatDate } from "@/lib/format";

export type TeamMember = {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  role: string;
};

export type TeamInvite = {
  id: string;
  email: string;
  role: string;
  expiresAt: Date;
};

export function TeamManager({
  members,
  invites,
  currentRole,
  currentUserId,
}: {
  members: TeamMember[];
  invites: TeamInvite[];
  currentRole: string;
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteNote, setInviteNote] = useState<string | null>(null);
  const [invite, setInvite] = useState({ email: "", role: "MEMBER" });

  const canChangeRole = currentRole === "OWNER";

  const handleInvite = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await inviteMember(invite);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setInviteLink(result.data.link);
      setInviteNote(
        result.data.emailSent
          ? "Email undangan sudah dikirim."
          : (result.data.reason ?? "Bagikan tautan undangan ini."),
      );
      setInvite({ email: "", role: "MEMBER" });
      router.refresh();
    });
  };

  const handleRole = (membershipId: string, role: string) => {
    startTransition(async () => {
      const result = await updateMemberRole({ membershipId, role });
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
      <div className="flex justify-end">
        <Dialog
          open={open}
          onOpenChange={(value) => {
            setOpen(value);
            if (!value) {
              setInviteLink(null);
              setInviteNote(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm">Undang anggota</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Undang anggota</DialogTitle>
              <DialogDescription>
                Anggota diundang lewat email dan tautan undangan.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4">
              <TextField
                id="invite-email"
                label="Email"
                type="email"
                value={invite.email}
                onChange={(email) => setInvite((current) => ({ ...current, email }))}
                required
              />
              <SelectField
                id="invite-role"
                label="Peran"
                value={invite.role}
                onChange={(role) => setInvite((current) => ({ ...current, role }))}
                options={[
                  { value: "ADMIN", label: "Admin" },
                  { value: "MEMBER", label: "Member" },
                ]}
              />
              {inviteLink ? (
                <div className="space-y-1 rounded-lg border p-3 text-sm">
                  <p className="font-medium">Tautan undangan</p>
                  <code className="block truncate text-xs">{inviteLink}</code>
                  {inviteNote ? (
                    <p className="text-muted-foreground text-xs">{inviteNote}</p>
                  ) : null}
                </div>
              ) : null}
              <DialogFooter>
                <Button type="submit" disabled={pending}>
                  {pending ? "Mengirim..." : "Kirim undangan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="p-3">Nama</th>
              <th className="p-3">Email</th>
              <th className="p-3">Peran</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.membershipId} className="border-t">
                <td className="p-3">{member.name}</td>
                <td className="p-3">{member.email}</td>
                <td className="p-3">
                  {canChangeRole ? (
                    <select
                      className="border-input bg-background h-8 rounded-md border px-2 text-sm"
                      value={member.role}
                      disabled={pending}
                      onChange={(event) =>
                        handleRole(member.membershipId, event.target.value)
                      }
                    >
                      {Object.entries(ROLE_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    (ROLE_LABEL[member.role] ?? member.role)
                  )}
                </td>
                <td className="p-3 text-right">
                  {member.userId === currentUserId ? null : (
                    <ConfirmAction
                      trigger="Keluarkan"
                      title="Keluarkan anggota?"
                      description="Anggota kehilangan akses ke workspace ini."
                      confirmLabel="Keluarkan"
                      destructive
                      onConfirm={() => removeMember(member.membershipId)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Undangan menunggu</p>
        {invites.length === 0 ? (
          <p className="text-muted-foreground text-sm">Tidak ada undangan aktif.</p>
        ) : (
          <ul className="space-y-2">
            {invites.map((inviteItem) => (
              <li
                key={inviteItem.id}
                className="flex items-center justify-between rounded-lg border p-3 text-sm"
              >
                <span>{inviteItem.email}</span>
                <span className="text-muted-foreground text-xs">
                  {ROLE_LABEL[inviteItem.role]} · berlaku sampai{" "}
                  {formatDate(inviteItem.expiresAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

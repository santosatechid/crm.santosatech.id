import { PageHeader } from "@/components/crm/pageHeader";
import { ProfileForm } from "@/components/crm/profileForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { ROLE_LABEL } from "@/lib/permissions";
import { requireWorkspace } from "@/services/auth/session";
import { prisma } from "@/services/prisma";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { user, workspace, membership } = await requireWorkspace();
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, phone: true, createdAt: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Profil" description="Identitas akun Anda." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Akun</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Email: </span>
              {profile?.email ?? user.email}
            </p>
            <p>
              <span className="text-muted-foreground">Workspace: </span>
              {workspace.name}
            </p>
            <p>
              <span className="text-muted-foreground">Peran: </span>
              {ROLE_LABEL[membership.role]}
            </p>
            <p>
              <span className="text-muted-foreground">Bergabung: </span>
              {formatDate(profile?.createdAt)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ubah profil</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm
              initial={{
                name: profile?.name ?? user.name,
                phone: profile?.phone ?? "",
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

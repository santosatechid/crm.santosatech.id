import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { GlassBackground } from "@/components/glass/background";
import OnboardingForm from "./onboardingForm";
import { auth } from "@/services/auth/auth";
import { prisma } from "@/services/prisma";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/auth/signIn");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { clientId: true },
  });

  if (user?.clientId) redirect("/dashboard");

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <GlassBackground />
      <div className="relative z-10 w-full max-w-lg">
        <OnboardingForm
        defaultName={session.user.name}
          defaultEmail={session.user.email}
        />
      </div>
    </main>
  );
}

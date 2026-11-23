"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { acceptInvite } from "@/app/actions/team";
import { Button } from "@/components/ui/button";

export function AcceptInviteButton({ token }: { token: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await acceptInvite(token);
          if (!result.ok) {
            toast.error(result.message);
            return;
          }
          toast.success(result.message);
          router.push("/dashboard");
          router.refresh();
        })
      }
    >
      {pending ? "Bergabung..." : "Terima undangan"}
    </Button>
  );
}

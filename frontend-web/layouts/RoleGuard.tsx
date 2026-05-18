"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { dashboardPathForRole, getAuthSession, isRoleAllowed } from "@/lib/auth";
import type { UserRoleName } from "@/types/user";
import { LoadingState } from "@/components/ui/LoadingState";

export function RoleGuard({ role, children }: { role: UserRoleName; children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    if (!isRoleAllowed(session.role?.name, role)) {
      router.replace(dashboardPathForRole(session.role?.name));
      return;
    }
    setReady(true);
  }, [role, router]);

  if (!ready) {
    return <LoadingState label="Memeriksa sesi..." />;
  }

  return children;
}

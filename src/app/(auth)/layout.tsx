"use client";

import type { ReactNode } from "react";
import { DashboardShell } from "@/components/Dashboard/DashboardShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}

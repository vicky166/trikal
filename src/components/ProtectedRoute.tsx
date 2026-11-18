"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !configured || user) return;
    router.replace("/login");
  }, [configured, loading, router, user]);

  if (!configured) {
    return <p className="p-8 text-stone-300">Supabase is not configured for this app.</p>;
  }
  if (loading || !user) {
    return <p className="p-8 text-stone-400">Loading account…</p>;
  }
  return children;
}

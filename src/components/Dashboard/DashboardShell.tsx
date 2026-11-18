"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";
import { signOut } from "@/lib/auth/auth";
import { getSupabase } from "@/lib/supabase/client";

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState("");

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !user) return;
    let active = true;
    void supabase
      .from("users")
      .select("name, email")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active || !data) return;
        setName(typeof data.name === "string" && data.name ? data.name : data.email ?? "");
      });
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-stone-800 px-5 py-4">
        <p className="text-sm tracking-[0.2em] text-amber-200/80">TRIKAL</p>
        <nav className="flex items-center gap-4 text-sm">
          <Link className={pathname === "/" ? "text-stone-100" : "text-stone-400"} href="/">
            Dashboard
          </Link>
          <Link className={pathname === "/chat" ? "text-stone-100" : "text-stone-400"} href="/chat">
            Chat
          </Link>
        </nav>
        <div className="flex items-center gap-3 text-sm text-stone-300">
          <span>{name || user?.email}</span>
          <button
            className="rounded-lg border border-stone-700 px-3 py-2"
            type="button"
            onClick={() => {
              void signOut().then(() => router.replace("/login"));
            }}
          >
            Log out
          </button>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}

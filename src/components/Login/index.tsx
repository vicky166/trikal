"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmail } from "@/lib/auth/auth";
import { AuthField, AuthLink, AuthShell } from "@/components/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!email.includes("@") || password.length < 8) {
      setError("Enter a valid email and a password of at least 8 characters.");
      return;
    }
    setBusy(true);
    const result = await signInWithEmail(email.trim(), password);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.replace("/");
  }

  return (
    <AuthShell
      title="Log in"
      footer={<AuthLink href="/signup">Need an account?</AuthLink>}
    >
      <form className="flex flex-col gap-4" onSubmit={(event) => void onSubmit(event)} noValidate>
        <AuthField label="Email" type="email" autoComplete="email" value={email} disabled={busy} onChange={setEmail} />
        <AuthField label="Password" type="password" autoComplete="current-password" value={password} disabled={busy} onChange={setPassword} />
        <button className="min-h-12 rounded-xl bg-stone-100 text-stone-950 disabled:opacity-60" type="submit" disabled={busy}>
          {busy ? "Please wait" : "Log in"}
        </button>
      </form>
      {error ? <p className="text-sm leading-6 text-red-300">{error}</p> : null}
    </AuthShell>
  );
}

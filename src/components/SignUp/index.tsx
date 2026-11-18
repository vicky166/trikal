"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signUpWithEmail } from "@/lib/auth/auth";
import { AuthField, AuthLink, AuthShell } from "@/components/AuthShell";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 80 || !email.includes("@") || password.length < 8) {
      setError("Enter your name, a valid email, and a password of at least 8 characters.");
      return;
    }
    setBusy(true);
    const result = await signUpWithEmail(trimmedName, email.trim(), password);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    if (result.needsEmailConfirm) {
      setNotice("Account created. Open the confirmation email from Supabase, then log in.");
      return;
    }
    router.replace("/");
  }

  return (
    <AuthShell
      title="Create an account"
      footer={
        <AuthLink href="/login">Already have an account?</AuthLink>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={(event) => void onSubmit(event)} noValidate>
        <AuthField label="Full name" type="text" autoComplete="name" value={name} disabled={busy} onChange={setName} />
        <AuthField label="Email" type="email" autoComplete="email" value={email} disabled={busy} onChange={setEmail} />
        <AuthField label="Password" type="password" autoComplete="new-password" value={password} disabled={busy} onChange={setPassword} />
        <button className="min-h-12 rounded-xl bg-stone-100 text-stone-950 disabled:opacity-60" type="submit" disabled={busy}>
          {busy ? "Please wait" : "Create account"}
        </button>
      </form>
      {error ? <p className="text-sm leading-6 text-red-300">{error}</p> : null}
      {notice ? <p className="text-sm leading-6 text-stone-300">{notice}</p> : null}
    </AuthShell>
  );
}

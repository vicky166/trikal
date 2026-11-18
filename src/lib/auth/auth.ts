import type { AuthError, Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";

export type AuthResult =
  | { ok: true; session: Session | null; needsEmailConfirm: boolean }
  | { ok: false; message: string };

export async function signUpWithEmail(name: string, email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, message: "Supabase is not configured." };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name }, emailRedirectTo: `${window.location.origin}/login` },
  });
  if (error) return { ok: false, message: readableAuthError(error) };
  const duplicate = Array.isArray(data.user?.identities) && data.user.identities.length === 0;
  if (duplicate) return { ok: false, message: "An account with this email already exists. Log in instead." };
  return { ok: true, session: data.session, needsEmailConfirm: !data.session };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, message: "Supabase is not configured." };
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: readableAuthError(error) };
  return { ok: true, session: data.session, needsEmailConfirm: !data.session };
}

export async function signOut(): Promise<void> {
  await getSupabase()?.auth.signOut();
}

function readableAuthError(error: AuthError): string {
  const text = `${error.code ?? ""} ${error.message}`.toLowerCase();
  if (text.includes("rate limit")) {
    return "Supabase stopped sending email for a while. In Authentication, turn off Confirm email, or wait about an hour and try again.";
  }
  if (text.includes("invalid_credentials") || text.includes("invalid login")) return "The email or password does not match an account.";
  if (text.includes("not confirmed") || text.includes("email_not_confirmed")) return "Confirm the email from Supabase before logging in.";
  if (text.includes("already")) return "An account with this email already exists. Log in instead.";
  return error.message;
}

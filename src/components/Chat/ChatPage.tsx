"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getSupabase } from "@/lib/supabase/client";

type ChatLine = { id: string; role: "user" | "assistant"; body: string };

export function ChatPage() {
  const { user } = useAuth();
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !user) return;
    let active = true;
    void supabase
      .from("messages")
      .select("id, role, body")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !data) {
          setNote("Chat is on this page. Saved history appears after the messages table exists.");
          return;
        }
        setLines(
          data
            .filter((row) => row.role === "user" || row.role === "assistant")
            .map((row) => ({ id: String(row.id), role: row.role, body: String(row.body) })),
        );
      });
    return () => {
      active = false;
    };
  }, [user]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !user) return;
    setBusy(true);
    setDraft("");
    const local: ChatLine = { id: crypto.randomUUID(), role: "user", body };
    setLines((current) => [...current, local]);
    const saved = await saveMessage(user.id, body);
    setBusy(false);
    if (!saved) setNote("The message is on this screen. It was not saved because the chat tables are not ready.");
  }

  return (
    <section className="mx-auto flex h-full min-h-[70vh] w-full max-w-3xl flex-col px-5 py-8">
      <h1 className="text-3xl text-stone-100">Chat</h1>
      <p className="mt-2 text-sm leading-6 text-stone-400">
        Write a message. It stays in your account when the database tables are ready. No model answer is invented.
      </p>
      <div className="mt-6 flex flex-1 flex-col gap-3">
        {lines.length === 0 ? <p className="text-sm text-stone-500">No messages yet.</p> : null}
        {lines.map((line) => (
          <p
            key={line.id}
            className={
              line.role === "user"
                ? "max-w-[80%] self-end rounded-2xl bg-stone-100 px-4 py-3 text-stone-950"
                : "max-w-[80%] self-start rounded-2xl border border-stone-800 px-4 py-3 text-stone-200"
            }
          >
            {line.body}
          </p>
        ))}
      </div>
      {note ? <p className="mt-4 text-sm text-amber-200/80">{note}</p> : null}
      <form className="mt-4 flex gap-3" onSubmit={(event) => void onSubmit(event)}>
        <input
          className="min-h-12 flex-1 rounded-xl border border-stone-700 bg-stone-900 px-3 text-stone-100 outline-none"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a message"
          disabled={busy}
        />
        <button className="min-h-12 rounded-xl bg-stone-100 px-5 text-stone-950 disabled:opacity-60" type="submit" disabled={busy}>
          Send
        </button>
      </form>
    </section>
  );
}

async function saveMessage(userId: string, body: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const existing = await supabase
    .from("conversations")
    .select("id")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing.error) return false;
  let conversationId = existing.data?.id as string | undefined;
  if (!conversationId) {
    const created = await supabase.from("conversations").insert({ user_id: userId, title: "Chat", language: "en" }).select("id").single();
    if (created.error || !created.data) return false;
    conversationId = created.data.id as string;
  }
  const inserted = await supabase.from("messages").insert({
    conversation_id: conversationId,
    user_id: userId,
    role: "user",
    body,
  });
  return !inserted.error;
}

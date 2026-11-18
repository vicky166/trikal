"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <p className="text-sm tracking-[0.2em] text-amber-200/80">TRIKAL</p>
      <h1 className="mt-3 text-4xl text-stone-100">{title}</h1>
      <div className="mt-8 flex flex-col gap-4">{children}</div>
      <div className="mt-6 flex flex-col gap-2 text-sm text-stone-400">{footer}</div>
    </main>
  );
}

export function AuthField({
  label,
  type,
  value,
  autoComplete,
  onChange,
  disabled,
}: {
  label: string;
  type: string;
  value: string;
  autoComplete: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-stone-300">
      {label}
      <input
        className="min-h-12 rounded-xl border border-stone-700 bg-stone-900 px-3 text-base text-stone-100 outline-none focus:border-amber-200/60"
        type={type}
        autoComplete={autoComplete}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function AuthLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-stone-300 underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}

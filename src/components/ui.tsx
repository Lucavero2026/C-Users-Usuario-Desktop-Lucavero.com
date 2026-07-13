"use client";

import * as React from "react";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

const inputBase =
  "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-base outline-none transition-shadow placeholder:text-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/10";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className = "", ...props }, ref) {
  return <input ref={ref} className={`${inputBase} ${className}`} {...props} />;
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = "", ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={`${inputBase} min-h-32 resize-y ${className}`}
      {...props}
    />
  );
});

export function Select({
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${inputBase} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Button({
  className = "",
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
}) {
  const styles = {
    primary: "bg-brand text-white hover:bg-brand-600",
    outline: "border border-border bg-surface hover:bg-surface-muted",
    ghost: "hover:bg-surface-muted",
  }[variant];
  return (
    <button
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
      {...props}
    />
  );
}

export function ResultBox({
  children,
  tone = "brand",
}: {
  children: React.ReactNode;
  tone?: "brand" | "financas" | "trabalhista" | "consultas" | "utilidades";
}) {
  const bg = {
    brand: "var(--brand-soft)",
    financas: "var(--c-financas-soft)",
    trabalhista: "var(--c-trabalhista-soft)",
    consultas: "var(--c-consultas-soft)",
    utilidades: "var(--c-utilidades-soft)",
  }[tone];
  return (
    <div
      className="rounded-2xl border border-border p-5"
      style={{ background: bg }}
    >
      {children}
    </div>
  );
}

/** Linha rótulo → valor, usada nos resultados. */
export function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-1.5 ${
        strong ? "border-t border-border/70 pt-2.5 mt-1" : ""
      }`}
    >
      <span className={strong ? "font-semibold" : "text-muted"}>{label}</span>
      <span
        className={`tabular-nums ${strong ? "text-lg font-bold" : "font-medium"}`}
      >
        {value}
      </span>
    </div>
  );
}

export function CopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <Button
      variant="outline"
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          /* ignore */
        }
      }}
    >
      {copied ? "Copiado!" : label}
    </Button>
  );
}

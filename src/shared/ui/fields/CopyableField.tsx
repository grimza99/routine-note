"use client";

import { useState } from "react";

type CopyableFieldProps = {
  label?: string;
  value: string;
  helperText?: string;
};

export function CopyableField({ label, value, helperText }: CopyableFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (error) {
      console.error("Failed to copy", error);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {label}
        </span>
      ) : null}
      <div
        className="flex items-center gap-3 rounded px-3 py-2"
        style={{
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-base)",
          background: "var(--white)",
        }}
      >
        <span className="flex-1 truncate text-sm" style={{ color: "var(--text-primary)" }}>
          {value}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded px-3 py-1 text-xs font-semibold"
          style={{
            border: "1px solid var(--primary)",
            color: "var(--primary)",
            background: "var(--white)",
            borderRadius: "var(--radius-base)",
          }}
          aria-live="polite"
        >
          {copied ? "복사됨" : "복사"}
        </button>
      </div>
      {helperText ? (
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
}

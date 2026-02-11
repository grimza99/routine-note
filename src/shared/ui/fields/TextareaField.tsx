import type { TextareaHTMLAttributes } from "react";

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  helperText?: string;
};

export function TextareaField({ label, helperText, ...props }: TextareaFieldProps) {
  const isDisabled = Boolean(props.disabled);

  return (
    <label className="flex flex-col gap-2">
      {label ? (
        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {label}
        </span>
      ) : null}
      <textarea
        {...props}
        className="min-h-[120px] w-full rounded px-3 py-2 text-sm"
        style={{
          border: `1px solid ${isDisabled ? "var(--disabled)" : "var(--primary)"}`,
          borderRadius: "var(--radius-base)",
          color: isDisabled ? "var(--disabled)" : "var(--primary)",
          background: "var(--white)",
          resize: "vertical",
        }}
      />
      {helperText ? (
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {helperText}
        </span>
      ) : null}
    </label>
  );
}

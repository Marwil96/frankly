"use client";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {label && <label className="text-[11px]">{label}</label>}
      <input
        className={`bg-white shadow-win95-sunken px-1 py-0.5 text-[11px] outline-none ${className}`}
        {...props}
      />
    </div>
  );
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className = "", ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {label && <label className="text-[11px]">{label}</label>}
      <textarea
        className={`bg-white shadow-win95-sunken px-1 py-0.5 text-[11px] outline-none resize-y ${className}`}
        {...props}
      />
    </div>
  );
}

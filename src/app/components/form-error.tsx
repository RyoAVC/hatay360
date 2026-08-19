import { AlertTriangle } from "lucide-react";

type FormErrorProps = {
  children: string;
  tone?: "light" | "dark";
};

export function FormError({ children, tone = "light" }: FormErrorProps) {
  if (!children) return null;
  const dark = tone === "dark";
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-2xl border-2 px-4 py-3.5 text-[14px] font-bold leading-snug shadow-[0_10px_28px_rgba(185,28,28,0.18)] ${
        dark ? "border-red-400 bg-red-950 text-red-50" : "border-red-500 bg-[#fff1f1] text-red-800"
      }`}
    >
      <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${dark ? "text-red-300" : "text-red-600"}`} />
      <p>{children}</p>
    </div>
  );
}

export function FieldHint({ children, error = false }: { children: string; error?: boolean }) {
  return (
    <p className={`mt-1.5 text-[12px] font-bold ${error ? "text-red-600" : "text-[#6b7280]"}`}>
      {children}
    </p>
  );
}

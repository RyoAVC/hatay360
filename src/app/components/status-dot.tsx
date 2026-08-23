import { OPS_DOT_LABELS, type OpsDot } from "../lib/ops-status";

export function StatusDot({
  kind,
  label,
  className = "",
}: {
  kind: OpsDot;
  label?: string;
  className?: string;
}) {
  const text = label ?? OPS_DOT_LABELS[kind];
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <i className={`status-dot status-dot-${kind}`} aria-hidden="true" />
      <span className="text-[8px] font-black uppercase tracking-[0.12em]">{text}</span>
    </span>
  );
}

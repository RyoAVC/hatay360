// Aktivite Kaydı (Audit Log, P9) — istemci tarafı tip ve Türkçe etiket haritaları.

export type AuditLog = {
  id: number;
  actorType: string;
  actorId: number | null;
  actorLabel: string;
  customerId: number | null;
  action: string;
  target: string;
  ip: string;
  meta: string;
  createdAt: string;
};

export type AuditMeta = { page: number; perPage: number; total: number };
export type AuditResponse = { rows: AuditLog[]; meta: AuditMeta };

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  login: "Giriş",
  login_failed: "Başarısız giriş",
  invoice_view: "Fatura görüntüleme",
  file_download: "Dosya indirme",
  approval_approve: "Onay verildi",
  approval_revise: "Revize istendi",
  quote_create: "Teklif gönderildi",
  quote_accept: "Teklif kabul edildi",
  ticket_open: "Destek talebi",
  extra_request: "Ek hizmet talebi",
  user_create: "Kullanıcı eklendi",
  stage_change: "Aşama değişikliği",
  renewal_add: "Yenileme eklendi",
  referral_reward: "Tavsiye ödülü",
  password_change: "Şifre değişikliği",
};

export const AUDIT_ACTOR_LABELS: Record<string, string> = {
  customer: "Müşteri",
  customer_user: "Alt kullanıcı",
  admin: "Yönetici",
  partner: "Bayi",
  system: "Sistem",
};

export const AUDIT_ACTIONS = Object.keys(AUDIT_ACTION_LABELS);
export const AUDIT_ACTOR_TYPES = Object.keys(AUDIT_ACTOR_LABELS);

export function auditActionLabel(action: string): string {
  return AUDIT_ACTION_LABELS[action] || action;
}

export function auditActorLabel(actorType: string): string {
  return AUDIT_ACTOR_LABELS[actorType] || actorType;
}

// Giriş/başarısız giriş gibi işlemlerin tabloda renk tonu.
export function auditActionTone(action: string): string {
  if (action === "login_failed") return "bg-rose-500/15 text-rose-200 border-rose-400/30";
  if (action === "login" || action === "approval_approve" || action === "quote_accept") return "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";
  if (action === "approval_revise" || action === "password_change") return "bg-amber-500/15 text-amber-200 border-amber-400/30";
  return "bg-cyan-500/15 text-cyan-100 border-cyan-400/30";
}

export function formatAuditTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" });
}

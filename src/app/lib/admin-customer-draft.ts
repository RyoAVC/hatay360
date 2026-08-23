export type AdminCustomerDraft = {
  leadId?: number;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  sector?: string;
  district?: string;
  service?: string;
  address?: string;
  kind?: string;
};

const STORAGE_KEY = "hatay360.admin.customer.draft";

function clip(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

function sanitizeDraft(raw: unknown): AdminCustomerDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const input = raw as Record<string, unknown>;
  const draft: AdminCustomerDraft = {
    companyName: clip(input.companyName, 80),
    contactName: clip(input.contactName, 80),
    email: clip(input.email, 80),
    phone: clip(input.phone, 14),
  };
  const leadId = Number(input.leadId);
  if (Number.isFinite(leadId) && leadId > 0) draft.leadId = Math.floor(leadId);
  const sector = clip(input.sector, 80);
  const district = clip(input.district, 80);
  const service = clip(input.service, 120);
  const address = clip(input.address, 200);
  const kind = clip(input.kind, 40);
  if (sector) draft.sector = sector;
  if (district) draft.district = district;
  if (service) draft.service = service;
  if (address) draft.address = address;
  if (kind) draft.kind = kind;
  return draft;
}

export function writeAdminCustomerDraft(input: Partial<AdminCustomerDraft>) {
  const draft = sanitizeDraft(input);
  if (!draft) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* ignore quota / private mode */
  }
}

export function readAdminCustomerDraft(): AdminCustomerDraft | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return sanitizeDraft(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function clearAdminCustomerDraft() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { copyFileSync, createReadStream, existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { DatabaseSync } from "node:sqlite";
import { resolve4, resolveAny, resolveMx } from "node:dns/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  defaultPaymentDates,
  isAccountStatus,
  isCatalogKind,
  isSiteStatus,
  resolvePaymentAmounts,
  summarizePayments,
} from "./src/app/lib/payment-balance.ts";
import { countPortalNapIssues } from "./src/app/lib/seo.ts";
import { buildContractPdf, buildInvoicePdf, buildQuotePdf, htmlToPlain } from "./src/app/lib/contract-pdf.mjs";
import {
  bindCustomerOtp,
  OTP_SMTP_UNAVAILABLE_TR,
  OTP_DASHBOARD_REASON,
  SMTP_NOT_CONFIGURED,
  sendCustomerOtpEmail,
} from "./src/app/lib/customer-otp.ts";
import {
  GATEWAY_NOT_CONFIGURED,
  GATEWAY_NOT_CONNECTED_TR,
  GATEWAY_PREPARING_TR,
  paymentGatewayStatus,
  startIyzicoCheckout,
} from "./src/app/lib/iyzico-checkout.ts";
import { createExampleBayilikSartlari, normalizeBayilikSartlari } from "./src/app/lib/bayilik-sartlari.ts";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, "dist");

function applyEnvFile(filePath) {
  if (!filePath || !existsSync(filePath)) return false;
  const text = readFileSync(filePath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index <= 0) continue;
    const key = line.slice(0, index).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let value = line.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
  return true;
}

function domainRootFromAppPath(appPath) {
  const match = appPath.match(/^(.*[/\\]domains[/\\][^/\\]+)[/\\]/);
  return match?.[1] || null;
}

for (const filePath of [
  path.join(ROOT, "hatay360.runtime.env"),
  path.join(ROOT, ".env"),
  path.join(process.cwd(), ".env"),
  path.join(domainRootFromAppPath(ROOT) || "", ".env"),
  path.join(domainRootFromAppPath(ROOT) || "", "public_html", ".env"),
  path.join(domainRootFromAppPath(ROOT) || "", "public_html", "hatay360.runtime.env"),
]) {
  applyEnvFile(filePath);
}

const domainRoot = domainRootFromAppPath(ROOT);
const DATA_DIR = path.resolve(
  process.env.HATAY360_DATA_DIR ||
    (domainRoot && ROOT.includes(`${path.sep}hbuilds${path.sep}`)
      ? path.join(domainRoot, "data")
      : path.join(ROOT, "data")),
);
const PORT = Number(process.env.PORT || 3601);
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const SESSION_COOKIE = "hatay360_session";
const CUSTOMER_SESSION_COOKIE = "hatay360_customer_session";
const CUSTOMER_OTP_COOKIE = "hatay360_customer_otp";
const PARTNER_SESSION_COOKIE = "hatay360_partner_session";
const SESSION_HOURS = 12;
const PARTNER_TRUSTED_SESSION_DAYS = 30;
const OTP_PENDING_MINUTES = 10;
const STEPUP_MINUTES = 30;
const LEAD_KINDS = new Set(["callback", "maps", "new_customer", "partner", "partner_referral"]);
const CONTENT_KEYS = ["plans", "slides", "services", "sectors", "references", "settings"];

mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(path.join(DATA_DIR, "hatay360.sqlite"));
db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;");
db.exec(`
  CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS admin_sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS login_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    visitor_hash TEXT NOT NULL,
    success INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS content_sections (
    key TEXT PRIMARY KEY,
    json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS franchise_terms (
    brand_id TEXT PRIMARY KEY,
    json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    service TEXT NOT NULL,
    source_path TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS pageviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL,
    referrer TEXT NOT NULL,
    utm_source TEXT NOT NULL,
    utm_campaign TEXT NOT NULL,
    visitor_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS pageviews_created_idx ON pageviews(created_at);
  CREATE INDEX IF NOT EXISTS pageviews_path_idx ON pageviews(path);
  CREATE INDEX IF NOT EXISTS leads_created_idx ON leads(created_at);
  CREATE TABLE IF NOT EXISTS customer_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS customer_sessions (
    token_hash TEXT PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS ad_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    platform TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    monthly_budget REAL NOT NULL DEFAULT 0,
    management_fee REAL NOT NULL DEFAULT 0,
    start_date TEXT NOT NULL,
    end_date TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS campaign_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
    period_start TEXT NOT NULL,
    period_end TEXT NOT NULL,
    spend REAL NOT NULL DEFAULT 0,
    impressions INTEGER NOT NULL DEFAULT 0,
    clicks INTEGER NOT NULL DEFAULT 0,
    leads INTEGER NOT NULL DEFAULT 0,
    conversions INTEGER NOT NULL DEFAULT 0,
    revenue REAL NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL,
    UNIQUE(campaign_id, period_start, period_end)
  );
  CREATE TABLE IF NOT EXISTS customer_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    priority TEXT NOT NULL DEFAULT 'normal',
    admin_reply TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS customer_service_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
    service TEXT NOT NULL,
    details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS customer_domain_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    result TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS ad_campaigns_customer_idx ON ad_campaigns(customer_id);
  CREATE INDEX IF NOT EXISTS campaign_stats_campaign_idx ON campaign_stats(campaign_id);
  CREATE INDEX IF NOT EXISTS customer_tickets_customer_idx ON customer_tickets(customer_id);
  CREATE TABLE IF NOT EXISTS customer_maps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    maps_url TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS customer_daily_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
    day TEXT NOT NULL,
    ads_clicks INTEGER NOT NULL DEFAULT 0,
    ads_impressions INTEGER NOT NULL DEFAULT 0,
    ads_spend REAL NOT NULL DEFAULT 0,
    site_visitors INTEGER NOT NULL DEFAULT 0,
    site_sessions INTEGER NOT NULL DEFAULT 0,
    source TEXT NOT NULL DEFAULT 'sample',
    UNIQUE(customer_id, day)
  );
  CREATE INDEX IF NOT EXISTS customer_maps_customer_idx ON customer_maps(customer_id);
  CREATE INDEX IF NOT EXISTS customer_daily_metrics_customer_idx ON customer_daily_metrics(customer_id, day);
  CREATE TABLE IF NOT EXISTS partner_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    website TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    commission_rate REAL NOT NULL DEFAULT 20,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS partner_sessions (
    token_hash TEXT PRIMARY KEY,
    partner_id INTEGER NOT NULL REFERENCES partner_accounts(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS partner_payment_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partner_id INTEGER NOT NULL REFERENCES partner_accounts(id) ON DELETE CASCADE,
    amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS partner_contract_acceptances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partner_id INTEGER NOT NULL REFERENCES partner_accounts(id) ON DELETE CASCADE,
    brand_id TEXT NOT NULL,
    full_name TEXT NOT NULL,
    terms_snapshot TEXT NOT NULL,
    terms_updated_at TEXT NOT NULL,
    accepted_at TEXT NOT NULL,
    ip TEXT NOT NULL,
    user_agent TEXT NOT NULL DEFAULT '',
    UNIQUE(partner_id, brand_id, terms_updated_at)
  );
  CREATE TABLE IF NOT EXISTS partner_quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partner_id INTEGER NOT NULL REFERENCES partner_accounts(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    service TEXT NOT NULL,
    amount REAL NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS partner_deals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partner_id INTEGER NOT NULL REFERENCES partner_accounts(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    service TEXT NOT NULL,
    value REAL NOT NULL DEFAULT 0,
    stage TEXT NOT NULL DEFAULT 'new',
    probability INTEGER NOT NULL DEFAULT 20,
    next_action TEXT NOT NULL DEFAULT '',
    follow_up_at TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS partner_deal_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deal_id INTEGER NOT NULL REFERENCES partner_deals(id) ON DELETE CASCADE,
    partner_id INTEGER NOT NULL REFERENCES partner_accounts(id) ON DELETE CASCADE,
    kind TEXT NOT NULL DEFAULT 'note',
    detail TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS partner_deals_partner_idx ON partner_deals(partner_id, stage, updated_at);
  CREATE INDEX IF NOT EXISTS partner_deal_activities_deal_idx ON partner_deal_activities(deal_id, created_at);
  CREATE TABLE IF NOT EXISTS partner_support_conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partner_id INTEGER NOT NULL REFERENCES partner_accounts(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    priority TEXT NOT NULL DEFAULT 'normal',
    status TEXT NOT NULL DEFAULT 'open',
    assigned_to TEXT NOT NULL DEFAULT '',
    last_message_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS partner_support_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL REFERENCES partner_support_conversations(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS partner_support_conversations_partner_idx ON partner_support_conversations(partner_id, updated_at);
  CREATE INDEX IF NOT EXISTS partner_support_messages_conversation_idx ON partner_support_messages(conversation_id, created_at);
`);

function ensureColumn(table, name, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((column) => column.name === name)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);
  }
}

ensureColumn("leads", "kind", "TEXT NOT NULL DEFAULT 'callback'");
ensureColumn("leads", "email", "TEXT NOT NULL DEFAULT ''");
ensureColumn("leads", "sector", "TEXT NOT NULL DEFAULT ''");
ensureColumn("leads", "district", "TEXT NOT NULL DEFAULT ''");
ensureColumn("leads", "address", "TEXT NOT NULL DEFAULT ''");
ensureColumn("leads", "hours", "TEXT NOT NULL DEFAULT ''");
ensureColumn("leads", "website", "TEXT NOT NULL DEFAULT ''");
ensureColumn("leads", "notes", "TEXT NOT NULL DEFAULT ''");
ensureColumn("leads", "sms_ok", "INTEGER NOT NULL DEFAULT 1");
ensureColumn("leads", "partner_id", "INTEGER");
ensureColumn("partner_support_messages", "read_by_partner", "INTEGER NOT NULL DEFAULT 0");
ensureColumn("partner_support_messages", "read_by_admin", "INTEGER NOT NULL DEFAULT 0");
ensureColumn("partner_accounts", "referral_code", "TEXT NOT NULL DEFAULT ''");
ensureColumn("partner_sessions", "ip", "TEXT NOT NULL DEFAULT ''");
ensureColumn("partner_sessions", "user_agent", "TEXT NOT NULL DEFAULT ''");
ensureColumn("partner_sessions", "trusted", "INTEGER NOT NULL DEFAULT 0");
ensureColumn("customer_accounts", "package_id", "TEXT NOT NULL DEFAULT ''");
ensureColumn("customer_accounts", "website_url", "TEXT NOT NULL DEFAULT ''");
ensureColumn("customer_accounts", "site_logo_url", "TEXT NOT NULL DEFAULT ''");
ensureColumn("customer_accounts", "site_phone", "TEXT NOT NULL DEFAULT ''");
ensureColumn("customer_accounts", "site_address", "TEXT NOT NULL DEFAULT ''");
ensureColumn("customer_accounts", "site_hours", "TEXT NOT NULL DEFAULT ''");
ensureColumn("customer_accounts", "ssl_status", "TEXT NOT NULL DEFAULT 'unknown'");
ensureColumn("customer_accounts", "last_backup_at", "TEXT NOT NULL DEFAULT ''");
ensureColumn("customer_accounts", "last_update_at", "TEXT NOT NULL DEFAULT ''");
ensureColumn("customer_accounts", "site_status", "TEXT NOT NULL DEFAULT 'open'");
ensureColumn("customer_accounts", "two_factor", "INTEGER NOT NULL DEFAULT 0");
ensureColumn("customer_accounts", "google_ads_customer_id", "TEXT NOT NULL DEFAULT ''");
ensureColumn("customer_accounts", "meta_ad_account_id", "TEXT NOT NULL DEFAULT ''");
ensureColumn("customer_tickets", "queue_position", "INTEGER NOT NULL DEFAULT 0");
db.exec(`
  CREATE TABLE IF NOT EXISTS customer_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'limited',
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_by TEXT NOT NULL DEFAULT 'owner',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(email)
  );
  CREATE INDEX IF NOT EXISTS customer_users_customer_idx ON customer_users(customer_id);
`);
ensureColumn("customer_sessions", "user_id", "INTEGER");
ensureColumn("customer_sessions", "role", "TEXT NOT NULL DEFAULT 'full'");
ensureColumn("customer_sessions", "stepup_at", "TEXT NOT NULL DEFAULT ''");
db.exec(`
  CREATE TABLE IF NOT EXISTS customer_otp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL,
    code_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS customer_otp_customer_idx ON customer_otp(customer_id);
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS customer_whatsapp_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'waiting',
    queue_position INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS customer_whatsapp_queue_customer_idx ON customer_whatsapp_queue(customer_id, status);
`);
{
  const waiting = db.prepare("SELECT id FROM customer_tickets WHERE status = 'open' AND queue_position = 0 ORDER BY created_at ASC, id ASC").all();
  const maxRow = db.prepare("SELECT COALESCE(MAX(queue_position), 0) AS max FROM customer_tickets WHERE queue_position > 0").get();
  let nextPos = Number(maxRow?.max || 0);
  const setPos = db.prepare("UPDATE customer_tickets SET queue_position = ? WHERE id = ?");
  for (const row of waiting) {
    nextPos += 1;
    setPos.run(nextPos, row.id);
  }
}
db.exec(`
  CREATE TABLE IF NOT EXISTS customer_catalog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    title TEXT NOT NULL,
    details TEXT NOT NULL DEFAULT '',
    amount REAL NOT NULL DEFAULT 0,
    quantity REAL NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS customer_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
    period TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    paid_amount REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'unpaid',
    note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(customer_id, period)
  );
  CREATE TABLE IF NOT EXISTS customer_contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
    family_id INTEGER NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    title TEXT NOT NULL DEFAULT '',
    original_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    uploaded_by TEXT NOT NULL,
    is_current INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS customer_catalog_customer_idx ON customer_catalog(customer_id, kind);
  CREATE INDEX IF NOT EXISTS customer_payments_customer_idx ON customer_payments(customer_id, period);
  CREATE INDEX IF NOT EXISTS customer_contracts_customer_idx ON customer_contracts(customer_id, family_id, version);
  CREATE TABLE IF NOT EXISTS contract_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    body_html TEXT NOT NULL DEFAULT '',
    sig_x REAL NOT NULL DEFAULT 12,
    sig_y REAL NOT NULL DEFAULT 78,
    sig_w REAL NOT NULL DEFAULT 36,
    sig_h REAL NOT NULL DEFAULT 12,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS approvals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    kind TEXT NOT NULL DEFAULT 'file',
    body_text TEXT NOT NULL DEFAULT '',
    original_name TEXT NOT NULL DEFAULT '',
    stored_name TEXT NOT NULL DEFAULT '',
    mime_type TEXT NOT NULL DEFAULT '',
    size_bytes INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    feedback_text TEXT NOT NULL DEFAULT '',
    created_by TEXT NOT NULL DEFAULT 'admin',
    created_at TEXT NOT NULL,
    responded_at TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS approvals_customer_status_idx ON approvals(customer_id, status);
  CREATE TABLE IF NOT EXISTS approval_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    approval_id INTEGER NOT NULL REFERENCES approvals(id) ON DELETE CASCADE,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS approval_events_approval_idx ON approval_events(approval_id, id);
  CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    original_name TEXT NOT NULL DEFAULT '',
    stored_name TEXT NOT NULL DEFAULT '',
    archive_name TEXT NOT NULL DEFAULT '',
    mime_type TEXT NOT NULL DEFAULT '',
    size_bytes INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    accept_name TEXT NOT NULL DEFAULT '',
    accept_ip TEXT NOT NULL DEFAULT '',
    accepted_at TEXT NOT NULL DEFAULT '',
    created_by TEXT NOT NULL DEFAULT 'admin',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS quotes_customer_status_idx ON quotes(customer_id, status);
  CREATE TABLE IF NOT EXISTS customer_project (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL UNIQUE REFERENCES customer_accounts(id) ON DELETE CASCADE,
    stage TEXT NOT NULL DEFAULT 'baslangic',
    updated_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS customer_project_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    from_stage TEXT,
    to_stage TEXT NOT NULL,
    note TEXT DEFAULT '',
    actor TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS customer_project_events_customer_idx ON customer_project_events(customer_id, id);
  CREATE TABLE IF NOT EXISTS portal_announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    title TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    link_url TEXT NOT NULL DEFAULT '',
    tone TEXT NOT NULL DEFAULT 'info',
    active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS portal_announcements_customer_idx ON portal_announcements(customer_id, active);
  CREATE TABLE IF NOT EXISTS admin_impersonation_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_hash TEXT NOT NULL UNIQUE,
    customer_id INTEGER NOT NULL,
    admin_id INTEGER,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);
ensureColumn("customer_project", "celebration_pending", "INTEGER NOT NULL DEFAULT 0");
ensureColumn("customer_project", "celebration_seen", "INTEGER NOT NULL DEFAULT 0");
ensureColumn("customer_accounts", "seo_score_override", "INTEGER");
ensureColumn("customer_accounts", "seo_score_label", "TEXT NOT NULL DEFAULT ''");
ensureColumn("customer_accounts", "seo_score_note", "TEXT NOT NULL DEFAULT ''");
ensureColumn("customer_accounts", "national_id", "TEXT NOT NULL DEFAULT ''");
ensureColumn("leads", "national_id", "TEXT NOT NULL DEFAULT ''");
ensureColumn("customer_payments", "start_date", "TEXT NOT NULL DEFAULT ''");
ensureColumn("customer_payments", "end_date", "TEXT NOT NULL DEFAULT ''");
ensureColumn("customer_payments", "gateway_ref", "TEXT NOT NULL DEFAULT ''");
ensureColumn("customer_payments", "gateway_provider", "TEXT NOT NULL DEFAULT ''");
ensureColumn("customer_accounts", "site_error", "INTEGER NOT NULL DEFAULT 0");
ensureColumn("customer_accounts", "referral_code", "TEXT NOT NULL DEFAULT ''");
ensureColumn("leads", "referral_code", "TEXT NOT NULL DEFAULT ''");
ensureColumn("leads", "referred_by_customer_id", "INTEGER");
ensureColumn("leads", "referral_rewarded", "INTEGER NOT NULL DEFAULT 0");
ensureColumn("customer_contracts", "template_id", "INTEGER NOT NULL DEFAULT 0");
ensureColumn("customer_contracts", "body_html", "TEXT NOT NULL DEFAULT ''");
ensureColumn("customer_contracts", "sign_status", "TEXT NOT NULL DEFAULT ''");
ensureColumn("customer_contracts", "sign_reason", "TEXT NOT NULL DEFAULT ''");
ensureColumn("customer_contracts", "signature_stored", "TEXT NOT NULL DEFAULT ''");
ensureColumn("customer_contracts", "signed_at", "TEXT NOT NULL DEFAULT ''");
ensureColumn("customer_contracts", "sig_x", "REAL NOT NULL DEFAULT 12");
ensureColumn("customer_contracts", "sig_y", "REAL NOT NULL DEFAULT 78");
ensureColumn("customer_contracts", "sig_w", "REAL NOT NULL DEFAULT 36");
ensureColumn("customer_contracts", "sig_h", "REAL NOT NULL DEFAULT 12");
ensureColumn("customer_contracts", "updated_at", "TEXT NOT NULL DEFAULT ''");
db.exec(`
  CREATE TABLE IF NOT EXISTS customer_renewals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    label TEXT NOT NULL DEFAULT '',
    renew_date TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    note TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS customer_renewals_customer_idx ON customer_renewals(customer_id);
  CREATE INDEX IF NOT EXISTS customer_renewals_renew_idx ON customer_renewals(renew_date);
  CREATE TABLE IF NOT EXISTS customer_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    ref TEXT NOT NULL DEFAULT '',
    read_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    UNIQUE(customer_id, kind, ref)
  );
  CREATE INDEX IF NOT EXISTS customer_notifications_customer_idx ON customer_notifications(customer_id);
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS extra_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price REAL NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);
(() => {
  const extraCount = Number(db.prepare("SELECT COUNT(*) AS n FROM extra_services").get()?.n || 0);
  if (extraCount > 0) return;
  const seededAt = new Date().toISOString();
  const insertExtra = db.prepare(
    `INSERT INTO extra_services (name, description, price, active, created_at, updated_at)
     VALUES (?, ?, 0, 1, ?, ?)`,
  );
  const extraSeeds = [
    ["SSL sertifikası", "HTTPS ve tarayıcı kilit ikonu. Yıllık yenileme."],
    ["Logo / kimlik", "Logo, renk ve marka kimliği çalışması."],
    ["Ek sayfa", "Mevcut siteye ek içerik sayfası."],
    ["Google Ads kurulumu", "Hesap, dönüşüm ve ilk kampanya kurulumu. Medya bütçesi ayrıdır."],
    ["Google Maps kaydı", "İşletme profili, kategori, NAP ve doğrulama. Sıra garantisi yok."],
    ["Site bakım", "Aylık güncelleme, yedek ve güvenlik kontrolü."],
  ];
  db.exec("BEGIN");
  try {
    for (const [name, description] of extraSeeds) {
      insertExtra.run(name, description, seededAt, seededAt);
    }
    db.exec("COMMIT");
  } catch (seedError) {
    db.exec("ROLLBACK");
    console.error("extra_services seed skipped", seedError);
  }
})();
db.exec(`
  CREATE TABLE IF NOT EXISTS seo_keywords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    locale TEXT NOT NULL DEFAULT 'tr',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    UNIQUE(customer_id, keyword)
  );
  CREATE INDEX IF NOT EXISTS seo_keywords_customer_idx ON seo_keywords(customer_id);
  CREATE TABLE IF NOT EXISTS seo_rank_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword_id INTEGER NOT NULL REFERENCES seo_keywords(id) ON DELETE CASCADE,
    checked_at TEXT NOT NULL,
    position INTEGER,
    url TEXT NOT NULL DEFAULT '',
    source TEXT NOT NULL DEFAULT 'none'
  );
  CREATE INDEX IF NOT EXISTS seo_rank_snapshots_kw_checked_idx ON seo_rank_snapshots(keyword_id, checked_at);
`);
ensureColumn("customer_service_requests", "kind", "TEXT NOT NULL DEFAULT 'service'");
ensureColumn("customer_service_requests", "extra_service_id", "INTEGER");
ensureColumn("customer_service_requests", "amount", "REAL NOT NULL DEFAULT 0");
ensureColumn("customer_service_requests", "catalog_id", "INTEGER");
ensureColumn("customer_catalog", "status", "TEXT NOT NULL DEFAULT 'active'");
// Aktivite Kaydı (Audit Log, P9) — kritik işlemler ayrı tabloya, isteği bloklamadan yazılır.
db.exec(`
  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_type TEXT NOT NULL,
    actor_id INTEGER,
    actor_label TEXT NOT NULL DEFAULT '',
    customer_id INTEGER,
    action TEXT NOT NULL,
    target TEXT NOT NULL DEFAULT '',
    ip TEXT NOT NULL DEFAULT '',
    meta TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS audit_log_customer_idx ON audit_log(customer_id, created_at);
  CREATE INDEX IF NOT EXISTS audit_log_action_idx ON audit_log(action);
  CREATE INDEX IF NOT EXISTS audit_log_created_idx ON audit_log(created_at);
`);
const CUSTOMER_FILES_DIR = path.join(DATA_DIR, "customer-files");
mkdirSync(CUSTOMER_FILES_DIR, { recursive: true });
const MAX_CONTRACT_BYTES = 8 * 1024 * 1024;
const MAX_APPROVAL_BYTES = 8 * 1024 * 1024;
const APPROVAL_EXT = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

function nowIso() {
  return new Date().toISOString();
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function getOrCreateMeta(key) {
  const row = db.prepare("SELECT value FROM app_meta WHERE key = ?").get(key);
  if (row?.value) return row.value;
  const value = randomBytes(32).toString("hex");
  db.prepare("INSERT INTO app_meta (key, value) VALUES (?, ?)").run(key, value);
  return value;
}

function readMeta(key) {
  return String(db.prepare("SELECT value FROM app_meta WHERE key = ?").get(key)?.value || "");
}

function writeMeta(key, value) {
  db.prepare(
    "INSERT INTO app_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  ).run(key, String(value ?? ""));
}

const analyticsSalt = getOrCreateMeta("analytics_salt");

function requestIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || req.socket.remoteAddress || "unknown";
}

// Aktivite Kaydı yardımcısı (P9): en iyi çaba (best-effort) INSERT.
// better-sqlite3 senkron ve hızlıdır; yine de gövde try/catch ile sarılır ve
// asla hata fırlatmaz — kayıt hatası ana isteği bloklamaz/bozmaz.
function logAudit({ actorType, actorId = null, actorLabel = "", customerId = null, action, target = "", ip = "", meta = "" } = {}) {
  try {
    if (!actorType || !action) return;
    const metaText = typeof meta === "string" ? meta : (() => { try { return JSON.stringify(meta); } catch { return ""; } })();
    db.prepare(
      `INSERT INTO audit_log (actor_type, actor_id, actor_label, customer_id, action, target, ip, meta, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      String(actorType).slice(0, 20),
      actorId != null && Number.isFinite(Number(actorId)) ? Number(actorId) : null,
      String(actorLabel || "").slice(0, 200),
      customerId != null && Number.isFinite(Number(customerId)) ? Number(customerId) : null,
      String(action).slice(0, 40),
      String(target || "").slice(0, 120),
      String(ip || "").slice(0, 60),
      String(metaText || "").slice(0, 400),
      nowIso(),
    );
  } catch {
    // yut: aktivite kaydı asla isteği bozmamalı
  }
}

// Aktivite Kaydı sorgusu (P9): filtre + basit sayfalama.
function auditRowPublic(row) {
  return {
    id: row.id,
    actorType: row.actor_type,
    actorId: row.actor_id,
    actorLabel: row.actor_label,
    customerId: row.customer_id,
    action: row.action,
    target: row.target,
    ip: row.ip,
    meta: row.meta,
    createdAt: row.created_at,
  };
}

function queryAuditLogs({ customerId = 0, action = "", actorType = "", q = "", days = 30, page = 1, perPage = 50 } = {}) {
  const clauses = [];
  const params = [];
  const dayCount = Number(days);
  if (Number.isFinite(dayCount) && dayCount > 0) {
    clauses.push("created_at >= ?");
    params.push(new Date(Date.now() - dayCount * 86_400_000).toISOString());
  }
  if (customerId) {
    clauses.push("customer_id = ?");
    params.push(Number(customerId));
  }
  if (action) {
    clauses.push("action = ?");
    params.push(String(action));
  }
  if (actorType) {
    clauses.push("actor_type = ?");
    params.push(String(actorType));
  }
  if (q) {
    clauses.push("(actor_label LIKE ? ESCAPE '\\' OR target LIKE ? ESCAPE '\\')");
    const like = `%${String(q).replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;
    params.push(like, like);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const total = Number(db.prepare(`SELECT COUNT(*) AS n FROM audit_log ${where}`).get(...params)?.n || 0);
  const safePer = Math.min(Math.max(Number(perPage) || 50, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const offset = (safePage - 1) * safePer;
  const rows = db
    .prepare(
      `SELECT id, actor_type, actor_id, actor_label, customer_id, action, target, ip, meta, created_at
       FROM audit_log ${where}
       ORDER BY created_at DESC, id DESC
       LIMIT ? OFFSET ?`,
    )
    .all(...params, safePer, offset);
  return { rows: rows.map(auditRowPublic), meta: { page: safePage, perPage: safePer, total } };
}

function visitorHash(req) {
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return sha256(`${analyticsSalt}|${day}|${requestIp(req)}|${req.headers["user-agent"] || ""}`);
}

/** İstanbul takvim günü (YYYY-MM-DD) ve UTC ISO sınırları — pageviews karşılaştırması için. */
function istanbulDayBounds(date = new Date()) {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  const start = new Date(`${ymd}T00:00:00+03:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { ymd, startIso: start.toISOString(), endIso: end.toISOString() };
}

function normalizeAnalyticsPath(value) {
  let pathname = cleanText(value, 200);
  if (!pathname) return "";
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  pathname = pathname.split("?")[0].split("#")[0];
  if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
  return pathname.slice(0, 200);
}

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  return { salt, hash: scryptSync(password, salt, 64).toString("hex") };
}

function generateMemberPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = randomBytes(16);
  let password = "";
  for (const byte of bytes) password += alphabet[byte % alphabet.length];
  return password;
}

function sanitizeTemplateHtml(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .slice(0, 20_000);
}

function clampBox(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(2, Math.min(90, Math.round(number * 10) / 10));
}

function publicTemplate(row) {
  return {
    id: row.id,
    name: row.name,
    bodyHtml: row.body_html || "",
    sigX: Number(row.sig_x) || 12,
    sigY: Number(row.sig_y) || 78,
    sigW: Number(row.sig_w) || 36,
    sigH: Number(row.sig_h) || 12,
    updatedAt: row.updated_at,
  };
}

/** Sözleşme şablonlarının ortak resmi başlığı: taraflar, marka ve AvcKayıtlı güven satırı.
 *  PDF düz metne çevirir; bu yüzden hem HTML hem düz okumada düzgün görünecek şekilde yazılmıştır. */
function contractHeaderHtml(title) {
  return `<p style="text-align:center"><strong>HATAY360</strong><br/>Web Tasarım · Reklam · Dijital Görünürlük · hatay360.com</p>
<p><strong>HİZMET SAĞLAYICI:</strong> Hatay360 (Avcı E-Ticaret) · Web tasarım, reklam ve dijital görünürlük · hatay360.com · Antakya / Hatay · Vergi No: [Vergi Dairesi / No]</p>
<p><strong>MÜŞTERİ:</strong> [Firma Ünvanı] · Yetkili: [Ad Soyad] · [Adres] · [Telefon] · [E-posta] · Vergi/TC No: [___]</p>
<p><strong>AvcKayıtlı belge</strong> — Bu sözleşme Hatay360 müşteri paneline kayıtlıdır; sürüm ve imza tarihi sistemde saklanır.</p>
<p>Sözleşme No: [___] · Düzenleme Tarihi: [GG.AA.YYYY]</p>
<hr/>`;
}

function contractCommonClausesHtml() {
  return `<h3>Ödeme ve Gecikme</h3>
<p>Ücret ve ödeme planı yukarıdaki kapsama göredir. Vadesi geçen ödenmemiş tutara %15 gecikme bedeli uygulanır (ödenmeyen × 1,15). Reklam medya bütçesi bu tutarın dışındadır ve müşteri tarafından karşılanır; reklam tıklaması ücrete dahil değildir.</p>
<h3>Süre ve Fesih</h3>
<p>Sözleşme imza tarihinde yürürlüğe girer. Taraflar yazılı bildirimle feshedebilir; devam eden dönem ücreti ve tamamlanan işler tahsil edilir.</p>
<h3>Gizlilik ve KVKK</h3>
<p>Taraflar iş kapsamında öğrendikleri bilgileri gizli tutar. Kişisel veriler 6698 sayılı KVKK kapsamında yalnızca hizmetin sunulması amacıyla işlenir.</p>
<h3>Onay ve İmza</h3>
<p>Müşteri aşağıdaki imza alanına imza atar. İmza ve Hatay360 onay damgası belgeye işlenir; onay/red gerekçesi müşteri panelinde görünür.</p>
<p>İmza: ____________________  Tarih: ____ / ____ / ______</p>`;
}

const CONTRACT_TEMPLATE_LIBRARY = [
  {
    name: "Web Tasarım Müşteri Sözleşmesi",
    body_html: `${contractHeaderHtml("Web Tasarım Müşteri Sözleşmesi")}
<h2>Web Tasarım Müşteri Sözleşmesi</h2>
<h3>1. Taraflar ve Konu</h3>
<p>Hizmet sağlayıcı; müşteri için kurumsal web sitesi tasarımı, geliştirme, yayına alma ve panel eğitimini üstlenir. İş kapsamı teklif ve bu sözleşmede yazılıdır.</p>
<h3>2. Müşteri Yükümlülükleri</h3>
<p>Logo, metin, görseller ve onaylar müşteri tarafından zamanında sağlanır. Gecikme teslim takvimini uzatabilir.</p>
<h3>3. Teslim ve Yayın</h3>
<p>Tasarım onayı sonrası site yayına alınır. Alan adı, hosting ve SSL müşteri adına yapılandırılır. Yayın sonrası ilk 30 gün küçük düzeltmeler dahildir.</p>
<h3>4. Ücret ve Ödeme</h3>
<p>Aylık hizmet bedeli ve kurulum tutarı teklifte belirtilir. Vadesi geçen ödenmemiş tutara %15 gecikme bedeli uygulanır.</p>
<h3>5. Fesih ve Gizlilik</h3>
<p>Taraflar yazılı bildirimle feshedebilir. Kişisel veriler KVKK kapsamında işlenir.</p>
${contractCommonClausesHtml()}`,
  },
  {
    name: "Hatay360 Web Tasarım Sözleşmesi",
    body_html: `${contractHeaderHtml("Hatay360 Web Tasarım Sözleşmesi")}
<h3>1. Konu ve Kapsam</h3>
<p>Hizmet sağlayıcı; müşteri için mobil uyumlu kurumsal web sitesi tasarımı, kurulumu ve yayına alınmasını üstlenir. Sayfa sayısı, içerik ve teslim süresi teklife göredir.</p>
<h3>2. İçerik ve Teslim</h3>
<p>Metin, logo ve görseller müşteri tarafından sağlanır. Site, kabul edilen tasarım onayının ardından yayına alınır. Alan adı ve barındırma müşteri adına ayarlanır.</p>
<h3>3. Bakım</h3>
<p>Yayın sonrası küçük düzeltmeler ilk [__] gün ücretsizdir. Kapsam dışı geliştirmeler ek hizmet olarak fiyatlanır.</p>
${contractCommonClausesHtml()}`,
  },
  {
    name: "Hatay360 Reklam Yönetim Sözleşmesi (Google / Meta)",
    body_html: `${contractHeaderHtml("Hatay360 Reklam Yönetim Sözleşmesi (Google / Meta)")}
<h3>1. Konu ve Kapsam</h3>
<p>Hizmet sağlayıcı; Google Ads ve/veya Meta reklam hesaplarının kurulumu, kampanya yönetimi ve optimizasyonunu üstlenir. Yönetim ücreti reklam medya bütçesinden ayrıdır.</p>
<h3>2. Bütçe ve Faturalama</h3>
<p>Reklam medya bütçesi müşteri tarafından karşılanır. Yönetim ücreti aylık/dönemsel tahsil edilir. Reklam tıklaması veya harcaması yönetim ücretine dahil değildir.</p>
<h3>3. Raporlama</h3>
<p>Kampanya sonuçları müşteri panelinde ve aylık raporda paylaşılır. Sonuç garantisi verilmez; performans optimizasyonu sürekli yürütülür.</p>
${contractCommonClausesHtml()}`,
  },
  {
    name: "Hatay360 Google Maps / Görünürlük Sözleşmesi",
    body_html: `${contractHeaderHtml("Hatay360 Google Maps / Görünürlük Sözleşmesi")}
<h3>1. Konu ve Kapsam</h3>
<p>Hizmet sağlayıcı; Google işletme profili kaydı/düzenlemesi, kategori, NAP (ad-telefon-adres) tutarlılığı ve doğrulama sürecini üstlenir.</p>
<h3>2. Doğrulama ve Sıra</h3>
<p>Profil doğrulaması Google’ın onayına tabidir. Harita sırası garanti edilmez; görünürlük iyileştirme çalışması yürütülür.</p>
<h3>3. Bilgi Tutarlılığı</h3>
<p>Site ve harita üzerindeki ad, telefon ve adres bilgileri aynı olmalıdır. Uyumsuz alanlar müşteri paneli uyarısına düşer.</p>
${contractCommonClausesHtml()}`,
  },
  {
    name: "Hatay360 E-ticaret / Mağaza Sözleşmesi",
    body_html: `${contractHeaderHtml("Hatay360 E-ticaret / Mağaza Sözleşmesi")}
<h3>1. Konu ve Kapsam</h3>
<p>Hizmet sağlayıcı; e-ticaret altyapısı kurulumu, vitrin/katalog tasarımı, sanal POS ve SSL entegrasyonunu üstlenir. Pazaryeri (Pazarla) entegrasyonu ayrı bir üründür.</p>
<h3>2. Ödeme Altyapısı</h3>
<p>Sanal POS ve ödeme sağlayıcı başvurusu müşteri adına yapılır. Sağlayıcı komisyonları müşteriye aittir.</p>
<h3>3. Ürün ve İçerik</h3>
<p>Ürün bilgileri, görseller ve stok müşteri tarafından sağlanır. Panel eğitimi hizmet kapsamındadır.</p>
${contractCommonClausesHtml()}`,
  },
];

function seedContractTemplates() {
  const createdAt = nowIso();
  const existing = db.prepare("SELECT id FROM contract_templates WHERE name = ?");
  const insert = db.prepare(
    `INSERT INTO contract_templates (name, body_html, sig_x, sig_y, sig_w, sig_h, created_at, updated_at)
     VALUES (?, ?, 12, 78, 36, 12, ?, ?)`,
  );
  const count = Number(db.prepare("SELECT COUNT(*) AS n FROM contract_templates").get()?.n || 0);
  if (count === 0) {
    insert.run(
      "Hatay360 Hizmet Sözleşmesi",
      `${contractHeaderHtml("Hatay360 Hizmet Sözleşmesi")}
<h3>Konu</h3>
<p>Hizmet kapsamı, süre, ücret ve teslim Hatay360 teklifine göredir. Admin bu şablonu düzenleyebilir.</p>
${contractCommonClausesHtml()}`,
      createdAt,
      createdAt,
    );
  }
  // Kütüphane şablonları: yalnızca aynı isimde kayıt yoksa eklenir (düzenlenmişlere dokunulmaz).
  for (const tpl of CONTRACT_TEMPLATE_LIBRARY) {
    if (existing.get(tpl.name)) continue;
    insert.run(tpl.name, tpl.body_html, createdAt, createdAt);
  }
}

seedContractTemplates();

// --- Çoklu müşteri sitesi (microsite) motoru ---
// managed_sites: kategori şablonuyla üretilen müşteri siteleri. config JSON olarak tutulur.
db.exec(`
  CREATE TABLE IF NOT EXISTS managed_sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    domain TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'generic',
    status TEXT NOT NULL DEFAULT 'construction',
    customer_id INTEGER,
    config TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS managed_sites_customer_idx ON managed_sites(customer_id);
`);

function parseManagedSite(row) {
  if (!row) return null;
  let config = {};
  try {
    config = JSON.parse(row.config || "{}");
  } catch {
    config = {};
  }
  return {
    id: Number(row.id),
    slug: row.slug,
    domain: row.domain || "",
    category: row.category || "generic",
    status: row.status || "construction",
    customerId: row.customer_id == null ? null : Number(row.customer_id),
    config,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getManagedSiteBySlug(slug) {
  return parseManagedSite(db.prepare("SELECT * FROM managed_sites WHERE slug = ?").get(String(slug || "").toLowerCase()));
}

function normalizeHost(hostname = "") {
  return String(hostname || "")
    .toLowerCase()
    .split(":")[0]
    .trim()
    .replace(/^www\./, "");
}

function getManagedSiteByDomain(hostname = "") {
  const host = normalizeHost(hostname);
  if (!host) return null;
  return parseManagedSite(
    db.prepare("SELECT * FROM managed_sites WHERE lower(replace(domain, 'www.', '')) = ?").get(host),
  );
}

function escapeHtml(value = "") {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function injectManagedSiteHtml(html, site, origin) {
  if (!site?.config?.seo) return html;
  const seo = site.config.seo;
  const business = site.config.business || {};
  const title = seo.title || business.name || site.slug;
  const description = seo.description || "";
  const keywords = seo.keywords || "";
  const canonical = `${origin.replace(/\/$/, "")}/`;
  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  );
  if (keywords) {
    if (/<meta\s+name="keywords"/i.test(out)) {
      out = out.replace(
        /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="keywords" content="${escapeHtml(keywords)}" />`,
      );
    } else {
      out = out.replace("</head>", `  <meta name="keywords" content="${escapeHtml(keywords)}" />\n  </head>`);
    }
  }
  if (!/<link\s+rel="canonical"/i.test(out)) {
    out = out.replace("</head>", `  <link rel="canonical" href="${escapeHtml(canonical)}" />\n  </head>`);
  } else {
    out = out.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escapeHtml(canonical)}" />`);
  }
  out = out.replace(/<meta\s+property="og:site_name"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:site_name" content="${escapeHtml(business.name || title)}" />`);
  out = out.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`);
  if (/<meta\s+property="og:description"/i.test(out)) {
    out = out.replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:description" content="${escapeHtml(description)}" />`,
    );
  }
  return out;
}

function listManagedSites() {
  return db
    .prepare("SELECT * FROM managed_sites ORDER BY created_at DESC")
    .all()
    .map(parseManagedSite);
}

function slugify(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function seedManagedSites() {
  const exists = db.prepare("SELECT id FROM managed_sites WHERE slug = ?").get("taxireyhanli");
  if (exists) return;
  const createdAt = nowIso();
  const config = {
    business: {
      name: "Reyhanlı Taksi",
      ownerName: "Mehmet Y.",
      phone: "05418822802",
      whatsapp: "05418822802",
      email: "",
      city: "Hatay",
      district: "Reyhanlı",
      addressText: "Reyhanlı / Hatay — Merkez, Cilvegözü Sınır Kapısı, hastane ve çevre mahalleler",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Reyhanl%C4%B1+Taksi",
      mapEmbedUrl: "",
      hours: "7/24",
    },
    brand: { logoUrl: "", primary: "#f5b301", accent: "#111827", dark: "#0b1220" },
    hero: {
      badge: "7/24 açık taksi hattı",
      title: "Reyhanlı Taksi · 7/24",
      subtitle:
        "Reyhanlı merkez, Cilvegözü Sınır Kapısı, hastane, otogar ve çevre mahallelerde 7/24 güvenilir taksi. Tek dokunuşla arayın veya WhatsApp'tan konum gönderin.",
      callLabel: "Hemen Ara",
      whatsappLabel: "WhatsApp'tan Yaz",
    },
    highlights: [
      { value: "7/24", label: "Aktif hizmet" },
      { value: "365", label: "Gün ulaşılabilir" },
      { value: "0541 882 28 02", label: "Reyhanlı taksi no" },
      { value: "WhatsApp", label: "Konum paylaşımı" },
    ],
    services: [
      { title: "Reyhanlı Merkez Taksi", desc: "Merkez, çarşı, otogar, kamu kurumları ve iş yeri ulaşımı için pratik taksi." },
      { title: "7/24 Reyhanlı Taksi", desc: "Gece, sabah erken saatler veya gün içi acil yolculuklarda hat her zaman açık." },
      { title: "Cilvegözü Sınır Kapısı Taksi", desc: "Cilvegözü Sınır Kapısı ve çevre yolları için taksi talebinizi iletin." },
      { title: "Reyhanlı Hastane Taksi", desc: "Reyhanlı Devlet Hastanesi ve sağlık kuruluşlarına güvenli ulaşım." },
      { title: "Otogar & Çarşı Taksi", desc: "Otogar, çarşı ve günlük şehir içi ulaşım ihtiyaçlarınız için." },
      { title: "WhatsApp ile Taksi Çağırma", desc: "Konum, güzergâh ve saat bilginizi WhatsApp'tan paylaşın." },
    ],
    areas: [
      "Reyhanlı Merkez",
      "Yenişehir",
      "Bağlar",
      "Cumhuriyet",
      "Bayır",
      "Değirmenkaşı",
      "Kuşaklı",
      "Harran",
      "Cilvegözü Yolu",
      "Cilvegözü Sınır Kapısı",
      "Reyhanlı Devlet Hastanesi",
      "Otogar",
    ],
    faqs: [
      {
        q: "Reyhanlı Taksi 7/24 hizmet veriyor mu?",
        a: "Evet. Reyhanlı ve Cilvegözü hattında günün her saati telefon ve WhatsApp üzerinden taksi talebi alıyoruz.",
      },
      {
        q: "Reyhanlı taksi numarası nedir?",
        a: "0541 882 28 02 numarasını arayarak bulunduğunuz konuma taksi isteyebilirsiniz. Sayfadaki Ara ve WhatsApp butonları tek dokunuşla çalışır.",
      },
      {
        q: "WhatsApp ile taksi çağırabilir miyim?",
        a: "Evet. Konumunuzu, gideceğiniz adresi ve uygun saat bilginizi WhatsApp'tan paylaşarak taksi talebinizi iletebilirsiniz.",
      },
      {
        q: "Hangi bölgelere hizmet veriyorsunuz?",
        a: "Reyhanlı merkez, Cilvegözü Sınır Kapısı, Reyhanlı Devlet Hastanesi, otogar, çarşı ve çevre mahallelere taksi hizmeti veriyoruz.",
      },
    ],
    seo: {
      title: "Reyhanlı Taksi | 7/24 Reyhanlı Taksi Numarası & Cilvegözü Taksi",
      description:
        "Reyhanlı taksi hattı 7/24 açık. Merkez, hastane, otogar ve Cilvegözü Sınır Kapısı için 0541 882 28 02 numarasını arayın veya WhatsApp'tan konum gönderin.",
      keywords:
        "reyhanlı taksi, taksi reyhanlı, reyhanlı taksi numarası, cilvegözü taksi, reyhanlı hastane taksi, 7/24 reyhanlı taksi, hatay reyhanlı taksi",
    },
    whatsappTemplate: "Merhaba, Reyhanlı'da taksi talebim var. Konumum: ",
    footerNote: "",
  };
  db.prepare(
    `INSERT INTO managed_sites (slug, domain, category, status, customer_id, config, created_at, updated_at)
     VALUES (?, ?, ?, ?, NULL, ?, ?, ?)`,
  ).run("taxireyhanli", "taxireyhanli.com", "taxi", "live", JSON.stringify(config), createdAt, createdAt);
}

seedManagedSites();

function verifyPassword(password, salt, expectedHex) {
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function bootstrapAdmin() {
  const username = String(process.env.HATAY360_ADMIN_USER || process.env.VITE_ADMIN_USER || "").trim();
  const password = String(process.env.HATAY360_ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || "");
  if (!username || !password) return;
  const existing = db.prepare("SELECT id FROM admin_users WHERE username = ?").get(username);
  if (existing) return;
  const credentials = hashPassword(password);
  db.prepare(
    "INSERT INTO admin_users (username, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?)",
  ).run(username, credentials.hash, credentials.salt, nowIso());
}

bootstrapAdmin();
if (!db.prepare("SELECT id FROM admin_users LIMIT 1").get()) {
  console.warn("Yönetici hesabı yok. HATAY360_ADMIN_USER ve HATAY360_ADMIN_PASSWORD tanımlayın.");
}

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Cross-Origin-Opener-Policy": "same-origin",
  "X-Permitted-Cross-Domain-Policies": "none",
};

function json(res, status, payload, extraHeaders = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...SECURITY_HEADERS,
    ...extraHeaders,
  });
  res.end(JSON.stringify(payload));
}

async function readJson(req, limit = 2_000_000) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error("PAYLOAD_TOO_LARGE");
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function cookies(req) {
  return Object.fromEntries(
    String(req.headers.cookie || "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        return [decodeURIComponent(part.slice(0, index)), decodeURIComponent(part.slice(index + 1))];
      }),
  );
}

function currentUser(req) {
  const token = cookies(req)[SESSION_COOKIE];
  if (!token) return null;
  return (
    db
      .prepare(
        `SELECT admin_users.id, admin_users.username
         FROM admin_sessions
         JOIN admin_users ON admin_users.id = admin_sessions.user_id
         WHERE admin_sessions.token_hash = ? AND admin_sessions.expires_at > ?`,
      )
      .get(sha256(token), nowIso()) || null
  );
}

function requireUser(req, res) {
  const user = currentUser(req);
  if (!user) json(res, 401, { error: "Oturum gerekli." });
  return user;
}

/** Env dolu mu? Değeri asla döndürmez. */
function envConfigured(key) {
  return Boolean(process.env[key] && String(process.env[key]).trim());
}

function adminConnectionsSnapshot() {
  const smtp = envConfigured("SMTP_HOST") && envConfigured("SMTP_USER") && envConfigured("SMTP_PASS");
  const iyzico = envConfigured("IYZICO_API_KEY") && (envConfigured("IYZICO_SECRET_KEY") || envConfigured("IYZICO_SECRET"));
  const googleAds =
    envConfigured("GOOGLE_ADS_DEVELOPER_TOKEN") &&
    envConfigured("GOOGLE_ADS_CLIENT_ID") &&
    envConfigured("GOOGLE_ADS_CLIENT_SECRET") &&
    envConfigured("GOOGLE_ADS_REFRESH_TOKEN");
  const metaAds = envConfigured("META_ACCESS_TOKEN") || (envConfigured("META_APP_ID") && envConfigured("META_APP_SECRET"));
  const seoRank = envConfigured("SERPAPI_KEY") || envConfigured("DATAFORSEO_LOGIN");
  const cron = envConfigured("CRON_SECRET");
  return {
    smtp: { configured: smtp, detail: "E-posta gönderimi (2FA, davet, yenileme hatırlatması)" },
    iyzico: { configured: iyzico, detail: "Online ödeme (Şimdi Öde)" },
    googleAds: { configured: googleAds, detail: "Canlı Google Ads raporu" },
    metaAds: { configured: metaAds, detail: "Canlı Meta Ads raporu" },
    seoRank: { configured: seoRank, detail: "SEO sıralama API (SerpApi/DataForSEO)" },
    cron: { configured: cron, detail: "Günlük cron gizli anahtarı" },
    envHint: [
      "SMTP_HOST",
      "SMTP_PORT",
      "SMTP_USER",
      "SMTP_PASS",
      "IYZICO_API_KEY",
      "IYZICO_SECRET_KEY",
      "GOOGLE_ADS_DEVELOPER_TOKEN",
      "GOOGLE_ADS_CLIENT_ID",
      "GOOGLE_ADS_CLIENT_SECRET",
      "GOOGLE_ADS_REFRESH_TOKEN",
      "META_APP_ID",
      "META_APP_SECRET",
      "META_ACCESS_TOKEN",
      "SERPAPI_KEY or DATAFORSEO_LOGIN",
      "CRON_SECRET",
    ],
  };
}

function currentCustomer(req) {
  const token = cookies(req)[CUSTOMER_SESSION_COOKIE];
  if (!token) return null;
  return (
    db
      .prepare(
        `SELECT customer_accounts.id, customer_accounts.company_name, customer_accounts.contact_name,
                customer_accounts.email, customer_accounts.phone, customer_accounts.status
         FROM customer_sessions
         JOIN customer_accounts ON customer_accounts.id = customer_sessions.customer_id
         WHERE customer_sessions.token_hash = ? AND customer_sessions.expires_at > ?
           AND customer_accounts.status = 'active'`,
      )
      .get(sha256(token), nowIso()) || null
  );
}

function requireCustomer(req, res) {
  const customer = currentCustomer(req);
  if (!customer) json(res, 401, { error: "Müşteri oturumu gerekli." });
  return customer;
}

// Çoklu kullanıcı / rol yönetimi (P6): oturuma bağlı rol. Eski oturumlar 'full'.
function currentCustomerRole(req) {
  const token = cookies(req)[CUSTOMER_SESSION_COOKIE];
  if (!token) return "full";
  const row = db
    .prepare("SELECT role FROM customer_sessions WHERE token_hash = ? AND expires_at > ?")
    .get(sha256(token), nowIso());
  const role = String(row?.role || "full");
  return role === "limited" ? "limited" : "full";
}

function requireCustomerFull(req, res) {
  const customer = requireCustomer(req, res);
  if (!customer) return null;
  if (currentCustomerRole(req) !== "full") {
    json(res, 403, { error: "Bu bölüm yalnızca tam yetkili kullanıcılara açıktır. Sınırlı kullanıcılar faturalandırma, sözleşme ve güvenlik alanlarını göremez." });
    return null;
  }
  return customer;
}

function currentCustomerSession(req) {
  const token = cookies(req)[CUSTOMER_SESSION_COOKIE];
  if (!token) return null;
  return (
    db
      .prepare(
        `SELECT token_hash, customer_id, user_id, role, stepup_at
         FROM customer_sessions
         WHERE token_hash = ? AND expires_at > ?`,
      )
      .get(sha256(token), nowIso()) || null
  );
}

function customerTwoFactorOn(customerId) {
  const row = db.prepare("SELECT two_factor FROM customer_accounts WHERE id = ?").get(Number(customerId));
  return Number(row?.two_factor) === 1;
}

function stepupIsFresh(stepupAt) {
  const ts = Date.parse(String(stepupAt || ""));
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts < STEPUP_MINUTES * 60 * 1000;
}

function requireCustomerStepup(req, res) {
  const customer = requireCustomerFull(req, res);
  if (!customer) return null;
  if (!customerTwoFactorOn(customer.id)) return customer;
  const session = currentCustomerSession(req);
  if (!session || !stepupIsFresh(session.stepup_at)) {
    json(res, 403, { error: "Bu işlem için ek doğrulama gerekir.", needsStepup: true });
    return null;
  }
  return customer;
}

function cookieHeader(name, token, maxAgeSec) {
  if (!token) {
    return `${name}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${IS_PRODUCTION ? "; Secure" : ""}`;
  }
  return `${name}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAgeSec}${IS_PRODUCTION ? "; Secure" : ""}`;
}

const otpPendingSecret = getOrCreateMeta("otp_pending_secret");

function signOtpPending(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = sha256(`otp-pending|${otpPendingSecret}|${body}`);
  return `${body}.${sig}`;
}

function readOtpPending(req) {
  const token = cookies(req)[CUSTOMER_OTP_COOKIE];
  if (!token) return null;
  const dot = String(token).lastIndexOf(".");
  if (dot <= 0) return null;
  const body = String(token).slice(0, dot);
  const sig = String(token).slice(dot + 1);
  const expected = sha256(`otp-pending|${otpPendingSecret}|${body}`);
  try {
    const left = Buffer.from(expected, "hex");
    const right = Buffer.from(sig, "hex");
    if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload || Number(payload.exp) < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function publicCustomerIdentity(account) {
  return {
    id: account.id,
    company_name: account.company_name,
    contact_name: account.contact_name,
    email: account.email,
    phone: account.phone,
  };
}

function issueCustomerSession(res, { account, userId = null, role = "full", extraCookies = [], skipAudit = false } = {}) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
  const sessionRole = role === "limited" ? "limited" : "full";
  db.prepare(
    "INSERT INTO customer_sessions (token_hash, customer_id, expires_at, created_at, user_id, role) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(sha256(token), account.id, expiresAt.toISOString(), nowIso(), userId, sessionRole);
  const cookiesOut = [cookieHeader(CUSTOMER_SESSION_COOKIE, token, SESSION_HOURS * 3600), ...extraCookies];
  return json(
    res,
    200,
    { ok: true, role: sessionRole, customer: publicCustomerIdentity(account) },
    { "Set-Cookie": cookiesOut.length === 1 ? cookiesOut[0] : cookiesOut },
  );
}

function verifyLoggedInCustomerPassword(req, customer, password) {
  const session = currentCustomerSession(req);
  if (session?.user_id) {
    const user = db
      .prepare(
        "SELECT password_hash, password_salt FROM customer_users WHERE id = ? AND customer_id = ? AND status = 'active'",
      )
      .get(session.user_id, customer.id);
    return Boolean(user && verifyPassword(password, user.password_salt, user.password_hash));
  }
  const account = db
    .prepare("SELECT password_hash, password_salt FROM customer_accounts WHERE id = ? AND status = 'active'")
    .get(customer.id);
  return Boolean(account && verifyPassword(password, account.password_salt, account.password_hash));
}

function publicCustomerUser(row) {
  return {
    id: row.id,
    name: row.name || "",
    email: row.email,
    role: row.role === "full" ? "full" : "limited",
    status: row.status === "disabled" ? "disabled" : "active",
    created_at: row.created_at,
  };
}

function listCustomerUsers(customerId) {
  return db
    .prepare("SELECT id, name, email, role, status, created_at FROM customer_users WHERE customer_id = ? ORDER BY created_at ASC, id ASC")
    .all(Number(customerId))
    .map(publicCustomerUser);
}

// Bir e-postanın giriş kimliği olarak başka bir hesapla çakışıp çakışmadığını denetler.
function customerLoginEmailTaken(email, { exceptUserId = 0 } = {}) {
  const normalized = String(email || "").toLowerCase();
  const account = db.prepare("SELECT id FROM customer_accounts WHERE email = ?").get(normalized);
  if (account) return true;
  const user = db.prepare("SELECT id FROM customer_users WHERE email = ?").get(normalized);
  if (user && Number(user.id) !== Number(exceptUserId)) return true;
  return false;
}

// Şirketin son tam yetkili (aktif) sub-user sayısını döndürür.
function activeFullSubUserCount(customerId, { exceptUserId = 0 } = {}) {
  return Number(
    db
      .prepare("SELECT COUNT(*) AS n FROM customer_users WHERE customer_id = ? AND role = 'full' AND status = 'active' AND id != ?")
      .get(Number(customerId), Number(exceptUserId))?.n || 0,
  );
}

function currentPartner(req) {
  const token = cookies(req)[PARTNER_SESSION_COOKIE];
  if (!token) return null;
  return (
    db
      .prepare(
        `SELECT partner_accounts.id, partner_accounts.company_name, partner_accounts.contact_name,
                partner_accounts.email, partner_accounts.phone, partner_accounts.city,
                partner_accounts.website, partner_accounts.commission_rate, partner_accounts.status
         FROM partner_sessions
         JOIN partner_accounts ON partner_accounts.id = partner_sessions.partner_id
         WHERE partner_sessions.token_hash = ? AND partner_sessions.expires_at > ?
           AND partner_accounts.status = 'active'`,
      )
      .get(sha256(token), nowIso()) || null
  );
}

function requirePartner(req, res) {
  const partner = currentPartner(req);
  if (!partner) json(res, 401, { error: "Firma oturumu gerekli." });
  return partner;
}

function csvEscape(value) {
  return `"${String(value || "").replace(/"/g, '""')}"`;
}

function validTrPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) return true;
  if (digits.length === 10 && digits.startsWith("5")) return true;
  if (digits.length === 12 && digits.startsWith("90")) return true;
  if (digits.length === 13 && digits.startsWith("90")) return true;
  return false;
}

function normalizeReferralCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 12);
}

function generateReferralCode() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let attempt = 0; attempt < 48; attempt += 1) {
    const bytes = randomBytes(8);
    let code = "";
    for (let i = 0; i < 8; i += 1) code += alphabet[bytes[i] % alphabet.length];
    const takenCustomer = db.prepare("SELECT id FROM customer_accounts WHERE upper(referral_code) = ? LIMIT 1").get(code);
    const takenPartner = db.prepare("SELECT id FROM partner_accounts WHERE upper(referral_code) = ? LIMIT 1").get(code);
    if (!takenCustomer && !takenPartner) return code;
  }
  return `H${Date.now().toString(36).toUpperCase()}${randomBytes(2).toString("hex").toUpperCase()}`.replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

function ensureCustomerReferralCode(customerId) {
  const id = Number(customerId);
  if (!Number.isFinite(id) || id <= 0) return "";
  const row = db.prepare("SELECT id, referral_code FROM customer_accounts WHERE id = ?").get(id);
  if (!row) return "";
  const current = normalizeReferralCode(row.referral_code);
  if (current.length >= 6) {
    if (current !== String(row.referral_code || "")) {
      db.prepare("UPDATE customer_accounts SET referral_code = ? WHERE id = ?").run(current, row.id);
    }
    return current;
  }
  const code = generateReferralCode();
  db.prepare("UPDATE customer_accounts SET referral_code = ? WHERE id = ?").run(code, row.id);
  return code;
}

function ensurePartnerReferralCode(partnerId) {
  const id = Number(partnerId);
  if (!Number.isFinite(id) || id <= 0) return "";
  const row = db.prepare("SELECT id, referral_code FROM partner_accounts WHERE id = ?").get(id);
  if (!row) return "";
  const current = normalizeReferralCode(row.referral_code);
  if (current.length >= 6) {
    if (current !== String(row.referral_code || "")) {
      db.prepare("UPDATE partner_accounts SET referral_code = ? WHERE id = ?").run(current, row.id);
    }
    return current;
  }
  const code = generateReferralCode();
  db.prepare("UPDATE partner_accounts SET referral_code = ? WHERE id = ?").run(code, row.id);
  return code;
}

function resolvePartnerReferral(code) {
  const normalized = normalizeReferralCode(code);
  if (normalized.length < 6) return null;
  const row = db
    .prepare("SELECT id FROM partner_accounts WHERE upper(referral_code) = ? AND status = 'active' LIMIT 1")
    .get(normalized);
  return row ? Number(row.id) : null;
}

function partnerReferralUrls(code) {
  const origin = String(process.env.HATAY360_SITE_ORIGIN || "https://hatay360.com").replace(/\/$/, "");
  const token = encodeURIComponent(code);
  return {
    referralUrl: `${origin}/musteri/kayit?ref=${token}`,
    referralContactUrl: `${origin}/iletisim?ref=${token}`,
  };
}

function estimatePartnerDealAmount(service) {
  const text = String(service || "").toLowerCase();
  if (text.includes("e-ticaret") || text.includes("eticaret")) return 28000;
  if (text.includes("google ads") || text.includes("meta")) return 9000;
  if (text.includes("maps") || text.includes("harita")) return 4000;
  if (text.includes("paket")) return 15000;
  return 12000;
}

function partnerLeadDisplayStatus(status) {
  const key = String(status || "").toLowerCase();
  if (key === "won") return "active";
  if (key === "closed") return "cancelled";
  return "proposal";
}

function partnerLeadDisplayLabel(status) {
  const key = partnerLeadDisplayStatus(status);
  if (key === "active") return "Aktif Müşteri";
  if (key === "cancelled") return "İptal";
  return "Teklif Aşamasında";
}

function computePartnerTier(activeCount) {
  const count = Math.max(0, Number(activeCount) || 0);
  if (count >= 16) {
    return {
      level: "gold",
      label: "Altın",
      nextLabel: null,
      current: count,
      target: 16,
      progress: 100,
    };
  }
  if (count >= 6) {
    return {
      level: "silver",
      label: "Gümüş",
      nextLabel: "Altın",
      current: count,
      target: 16,
      progress: Math.min(100, Math.round(((count - 6) / 10) * 100)),
    };
  }
  return {
    level: "bronze",
    label: "Bronz",
    nextLabel: "Gümüş",
    current: count,
    target: 6,
    progress: Math.min(100, Math.round((count / 6) * 100)),
  };
}

function buildPartnerHubPayload(partner) {
  const code = ensurePartnerReferralCode(partner.id);
  const rate = Number(partner.commission_rate) || 20;
  const referrals = db
    .prepare(
      `SELECT id, name, phone, email, service, sector, district, notes, status, created_at, updated_at
       FROM leads
       WHERE partner_id = ?
       ORDER BY created_at DESC
       LIMIT 200`,
    )
    .all(partner.id);
  const paymentRequests = db
    .prepare(
      `SELECT id, amount, status, created_at, updated_at
       FROM partner_payment_requests
       WHERE partner_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
    )
    .all(partner.id);
  const paidOut = paymentRequests
    .filter((row) => String(row.status).toLowerCase() === "paid")
    .reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const pendingRequested = paymentRequests
    .filter((row) => String(row.status).toLowerCase() === "pending")
    .reduce((sum, row) => sum + Number(row.amount || 0), 0);

  const commissions = [];
  let totalEarned = 0;
  let monthEarnings = 0;
  let activeReferrals = 0;
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  for (const row of referrals) {
    const displayStatus = partnerLeadDisplayStatus(row.status);
    if (displayStatus === "active") activeReferrals += 1;
    if (displayStatus !== "active") continue;
    const dealAmount = estimatePartnerDealAmount(row.service);
    const earnings = Math.round((dealAmount * rate) / 100);
    const eventDate = String(row.updated_at || row.created_at || "");
    totalEarned += earnings;
    if (eventDate.startsWith(monthPrefix)) monthEarnings += earnings;
    commissions.push({
      id: row.id,
      date: eventDate,
      customerName: row.name,
      dealAmount,
      commissionRate: rate,
      earnings,
      paymentStatus: "pending",
    });
  }

  const pendingBalance = Math.max(0, totalEarned - paidOut - pendingRequested);
  const tier = computePartnerTier(activeReferrals);

  return {
    summary: {
      monthEarnings,
      activeReferrals,
      pendingBalance,
      totalEarned,
      commissionRate: rate,
      tier,
    },
    referrals: referrals.map((row) => {
      const displayStatus = partnerLeadDisplayStatus(row.status);
      const dealAmount = displayStatus === "active" ? estimatePartnerDealAmount(row.service) : 0;
      const totalCommission =
        displayStatus === "active" ? Math.round((dealAmount * rate) / 100) : 0;
      return {
        id: row.id,
        companyName: row.name,
        status: displayStatus,
        statusLabel: partnerLeadDisplayLabel(row.status),
        broughtAt: row.created_at,
        totalCommission,
        service: row.service,
        phone: row.phone,
        email: row.email,
      };
    }),
    commissions,
    referralLinks: partnerReferralUrls(code),
    referralCode: code,
    paymentRequests,
  };
}

function resolveReferral(code) {
  const normalized = normalizeReferralCode(code);
  if (normalized.length < 6) return null;
  const row = db.prepare("SELECT id FROM customer_accounts WHERE upper(referral_code) = ? LIMIT 1").get(normalized);
  return row ? Number(row.id) : null;
}

function extractReferralCode(body, sourcePath) {
  const fromBody =
    body && typeof body === "object" ? body.ref || body.referralCode || body.referral_code : "";
  let fromPath = "";
  const pathStr = String(sourcePath || "");
  const queryAt = pathStr.indexOf("?");
  if (queryAt >= 0) {
    try {
      const params = new URLSearchParams(pathStr.slice(queryAt + 1));
      fromPath = params.get("ref") || params.get("referralCode") || params.get("referral_code") || "";
    } catch {
      fromPath = "";
    }
  }
  return normalizeReferralCode(fromBody || fromPath);
}

function publicReferralUrls(code) {
  const origin = String(process.env.HATAY360_SITE_ORIGIN || "https://hatay360.com").replace(/\/$/, "");
  const token = encodeURIComponent(code);
  return {
    referralUrl: `${origin}/musteri/kayit?ref=${token}`,
    referralContactUrl: `${origin}/iletisim?ref=${token}`,
  };
}

{
  const emptyCodes = db.prepare("SELECT id FROM customer_accounts WHERE referral_code IS NULL OR trim(referral_code) = ''").all();
  for (const row of emptyCodes) ensureCustomerReferralCode(row.id);
  const emptyPartnerCodes = db
    .prepare("SELECT id FROM partner_accounts WHERE referral_code IS NULL OR trim(referral_code) = ''")
    .all();
  for (const row of emptyPartnerCodes) ensurePartnerReferralCode(row.id);
  try {
    db.exec("CREATE UNIQUE INDEX IF NOT EXISTS customer_accounts_referral_code_idx ON customer_accounts(referral_code)");
  } catch {
    // boş kod kalırsa unique index atlanır; lazy generate dashboard'da tamamlar
  }
  try {
    db.exec("CREATE INDEX IF NOT EXISTS leads_referral_idx ON leads(referred_by_customer_id, referral_code)");
  } catch {
    // indeks isteğe bağlı
  }
}

function insertLead({
  name,
  phone,
  service,
  sourcePath,
  kind = "callback",
  email = "",
  sector = "",
  district = "",
  address = "",
  hours = "",
  website = "",
  notes = "",
  smsOk = 1,
  partnerId = null,
  referralCode = "",
  referredByCustomerId = null,
  nationalId = "",
}) {
  const createdAt = nowIso();
  const code = normalizeReferralCode(referralCode);
  const referrerId =
    referredByCustomerId == null || !Number.isFinite(Number(referredByCustomerId))
      ? null
      : Number(referredByCustomerId);
  return db
    .prepare(
      `INSERT INTO leads (
        name, phone, service, source_path, status, kind, email, sector, district,
        address, hours, website, notes, sms_ok, partner_id, referral_code, referred_by_customer_id, national_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      name,
      phone,
      service,
      sourcePath,
      kind,
      email,
      sector,
      district,
      address,
      hours,
      website,
      notes,
      smsOk,
      partnerId == null ? null : Number(partnerId),
      code,
      referrerId,
      normalizeNationalId(nationalId),
      createdAt,
      createdAt,
    );
}

function numberValue(value, max = 1_000_000_000) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(number, max));
}

function sameOrigin(req) {
  const origin = String(req.headers.origin || "");
  if (!origin) return !IS_PRODUCTION;
  const host = String(req.headers.host || "");
  const protocol = String(req.headers["x-forwarded-proto"] || (IS_PRODUCTION ? "https" : "http"));
  const allowed = new Set([
    `${protocol}://${host}`,
    "http://127.0.0.1:3600",
    "http://localhost:3600",
    ...String(process.env.HATAY360_ALLOWED_ORIGINS || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  ]);
  return allowed.has(origin);
}

function cleanText(value, max = 200) {
  return String(value || "").trim().slice(0, max);
}

const DOMAIN_NAME_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;

function normalizeDomainInput(value) {
  return cleanText(value, 253)
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.+$/, "");
}

async function probeDomain(domain) {
  let hasDns = false;
  let hasMx = false;
  let result = "unknown";

  try {
    const records = await resolveAny(domain);
    hasDns = Array.isArray(records) && records.length > 0;
    result = hasDns ? "registered" : "unknown";
  } catch (error) {
    if (["ENOTFOUND", "ENODATA"].includes(error?.code)) {
      try {
        await resolve4(domain);
        hasDns = true;
        result = "registered";
      } catch (fallbackError) {
        result = ["ENOTFOUND", "ENODATA"].includes(fallbackError?.code) ? "potentially_available" : "unknown";
      }
    } else {
      try {
        await resolve4(domain);
        hasDns = true;
        result = "registered";
      } catch {
        result = "unknown";
      }
    }
  }

  if (result === "registered" || hasDns) {
    try {
      const mx = await resolveMx(domain);
      hasMx = Array.isArray(mx) && mx.length > 0;
    } catch {
      hasMx = false;
    }
  }

  const note =
    result === "potentially_available"
      ? "DNS kaydı bulunamadı; kesin uygunluk kayıt kuruluşunda doğrulanmalıdır."
      : result === "registered"
        ? hasMx
          ? "DNS ve e-posta (MX) kaydı var; alan adı kullanımda görünüyor."
          : "DNS kaydı var; alan adı kayıtlı görünüyor."
        : "DNS ve alan adı ön kontrol sonucu.";

  return { domain, result, note, signals: { hasDns: hasDns || result === "registered", hasMx } };
}

function safeReferrer(value) {
  const raw = cleanText(value, 500);
  if (!raw) return "direct";
  try {
    return new URL(raw).hostname.slice(0, 120) || "direct";
  } catch {
    return "direct";
  }
}

const rateBuckets = new Map();
function rateLimited(req, key, limit, windowMs) {
  const id = `${key}:${requestIp(req)}`;
  const now = Date.now();
  const bucket = rateBuckets.get(id) || [];
  const fresh = bucket.filter((time) => now - time < windowMs);
  fresh.push(now);
  rateBuckets.set(id, fresh);
  return fresh.length > limit;
}

const { createOtp, verifyOtp } = bindCustomerOtp({ db, nowIso, rateLimited });

function recentFailedLogins(req) {
  const since = new Date(Date.now() - 20 * 60 * 1000).toISOString();
  const row = db
    .prepare("SELECT COUNT(*) AS n FROM login_events WHERE visitor_hash = ? AND success = 0 AND created_at >= ?")
    .get(visitorHash(req), since);
  return Number(row?.n || 0);
}

function loginLocked(req, res) {
  if (recentFailedLogins(req) < 8) return false;
  json(res, 429, { error: "Çok fazla hatalı giriş. 20 dakika sonra tekrar deneyin." });
  return true;
}

function logLogin(req, username, success) {
  db.prepare("INSERT INTO login_events (username, visitor_hash, success, created_at) VALUES (?, ?, ?, ?)").run(
    username || "empty",
    visitorHash(req),
    success ? 1 : 0,
    nowIso(),
  );
}

function isBotTrap(body) {
  return Boolean(cleanText(body?.company_fax, 80) || cleanText(body?.hp, 80));
}

setInterval(() => {
  db.prepare("DELETE FROM admin_sessions WHERE expires_at <= ?").run(nowIso());
  db.prepare("DELETE FROM customer_sessions WHERE expires_at <= ?").run(nowIso());
  db.prepare("DELETE FROM partner_sessions WHERE expires_at <= ?").run(nowIso());
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare("DELETE FROM pageviews WHERE created_at < ?").run(cutoff);
  // Aktivite Kaydı saklama sınırı (P9): 180 günden eski kayıtları temizle.
  try {
    const auditCutoff = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare("DELETE FROM audit_log WHERE created_at < ?").run(auditCutoff);
  } catch {
    // yut: temizlik hatası kritik değil
  }
}, 60 * 60 * 1000).unref();

const PORTAL_PACKAGE_IDS = new Set(["start", "pro", "scale", "enterprise", "shop-start", "shop-pro"]);
const SELF_SERVE_PACKAGES = new Set(["start", "pro", "scale", "shop-start"]);
const OWN_PANEL_PACKAGES = new Set(["enterprise", "shop-pro"]);
const PACKAGE_NAMES = {
  start: "Hatay360 Reklam Start",
  pro: "Hatay360 Reklam Pro",
  scale: "Hatay360 Yerel Hizmet Reklamı",
  enterprise: "Hatay360 Kurumsal Reklam & Web",
  "shop-start": "Hatay360 Mağaza Start",
  "shop-pro": "Hatay360 Mağaza & Pazarla",
};

function normalizePackageId(value) {
  const id = cleanText(value, 40);
  return PORTAL_PACKAGE_IDS.has(id) ? id : "";
}

function siteEditMode(packageId) {
  const id = normalizePackageId(packageId);
  if (SELF_SERVE_PACKAGES.has(id)) return "self-serve";
  if (OWN_PANEL_PACKAGES.has(id)) return "own-panel";
  return "none";
}

function canEditSmallSiteFields(packageId) {
  return siteEditMode(packageId) === "self-serve";
}

function dayStamp(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() - offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function phoneTail(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.slice(-10);
}

function normalizeNationalId(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
  return digits.length === 11 ? digits : "";
}

function isValidNationalId(value) {
  const digits = normalizeNationalId(value);
  if (!digits || digits[0] === "0") return false;
  const nums = digits.split("").map(Number);
  const odd = nums[0] + nums[2] + nums[4] + nums[6] + nums[8];
  const even = nums[1] + nums[3] + nums[5] + nums[7];
  const tenth = ((odd * 7 - even) % 10 + 10) % 10;
  const eleventh = nums.slice(0, 10).reduce((sum, n) => sum + n, 0) % 10;
  return tenth === nums[9] && eleventh === nums[10];
}

function findCustomerByPhone(phone) {
  const tail = phoneTail(phone);
  if (tail.length < 10) return null;
  const rows = db.prepare("SELECT * FROM customer_accounts ORDER BY id DESC LIMIT 5000").all();
  return rows.find((row) => phoneTail(row.phone) === tail) || null;
}

function findCustomerByNationalId(nationalId) {
  const id = normalizeNationalId(nationalId);
  if (!id) return null;
  return db.prepare("SELECT * FROM customer_accounts WHERE national_id = ?").get(id) || null;
}

function findExistingCustomer({ email, phone, nationalId }) {
  const normalizedEmail = cleanText(email, 160).toLowerCase();
  if (normalizedEmail.includes("@")) {
    const byEmail = db.prepare("SELECT * FROM customer_accounts WHERE email = ?").get(normalizedEmail);
    if (byEmail) return byEmail;
  }
  const byPhone = findCustomerByPhone(phone);
  if (byPhone) return byPhone;
  return findCustomerByNationalId(nationalId);
}

function duplicateCustomerMessage() {
  return "Bu telefon veya TC kimlik numarasıyla kayıtlı bir müşteri hesabı zaten var. Müşteri girişinden devam edin veya Hatay360 ile iletişime geçin.";
}

function findRecentOpenLeadByPhone(phone, kinds = ["maps", "new_customer", "callback"]) {
  const tail = phoneTail(phone);
  if (tail.length < 10) return null;
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const placeholders = kinds.map(() => "?").join(", ");
  const rows = db
    .prepare(
      `SELECT * FROM leads
       WHERE kind IN (${placeholders})
         AND status IN ('new', 'contacted')
         AND created_at >= ?
       ORDER BY created_at DESC
       LIMIT 200`,
    )
    .all(...kinds, cutoff);
  return rows.find((row) => phoneTail(row.phone) === tail) || null;
}

function fillBlank(current, next) {
  return String(current || "").trim() ? current : next || "";
}

function findRecentOpenMapsLead(phone) {
  const tail = phoneTail(phone);
  if (tail.length < 10) return null;
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const rows = db
    .prepare(
      `SELECT * FROM leads
       WHERE kind = 'maps'
         AND status IN ('new', 'contacted')
         AND created_at >= ?
       ORDER BY created_at DESC
       LIMIT 120`,
    )
    .all(cutoff);
  return rows.find((row) => phoneTail(row.phone) === tail) || null;
}

function mapsMergeNoteLine(existing, incomingNotes, sourcePath) {
  let notes = String(existing.notes || "").trim();
  const additions = [];
  const extraNotes = String(incomingNotes || "").trim();
  if (extraNotes && !notes.includes(extraNotes)) additions.push(extraNotes);
  const path = String(sourcePath || "").trim();
  if (path && path !== "/" && path !== existing.source_path && !notes.includes(path)) {
    const line = /musteri\/kayit/i.test(path) ? `Müşteri başvurusu · ${path}` : path;
    if (!additions.some((item) => item.includes(path))) additions.push(line);
  }
  if (additions.length) notes = notes ? `${notes}\n${additions.join("\n")}` : additions.join("\n");
  return notes.slice(0, 800);
}

function mergeMapsLead(existing, incoming) {
  const mergedTc = normalizeNationalId(incoming.nationalId) || normalizeNationalId(existing.national_id);
  db.prepare(
    `UPDATE leads
     SET email = ?, sector = ?, district = ?, address = ?, hours = ?, website = ?, service = ?, notes = ?, national_id = ?, updated_at = ?
     WHERE id = ?`,
  ).run(
    fillBlank(existing.email, incoming.email),
    fillBlank(existing.sector, incoming.sector),
    fillBlank(existing.district, incoming.district),
    fillBlank(existing.address, incoming.address),
    fillBlank(existing.hours, incoming.hours),
    fillBlank(existing.website, incoming.website),
    fillBlank(existing.service, incoming.service || "Google Maps / harita"),
    mapsMergeNoteLine(existing, incoming.notes, incoming.sourcePath),
    mergedTc || existing.national_id || "",
    nowIso(),
    existing.id,
  );
  return Number(existing.id);
}

function safeHttpUrl(value, max = 240) {
  const raw = cleanText(value, max);
  if (!raw) return "";
  try {
    const parsed = new URL(raw.includes("://") ? raw : `https://${raw}`);
    if (!["http:", "https:"].includes(parsed.protocol)) return "";
    return parsed.toString().slice(0, max);
  } catch {
    return "";
  }
}

function seedDailyMetrics(customerId) {
  const existing = db.prepare("SELECT COUNT(*) AS n FROM customer_daily_metrics WHERE customer_id = ?").get(customerId);
  if (Number(existing?.n) > 0) return;
  const insert = db.prepare(
    `INSERT INTO customer_daily_metrics (customer_id, day, ads_clicks, ads_impressions, ads_spend, site_visitors, site_sessions, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'sample')`,
  );
  for (let offset = 13; offset >= 0; offset -= 1) {
    const adsClicks = 420 + ((customerId * 19 + offset * 47) % 680);
    const adsImpressions = adsClicks * (18 + ((customerId + offset) % 12));
    const adsSpend = 80 + ((customerId * 11 + offset * 9) % 220);
    const siteVisitors = 3 + ((customerId * 5 + offset * 2) % 7);
    const siteSessions = siteVisitors + ((customerId + offset) % 3);
    insert.run(customerId, dayStamp(offset), adsClicks, adsImpressions, adsSpend, siteVisitors, siteSessions);
  }
}

function customerMapsListings(customer) {
  const stored = db
    .prepare("SELECT * FROM customer_maps WHERE customer_id = ? ORDER BY updated_at DESC")
    .all(customer.id)
    .map((row) => ({
      id: row.id,
      businessName: row.business_name,
      status: row.status,
      mapsUrl: row.maps_url,
      address: row.address,
      phone: row.phone,
      source: "record",
    }));
  if (stored.length) return stored;
  const email = String(customer.email || "").toLowerCase();
  const phone = phoneTail(customer.phone);
  return db
    .prepare("SELECT * FROM leads WHERE kind = 'maps' ORDER BY created_at DESC LIMIT 400")
    .all()
    .filter((lead) => {
      const leadEmail = String(lead.email || "").toLowerCase();
      const leadPhone = phoneTail(lead.phone);
      return (email && leadEmail && email === leadEmail) || (phone && leadPhone && phone === leadPhone);
    })
    .map((lead) => ({
      id: `lead-${lead.id}`,
      businessName: lead.name,
      status: "pending",
      mapsUrl: "",
      address: lead.address || "",
      phone: lead.phone || "",
      source: "lead",
    }));
}

function customerWebsite(account) {
  const packageId = normalizePackageId(account.package_id);
  return {
    packageId,
    packageName: packageId ? PACKAGE_NAMES[packageId] : "Paket atanmadı",
    editMode: siteEditMode(packageId),
    canEdit: canEditSmallSiteFields(packageId),
    url: account.website_url || "",
    logoUrl: account.site_logo_url || "",
    phone: account.site_phone || account.phone || "",
    address: account.site_address || "",
    hours: account.site_hours || "",
    sslStatus: ["active", "pending", "unknown"].includes(account.ssl_status) ? account.ssl_status : "unknown",
    siteStatus: isSiteStatus(account.site_status) ? account.site_status : "open",
    siteError: Number(account.site_error) === 1,
    lastBackupAt: account.last_backup_at || "",
    lastUpdateAt: account.last_update_at || "",
  };
}

function customerDir(customerId) {
  const id = Number(customerId);
  if (!Number.isInteger(id) || id <= 0) return null;
  return path.resolve(CUSTOMER_FILES_DIR, String(id));
}

function contractDiskPath(customerId, storedName) {
  if (!/^[a-f0-9]{32}\.(pdf|jpg)$/.test(String(storedName || ""))) return null;
  const dir = customerDir(customerId);
  if (!dir) return null;
  const full = path.resolve(dir, storedName);
  const relative = path.relative(dir, full);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return full;
}

function detectContractMime(buffer) {
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-") return "application/pdf";
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  return "";
}

function decodeContractUpload(body) {
  const originalName = cleanText(body.fileName, 160).replace(/[/\\]/g, "");
  const raw = String(body.data || "").replace(/\s/g, "");
  if (!originalName || !raw || !/^[A-Za-z0-9+/]+=*$/.test(raw)) return { error: "PDF veya JPG dosyası gönderin." };
  let buffer;
  try {
    buffer = Buffer.from(raw, "base64");
  } catch {
    return { error: "Dosya okunamadı." };
  }
  if (!buffer.length) return { error: "Dosya boş." };
  if (buffer.length > MAX_CONTRACT_BYTES) return { error: "Dosya en fazla 8 MB olabilir." };
  const mimeType = detectContractMime(buffer);
  if (!mimeType) return { error: "Yalnızca PDF veya JPG kabul edilir." };
  const ext = mimeType === "application/pdf" ? "pdf" : "jpg";
  const storedName = `${randomBytes(16).toString("hex")}.${ext}`;
  return {
    originalName: originalName.slice(0, 160),
    storedName,
    mimeType,
    buffer,
  };
}

function publicContract(row) {
  return {
    id: row.id,
    familyId: row.family_id,
    version: row.version,
    title: row.title || "",
    fileName: row.original_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    uploadedBy: row.uploaded_by,
    current: Number(row.is_current) === 1,
    createdAt: row.created_at,
    templateId: Number(row.template_id) || 0,
    bodyHtml: row.body_html || "",
    signStatus: row.sign_status || "",
    signReason: row.sign_reason || "",
    signedAt: row.signed_at || "",
    hasSignature: Boolean(row.signature_stored),
    sigX: Number(row.sig_x) || 12,
    sigY: Number(row.sig_y) || 78,
    sigW: Number(row.sig_w) || 36,
    sigH: Number(row.sig_h) || 12,
  };
}

function publicPayment(row) {
  const resolved = resolvePaymentAmounts({
    amount: row.amount,
    paidAmount: row.paid_amount,
    status: row.status,
    period: row.period,
    startDate: row.start_date,
    endDate: row.end_date,
  });
  return {
    id: row.id,
    period: resolved.period || row.period,
    amount: resolved.amount,
    paidAmount: resolved.paidAmount,
    remaining: resolved.remaining,
    unpaidBase: resolved.unpaidBase,
    penalty: resolved.penalty,
    overdue: resolved.overdue,
    daysLeft: resolved.daysLeft,
    daysOverdue: resolved.daysOverdue,
    startDate: resolved.startDate,
    endDate: resolved.endDate,
    status: resolved.status,
    note: row.note || "",
    gatewayRef: String(row.gateway_ref || ""),
    gatewayProvider: String(row.gateway_provider || ""),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function catalogRowStatus(row) {
  const status = String(row?.status || "active");
  if (status === "draft" || status === "cancelled") return status;
  return "active";
}

function publicCatalogItem(row) {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    details: row.details || "",
    amount: roundCatalogAmount(row.amount),
    quantity: roundCatalogAmount(row.quantity) || 1,
    status: catalogRowStatus(row),
    createdAt: row.created_at,
  };
}

function roundCatalogAmount(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return 0;
  return Math.round(Math.max(0, number) * 100) / 100;
}

function listCustomerCatalog(customerId) {
  return db
    .prepare("SELECT * FROM customer_catalog WHERE customer_id = ? ORDER BY created_at DESC, id DESC")
    .all(customerId)
    .map(publicCatalogItem);
}

function listCustomerPayments(customerId) {
  return db
    .prepare("SELECT * FROM customer_payments WHERE customer_id = ? ORDER BY period DESC, id DESC")
    .all(customerId)
    .map(publicPayment);
}

function listCustomerContracts(customerId) {
  return db
    .prepare("SELECT * FROM customer_contracts WHERE customer_id = ? ORDER BY family_id DESC, version DESC, id DESC")
    .all(customerId)
    .map(publicContract);
}

function customerRecords(customerId, { billedOnly = false } = {}) {
  let catalog = listCustomerCatalog(customerId);
  if (billedOnly) catalog = catalog.filter((item) => item.status === "active");
  const payments = listCustomerPayments(customerId);
  return {
    catalog,
    products: catalog.filter((item) => item.kind === "product"),
    services: catalog.filter((item) => item.kind === "service"),
    invoices: catalog.filter((item) => item.kind === "invoice"),
    extras: catalog.filter((item) => item.kind === "extra"),
    payments,
    paymentSummary: summarizePayments(payments),
    contracts: listCustomerContracts(customerId),
  };
}

function publicExtraService(row, { includeInactive = false } = {}) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    price: roundCatalogAmount(row.price),
    ...(includeInactive ? { active: Number(row.active) === 1, createdAt: row.created_at, updatedAt: row.updated_at } : {}),
  };
}

function listExtraServices({ activeOnly = false } = {}) {
  const sql = activeOnly
    ? "SELECT * FROM extra_services WHERE active = 1 ORDER BY name ASC, id ASC"
    : "SELECT * FROM extra_services ORDER BY active DESC, name ASC, id ASC";
  return db.prepare(sql).all().map((row) => publicExtraService(row, { includeInactive: !activeOnly }));
}

const SEO_RANK_WAIT_MESSAGE =
  "Sıralama verisi bekleniyor — Hatay360 Google API bağlayınca haftalık konumlar burada görünecek.";

function cleanSeoKeyword(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 80);
}

function seoSnapshotPair(keywordId) {
  return db
    .prepare(
      "SELECT position, url, source, checked_at FROM seo_rank_snapshots WHERE keyword_id = ? ORDER BY checked_at DESC, id DESC LIMIT 2",
    )
    .all(keywordId);
}

function publicSeoKeyword(row, snapshots = seoSnapshotPair(row.id)) {
  const current = snapshots[0] || null;
  const prev = snapshots[1] || null;
  const position = current && current.position != null ? Number(current.position) : null;
  const previousPosition = prev && prev.position != null ? Number(prev.position) : null;
  const delta = position != null && previousPosition != null ? previousPosition - position : null;
  return {
    id: row.id,
    keyword: row.keyword,
    locale: row.locale || "tr",
    active: Number(row.active) === 1,
    createdAt: row.created_at,
    position,
    previousPosition,
    delta,
    lastChecked: current?.checked_at || null,
    url: current?.url || "",
    source: current?.source || "none",
  };
}

function listCustomerSeo(customerId) {
  return db
    .prepare("SELECT * FROM seo_keywords WHERE customer_id = ? ORDER BY created_at DESC, id DESC")
    .all(Number(customerId))
    .map((row) => publicSeoKeyword(row));
}

function customerSeoPayload(customerId) {
  const account = findCustomerAccount(customerId);
  const keywords = listCustomerSeo(customerId);
  const ranked = keywords.filter((row) => row.lastChecked && row.position != null);
  const positions = ranked.map((row) => Number(row.position));
  const avgPosition = positions.length ? Math.round(positions.reduce((a, b) => a + b, 0) / positions.length) : null;
  const bestPosition = positions.length ? Math.min(...positions) : null;
  const computed =
    ranked.length > 0
      ? Math.round(
          ranked.reduce((sum, row) => {
            const p = Number(row.position);
            if (p <= 3) return sum + 100;
            if (p <= 10) return sum + 82;
            if (p <= 20) return sum + 68;
            if (p <= 50) return sum + 48;
            return sum + 28;
          }, 0) / ranked.length,
        )
      : 0;
  const overrideRaw = account?.seo_score_override;
  const override = overrideRaw != null && Number(overrideRaw) > 0 ? Math.min(100, Math.round(Number(overrideRaw))) : null;
  const score = override ?? computed;
  const label =
    String(account?.seo_score_label || "").trim() ||
    (score >= 80 ? "Güçlü görünürlük" : score >= 55 ? "Gelişiyor" : score > 0 ? "Takip altında" : "Veri bekleniyor");
  const scoreNote = String(account?.seo_score_note || "").trim();
  return {
    keywords,
    connected: false,
    message: SEO_RANK_WAIT_MESSAGE,
    score,
    scoreLabel: label,
    scoreNote,
    scoreAdminConfigured: override != null,
    metrics: [
      { id: "visibility", label: "SEO puanı", value: score, max: 100 },
      { id: "keywords", label: "Takip kelimesi", value: keywords.length, max: Math.max(keywords.length, 5) },
      { id: "ranked", label: "Sıralamada", value: ranked.length, max: Math.max(keywords.length, 1) },
      { id: "avg", label: "Ort. konum", value: avgPosition ?? 0, hint: avgPosition != null ? `#${avgPosition}` : "—" },
      { id: "best", label: "En iyi", value: bestPosition != null ? Math.max(0, 100 - bestPosition) : 0, hint: bestPosition != null ? `#${bestPosition}` : "—" },
    ],
  };
}

function listPortalAnnouncements(customerId) {
  const id = Number(customerId);
  return db
    .prepare(
      `SELECT * FROM portal_announcements
       WHERE active = 1 AND (customer_id IS NULL OR customer_id = ?)
       ORDER BY sort_order DESC, id DESC LIMIT 12`,
    )
    .all(id)
    .map((row) => ({
      id: row.id,
      customerId: row.customer_id,
      title: row.title,
      body: row.body || "",
      linkUrl: row.link_url || "",
      tone: ["info", "promo", "campaign", "alert"].includes(row.tone) ? row.tone : "info",
      sortOrder: Number(row.sort_order) || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
}

function listAdminPortalAnnouncements(customerId) {
  return db
    .prepare("SELECT * FROM portal_announcements WHERE customer_id IS NULL OR customer_id = ? ORDER BY sort_order DESC, id DESC")
    .all(Number(customerId))
    .map((row) => ({
      id: row.id,
      customerId: row.customer_id,
      title: row.title,
      body: row.body || "",
      linkUrl: row.link_url || "",
      tone: row.tone || "info",
      active: Number(row.active) === 1,
      sortOrder: Number(row.sort_order) || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
}

const QUOTE_TEMPLATE_LIBRARY = {
  kurumsal: {
    name: "Kurumsal Teklif",
    defaultTitle: "Hatay360 Kurumsal Web Teklifi",
    bodyHtml: `<h2>Kurumsal Web Tasarım Teklifi</h2><p>Mobil uyumlu kurumsal site, SSL, temel SEO, WhatsApp ve harita entegrasyonu. Aylık hizmet ve kurulum tutarı teklifte belirtilir.</p><p>Geçerlilik: 14 gün.</p>`,
  },
  prime: {
    name: "Prime VIP Teklif",
    defaultTitle: "Hatay360 Prime VIP Teklif",
    bodyHtml: `<h2>Prime VIP Dijital Paket</h2><p>Web + reklam yönetimi + harita görünürlük + SEO takibi. Öncelikli destek ve aylık rapor. Reklam bütçesi ayrıdır.</p>`,
  },
};

function createQuoteFromTemplate(customerId, templateKey, title, createdBy) {
  const tpl = QUOTE_TEMPLATE_LIBRARY[templateKey];
  if (!tpl) return { error: "Geçersiz teklif şablonu." };
  const account = findCustomerAccount(customerId);
  if (!account) return { error: "Müşteri bulunamadı." };
  const cleanTitle = cleanText(title, 160) || tpl.defaultTitle;
  const pdf = buildQuotePdf({
    title: cleanTitle,
    body: tpl.bodyHtml,
    companyName: account.company_name,
    contactName: account.contact_name,
    issuedAt: nowIso().slice(0, 10),
  });
  const storedName = `${randomBytes(16).toString("hex")}.pdf`;
  const upload = { originalName: `${cleanTitle}.pdf`, storedName, mimeType: "application/pdf", buffer: pdf };
  return saveQuote(customerId, { title: cleanTitle, upload, createdBy });
}

// Gelecek cron: collectSeoKeywordsForSync() ile aktif kelimeleri alıp ranking API dolduracak.
// SerpApi / DataForSEO / herhangi bir ranking HTTP çağrısı BURADA YOK — yalnızca iskelet.
function collectSeoKeywordsForSync() {
  return db
    .prepare(
      `SELECT seo_keywords.id AS keyword_id,
              seo_keywords.keyword,
              seo_keywords.locale,
              seo_keywords.customer_id,
              customer_accounts.company_name,
              customer_accounts.website_url
       FROM seo_keywords
       JOIN customer_accounts ON customer_accounts.id = seo_keywords.customer_id
       WHERE seo_keywords.active = 1
       ORDER BY seo_keywords.id ASC`,
    )
    .all();
}

function cleanGoogleAdsCustomerId(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return { ok: true, value: "" };
  const digits = raw.replace(/-/g, "");
  if (!/^\d{8,12}$/.test(digits)) return { ok: false, value: "" };
  return { ok: true, value: digits };
}

function cleanMetaAdAccountId(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return { ok: true, value: "" };
  const match = raw.match(/^(act_)?(\d+)$/i);
  if (!match) return { ok: false, value: "" };
  const digits = match[2];
  if (digits.length < 5 || digits.length > 20) return { ok: false, value: "" };
  return { ok: true, value: `${match[1] ? "act_" : ""}${digits}` };
}

function adsAccountBinding(customer) {
  const googleId = String(customer?.google_ads_customer_id || customer?.googleAdsCustomerId || "").trim();
  const metaId = String(customer?.meta_ad_account_id || customer?.metaAdAccountId || "").trim();
  const googleBound = googleId.length > 0;
  const metaBound = metaId.length > 0;
  const bound = googleBound || metaBound;
  return {
    googleId,
    metaId,
    googleBound,
    metaBound,
    live: false,
    label: bound ? "kayıtlı" : "eşleşmedi",
    status: bound ? "bound" : "pending",
    detail: bound
      ? "Google Ads / Meta hesap ID kayıtlı; canlı API henüz bağlı değil. Sayılar Hatay360 kaydıdır."
      : "Hesap ID’si henüz eşleşmedi.",
  };
}

// Gelecek cron: collectAdsAccountsForSync() bağlı ID’leri alır. Google Ads / Meta HTTP yok.
function collectAdsAccountsForSync() {
  return db
    .prepare(
      `SELECT id, company_name, email, google_ads_customer_id, meta_ad_account_id
       FROM customer_accounts
       WHERE google_ads_customer_id != '' OR meta_ad_account_id != ''
       ORDER BY id ASC`,
    )
    .all()
    .map((row) => ({
      customerId: row.id,
      companyName: row.company_name,
      email: row.email,
      ...adsAccountBinding(row),
    }))
    .filter((row) => row.googleBound || row.metaBound);
}

function parseAdsReportRange(raw) {
  const n = Number(raw);
  if (n === 30) return 30;
  if (n === 90) return 90;
  return 7;
}

function customerAdsReport(customer, rangeRaw) {
  const range = parseAdsReportRange(rangeRaw);
  const account = findCustomerAccount(customer.id) || customer;
  const binding = adsAccountBinding(account);
  const cutoff = dayStamp(range - 1);
  const panelRows = db
    .prepare(
      `SELECT day, ads_clicks, ads_impressions, ads_spend, source
       FROM customer_daily_metrics
       WHERE customer_id = ? AND source = 'panel' AND day >= ?
       ORDER BY day ASC`,
    )
    .all(account.id, cutoff);
  if (!panelRows.length) {
    return { range, series: [], source: "none", binding };
  }
  return {
    range,
    series: panelRows.map((row) => ({
      day: row.day,
      adsClicks: Number(row.ads_clicks) || 0,
      adsImpressions: Number(row.ads_impressions) || 0,
      adsSpend: Number(row.ads_spend) || 0,
    })),
    source: "hatay360",
    binding,
  };
}

function listAllSeoKeywords() {
  return db
    .prepare(
      `SELECT seo_keywords.*, customer_accounts.company_name
       FROM seo_keywords
       JOIN customer_accounts ON customer_accounts.id = seo_keywords.customer_id
       ORDER BY customer_accounts.company_name COLLATE NOCASE, seo_keywords.keyword COLLATE NOCASE, seo_keywords.id ASC`,
    )
    .all()
    .map((row) => ({
      ...publicSeoKeyword(row),
      customerId: row.customer_id,
      companyName: row.company_name,
    }));
}

function findExtraRequestForCatalog(customerId, lineId, details) {
  const byCatalog = db
    .prepare("SELECT * FROM customer_service_requests WHERE catalog_id = ? AND customer_id = ?")
    .get(lineId, customerId);
  if (byCatalog) return byCatalog;
  try {
    const parsed = JSON.parse(String(details || ""));
    const requestId = Number(parsed?.requestId || 0);
    if (requestId) {
      return db.prepare("SELECT * FROM customer_service_requests WHERE id = ? AND customer_id = ?").get(requestId, customerId) || null;
    }
  } catch {
    // detay düz metin olabilir
  }
  return null;
}

function applyExtraCatalogDecision(customerId, lineId, decision) {
  const row = db.prepare("SELECT * FROM customer_catalog WHERE id = ? AND customer_id = ?").get(lineId, customerId);
  if (!row) return { error: "Satır bulunamadı.", status: 404 };
  if (row.kind !== "extra") return { error: "Bu satır ek hizmet değil.", status: 400 };
  const accept = decision === "accept";
  const now = nowIso();
  db.prepare("UPDATE customer_catalog SET status = ?, updated_at = ? WHERE id = ?").run(accept ? "active" : "cancelled", now, lineId);
  const request = findExtraRequestForCatalog(customerId, lineId, row.details);
  if (request) {
    db.prepare("UPDATE customer_service_requests SET status = ?, catalog_id = ?, updated_at = ? WHERE id = ?").run(
      accept ? "accepted" : "closed",
      lineId,
      now,
      request.id,
    );
  }
  return { ok: true, ...customerRecords(customerId) };
}

function applyExtraRequestDecision(requestId, decision) {
  const request = db.prepare("SELECT * FROM customer_service_requests WHERE id = ?").get(requestId);
  if (!request) return { error: "Talep bulunamadı.", status: 404 };
  if (String(request.kind || "service") !== "extra") return { error: "Bu talep ek hizmet değil.", status: 400 };
  const accept = decision === "accept";
  const now = nowIso();
  db.prepare("UPDATE customer_service_requests SET status = ?, updated_at = ? WHERE id = ?").run(accept ? "accepted" : "closed", now, requestId);
  if (request.catalog_id) {
    db.prepare("UPDATE customer_catalog SET status = ?, updated_at = ? WHERE id = ? AND customer_id = ?").run(
      accept ? "active" : "cancelled",
      now,
      request.catalog_id,
      request.customer_id,
    );
  }
  return { ok: true };
}

function findCustomerAccount(customerId) {
  return db.prepare("SELECT * FROM customer_accounts WHERE id = ?").get(Number(customerId)) || null;
}

const PROJECT_STAGES = [
  { key: "baslangic", label: "Başlangıç" },
  { key: "tasarim", label: "Tasarım" },
  { key: "onay", label: "Onay Bekliyor" },
  { key: "gelistirme", label: "Geliştirme" },
  { key: "test", label: "Test" },
  { key: "yayinlaniyor", label: "Yayınlanıyor" },
  { key: "yayinda", label: "Yayında" },
];
const PROJECT_STAGE_KEYS = PROJECT_STAGES.map((item) => item.key);

function projectStageLabel(stage) {
  return PROJECT_STAGES.find((item) => item.key === stage)?.label || stage;
}

function getCustomerProject(customerId) {
  const id = Number(customerId);
  let row = db.prepare("SELECT * FROM customer_project WHERE customer_id = ?").get(id);
  if (!row) {
    const now = nowIso();
    db.prepare("INSERT INTO customer_project (customer_id, stage, updated_at, created_at) VALUES (?, 'baslangic', ?, ?)").run(id, now, now);
    row = db.prepare("SELECT * FROM customer_project WHERE customer_id = ?").get(id);
  }
  return row;
}

function setCustomerStage(customerId, stage, actor, note = "") {
  const id = Number(customerId);
  const nextStage = String(stage || "");
  if (!PROJECT_STAGE_KEYS.includes(nextStage)) return { error: "Geçersiz aşama." };
  const current = getCustomerProject(id);
  if (current.stage === nextStage) return { error: "Aşama değişmedi." };
  const stageNote = cleanText(note, 400);
  if (stageNote.length < 4) return { error: "Müşteri panelinde görünecek kısa not yazın." };
  const now = nowIso();
  db.exec("BEGIN IMMEDIATE");
  try {
    const celebrate = nextStage === "yayinlaniyor" || nextStage === "yayinda";
    db.prepare("UPDATE customer_project SET stage = ?, updated_at = ?, celebration_pending = ?, celebration_seen = CASE WHEN ? THEN 0 ELSE celebration_seen END WHERE customer_id = ?")
      .run(nextStage, now, celebrate ? 1 : 0, celebrate ? 1 : 0, id);
    db.prepare(
      "INSERT INTO customer_project_events (customer_id, from_stage, to_stage, note, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(id, current.stage, nextStage, stageNote, cleanText(actor, 40) || "admin", now);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return { project: customerProjectPayload(id) };
}

function customerProjectPayload(customerId) {
  const id = Number(customerId);
  const row = getCustomerProject(id);
  const stageIndex = Math.max(0, PROJECT_STAGE_KEYS.indexOf(row.stage));
  const lastNoteRow = db
    .prepare(
      "SELECT note, created_at FROM customer_project_events WHERE customer_id = ? AND note IS NOT NULL AND TRIM(note) != '' ORDER BY id DESC LIMIT 1",
    )
    .get(id);
  return {
    stage: row.stage,
    stageLabel: projectStageLabel(row.stage),
    stageIndex,
    totalStages: PROJECT_STAGES.length,
    stages: PROJECT_STAGES.map((item, index) => ({
      key: item.key,
      label: item.label,
      done: index < stageIndex,
      current: index === stageIndex,
    })),
    pendingApprovals: pendingApprovalsCount(id),
    updatedAt: row.updated_at,
    lastNote: lastNoteRow?.note || "",
    lastNoteAt: lastNoteRow?.created_at || "",
    celebrationPending: Number(row.celebration_pending) === 1 && Number(row.celebration_seen) !== 1,
  };
}

function customerProjectEvents(customerId) {
  return db
    .prepare("SELECT id, from_stage, to_stage, note, actor, created_at FROM customer_project_events WHERE customer_id = ? ORDER BY id DESC LIMIT 40")
    .all(Number(customerId))
    .map((row) => ({
      id: row.id,
      fromStage: row.from_stage,
      fromLabel: row.from_stage ? projectStageLabel(row.from_stage) : "",
      toStage: row.to_stage,
      toLabel: projectStageLabel(row.to_stage),
      note: row.note || "",
      actor: row.actor,
      createdAt: row.created_at,
    }));
}

function saveContractFile(customerId, upload, extras = {}) {
  const dir = customerDir(customerId);
  if (!dir) return { error: "Müşteri bulunamadı." };
  mkdirSync(dir, { recursive: true });
  const diskPath = contractDiskPath(customerId, upload.storedName);
  if (!diskPath) return { error: "Dosya adı geçersiz." };
  const createdAt = nowIso();
  const family = Number(extras.familyId) || 0;
  let version = 1;
  db.exec("BEGIN IMMEDIATE");
  try {
    if (family) {
      const existing = db.prepare("SELECT id FROM customer_contracts WHERE customer_id = ? AND family_id = ? LIMIT 1").get(customerId, family);
      if (!existing) {
        db.exec("ROLLBACK");
        return { error: "Sözleşme ailesi bulunamadı." };
      }
      db.prepare("UPDATE customer_contracts SET is_current = 0 WHERE customer_id = ? AND family_id = ?").run(customerId, family);
      const last = db.prepare("SELECT MAX(version) AS version FROM customer_contracts WHERE customer_id = ? AND family_id = ?").get(customerId, family);
      version = Number(last?.version || 0) + 1;
    }
    writeFileSync(diskPath, upload.buffer);
    const result = db
      .prepare(
        `INSERT INTO customer_contracts (
          customer_id, family_id, version, title, original_name, stored_name, mime_type, size_bytes, uploaded_by, is_current, created_at,
          template_id, body_html, sign_status, sign_reason, signature_stored, signed_at, sig_x, sig_y, sig_w, sig_h
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        customerId,
        family || 0,
        version,
        cleanText(extras.title, 160) || upload.originalName,
        upload.originalName,
        upload.storedName,
        upload.mimeType,
        upload.buffer.length,
        extras.uploadedBy,
        createdAt,
        Number(extras.templateId) || 0,
        sanitizeTemplateHtml(extras.bodyHtml),
        cleanText(extras.signStatus, 20) || "pending",
        cleanText(extras.signReason, 400),
        extras.signatureStored || "",
        extras.signedAt || "",
        clampBox(extras.sigX, 12),
        clampBox(extras.sigY, 78),
        clampBox(extras.sigW, 36),
        clampBox(extras.sigH, 12),
      );
    const id = Number(result.lastInsertRowid);
    if (!family) db.prepare("UPDATE customer_contracts SET family_id = ? WHERE id = ?").run(id, id);
    db.exec("COMMIT");
    return { id, familyId: family || id };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function restoreContractVersion(customerId, contractId, uploadedBy) {
  const source = db.prepare("SELECT * FROM customer_contracts WHERE id = ? AND customer_id = ?").get(Number(contractId), customerId);
  if (!source) return { error: "Sözleşme bulunamadı." };
  const sourcePath = contractDiskPath(customerId, source.stored_name);
  if (!sourcePath || !existsSync(sourcePath)) return { error: "Sözleşme dosyası diskte yok." };
  const ext = source.mime_type === "application/pdf" ? "pdf" : "jpg";
  const storedName = `${randomBytes(16).toString("hex")}.${ext}`;
  const buffer = readFileSync(sourcePath);
  return saveContractFile(customerId, {
    originalName: source.original_name,
    storedName,
    mimeType: source.mime_type,
    buffer,
  }, {
    title: source.title || source.original_name,
    familyId: source.family_id,
    uploadedBy,
    templateId: source.template_id,
    bodyHtml: source.body_html,
    signStatus: source.sign_status || "pending",
    signReason: source.sign_reason,
    sigX: source.sig_x,
    sigY: source.sig_y,
    sigW: source.sig_w,
    sigH: source.sig_h,
  });
}

function decodeSignatureJpeg(dataUrl) {
  const raw = String(dataUrl || "").trim();
  const match = raw.match(/^data:image\/(jpeg|jpg);base64,([A-Za-z0-9+/]+=*)$/i) || raw.match(/^([A-Za-z0-9+/]+=*)$/);
  const encoded = match ? match[match.length - 1] : "";
  if (!encoded) return { error: "İmza görseli gönderin." };
  let buffer;
  try {
    buffer = Buffer.from(encoded, "base64");
  } catch {
    return { error: "İmza okunamadı." };
  }
  if (buffer.length < 32 || buffer.length > 1_200_000) return { error: "İmza dosyası geçersiz." };
  if (!(buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)) return { error: "İmza JPEG olmalıdır." };
  return { buffer };
}

function assignContractFromTemplate(customerId, templateId, title) {
  const account = findCustomerAccount(customerId);
  const template = db.prepare("SELECT * FROM contract_templates WHERE id = ?").get(Number(templateId));
  if (!account) return { error: "Müşteri bulunamadı." };
  if (!template) return { error: "Şablon bulunamadı." };
  const bodyHtml = sanitizeTemplateHtml(template.body_html);
  const pdf = buildContractPdf({
    title: template.name,
    body: bodyHtml,
    companyName: account.company_name,
    contactName: account.contact_name,
    sigBox: { x: template.sig_x, y: template.sig_y, w: template.sig_w, h: template.sig_h },
  });
  const storedName = `${randomBytes(16).toString("hex")}.pdf`;
  return saveContractFile(customerId, {
    originalName: `${cleanText(template.name, 80) || "sozlesme"}.pdf`,
    storedName,
    mimeType: "application/pdf",
    buffer: pdf,
  }, {
    title: cleanText(title, 160) || template.name,
    uploadedBy: "admin",
    templateId: template.id,
    bodyHtml,
    signStatus: "pending",
    sigX: template.sig_x,
    sigY: template.sig_y,
    sigW: template.sig_w,
    sigH: template.sig_h,
  });
}

function applyContractSignature(customerId, contractId, signatureJpeg, uploadedBy) {
  const row = db.prepare("SELECT * FROM customer_contracts WHERE id = ? AND customer_id = ?").get(Number(contractId), customerId);
  if (!row) return { error: "Sözleşme bulunamadı." };
  if (row.sign_status === "approved") return { error: "Onaylı sözleşme yeniden imzalanamaz." };
  const account = findCustomerAccount(customerId);
  const signedAt = nowIso();
  const pdf = buildContractPdf({
    title: row.title || row.original_name,
    body: row.body_html || htmlToPlain(row.title),
    companyName: account?.company_name,
    contactName: account?.contact_name,
    signatureJpeg,
    sigBox: { x: row.sig_x, y: row.sig_y, w: row.sig_w, h: row.sig_h },
    signedAt,
    statusLabel: "Imza alindi - incelemede",
  });
  const dir = customerDir(customerId);
  mkdirSync(dir, { recursive: true });
  const storedName = `${randomBytes(16).toString("hex")}.pdf`;
  const signatureStored = `${randomBytes(16).toString("hex")}.jpg`;
  const sigPath = contractDiskPath(customerId, signatureStored);
  if (sigPath) writeFileSync(sigPath, signatureJpeg);
  return saveContractFile(customerId, {
    originalName: row.original_name || "sozlesme.pdf",
    storedName,
    mimeType: "application/pdf",
    buffer: pdf,
  }, {
    title: row.title,
    familyId: row.family_id,
    uploadedBy,
    templateId: row.template_id,
    bodyHtml: row.body_html,
    signStatus: "signed",
    signatureStored,
    signedAt,
    sigX: row.sig_x,
    sigY: row.sig_y,
    sigW: row.sig_w,
    sigH: row.sig_h,
  });
}

function reviewContractStatus(customerId, contractId, status, reason) {
  const row = db.prepare("SELECT * FROM customer_contracts WHERE id = ? AND customer_id = ?").get(Number(contractId), customerId);
  if (!row) return { error: "Sözleşme bulunamadı." };
  const cleanedReason = cleanText(reason, 400);
  const approvedAt = nowIso();

  // Şablon metni + kayıtlı imza varsa onay damgalı yeni PDF sürümü üret.
  if (status === "approved" && String(row.body_html || "").trim()) {
    const account = findCustomerAccount(customerId);
    let signatureJpeg = null;
    if (row.signature_stored) {
      const sigPath = contractDiskPath(customerId, row.signature_stored);
      if (sigPath && existsSync(sigPath)) signatureJpeg = readFileSync(sigPath);
    }
    const pdf = buildContractPdf({
      title: row.title || row.original_name,
      body: row.body_html,
      companyName: account?.company_name,
      contactName: account?.contact_name,
      signatureJpeg,
      sigBox: { x: row.sig_x, y: row.sig_y, w: row.sig_w, h: row.sig_h },
      signedAt: row.signed_at || approvedAt,
      approvedAt,
      statusLabel: "Hatay360 onaylandi",
    });
    const storedName = `${randomBytes(16).toString("hex")}.pdf`;
    const saved = saveContractFile(customerId, {
      originalName: row.original_name || "sozlesme.pdf",
      storedName,
      mimeType: "application/pdf",
      buffer: pdf,
    }, {
      title: row.title,
      familyId: row.family_id,
      uploadedBy: "admin",
      templateId: row.template_id,
      bodyHtml: row.body_html,
      signStatus: "approved",
      signReason: cleanedReason,
      signatureStored: row.signature_stored || "",
      signedAt: row.signed_at || approvedAt,
      sigX: row.sig_x,
      sigY: row.sig_y,
      sigW: row.sig_w,
      sigH: row.sig_h,
    });
    if (saved.error) return saved;
    return { ok: true, id: saved.id };
  }

  db.prepare("UPDATE customer_contracts SET sign_status = ?, sign_reason = ?, updated_at = ? WHERE id = ?").run(
    status,
    cleanedReason,
    approvedAt,
    contractId,
  );
  return { ok: true, id: contractId };
}

function sendContractFile(res, row, download) {
  const diskPath = contractDiskPath(row.customer_id, row.stored_name);
  if (!diskPath || !existsSync(diskPath)) return json(res, 404, { error: "Dosya bulunamadı." });
  const stat = statSync(diskPath);
  const safeName = String(row.original_name || "sozlesme").replace(/[\r\n"]/g, "");
  res.writeHead(200, {
    "Content-Type": row.mime_type,
    "Content-Length": stat.size,
    "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${encodeURIComponent(safeName)}"`,
    "Cache-Control": "no-store",
    ...SECURITY_HEADERS,
  });
  createReadStream(diskPath).pipe(res);
}

/* ===== Onay Modülü (Approval Workflow) — sözleşme akışını birebir örnek alır ===== */
function approvalDiskPath(customerId, storedName) {
  if (!/^[a-f0-9]{32}\.(pdf|jpg|png|webp)$/.test(String(storedName || ""))) return null;
  const dir = customerDir(customerId);
  if (!dir) return null;
  const full = path.resolve(dir, storedName);
  const relative = path.relative(dir, full);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return full;
}

function detectApprovalMime(buffer) {
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-") return "application/pdf";
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "image/png";
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return "";
}

function decodeApprovalUpload(body) {
  const kind = ["file", "image", "text"].includes(String(body.kind)) ? String(body.kind) : "file";
  const bodyText = cleanText(body.bodyText ?? body.body_text, 5000);
  if (kind === "text") {
    if (!bodyText) return { error: "Metin / tasarım notu içeriği girin." };
    return { kind, bodyText, upload: null };
  }
  const originalName = cleanText(body.fileName, 160).replace(/[/\\]/g, "");
  const rawInput = String(body.data || "");
  const raw = (rawInput.includes(",") ? rawInput.slice(rawInput.indexOf(",") + 1) : rawInput).replace(/\s/g, "");
  if (!raw || !/^[A-Za-z0-9+/]+=*$/.test(raw)) return { error: "Görsel veya PDF dosyası gönderin." };
  let buffer;
  try {
    buffer = Buffer.from(raw, "base64");
  } catch {
    return { error: "Dosya okunamadı." };
  }
  if (!buffer.length) return { error: "Dosya boş." };
  if (buffer.length > MAX_APPROVAL_BYTES) return { error: "Dosya en fazla 8 MB olabilir." };
  const mimeType = detectApprovalMime(buffer);
  if (!mimeType) return { error: "Yalnızca PDF, JPG, PNG veya WebP kabul edilir." };
  if (kind === "image" && mimeType === "application/pdf") return { error: "Görsel için JPG, PNG veya WebP yükleyin." };
  const ext = APPROVAL_EXT[mimeType];
  const storedName = `${randomBytes(16).toString("hex")}.${ext}`;
  return { kind, bodyText, upload: { originalName: originalName.slice(0, 160) || `onay.${ext}`, storedName, mimeType, buffer } };
}

function addApprovalEvent(approvalId, actor, action, note) {
  db.prepare("INSERT INTO approval_events (approval_id, actor, action, note, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(Number(approvalId), cleanText(actor, 80) || "admin", cleanText(action, 20), cleanText(note, 400), nowIso());
}

function saveApproval(customerId, { title, description, kind, bodyText, upload, createdBy } = {}) {
  const account = findCustomerAccount(customerId);
  if (!account) return { error: "Müşteri bulunamadı." };
  const cleanTitle = cleanText(title, 160);
  if (cleanTitle.length < 2) return { error: "Onay başlığı yazın." };
  const resolvedKind = ["file", "image", "text"].includes(String(kind)) ? String(kind) : "file";
  const cleanBody = cleanText(bodyText, 5000);
  if (resolvedKind === "text") {
    if (!cleanBody) return { error: "Metin / tasarım notu içeriği girin." };
  } else if (!upload) {
    return { error: "Görsel veya dosya ekleyin." };
  }
  const createdAt = nowIso();
  let stored = { originalName: "", storedName: "", mimeType: "", size: 0 };
  if (upload) {
    const dir = customerDir(customerId);
    if (!dir) return { error: "Müşteri bulunamadı." };
    mkdirSync(dir, { recursive: true });
    const diskPath = approvalDiskPath(customerId, upload.storedName);
    if (!diskPath) return { error: "Dosya adı geçersiz." };
    writeFileSync(diskPath, upload.buffer);
    stored = { originalName: upload.originalName, storedName: upload.storedName, mimeType: upload.mimeType, size: upload.buffer.length };
  }
  const createdBySafe = cleanText(createdBy, 60) || "admin";
  const result = db
    .prepare(
      `INSERT INTO approvals (
        customer_id, title, description, kind, body_text, original_name, stored_name, mime_type, size_bytes,
        status, feedback_text, created_by, created_at, responded_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', '', ?, ?, '', ?)`,
    )
    .run(
      Number(customerId),
      cleanTitle,
      cleanText(description, 2000),
      resolvedKind,
      resolvedKind === "text" ? cleanBody : "",
      stored.originalName,
      stored.storedName,
      stored.mimeType,
      stored.size,
      createdBySafe,
      createdAt,
      createdAt,
    );
  const id = Number(result.lastInsertRowid);
  addApprovalEvent(id, createdBySafe === "admin" ? "admin" : createdBySafe, "created", cleanTitle);
  return { id };
}

function respondApproval(customerId, approvalId, decision, feedback) {
  const row = db.prepare("SELECT * FROM approvals WHERE id = ? AND customer_id = ?").get(Number(approvalId), Number(customerId));
  if (!row) return { error: "Onay kaydı bulunamadı." };
  if (!["approved", "revision"].includes(decision)) return { error: "Geçersiz karar." };
  const cleanFeedback = cleanText(feedback, 2000);
  if (decision === "revision" && cleanFeedback.length < 3) {
    return { error: "Revize için en az 3 karakterlik açıklama yazın." };
  }
  const now = nowIso();
  db.prepare("UPDATE approvals SET status = ?, feedback_text = ?, responded_at = ?, updated_at = ? WHERE id = ? AND customer_id = ?")
    .run(decision, decision === "revision" ? cleanFeedback : "", now, now, Number(approvalId), Number(customerId));
  addApprovalEvent(approvalId, "customer", decision, decision === "revision" ? cleanFeedback : "Onaylandı");
  return { ok: true, id: Number(approvalId) };
}

function sendApprovalFile(res, row, download) {
  const diskPath = approvalDiskPath(row.customer_id, row.stored_name);
  if (!diskPath || !existsSync(diskPath)) return json(res, 404, { error: "Dosya bulunamadı." });
  const stat = statSync(diskPath);
  const safeName = String(row.original_name || "onay").replace(/[\r\n"]/g, "");
  res.writeHead(200, {
    "Content-Type": row.mime_type || "application/octet-stream",
    "Content-Length": stat.size,
    "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${encodeURIComponent(safeName)}"`,
    "Cache-Control": "no-store",
    ...SECURITY_HEADERS,
  });
  createReadStream(diskPath).pipe(res);
}

function listApprovalEvents(approvalId) {
  return db
    .prepare("SELECT actor, action, note, created_at FROM approval_events WHERE approval_id = ? ORDER BY id ASC")
    .all(Number(approvalId))
    .map((event) => ({ actor: event.actor, action: event.action, note: event.note || "", createdAt: event.created_at }));
}

function publicApproval(row, { withEvents = false } = {}) {
  const hasFile = Boolean(row.stored_name);
  return {
    id: row.id,
    title: row.title || "",
    description: row.description || "",
    kind: row.kind || "file",
    bodyText: row.body_text || "",
    status: row.status || "pending",
    feedbackText: row.feedback_text || "",
    fileName: row.original_name || "",
    mimeType: row.mime_type || "",
    sizeBytes: Number(row.size_bytes) || 0,
    hasFile,
    fileUrl: hasFile ? `/api/customer/approvals/${row.id}/file` : "",
    createdBy: row.created_by || "admin",
    createdAt: row.created_at,
    respondedAt: row.responded_at || "",
    updatedAt: row.updated_at || "",
    ...(withEvents ? { events: listApprovalEvents(row.id) } : {}),
  };
}

function listCustomerApprovals(customerId) {
  return db
    .prepare("SELECT * FROM approvals WHERE customer_id = ? ORDER BY id DESC")
    .all(Number(customerId))
    .map((row) => publicApproval(row, { withEvents: true }));
}

function pendingApprovalsCount(customerId) {
  return Number(db.prepare("SELECT COUNT(*) AS n FROM approvals WHERE customer_id = ? AND status = 'pending'").get(Number(customerId))?.n || 0);
}

function adminApprovalList({ status, customerId } = {}) {
  const clauses = [];
  const params = [];
  if (status && ["pending", "approved", "revision"].includes(status)) {
    clauses.push("approvals.status = ?");
    params.push(status);
  }
  if (customerId) {
    clauses.push("approvals.customer_id = ?");
    params.push(Number(customerId));
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = db
    .prepare(
      `SELECT approvals.*, customer_accounts.company_name
       FROM approvals
       JOIN customer_accounts ON customer_accounts.id = approvals.customer_id
       ${where}
       ORDER BY CASE approvals.status WHEN 'pending' THEN 0 WHEN 'revision' THEN 1 ELSE 2 END, approvals.id DESC`,
    )
    .all(...params);
  const now = Date.now();
  return rows.map((row) => {
    const created = new Date(row.created_at).getTime();
    const waitingDays = row.status === "pending" && Number.isFinite(created) ? Math.max(0, Math.floor((now - created) / 86_400_000)) : 0;
    return {
      id: row.id,
      customerId: row.customer_id,
      companyName: row.company_name || "",
      title: row.title || "",
      description: row.description || "",
      kind: row.kind || "file",
      bodyText: row.body_text || "",
      status: row.status || "pending",
      feedbackText: row.feedback_text || "",
      hasFile: Boolean(row.stored_name),
      fileName: row.original_name || "",
      mimeType: row.mime_type || "",
      fileUrl: row.stored_name ? `/api/admin/approvals/${row.id}/file` : "",
      createdBy: row.created_by || "admin",
      createdAt: row.created_at,
      respondedAt: row.responded_at || "",
      waitingDays,
    };
  });
}

/* ===== Teklif / Kayıtlı Kabul (P10) — nitelikli e-imza değil; checkbox + ad + tarih + IP ===== */
const QUOTE_STATUSES = ["pending", "accepted", "withdrawn"];
const QUOTE_EXT = APPROVAL_EXT;

function quoteDiskPath(customerId, storedName) {
  if (!/^[a-f0-9]{32}\.(pdf|jpg|png|webp)$/.test(String(storedName || ""))) return null;
  const dir = customerDir(customerId);
  if (!dir) return null;
  const full = path.resolve(dir, storedName);
  const relative = path.relative(dir, full);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return full;
}

function quoteActiveFileName(row) {
  if (row.status === "accepted" && row.archive_name) return row.archive_name;
  return row.stored_name;
}

function decodeQuoteUpload(body) {
  const originalName = cleanText(body.fileName, 160).replace(/[/\\]/g, "");
  const rawInput = String(body.data || body.file || "");
  const raw = (rawInput.includes(",") ? rawInput.slice(rawInput.indexOf(",") + 1) : rawInput).replace(/\s/g, "");
  if (!raw || !/^[A-Za-z0-9+/]+=*$/.test(raw)) return { error: "PDF veya görsel dosyası gönderin." };
  let buffer;
  try {
    buffer = Buffer.from(raw, "base64");
  } catch {
    return { error: "Dosya okunamadı." };
  }
  if (!buffer.length) return { error: "Dosya boş." };
  if (buffer.length > MAX_APPROVAL_BYTES) return { error: "Dosya en fazla 8 MB olabilir." };
  const mimeType = detectApprovalMime(buffer);
  if (!mimeType) return { error: "Yalnızca PDF, JPG, PNG veya WebP kabul edilir." };
  const ext = QUOTE_EXT[mimeType];
  const storedName = `${randomBytes(16).toString("hex")}.${ext}`;
  return { originalName: originalName.slice(0, 160) || `teklif.${ext}`, storedName, mimeType, buffer };
}

function saveQuote(customerId, { title, upload, createdBy } = {}) {
  const account = findCustomerAccount(customerId);
  if (!account) return { error: "Müşteri bulunamadı." };
  const cleanTitle = cleanText(title, 160);
  if (cleanTitle.length < 2) return { error: "Teklif başlığı yazın." };
  if (!upload) return { error: "PDF veya görsel dosyası gönderin." };
  const dir = customerDir(customerId);
  if (!dir) return { error: "Müşteri bulunamadı." };
  mkdirSync(dir, { recursive: true });
  const diskPath = quoteDiskPath(customerId, upload.storedName);
  if (!diskPath) return { error: "Dosya adı geçersiz." };
  writeFileSync(diskPath, upload.buffer);
  const createdAt = nowIso();
  const createdBySafe = cleanText(createdBy, 60) || "admin";
  const result = db
    .prepare(
      `INSERT INTO quotes (
        customer_id, title, original_name, stored_name, archive_name, mime_type, size_bytes,
        status, accept_name, accept_ip, accepted_at, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, '', ?, ?, 'pending', '', '', '', ?, ?, ?)`,
    )
    .run(
      Number(customerId),
      cleanTitle,
      upload.originalName,
      upload.storedName,
      upload.mimeType,
      upload.buffer.length,
      createdBySafe,
      createdAt,
      createdAt,
    );
  return { id: Number(result.lastInsertRowid) };
}

function sendQuoteFile(res, row, download) {
  const fileName = quoteActiveFileName(row);
  const diskPath = quoteDiskPath(row.customer_id, fileName);
  if (!diskPath || !existsSync(diskPath)) {
    const fallback = quoteDiskPath(row.customer_id, row.stored_name);
    if (!fallback || !existsSync(fallback)) return json(res, 404, { error: "Dosya bulunamadı." });
    const stat = statSync(fallback);
    const safeName = String(row.original_name || "teklif").replace(/[\r\n"]/g, "");
    res.writeHead(200, {
      "Content-Type": row.mime_type || "application/octet-stream",
      "Content-Length": stat.size,
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${encodeURIComponent(safeName)}"`,
      "Cache-Control": "no-store",
      ...SECURITY_HEADERS,
    });
    createReadStream(fallback).pipe(res);
    return;
  }
  const stat = statSync(diskPath);
  const safeName = String(row.original_name || "teklif").replace(/[\r\n"]/g, "");
  res.writeHead(200, {
    "Content-Type": row.mime_type || "application/octet-stream",
    "Content-Length": stat.size,
    "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${encodeURIComponent(safeName)}"`,
    "Cache-Control": "no-store",
    ...SECURITY_HEADERS,
  });
  createReadStream(diskPath).pipe(res);
}

function publicQuote(row) {
  const hasFile = Boolean(row.stored_name || row.archive_name);
  return {
    id: row.id,
    title: row.title || "",
    status: QUOTE_STATUSES.includes(row.status) ? row.status : "pending",
    hasFile,
    acceptedAt: row.accepted_at || "",
    acceptName: row.accept_name || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at || "",
  };
}

function listCustomerQuotes(customerId) {
  return db
    .prepare("SELECT * FROM quotes WHERE customer_id = ? ORDER BY id DESC")
    .all(Number(customerId))
    .map((row) => publicQuote(row));
}

function pendingQuotesCount(customerId) {
  return Number(db.prepare("SELECT COUNT(*) AS n FROM quotes WHERE customer_id = ? AND status = 'pending'").get(Number(customerId))?.n || 0);
}

function adminQuoteList({ status, customerId } = {}) {
  const clauses = [];
  const params = [];
  if (status && QUOTE_STATUSES.includes(status)) {
    clauses.push("quotes.status = ?");
    params.push(status);
  }
  if (customerId) {
    clauses.push("quotes.customer_id = ?");
    params.push(Number(customerId));
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = db
    .prepare(
      `SELECT quotes.*, customer_accounts.company_name
       FROM quotes
       JOIN customer_accounts ON customer_accounts.id = quotes.customer_id
       ${where}
       ORDER BY CASE quotes.status WHEN 'pending' THEN 0 WHEN 'accepted' THEN 1 ELSE 2 END, quotes.id DESC`,
    )
    .all(...params);
  const now = Date.now();
  return rows.map((row) => {
    const created = new Date(row.created_at).getTime();
    const waitingDays = row.status === "pending" && Number.isFinite(created) ? Math.max(0, Math.floor((now - created) / 86_400_000)) : 0;
    const hasFile = Boolean(row.stored_name || row.archive_name);
    return {
      id: row.id,
      customerId: row.customer_id,
      companyName: row.company_name || "",
      title: row.title || "",
      status: QUOTE_STATUSES.includes(row.status) ? row.status : "pending",
      hasFile,
      fileName: row.original_name || "",
      mimeType: row.mime_type || "",
      fileUrl: hasFile ? `/api/admin/quotes/${row.id}/file` : "",
      acceptName: row.accept_name || "",
      acceptIp: row.accept_ip || "",
      acceptedAt: row.accepted_at || "",
      createdBy: row.created_by || "admin",
      createdAt: row.created_at,
      waitingDays,
    };
  });
}

function acceptQuote(customerId, quoteId, { name, ip } = {}) {
  const row = db.prepare("SELECT * FROM quotes WHERE id = ? AND customer_id = ?").get(Number(quoteId), Number(customerId));
  if (!row) return { error: "Teklif bulunamadı.", status: 404 };
  if (row.status === "accepted") return { error: "Bu teklif zaten kabul edildi.", status: 409 };
  if (row.status === "withdrawn") return { error: "Bu teklif geri çekildi.", status: 409 };
  if (row.status !== "pending") return { error: "Bu teklif kabul edilemez.", status: 409 };
  const acceptName = cleanText(name, 120);
  if (acceptName.length < 3) return { error: "Ad soyad en az 3 karakter olmalıdır.", status: 400 };
  const srcPath = quoteDiskPath(row.customer_id, row.stored_name);
  if (!srcPath || !existsSync(srcPath)) return { error: "Teklif dosyası bulunamadı.", status: 404 };
  const extMatch = String(row.stored_name || "").match(/\.(pdf|jpg|png|webp)$/);
  const ext = extMatch ? extMatch[1] : "pdf";
  let archiveName = `${randomBytes(16).toString("hex")}.${ext}`;
  while (archiveName === row.stored_name || archiveName === row.archive_name) {
    archiveName = `${randomBytes(16).toString("hex")}.${ext}`;
  }
  const destPath = quoteDiskPath(row.customer_id, archiveName);
  if (!destPath) return { error: "Arşiv dosyası oluşturulamadı.", status: 500 };
  copyFileSync(srcPath, destPath);
  const now = nowIso();
  db.prepare(
    `UPDATE quotes SET status = 'accepted', archive_name = ?, accept_name = ?, accept_ip = ?, accepted_at = ?, updated_at = ?
     WHERE id = ? AND customer_id = ? AND status = 'pending'`,
  ).run(archiveName, acceptName, cleanText(ip, 60), now, now, Number(quoteId), Number(customerId));
  const updated = db.prepare("SELECT * FROM quotes WHERE id = ?").get(Number(quoteId));
  if (!updated || updated.status !== "accepted") return { error: "Bu teklif zaten kabul edildi.", status: 409 };
  return { ok: true, id: Number(quoteId) };
}

function withdrawQuote(quoteId) {
  const row = db.prepare("SELECT * FROM quotes WHERE id = ?").get(Number(quoteId));
  if (!row) return { error: "Teklif bulunamadı.", status: 404 };
  if (row.status === "accepted") return { error: "Kabul edilen teklif geri çekilemez.", status: 409 };
  if (row.status === "withdrawn") return { error: "Bu teklif zaten geri çekildi.", status: 409 };
  if (row.status !== "pending") return { error: "Yalnızca bekleyen teklif geri çekilebilir.", status: 409 };
  const now = nowIso();
  db.prepare("UPDATE quotes SET status = 'withdrawn', updated_at = ? WHERE id = ? AND status = 'pending'").run(now, Number(quoteId));
  return { ok: true, id: Number(quoteId) };
}

function mutateAcceptedQuoteBlocked(row) {
  if (!row) return { error: "Teklif bulunamadı.", status: 404 };
  if (row.status === "accepted") return { error: "Kabul edilen teklif değiştirilemez.", status: 409 };
  return null;
}

function deleteQuote(quoteId) {
  const row = db.prepare("SELECT * FROM quotes WHERE id = ?").get(Number(quoteId));
  const blocked = mutateAcceptedQuoteBlocked(row);
  if (blocked) return blocked;
  for (const name of [row.stored_name, row.archive_name]) {
    const diskPath = quoteDiskPath(row.customer_id, name);
    if (diskPath && existsSync(diskPath)) {
      try {
        unlinkSync(diskPath);
      } catch {
        /* dosya silinemese kayıt yine kalkar */
      }
    }
  }
  db.prepare("DELETE FROM quotes WHERE id = ?").run(Number(quoteId));
  return { ok: true, id: Number(quoteId) };
}

function updatePendingQuote(quoteId, { title, upload } = {}) {
  const row = db.prepare("SELECT * FROM quotes WHERE id = ?").get(Number(quoteId));
  const blocked = mutateAcceptedQuoteBlocked(row);
  if (blocked) return blocked;
  if (row.status !== "pending") return { error: "Yalnızca bekleyen teklif güncellenebilir.", status: 409 };
  const cleanTitle = title != null ? cleanText(title, 160) : row.title;
  if (cleanTitle.length < 2) return { error: "Teklif başlığı yazın.", status: 400 };
  let stored = { original_name: row.original_name, stored_name: row.stored_name, mime_type: row.mime_type, size_bytes: row.size_bytes };
  if (upload) {
    const diskPath = quoteDiskPath(row.customer_id, upload.storedName);
    if (!diskPath) return { error: "Dosya adı geçersiz.", status: 400 };
    mkdirSync(customerDir(row.customer_id), { recursive: true });
    writeFileSync(diskPath, upload.buffer);
    const oldPath = quoteDiskPath(row.customer_id, row.stored_name);
    if (oldPath && existsSync(oldPath) && oldPath !== diskPath) {
      try {
        unlinkSync(oldPath);
      } catch {
        /* eski dosya kalsın */
      }
    }
    stored = {
      original_name: upload.originalName,
      stored_name: upload.storedName,
      mime_type: upload.mimeType,
      size_bytes: upload.buffer.length,
    };
  }
  const now = nowIso();
  db.prepare(
    `UPDATE quotes SET title = ?, original_name = ?, stored_name = ?, mime_type = ?, size_bytes = ?, updated_at = ?
     WHERE id = ? AND status = 'pending'`,
  ).run(cleanTitle, stored.original_name, stored.stored_name, stored.mime_type, stored.size_bytes, now, Number(quoteId));
  return { ok: true, id: Number(quoteId) };
}

// --- Otomatik Yenileme Hatırlatması (P5) ---
// Yenilenebilir hizmetler: alan adı, hosting, bakım paketi, SSL vb. Panel-içi hatırlatma;
// e-posta/SMS bu aşamada kapsam dışıdır (kimlik bilgisi yok). Gelecekte cron + SMTP için temiz seam.
const RENEWAL_KINDS = ["domain", "hosting", "bakim", "ssl", "web_tasarim", "yazilim", "reklam", "ozel_kodlama", "diger"];
const RENEWAL_STATUSES = ["active", "cancelled", "done"];
const RENEW_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Bugünden itibaren gün farkı (tarih-yalnız, yerel/İstanbul takvimi). Negatif = süresi geçmiş. */
function renewalDaysLeft(renewDate) {
  const parts = String(renewDate || "").split("-").map((value) => Number(value));
  if (parts.length < 3 || parts.some((value) => !Number.isFinite(value))) return 0;
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const renewUtc = Date.UTC(parts[0], parts[1] - 1, parts[2]);
  return Math.round((renewUtc - todayUtc) / 86_400_000);
}

/** overdue (<0) · due (0..14) · upcoming (15..45) · later (>45). Eşikler: 14/7/1 due içindedir. */
function renewalBucket(daysLeft) {
  if (daysLeft < 0) return "overdue";
  if (daysLeft <= 14) return "due";
  if (daysLeft <= 45) return "upcoming";
  return "later";
}

function publicRenewal(row) {
  const daysLeft = renewalDaysLeft(row.renew_date);
  return {
    id: row.id,
    customerId: row.customer_id,
    companyName: row.company_name || "",
    kind: RENEWAL_KINDS.includes(row.kind) ? row.kind : "diger",
    label: row.label || "",
    renewDate: row.renew_date,
    amount: Number(row.amount) || 0,
    note: row.note || "",
    status: RENEWAL_STATUSES.includes(row.status) ? row.status : "active",
    daysLeft,
    bucket: renewalBucket(daysLeft),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function customerRenewals(customerId) {
  return db
    .prepare("SELECT * FROM customer_renewals WHERE customer_id = ? ORDER BY renew_date ASC, id ASC")
    .all(Number(customerId))
    .map(publicRenewal);
}

function adminRenewalsList({ status, bucket, customerId } = {}) {
  const clauses = [];
  const params = [];
  if (status && RENEWAL_STATUSES.includes(status)) {
    clauses.push("customer_renewals.status = ?");
    params.push(status);
  }
  if (customerId) {
    clauses.push("customer_renewals.customer_id = ?");
    params.push(Number(customerId));
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  let rows = db
    .prepare(
      `SELECT customer_renewals.*, customer_accounts.company_name
       FROM customer_renewals
       JOIN customer_accounts ON customer_accounts.id = customer_renewals.customer_id
       ${where}
       ORDER BY customer_renewals.renew_date ASC, customer_renewals.id ASC`,
    )
    .all(...params)
    .map(publicRenewal);
  if (bucket && ["overdue", "due", "upcoming", "later"].includes(bucket)) {
    rows = rows.filter((row) => row.bucket === bucket);
  }
  return rows;
}

/** Aktif yenilemeler için süresi geçmiş + 14 gün içindeki sayılar (ops badge). */
function renewalAlertCounts() {
  let overdue = 0;
  let due = 0;
  for (const row of db.prepare("SELECT renew_date FROM customer_renewals WHERE status = 'active'").all()) {
    const daysLeft = renewalDaysLeft(row.renew_date);
    if (daysLeft < 0) overdue += 1;
    else if (daysLeft <= 14) due += 1;
  }
  return { overdue, due };
}

/**
 * Günlük cron burayı çağırır. Saf fonksiyon: 14/7/1 gün kala veya süresi geçmiş (daysLeft < 0)
 * aktif yenilemeleri döndürür; HİÇBİR transport (e-posta/SMS) tetiklemez.
 */
function collectDueRenewals(thresholds = [14, 7, 1]) {
  const rows = db
    .prepare(
      `SELECT customer_renewals.*, customer_accounts.company_name, customer_accounts.email
       FROM customer_renewals
       JOIN customer_accounts ON customer_accounts.id = customer_renewals.customer_id
       WHERE customer_renewals.status = 'active'`,
    )
    .all();
  const items = [];
  for (const row of rows) {
    const daysLeft = renewalDaysLeft(row.renew_date);
    if (daysLeft < 0 || thresholds.includes(daysLeft)) {
      items.push({ ...publicRenewal(row), email: row.email || "", reminderDay: daysLeft < 0 ? "overdue" : daysLeft });
    }
  }
  return items;
}

const RENEWAL_KIND_TR = { domain: "Alan adı", hosting: "Hosting", bakim: "Bakım paketi", ssl: "SSL", diger: "Hizmet" };
const RENEWAL_NOTICE_KINDS = new Set(["renewal_14", "renewal_7", "renewal_1", "renewal_overdue"]);

function renewalNoticeCopy(item) {
  const name = item.label || RENEWAL_KIND_TR[item.kind] || "Hizmet";
  if (item.daysLeft < 0 || item.reminderDay === "overdue") {
    return {
      kind: "renewal_overdue",
      title: "Yenileme tarihi geçti",
      body: `${name} yenileme tarihi geçti. Hatay360 ekibiyle görüşebilirsiniz.`,
      ref: `${item.id}:overdue`,
    };
  }
  const day = Number(item.reminderDay ?? item.daysLeft);
  const kind = day === 1 ? "renewal_1" : day === 7 ? "renewal_7" : "renewal_14";
  const when = day === 1 ? "yarın" : `${day} gün içinde`;
  return {
    kind,
    title: day === 1 ? "Yenileme yarın" : `Yenileme ${day} gün içinde`,
    body: `${name} ${when} yenilenecek.`,
    ref: `${item.id}:${day}`,
  };
}

function publicNotification(row) {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title || "",
    body: row.body || "",
    ref: row.ref || "",
    createdAt: row.created_at,
    readAt: row.read_at || "",
  };
}

function customerNotifications(customerId, { unreadOnly = false, limit = 8 } = {}) {
  const where = unreadOnly ? "AND read_at = ''" : "";
  return db
    .prepare(
      `SELECT * FROM customer_notifications WHERE customer_id = ? ${where} ORDER BY created_at DESC, id DESC LIMIT ?`,
    )
    .all(Number(customerId), Math.max(1, Math.min(Number(limit) || 8, 40)))
    .map(publicNotification);
}

function unreadNotificationCount(customerId) {
  return Number(
    db.prepare("SELECT COUNT(*) AS n FROM customer_notifications WHERE customer_id = ? AND read_at = ''").get(Number(customerId))?.n || 0,
  );
}

function cronSecretProvided(req) {
  const auth = String(req.headers.authorization || "");
  const bearer = /^Bearer\s+/i.test(auth) ? auth.replace(/^Bearer\s+/i, "").trim() : "";
  const header = String(req.headers["x-cron-secret"] || "").trim();
  return bearer || header;
}

function cronSecretMatches(provided) {
  const expected = String(process.env.CRON_SECRET || "").trim();
  if (!expected) return false;
  const left = Buffer.from(String(provided || ""));
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** Panel bildirimi yazar; SMTP/e-posta çağırmaz. */
function insertDueRenewalNotifications() {
  const due = collectDueRenewals();
  const insert = db.prepare(
    `INSERT OR IGNORE INTO customer_notifications (customer_id, kind, title, body, ref, read_at, created_at)
     VALUES (?, ?, ?, ?, ?, '', ?)`,
  );
  let inserted = 0;
  const createdAt = nowIso();
  for (const item of due) {
    const copy = renewalNoticeCopy(item);
    if (!RENEWAL_NOTICE_KINDS.has(copy.kind)) continue;
    const result = insert.run(item.customerId, copy.kind, copy.title, copy.body, copy.ref, createdAt);
    if (result.changes > 0) inserted += 1;
  }
  return { inserted, scanned: due.length, at: createdAt };
}

function paymentInvoiceStatusLabel(payment) {
  if (payment.overdue && payment.remaining > 0) return "Gecikmis (CEZA %15)";
  if (payment.status === "paid") return "Odendi";
  if (payment.status === "remaining") return "Kalan";
  return "Odenmedi";
}

function buildCustomerPaymentInvoicePdf(account, paymentRow) {
  const payment = publicPayment(paymentRow);
  return buildInvoicePdf({
    companyName: account?.company_name,
    contactName: account?.contact_name,
    email: account?.email,
    phone: account?.phone,
    period: payment.period,
    startDate: payment.startDate,
    endDate: payment.endDate,
    statusLabel: paymentInvoiceStatusLabel(payment),
    amount: payment.amount,
    paidAmount: payment.paidAmount,
    unpaidBase: payment.unpaidBase,
    penalty: payment.penalty,
    remaining: payment.remaining,
    overdue: payment.overdue,
    daysOverdue: payment.daysOverdue,
    note: payment.note,
    issuedAt: nowIso().slice(0, 10),
  });
}

function paymentInvoiceDownloadName(paymentRow, customerId) {
  const payment = publicPayment(paymentRow);
  const period = String(payment.period || paymentRow.period || "donem").replace(/[^\d-]/g, "") || "donem";
  const base = customerId != null ? `hatay360-odeme-${customerId}-${period}` : `hatay360-odeme-${period}`;
  return payment.overdue && payment.remaining > 0 ? `${base}-ceza.pdf` : `${base}.pdf`;
}

function sendPdfBuffer(res, buffer, fileName, download = true) {
  const safeName = String(fileName || "hatay360-fatura.pdf").replace(/[\r\n"]/g, "");
  res.writeHead(200, {
    "Content-Type": "application/pdf",
    "Content-Length": buffer.length,
    "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${encodeURIComponent(safeName)}"`,
    "Cache-Control": "no-store",
    ...SECURITY_HEADERS,
  });
  res.end(buffer);
}

function nextTicketQueuePosition() {
  const row = db.prepare("SELECT COALESCE(MAX(queue_position), 0) AS max FROM customer_tickets WHERE queue_position > 0").get();
  return Number(row?.max || 0) + 1;
}

function nextWhatsappQueuePosition() {
  const row = db.prepare("SELECT COALESCE(MAX(queue_position), 0) AS max FROM customer_whatsapp_queue WHERE queue_position > 0 AND status = 'waiting'").get();
  return Number(row?.max || 0) + 1;
}

function compactTicketQueueAfter(position) {
  if (position > 0) {
    db.prepare("UPDATE customer_tickets SET queue_position = queue_position - 1 WHERE queue_position > ?").run(position);
  }
}

function compactWhatsappQueueAfter(position) {
  if (position > 0) {
    db.prepare("UPDATE customer_whatsapp_queue SET queue_position = queue_position - 1 WHERE queue_position > ? AND status = 'waiting'").run(position);
  }
}

function leaveTicketQueue(ticketId) {
  const ticket = db.prepare("SELECT queue_position FROM customer_tickets WHERE id = ?").get(Number(ticketId));
  const position = Number(ticket?.queue_position || 0);
  if (position > 0) {
    db.prepare("UPDATE customer_tickets SET queue_position = 0 WHERE id = ?").run(Number(ticketId));
    compactTicketQueueAfter(position);
  }
  return position;
}

function ticketAggregates() {
  const row = db
    .prepare(
      `SELECT
         SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS openCount,
         SUM(CASE WHEN status = 'answering' THEN 1 ELSE 0 END) AS answeringCount,
         SUM(CASE WHEN status = 'answered' THEN 1 ELSE 0 END) AS answeredCount,
         SUM(CASE WHEN status = 'open' AND queue_position > 0 THEN 1 ELSE 0 END) AS waitingCount
       FROM customer_tickets`,
    )
    .get();
  const avg = db
    .prepare(
      `SELECT AVG((julianday(updated_at) - julianday(created_at)) * 24 * 60) AS minutes
       FROM customer_tickets
       WHERE status IN ('answered', 'closed') AND TRIM(admin_reply) != ''`,
    )
    .get();
  const whatsappWaiting = db.prepare("SELECT COUNT(*) AS n FROM customer_whatsapp_queue WHERE status = 'waiting'").get();
  return {
    open: Number(row?.openCount || 0),
    answering: Number(row?.answeringCount || 0),
    answered: Number(row?.answeredCount || 0),
    waiting: Number(row?.waitingCount || 0),
    operatorWatching: Number(row?.answeringCount || 0),
    avgReplyMinutes: avg?.minutes == null ? null : Math.max(1, Math.round(Number(avg.minutes))),
    whatsappWaiting: Number(whatsappWaiting?.n || 0),
  };
}

/** Hesap + harita kaydı NAP alan sayısı (müşteri portalı ile aynı kural). */
function accountNapIssueCount(account, mapsRow) {
  if (!account || !mapsRow) return 0;
  return countPortalNapIssues({
    maps: [
      {
        businessName: mapsRow.business_name,
        phone: mapsRow.phone,
        address: mapsRow.address,
      },
    ],
    companyName: account.company_name,
    companyPhone: account.phone,
    websitePhone: account.site_phone,
    websiteAddress: account.site_address,
  });
}

/** Admin panel aksiyon sayaçları — CEZA ×1.15 summarizePayments ile aynı mantık. */
function computeOpsAlerts() {
  const tickets = ticketAggregates();
  const paymentRows = db
    .prepare("SELECT customer_id, amount, paid_amount, status, period, start_date, end_date FROM customer_payments")
    .all();
  const byCustomer = new Map();
  for (const row of paymentRows) {
    const list = byCustomer.get(row.customer_id) || [];
    list.push({
      amount: row.amount,
      paidAmount: row.paid_amount,
      status: row.status,
      period: row.period,
      startDate: row.start_date,
      endDate: row.end_date,
    });
    byCustomer.set(row.customer_id, list);
  }
  let overdueCustomers = 0;
  let overdueRows = 0;
  let overduePenalty = 0;
  let overdueRemaining = 0;
  for (const rows of byCustomer.values()) {
    const summary = summarizePayments(rows);
    if (Number(summary.overdueCount || 0) > 0) {
      overdueCustomers += 1;
      overdueRows += Number(summary.overdueCount || 0);
      overduePenalty += Number(summary.penalty || 0);
      overdueRemaining += Number(summary.remaining || 0);
    }
  }
  const contractsAwaitingApprove = Number(
    db
      .prepare("SELECT COUNT(*) AS n FROM customer_contracts WHERE is_current = 1 AND sign_status = 'signed'")
      .get()?.n || 0,
  );
  const leadsNeedingApprove = Number(
    db
      .prepare(
        `SELECT COUNT(*) AS n FROM leads
         WHERE kind IN ('new_customer', 'maps', 'callback', 'partner_referral')
           AND status NOT IN ('won', 'closed')`,
      )
      .get()?.n || 0,
  );
  const pendingPartners = Number(
    db.prepare("SELECT COUNT(*) AS n FROM partner_accounts WHERE status = 'pending'").get()?.n || 0,
  );
  const serviceRequestsNew = Number(
    db.prepare("SELECT COUNT(*) AS n FROM customer_service_requests WHERE status = 'new'").get()?.n || 0,
  );
  const extraRequestsNew = Number(
    db.prepare("SELECT COUNT(*) AS n FROM customer_service_requests WHERE kind = 'extra' AND status = 'new'").get()?.n || 0,
  );
  const approvalsPending = Number(
    db.prepare("SELECT COUNT(*) AS n FROM approvals WHERE status = 'pending'").get()?.n || 0,
  );
  const quotesPending = Number(
    db.prepare("SELECT COUNT(*) AS n FROM quotes WHERE status = 'pending'").get()?.n || 0,
  );
  const renewals = renewalAlertCounts();
  const latestMaps = new Map();
  for (const row of db.prepare("SELECT customer_id, business_name, phone, address FROM customer_maps ORDER BY updated_at DESC, id DESC").all()) {
    if (!latestMaps.has(row.customer_id)) latestMaps.set(row.customer_id, row);
  }
  let napCustomers = 0;
  let napIssues = 0;
  for (const account of db.prepare("SELECT id, company_name, phone, site_phone, site_address FROM customer_accounts").all()) {
    const mapsRow = latestMaps.get(account.id);
    if (!mapsRow) continue;
    const issues = accountNapIssueCount(account, mapsRow);
    if (issues > 0) {
      napCustomers += 1;
      napIssues += issues;
    }
  }
  const total =
    tickets.open +
    tickets.answering +
    tickets.whatsappWaiting +
    overdueCustomers +
    contractsAwaitingApprove +
    approvalsPending +
    quotesPending +
    leadsNeedingApprove +
    pendingPartners +
    serviceRequestsNew +
    napCustomers +
    renewals.overdue +
    renewals.due;
  return {
    total,
    ticketsOpen: tickets.open,
    ticketsAnswering: tickets.answering,
    whatsappWaiting: tickets.whatsappWaiting,
    overdueCustomers,
    overdueRows,
    overduePenalty: Math.round(overduePenalty * 100) / 100,
    overdueRemaining: Math.round(overdueRemaining * 100) / 100,
    contractsAwaitingApprove,
    approvalsPending,
    quotesPending,
    leadsNeedingApprove,
    pendingPartners,
    serviceRequestsNew,
    extraRequestsNew,
    napCustomers,
    napIssues,
    renewalsOverdue: renewals.overdue,
    renewalsDue: renewals.due,
  };
}

const INBOX_CAP = 80;
const INBOX_URGENCY_RANK = { now: 0, soon: 1, normal: 2 };
const TICKET_STALE_MS = 4 * 60 * 60 * 1000;

function adminInboxItem(row) {
  return {
    type: row.type,
    id: Number(row.id) || 0,
    customerId: Number(row.customerId) || 0,
    title: String(row.title || "").slice(0, 180),
    subtitle: String(row.subtitle || "").slice(0, 220),
    createdAt: row.createdAt || "",
    hrefTab: row.hrefTab,
    urgency: row.urgency === "now" || row.urgency === "soon" ? row.urgency : "normal",
  };
}

/** Bekleyen işler kutusu — onay / teklif / ek hizmet / yenileme / ticket / lead. */
function adminInbox() {
  const items = [];

  for (const row of db
    .prepare(
      `SELECT approvals.id, approvals.customer_id, approvals.title, approvals.created_at, customer_accounts.company_name
       FROM approvals
       JOIN customer_accounts ON customer_accounts.id = approvals.customer_id
       WHERE approvals.status = 'pending'
       ORDER BY approvals.created_at DESC
       LIMIT 40`,
    )
    .all()) {
    items.push(
      adminInboxItem({
        type: "approval",
        id: row.id,
        customerId: row.customer_id,
        title: row.title || "Onay bekliyor",
        subtitle: row.company_name || "",
        createdAt: row.created_at,
        hrefTab: "approvals",
        urgency: "soon",
      }),
    );
  }

  for (const row of db
    .prepare(
      `SELECT quotes.id, quotes.customer_id, quotes.title, quotes.created_at, customer_accounts.company_name
       FROM quotes
       JOIN customer_accounts ON customer_accounts.id = quotes.customer_id
       WHERE quotes.status = 'pending'
       ORDER BY quotes.created_at DESC
       LIMIT 40`,
    )
    .all()) {
    items.push(
      adminInboxItem({
        type: "quote",
        id: row.id,
        customerId: row.customer_id,
        title: row.title || "Teklif bekliyor",
        subtitle: row.company_name || "",
        createdAt: row.created_at,
        hrefTab: "quotes",
        urgency: "soon",
      }),
    );
  }

  for (const row of db
    .prepare(
      `SELECT customer_service_requests.id, customer_service_requests.customer_id, customer_service_requests.service,
              customer_service_requests.details, customer_service_requests.created_at, customer_accounts.company_name
       FROM customer_service_requests
       JOIN customer_accounts ON customer_accounts.id = customer_service_requests.customer_id
       WHERE customer_service_requests.kind = 'extra' AND customer_service_requests.status = 'new'
       ORDER BY customer_service_requests.created_at DESC
       LIMIT 40`,
    )
    .all()) {
    items.push(
      adminInboxItem({
        type: "extra",
        id: row.id,
        customerId: row.customer_id,
        title: row.service || "Ek hizmet talebi",
        subtitle: [row.company_name, row.details].filter(Boolean).join(" · "),
        createdAt: row.created_at,
        hrefTab: "tickets",
        urgency: "soon",
      }),
    );
  }

  for (const row of db
    .prepare(
      `SELECT customer_renewals.id, customer_renewals.customer_id, customer_renewals.kind, customer_renewals.label,
              customer_renewals.renew_date, customer_renewals.created_at, customer_accounts.company_name
       FROM customer_renewals
       JOIN customer_accounts ON customer_accounts.id = customer_renewals.customer_id
       WHERE customer_renewals.status = 'active'`,
    )
    .all()) {
    const daysLeft = renewalDaysLeft(row.renew_date);
    if (daysLeft > 14) continue;
    const kindLabel = RENEWAL_KIND_TR[row.kind] || row.kind || "Yenileme";
    const name = row.label || kindLabel;
    items.push(
      adminInboxItem({
        type: "renewal",
        id: row.id,
        customerId: row.customer_id,
        title: name,
        subtitle:
          daysLeft < 0
            ? `${row.company_name || ""} · ${Math.abs(daysLeft)} gün gecikti`
            : `${row.company_name || ""} · ${daysLeft} gün kaldı`,
        createdAt: row.created_at,
        hrefTab: "renewals",
        urgency: daysLeft < 0 ? "now" : "soon",
      }),
    );
  }

  for (const row of db
    .prepare(
      `SELECT customer_tickets.id, customer_tickets.customer_id, customer_tickets.subject, customer_tickets.status,
              customer_tickets.created_at, customer_tickets.updated_at, customer_accounts.company_name
       FROM customer_tickets
       JOIN customer_accounts ON customer_accounts.id = customer_tickets.customer_id
       WHERE customer_tickets.status IN ('open', 'answering')
       ORDER BY customer_tickets.updated_at DESC
       LIMIT 50`,
    )
    .all()) {
    const stamp = Date.parse(row.updated_at || row.created_at || "");
    const stale = Number.isFinite(stamp) && Date.now() - stamp >= TICKET_STALE_MS;
    if (row.status !== "open" && !stale) continue;
    items.push(
      adminInboxItem({
        type: "ticket",
        id: row.id,
        customerId: row.customer_id,
        title: row.subject || "Ticket",
        subtitle: stale ? `${row.company_name || ""} · 4 saatten eski` : row.company_name || "",
        createdAt: row.created_at,
        hrefTab: "tickets",
        urgency: stale ? "now" : "soon",
      }),
    );
  }

  for (const row of db
    .prepare(
      `SELECT id, name, service, status, created_at, referred_by_customer_id
       FROM leads
       WHERE status IN ('new', 'pending')
       ORDER BY created_at DESC
       LIMIT 40`,
    )
    .all()) {
    items.push(
      adminInboxItem({
        type: "lead",
        id: row.id,
        customerId: row.referred_by_customer_id || 0,
        title: row.name || "Yeni kayıt",
        subtitle: [row.service, row.status].filter(Boolean).join(" · "),
        createdAt: row.created_at,
        hrefTab: "signups",
        urgency: "normal",
      }),
    );
  }

  items.sort((a, b) => {
    const rankA = INBOX_URGENCY_RANK[a.urgency] ?? 2;
    const rankB = INBOX_URGENCY_RANK[b.urgency] ?? 2;
    if (rankA !== rankB) return rankA - rankB;
    return String(b.createdAt).localeCompare(String(a.createdAt));
  });
  return items.slice(0, INBOX_CAP);
}

function customerQueueView(customerId, vitrin = ticketVitrinSettings()) {
  const ticket = db
    .prepare(
      `SELECT id, status, queue_position FROM customer_tickets
       WHERE customer_id = ? AND (queue_position > 0 OR status = 'answering')
       ORDER BY CASE WHEN queue_position > 0 THEN 0 ELSE 1 END, queue_position ASC, id ASC
       LIMIT 1`,
    )
    .get(customerId);
  const whatsapp = db
    .prepare(
      `SELECT id, status, queue_position FROM customer_whatsapp_queue
       WHERE customer_id = ? AND status IN ('waiting', 'serving')
       ORDER BY CASE WHEN status = 'waiting' THEN 0 ELSE 1 END, queue_position ASC, id ASC
       LIMIT 1`,
    )
    .get(customerId);
  return {
    ticketId: ticket?.id || null,
    ticketPosition: ticket && Number(ticket.queue_position) > 0 ? displayQueuePosition(ticket.queue_position, vitrin.open) : null,
    ticketServing: ticket?.status === "answering",
    whatsappId: whatsapp?.id || null,
    whatsappPosition: whatsapp && whatsapp.status === "waiting" ? displayQueuePosition(whatsapp.queue_position, vitrin.whatsappWaiting) : null,
    whatsappServing: whatsapp?.status === "serving",
  };
}

function ticketVitrinSettings() {
  const row = db.prepare("SELECT value FROM app_meta WHERE key = 'ticket_vitrin'").get();
  if (row?.value) {
    try {
      const parsed = JSON.parse(row.value);
      const open = Math.max(0, Math.min(9999, Number(parsed.open) || 0));
      return {
        open,
        answering: Math.max(0, Math.min(9999, Number(parsed.answering) || 0)),
        answered: Math.max(0, Math.min(99999, Number(parsed.answered) || 0)),
        whatsappWaiting:
          parsed.whatsappWaiting === undefined
            ? Math.max(3, Math.round(open / 8) + 2)
            : Math.max(0, Math.min(9999, Number(parsed.whatsappWaiting) || 0)),
      };
    } catch {
      // seed again
    }
  }
  const real = ticketAggregates();
  const seeded = {
    open: Math.max(18, real.open * 8 + 14),
    answering: Math.max(2, real.answering * 3 + 2),
    answered: Math.max(64, real.answered * 9 + 36),
    whatsappWaiting: Math.max(3, real.whatsappWaiting * 2 + 4),
  };
  db.prepare("INSERT INTO app_meta (key, value) VALUES ('ticket_vitrin', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(JSON.stringify(seeded));
  return seeded;
}

function saveTicketVitrin(body) {
  const current = ticketVitrinSettings();
  const next = {
    open: body.open === undefined ? current.open : Math.max(0, Math.min(9999, Number(body.open) || 0)),
    answering: body.answering === undefined ? current.answering : Math.max(0, Math.min(9999, Number(body.answering) || 0)),
    answered: body.answered === undefined ? current.answered : Math.max(0, Math.min(99999, Number(body.answered) || 0)),
    whatsappWaiting: body.whatsappWaiting === undefined ? current.whatsappWaiting : Math.max(0, Math.min(9999, Number(body.whatsappWaiting) || 0)),
  };
  db.prepare("INSERT INTO app_meta (key, value) VALUES ('ticket_vitrin', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(JSON.stringify(next));
  return next;
}

/** Müşteriye gösterilen sıra numarası vitrin (gösterge) sayısıyla tutarlı olsun:
 *  gerçek sıra 1 + vitrin.open 46 → görünen "Sıra 47". Gerçek sıra 0 ise null. */
function displayQueuePosition(realPosition, offset) {
  const real = Number(realPosition) || 0;
  if (real <= 0) return null;
  return real + Math.max(0, Number(offset) || 0);
}

function companyFromLead(lead) {
  const fromNotes = String(lead.notes || "").match(/İşletme:\s*(.+)/);
  return cleanText(fromNotes?.[1] || lead.service || lead.name, 160) || lead.name;
}

function emailFromLead(lead) {
  const email = cleanText(lead.email, 160).toLowerCase();
  if (email.includes("@")) return email;
  const digits = String(lead.phone || "").replace(/\D/g, "").slice(-10);
  return `m${digits || lead.id}@hatay360.musteri`;
}

function upsertCustomerFromPerson({ companyName, contactName, email, phone, packageId = "", nationalId = "" }) {
  const normalizedTc = normalizeNationalId(nationalId);
  const existing = findExistingCustomer({ email, phone, nationalId: normalizedTc });
  const password = generateMemberPassword();
  const credentials = hashPassword(password);
  const now = nowIso();
  const resolvedEmail = existing?.email || email;
  if (existing) {
    db.prepare(
      `UPDATE customer_accounts SET
        company_name = ?, contact_name = ?, phone = ?, status = 'active',
        national_id = CASE WHEN ? != '' THEN ? ELSE national_id END,
        password_hash = ?, password_salt = ?, updated_at = ?
       WHERE id = ?`,
    ).run(
      companyName,
      contactName,
      phone || existing.phone,
      normalizedTc,
      normalizedTc,
      credentials.hash,
      credentials.salt,
      now,
      existing.id,
    );
    db.prepare("DELETE FROM customer_sessions WHERE customer_id = ?").run(existing.id);
    return { id: existing.id, email: resolvedEmail, password, existing: true };
  }
  const referralCode = generateReferralCode();
  const result = db.prepare(
    `INSERT INTO customer_accounts (company_name, contact_name, email, phone, national_id, password_hash, password_salt, status, package_id, referral_code, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)`,
  ).run(
    companyName,
    contactName,
    email,
    phone || "",
    normalizedTc,
    credentials.hash,
    credentials.salt,
    packageId,
    referralCode,
    now,
    now,
  );
  return { id: Number(result.lastInsertRowid), email, password, existing: false };
}

function approveLeadAccount(leadId) {
  const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(Number(leadId));
  if (!lead) return { error: "Başvuru bulunamadı." };
  const contactName = cleanText(lead.name, 160);
  const companyName = companyFromLead(lead);
  const email = emailFromLead(lead);
  const created = upsertCustomerFromPerson({
    companyName,
    contactName,
    email,
    phone: lead.phone,
    nationalId: lead.national_id || "",
  });
  if (lead.kind === "maps") {
    const mapsExists = db.prepare("SELECT id FROM customer_maps WHERE customer_id = ? LIMIT 1").get(created.id);
    if (!mapsExists) {
      db.prepare(
        `INSERT INTO customer_maps (customer_id, business_name, status, maps_url, address, phone, created_at, updated_at)
         VALUES (?, ?, 'pending', '', ?, ?, ?, ?)`,
      ).run(created.id, companyName, lead.address || "", lead.phone || "", nowIso(), nowIso());
    }
  }
  db.prepare("UPDATE leads SET status = 'won', updated_at = ? WHERE id = ?").run(nowIso(), lead.id);
  return {
    ok: true,
    kind: lead.kind || "callback",
    customerId: created.id,
    email: created.email,
    generatedPassword: created.password,
    existing: created.existing,
  };
}

function approvePartnerAccount(partnerId) {
  const partner = db.prepare("SELECT * FROM partner_accounts WHERE id = ?").get(Number(partnerId));
  if (!partner) return { error: "Bayi bulunamadı." };
  // Kayıt sırasında belirlenen şifre korunur. Login /api/partners/login status === 'active' ister.
  // Eski davranış (şifre yeniden üretme) kayıt şifresiyle girişi kırıyordu.
  db.prepare(`UPDATE partner_accounts SET status = 'active', updated_at = ? WHERE id = ?`).run(nowIso(), partner.id);
  ensurePartnerReferralCode(partner.id);
  const lead = db.prepare("SELECT id FROM leads WHERE kind = 'partner' AND email = ? ORDER BY id DESC LIMIT 1").get(partner.email);
  if (lead) db.prepare("UPDATE leads SET status = 'won', updated_at = ? WHERE id = ?").run(nowIso(), lead.id);
  return {
    ok: true,
    partnerId: partner.id,
    email: partner.email,
    passwordKept: true,
  };
}

function supportLive(customerId, { admin = false } = {}) {
  const real = ticketAggregates();
  const vitrin = ticketVitrinSettings();
  const whatsappShown = vitrin.whatsappWaiting + real.whatsappWaiting;
  const hatay360 = {
    open: vitrin.open,
    answering: vitrin.answering,
    answered: vitrin.answered,
    waiting: real.waiting,
    operatorWatching: vitrin.answering,
    avgReplyMinutes: real.avgReplyMinutes,
    whatsappWaiting: whatsappShown,
  };
  const payload = {
    hatay360,
    ecosystem: {
      label: "AVC ekosistemi",
      note: "Hatay360 ayrı markadır. Avcı E-Ticaret ve AvcNova kardeş sistemlerdir; bu sayılar sizin ticketiniz değildir.",
      sisterSystems: 2,
      hatay360Waiting: real.waiting,
      whatsappWaiting: whatsappShown,
    },
    mine: customerQueueView(customerId, vitrin),
  };
  if (admin) {
    payload.vitrin = vitrin;
    payload.real = real;
  }
  return payload;
}

function listWhatsappQueue() {
  return db
    .prepare(
      `SELECT customer_whatsapp_queue.*, customer_accounts.company_name, customer_accounts.contact_name
       FROM customer_whatsapp_queue
       JOIN customer_accounts ON customer_accounts.id = customer_whatsapp_queue.customer_id
       ORDER BY CASE customer_whatsapp_queue.status WHEN 'waiting' THEN 0 WHEN 'serving' THEN 1 ELSE 2 END,
                customer_whatsapp_queue.queue_position ASC, customer_whatsapp_queue.id ASC`,
    )
    .all();
}

function advanceTicketQueue(ticketId) {
  const ticket = db.prepare("SELECT * FROM customer_tickets WHERE id = ?").get(Number(ticketId));
  if (!ticket) return { error: "Ticket bulunamadı." };
  const now = nowIso();
  const position = Number(ticket.queue_position || 0);
  db.exec("BEGIN");
  try {
    if (ticket.status === "open") {
      db.prepare("UPDATE customer_tickets SET status = 'answering', queue_position = 0, updated_at = ? WHERE id = ?").run(now, ticket.id);
    } else if (ticket.status === "answering") {
      db.prepare("UPDATE customer_tickets SET status = 'answered', queue_position = 0, updated_at = ? WHERE id = ?").run(now, ticket.id);
    } else {
      db.prepare("UPDATE customer_tickets SET queue_position = 0, updated_at = ? WHERE id = ?").run(now, ticket.id);
    }
    compactTicketQueueAfter(position);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return { ok: true, id: ticket.id };
}

function advanceWhatsappQueue(queueId) {
  const row = db.prepare("SELECT * FROM customer_whatsapp_queue WHERE id = ?").get(Number(queueId));
  if (!row) return { error: "WhatsApp sırası bulunamadı." };
  const now = nowIso();
  const position = Number(row.queue_position || 0);
  db.exec("BEGIN");
  try {
    if (row.status === "waiting") {
      db.prepare("UPDATE customer_whatsapp_queue SET status = 'serving', queue_position = 0, updated_at = ? WHERE id = ?").run(now, row.id);
    } else {
      db.prepare("UPDATE customer_whatsapp_queue SET status = 'served', queue_position = 0, updated_at = ? WHERE id = ?").run(now, row.id);
    }
    compactWhatsappQueueAfter(position);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return { ok: true, id: row.id };
}

function mapDailyRows(rows) {
  return rows.map((row) => ({
    day: row.day,
    adsClicks: Number(row.ads_clicks) || 0,
    adsImpressions: Number(row.ads_impressions) || 0,
    adsSpend: Number(row.ads_spend) || 0,
    siteVisitors: Number(row.site_visitors) || 0,
    siteSessions: Number(row.site_sessions) || 0,
    source: row.source === "panel" ? "panel" : "sample",
  }));
}

function customerDashboard(customer, role = "full") {
  const campaigns = db
    .prepare(
      `SELECT ad_campaigns.*,
        COALESCE(SUM(campaign_stats.spend), 0) AS spend,
        COALESCE(SUM(campaign_stats.impressions), 0) AS impressions,
        COALESCE(SUM(campaign_stats.clicks), 0) AS clicks,
        COALESCE(SUM(campaign_stats.leads), 0) AS leads,
        COALESCE(SUM(campaign_stats.conversions), 0) AS conversions,
        COALESCE(SUM(campaign_stats.revenue), 0) AS revenue
       FROM ad_campaigns
       LEFT JOIN campaign_stats ON campaign_stats.campaign_id = ad_campaigns.id
       WHERE ad_campaigns.customer_id = ?
       GROUP BY ad_campaigns.id
       ORDER BY ad_campaigns.created_at DESC`,
    )
    .all(customer.id)
    .map((campaign) => ({
      ...campaign,
      profit: Number(campaign.revenue) - Number(campaign.spend) - Number(campaign.management_fee),
      roas: Number(campaign.spend) > 0 ? Number(campaign.revenue) / Number(campaign.spend) : 0,
      ctr: Number(campaign.impressions) > 0 ? (Number(campaign.clicks) / Number(campaign.impressions)) * 100 : 0,
    }));
  const totals = campaigns.reduce(
    (sum, campaign) => ({
      monthlyBudget: sum.monthlyBudget + Number(campaign.monthly_budget),
      managementFee: sum.managementFee + Number(campaign.management_fee),
      spend: sum.spend + Number(campaign.spend),
      impressions: sum.impressions + Number(campaign.impressions),
      clicks: sum.clicks + Number(campaign.clicks),
      leads: sum.leads + Number(campaign.leads),
      conversions: sum.conversions + Number(campaign.conversions),
      revenue: sum.revenue + Number(campaign.revenue),
    }),
    { monthlyBudget: 0, managementFee: 0, spend: 0, impressions: 0, clicks: 0, leads: 0, conversions: 0, revenue: 0 },
  );
  const ticketVitrin = ticketVitrinSettings();
  const tickets = db.prepare("SELECT * FROM customer_tickets WHERE customer_id = ? ORDER BY created_at DESC LIMIT 100").all(customer.id).map((ticket) => ({
    ...ticket,
    queue_position: Number(ticket.queue_position) > 0 ? displayQueuePosition(ticket.queue_position, ticketVitrin.open) : 0,
  }));
  const serviceRequests = db.prepare("SELECT * FROM customer_service_requests WHERE customer_id = ? ORDER BY created_at DESC LIMIT 100").all(customer.id);
  const domainChecks = db.prepare("SELECT * FROM customer_domain_checks WHERE customer_id = ? ORDER BY created_at DESC LIMIT 20").all(customer.id);
  const stats = db
    .prepare(
      `SELECT campaign_stats.*, ad_campaigns.name AS campaign_name, ad_campaigns.platform
       FROM campaign_stats
       JOIN ad_campaigns ON ad_campaigns.id = campaign_stats.campaign_id
       WHERE ad_campaigns.customer_id = ?
       ORDER BY campaign_stats.period_start ASC, campaign_stats.id ASC`,
    )
    .all(customer.id);
  const account =
    db
      .prepare(
        `SELECT id, company_name, contact_name, email, phone, status, package_id, website_url, site_logo_url,
                site_phone, site_address, site_hours, ssl_status, site_status, site_error, last_backup_at, last_update_at, two_factor,
                google_ads_customer_id, meta_ad_account_id
         FROM customer_accounts WHERE id = ?`,
      )
      .get(customer.id) || customer;
  seedDailyMetrics(account.id);
  const dailyMetrics = mapDailyRows(
    db
      .prepare("SELECT * FROM customer_daily_metrics WHERE customer_id = ? ORDER BY day ASC")
      .all(account.id),
  );
  const sampleDays = dailyMetrics.some((row) => row.source !== "panel");
  const panelDays = dailyMetrics.some((row) => row.source === "panel");
  const normalizedRole = role === "limited" ? "limited" : "full";
  const referralCode = ensureCustomerReferralCode(account.id);
  const referralLinks = publicReferralUrls(referralCode);
  const payload = {
    role: normalizedRole,
    customer: {
      id: account.id,
      company_name: account.company_name,
      contact_name: account.contact_name,
      email: account.email,
      phone: account.phone,
      status: account.status,
    },
    referralCode,
    referralUrl: referralLinks.referralUrl,
    referralContactUrl: referralLinks.referralContactUrl,
    website: customerWebsite(account),
    maps: customerMapsListings(account),
    dailyMetrics,
    metricsSource: !dailyMetrics.length ? "none" : sampleDays && panelDays ? "mixed" : panelDays ? "panel" : "sample",
    adsConnection: (() => {
      const binding = adsAccountBinding(account);
      return {
        ...binding,
        status: stats.length || campaigns.length ? "panel" : binding.googleBound || binding.metaBound ? "bound" : "pending",
      };
    })(),
    campaigns,
    totals: {
      ...totals,
      profit: totals.revenue - totals.spend - totals.managementFee,
      roas: totals.spend > 0 ? totals.revenue / totals.spend : 0,
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
    },
    tickets,
    supportLive: supportLive(customer.id),
    serviceRequests,
    domainChecks,
    stats,
    approvals: listCustomerApprovals(account.id),
    approvalsPending: pendingApprovalsCount(account.id),
    quotes: listCustomerQuotes(account.id),
    quotesPending: pendingQuotesCount(account.id),
    renewals: customerRenewals(account.id).filter((row) => row.status === "active"),
    unreadNotifications: unreadNotificationCount(account.id),
    notifications: customerNotifications(account.id, { unreadOnly: true, limit: 5 }),
    project: customerProjectPayload(account.id),
    seo: customerSeoPayload(account.id),
    announcements: listPortalAnnouncements(account.id),
    twoFactor: {
      enabled: Number(account.two_factor) === 1,
      available: false,
      reason: OTP_DASHBOARD_REASON,
    },
    paymentGateway: paymentGatewayStatus(),
    ...customerRecords(account.id, { billedOnly: true }),
  };
  if (normalizedRole === "limited") {
    // Sınırlı kullanıcılar faturalandırma verisini göremez: finansal alanları çıkar.
    delete payload.payments;
    delete payload.paymentSummary;
    delete payload.contracts;
    delete payload.renewals;
    delete payload.catalog;
    delete payload.products;
    delete payload.services;
    delete payload.invoices;
    delete payload.extras;
    payload.totals = { billable: false };
  }
  return payload;
}

async function handleApi(req, res, url) {
  const cronRoute = url.pathname.startsWith("/api/cron/");
  if (!cronRoute && !sameOrigin(req) && !["GET", "HEAD"].includes(req.method || "")) {
    return json(res, 403, { error: "Geçersiz istek kaynağı." });
  }
  const method = req.method || "GET";
  if (["POST", "PUT", "PATCH"].includes(method)) {
    const contentType = String(req.headers["content-type"] || "").toLowerCase();
    if (contentType && !contentType.includes("application/json")) {
      return json(res, 415, { error: "İstek JSON olarak gönderilmelidir." });
    }
  }

  if (req.method === "GET" && url.pathname === "/api/health") {
    return json(res, 200, { ok: true, database: "sqlite", time: nowIso() });
  }

  // Public microsite verisi (müşteri siteleri). Yayında olmayanlar da preview için döner; sayfa duruma göre render eder.
  const publicSiteMatch = url.pathname.match(/^\/api\/sites\/([a-z0-9-]{1,60})$/);
  if (req.method === "GET" && publicSiteMatch) {
    const site = getManagedSiteBySlug(publicSiteMatch[1]);
    if (!site) return json(res, 404, { error: "Site bulunamadı." });
    return json(res, 200, { site });
  }

  // Günlük yenileme cron: yalnızca panel bildirimi. SMTP/e-posta gönderilmez.
  if (req.method === "POST" && url.pathname === "/api/cron/renewals") {
    if (!envConfigured("CRON_SECRET")) return json(res, 401, { error: "cron kapalı" });
    if (!cronSecretMatches(cronSecretProvided(req))) return json(res, 401, { error: "Yetkisiz." });
    const lastAt = readMeta("last_renewal_cron_at");
    const lastMs = lastAt ? Date.parse(lastAt) : NaN;
    if (Number.isFinite(lastMs) && Date.now() - lastMs < 60 * 60 * 1000) {
      return json(res, 429, { error: "Cron saatte bir çalışır.", ok: false, at: lastAt });
    }
    if (rateLimited(req, "cron-renewals", 1, 60 * 60 * 1000)) {
      return json(res, 429, { error: "Cron saatte bir çalışır." });
    }
    const result = insertDueRenewalNotifications();
    writeMeta("last_renewal_cron_at", result.at);
    writeMeta("last_renewal_cron_inserted", String(result.inserted));
    writeMeta("last_renewal_cron_scanned", String(result.scanned));
    return json(res, 200, { ok: true, inserted: result.inserted, scanned: result.scanned, at: result.at });
  }

  if (req.method === "GET" && url.pathname === "/api/auth/session") {
    const user = currentUser(req);
    const configured = Boolean(db.prepare("SELECT id FROM admin_users LIMIT 1").get());
    return json(res, 200, { authenticated: Boolean(user), configured, username: user?.username || null });
  }

  if (req.method === "POST" && url.pathname === "/api/auth/login") {
    if (loginLocked(req, res)) return;
    if (rateLimited(req, "login", 10, 15 * 60 * 1000)) {
      return json(res, 429, { error: "Çok fazla giriş denemesi. Bir süre sonra tekrar deneyin." });
    }
    const body = await readJson(req, 20_000);
    const username = cleanText(body.username, 100);
    const password = String(body.password || "");
    const user = db.prepare("SELECT * FROM admin_users WHERE username = ?").get(username);
    const success = Boolean(user && verifyPassword(password, user.password_salt, user.password_hash));
    logLogin(req, username, success);
    if (!success) {
      logAudit({ actorType: "admin", actorLabel: username, action: "login_failed", ip: requestIp(req) });
      return json(res, 401, { error: "Kullanıcı adı veya şifre hatalı." });
    }

    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
    db.prepare("INSERT INTO admin_sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)").run(
      sha256(token),
      user.id,
      expiresAt.toISOString(),
      nowIso(),
    );
    logAudit({ actorType: "admin", actorId: user.id, actorLabel: user.username, action: "login", ip: requestIp(req) });
    const cookie = `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_HOURS * 3600}${IS_PRODUCTION ? "; Secure" : ""}`;
    return json(res, 200, { ok: true, username: user.username }, { "Set-Cookie": cookie });
  }

  if (req.method === "POST" && url.pathname === "/api/auth/logout") {
    const token = cookies(req)[SESSION_COOKIE];
    if (token) db.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").run(sha256(token));
    const cookie = `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${IS_PRODUCTION ? "; Secure" : ""}`;
    return json(res, 200, { ok: true }, { "Set-Cookie": cookie });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/audit") {
    if (!requireUser(req, res)) return;
    const result = queryAuditLogs({
      customerId: Number(url.searchParams.get("customerId")) || 0,
      action: cleanText(url.searchParams.get("action"), 40),
      actorType: cleanText(url.searchParams.get("actorType"), 20),
      q: cleanText(url.searchParams.get("q"), 120),
      days: Number(url.searchParams.get("days")) || 30,
      page: Number(url.searchParams.get("page")) || 1,
      perPage: Number(url.searchParams.get("perPage")) || 50,
    });
    return json(res, 200, result);
  }

  const adminCustomerAuditMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/audit$/);
  if (req.method === "GET" && adminCustomerAuditMatch) {
    if (!requireUser(req, res)) return;
    const result = queryAuditLogs({
      customerId: Number(adminCustomerAuditMatch[1]),
      days: Number(url.searchParams.get("days")) || 365,
      perPage: Number(url.searchParams.get("perPage")) || 15,
    });
    return json(res, 200, result);
  }

  if (req.method === "GET" && url.pathname === "/api/admin/ops-alerts") {
    if (!requireUser(req, res)) return;
    return json(res, 200, { alerts: computeOpsAlerts() });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/inbox") {
    if (!requireUser(req, res)) return;
    return json(res, 200, { items: adminInbox() });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/connections") {
    if (!requireUser(req, res)) return;
    return json(res, 200, adminConnectionsSnapshot());
  }

  if (req.method === "GET" && url.pathname === "/api/admin/cron/renewals") {
    if (!requireUser(req, res)) return;
    const lastRunAt = readMeta("last_renewal_cron_at");
    const total = Number(db.prepare("SELECT COUNT(*) AS n FROM customer_notifications").get()?.n || 0);
    const unread = Number(db.prepare("SELECT COUNT(*) AS n FROM customer_notifications WHERE read_at = ''").get()?.n || 0);
    return json(res, 200, {
      ok: true,
      configured: envConfigured("CRON_SECRET"),
      lastRunAt,
      inserted: Number(readMeta("last_renewal_cron_inserted") || 0),
      scanned: Number(readMeta("last_renewal_cron_scanned") || 0),
      notifications: { total, unread },
    });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/security") {
    const user = requireUser(req, res);
    if (!user) return;
    const now = nowIso();
    const activeSessions = Number(
      db.prepare("SELECT COUNT(*) AS n FROM admin_sessions WHERE user_id = ? AND expires_at > ?").get(user.id, now)?.n || 0,
    );
    const failed24h = Number(
      db
        .prepare("SELECT COUNT(*) AS n FROM login_events WHERE success = 0 AND created_at >= ?")
        .get(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())?.n || 0,
    );
    const events = db
      .prepare(
        `SELECT id, username, success, created_at,
                substr(visitor_hash, 1, 8) AS visitor_tag
         FROM login_events
         ORDER BY created_at DESC, id DESC
         LIMIT 40`,
      )
      .all()
      .map((row) => ({
        id: row.id,
        username: row.username,
        success: Boolean(row.success),
        createdAt: row.created_at,
        visitorTag: row.visitor_tag,
      }));
    return json(res, 200, {
      username: user.username,
      activeSessions,
      failed24h,
      events,
    });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/password") {
    const user = requireUser(req, res);
    if (!user) return;
    if (rateLimited(req, `admin-password-${user.id}`, 5, 60 * 60 * 1000)) {
      return json(res, 429, { error: "Çok fazla şifre değiştirme denemesi. Bir süre sonra tekrar deneyin." });
    }
    const body = await readJson(req, 20_000);
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    if (newPassword.length < 10 || newPassword.length > 128) {
      return json(res, 400, { error: "Yeni şifre en az 10, en fazla 128 karakter olmalıdır." });
    }
    if (currentPassword === newPassword) {
      return json(res, 400, { error: "Yeni şifre mevcut şifreden farklı olmalıdır." });
    }
    const account = db.prepare("SELECT id, password_hash, password_salt FROM admin_users WHERE id = ?").get(user.id);
    if (!account || !verifyPassword(currentPassword, account.password_salt, account.password_hash)) {
      return json(res, 401, { error: "Mevcut şifre hatalı." });
    }
    const credentials = hashPassword(newPassword);
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
    const changedAt = nowIso();
    db.exec("BEGIN IMMEDIATE");
    try {
      db.prepare("UPDATE admin_users SET password_hash = ?, password_salt = ? WHERE id = ?").run(
        credentials.hash,
        credentials.salt,
        user.id,
      );
      db.prepare("DELETE FROM admin_sessions WHERE user_id = ?").run(user.id);
      db.prepare("INSERT INTO admin_sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)").run(
        sha256(token),
        user.id,
        expiresAt.toISOString(),
        changedAt,
      );
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
    const cookie = `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_HOURS * 3600}${IS_PRODUCTION ? "; Secure" : ""}`;
    return json(res, 200, { ok: true }, { "Set-Cookie": cookie });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/sessions/revoke-others") {
    const user = requireUser(req, res);
    if (!user) return;
    const token = cookies(req)[SESSION_COOKIE];
    if (!token) return json(res, 401, { error: "Oturum gerekli." });
    const currentHash = sha256(token);
    const result = db
      .prepare("DELETE FROM admin_sessions WHERE user_id = ? AND token_hash != ?")
      .run(user.id, currentHash);
    return json(res, 200, { ok: true, revoked: Number(result.changes || 0) });
  }

  if (req.method === "GET" && url.pathname === "/api/customer/session") {
    const customer = currentCustomer(req);
    return json(res, 200, { authenticated: Boolean(customer), customer });
  }

  if (req.method === "POST" && url.pathname === "/api/customer/impersonate") {
    const body = await readJson(req, 10_000);
    const token = String(body.token || body.ito || "").trim();
    if (!token) return json(res, 400, { error: "Geçersiz oturum." });
    const row = db
      .prepare("SELECT * FROM admin_impersonation_tokens WHERE token_hash = ? AND expires_at > ?")
      .get(sha256(token), nowIso());
    if (!row) return json(res, 401, { error: "Oturum bağlantısı geçersiz veya süresi doldu." });
    const account = db.prepare("SELECT * FROM customer_accounts WHERE id = ? AND status = 'active'").get(row.customer_id);
    if (!account) return json(res, 404, { error: "Müşteri bulunamadı." });
    db.prepare("DELETE FROM admin_impersonation_tokens WHERE id = ?").run(row.id);
    return issueCustomerSession(res, { account, role: "full", skipAudit: true });
  }

  if (req.method === "POST" && url.pathname === "/api/customer/celebration/seen") {
    const customer = requireCustomer(req, res);
    if (!customer) return;
    db.prepare("UPDATE customer_project SET celebration_pending = 0, celebration_seen = 1, updated_at = ? WHERE customer_id = ?").run(nowIso(), customer.id);
    return json(res, 200, { ok: true, project: customerProjectPayload(customer.id) });
  }

  if (req.method === "POST" && url.pathname === "/api/customer/login") {
    if (loginLocked(req, res)) return;
    if (rateLimited(req, "customer-login", 10, 15 * 60 * 1000)) {
      return json(res, 429, { error: "Çok fazla giriş denemesi. Bir süre sonra tekrar deneyin." });
    }
    const body = await readJson(req, 20_000);
    const email = cleanText(body.email, 160).toLowerCase();
    const password = String(body.password || "");
    const account = db.prepare("SELECT * FROM customer_accounts WHERE email = ? AND status = 'active'").get(email);
    let success = Boolean(account && verifyPassword(password, account.password_salt, account.password_hash));
    // P6: hesap (owner) eşleşmediyse alt kullanıcıyı da dene.
    let sessionCustomerId = account ? account.id : 0;
    let sessionRole = "full";
    let sessionUserId = null;
    let loginAccount = account;
    if (!success) {
      const subUser = db.prepare("SELECT * FROM customer_users WHERE email = ? AND status = 'active'").get(email);
      if (subUser && verifyPassword(password, subUser.password_salt, subUser.password_hash)) {
        const parent = db.prepare("SELECT * FROM customer_accounts WHERE id = ? AND status = 'active'").get(subUser.customer_id);
        if (parent) {
          success = true;
          sessionCustomerId = parent.id;
          sessionRole = subUser.role === "full" ? "full" : "limited";
          sessionUserId = subUser.id;
          loginAccount = parent;
        }
      }
    }
    logLogin(req, email || "customer", success);
    if (!success) {
      logAudit({ actorType: "customer", actorLabel: email || "customer", action: "login_failed", ip: requestIp(req) });
      return json(res, 401, { error: "E-posta veya şifre hatalı." });
    }
    if (Number(loginAccount.two_factor) === 1) {
      const code = createOtp(sessionCustomerId, "login");
      sendCustomerOtpEmail(loginAccount, code);
      const pending = signOtpPending({
        cid: sessionCustomerId,
        uid: sessionUserId,
        role: sessionRole,
        email,
        exp: Date.now() + OTP_PENDING_MINUTES * 60 * 1000,
      });
      logAudit({
        actorType: sessionUserId ? "customer_user" : "customer",
        actorId: sessionUserId || sessionCustomerId,
        actorLabel: email,
        customerId: sessionCustomerId,
        action: "login_otp_pending",
        ip: requestIp(req),
      });
      return json(
        res,
        200,
        { ok: true, needsOtp: true },
        { "Set-Cookie": cookieHeader(CUSTOMER_OTP_COOKIE, pending, OTP_PENDING_MINUTES * 60) },
      );
    }
    logAudit({
      actorType: sessionUserId ? "customer_user" : "customer",
      actorId: sessionUserId || sessionCustomerId,
      actorLabel: email,
      customerId: sessionCustomerId,
      action: "login",
      ip: requestIp(req),
      meta: JSON.stringify({ role: sessionRole }),
    });
    return issueCustomerSession(res, { account: loginAccount, userId: sessionUserId, role: sessionRole });
  }

  if (req.method === "POST" && url.pathname === "/api/customer/login/otp") {
    if (rateLimited(req, "customer-login-otp", 10, 15 * 60 * 1000)) {
      return json(res, 429, { error: "Çok fazla kod denemesi. Bir süre sonra tekrar deneyin." });
    }
    const pending = readOtpPending(req);
    if (!pending?.cid) {
      return json(res, 401, { error: "Doğrulama oturumu yok veya süresi doldu. Yeniden giriş yapın." });
    }
    const body = await readJson(req, 20_000);
    const code = String(body.code || "").trim();
    const verified = verifyOtp(Number(pending.cid), "login", code, req);
    if (!verified.ok) {
      const status = verified.rateLimited || verified.locked ? 429 : 401;
      return json(res, status, { error: verified.error });
    }
    const loginAccount = db.prepare("SELECT * FROM customer_accounts WHERE id = ? AND status = 'active'").get(Number(pending.cid));
    if (!loginAccount) return json(res, 401, { error: "Hesap bulunamadı. Yeniden giriş yapın." });
    const sessionRole = pending.role === "limited" ? "limited" : "full";
    const sessionUserId = pending.uid ? Number(pending.uid) : null;
    logAudit({
      actorType: sessionUserId ? "customer_user" : "customer",
      actorId: sessionUserId || loginAccount.id,
      actorLabel: pending.email || loginAccount.email,
      customerId: loginAccount.id,
      action: "login",
      ip: requestIp(req),
      meta: JSON.stringify({ role: sessionRole, otp: true }),
    });
    return issueCustomerSession(res, {
      account: loginAccount,
      userId: sessionUserId,
      role: sessionRole,
      extraCookies: [cookieHeader(CUSTOMER_OTP_COOKIE, "", 0)],
    });
  }

  if (req.method === "GET" && url.pathname === "/api/partners/session") {
    const partner = currentPartner(req);
    return json(res, 200, { authenticated: Boolean(partner), partner });
  }

  if (req.method === "POST" && url.pathname === "/api/partners/register") {
    if (rateLimited(req, "partner-register", 5, 60 * 60 * 1000)) {
      return json(res, 429, { error: "Çok fazla başvuru gönderildi. Lütfen daha sonra tekrar deneyin." });
    }
    const body = await readJson(req, 30_000);
    if (isBotTrap(body)) return json(res, 201, { ok: true });
    const companyName = cleanText(body.companyName, 160);
    const contactName = cleanText(body.contactName, 120);
    const email = cleanText(body.email, 160).toLowerCase();
    const phone = cleanText(body.phone, 40);
    const city = cleanText(body.city, 80);
    const website = cleanText(body.website, 200);
    const notes = cleanText(body.notes, 800);
    const password = String(body.password || "");
    if (companyName.length < 2 || contactName.length < 2 || !email.includes("@") || !validTrPhone(phone)) {
      return json(res, 400, { error: "Firma, yetkili, e-posta ve telefon bilgilerini kontrol edin. Telefon 05xx xxx xx xx olmalı." });
    }
    if (password.length < 10 || password.length > 128) {
      return json(res, 400, { error: "Şifre en az 10, en fazla 128 karakter olmalıdır." });
    }
    const existing = db.prepare("SELECT id FROM partner_accounts WHERE email = ?").get(email);
    if (existing) return json(res, 409, { error: "Bu e-posta ile bayi başvurusu zaten var." });
    const credentials = hashPassword(password);
    const createdAt = nowIso();
    db.exec("BEGIN IMMEDIATE");
    try {
      const partnerResult = db
        .prepare(
          `INSERT INTO partner_accounts (
            company_name, contact_name, email, phone, city, website, notes,
            commission_rate, password_hash, password_salt, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 20, ?, ?, 'pending', ?, ?)`,
        )
        .run(companyName, contactName, email, phone, city, website, notes, credentials.hash, credentials.salt, createdAt, createdAt);
      insertLead({
        name: contactName,
        phone,
        service: `Bayi başvurusu · ${companyName}`,
        sourcePath: "/firma/kayit",
        kind: "partner",
        email,
        district: city,
        website,
        notes,
        smsOk: body.smsOk === false ? 0 : 1,
      });
      db.exec("COMMIT");
      return json(res, 201, { ok: true, id: Number(partnerResult.lastInsertRowid) });
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  if (req.method === "POST" && url.pathname === "/api/partners/login") {
    if (loginLocked(req, res)) return;
    if (rateLimited(req, "partner-login", 10, 15 * 60 * 1000)) {
      return json(res, 429, { error: "Çok fazla giriş denemesi. Bir süre sonra tekrar deneyin." });
    }
    const body = await readJson(req, 20_000);
    const email = cleanText(body.email, 160).toLowerCase();
    const password = String(body.password || "");
    const trustDevice = body.trustDevice === true || body.trustDevice === 1 || body.trustDevice === "1";
    const account = db.prepare("SELECT * FROM partner_accounts WHERE email = ?").get(email);
    const passwordOk = Boolean(account && verifyPassword(password, account.password_salt, account.password_hash));
    logLogin(req, email || "partner", passwordOk);
    if (!passwordOk) {
      logAudit({ actorType: "partner", actorLabel: email || "partner", action: "login_failed", ip: requestIp(req) });
      return json(res, 401, { error: "E-posta veya şifre hatalı." });
    }
    if (account.status === "pending") {
      return json(res, 403, { error: "Bayilik başvurunuz inceleniyor. Onay sonrası giriş açılır." });
    }
    if (account.status !== "active") {
      return json(res, 403, { error: "Bayi hesabınız duraklatıldı. Hatay360 ile iletişime geçin." });
    }
    const token = randomBytes(32).toString("base64url");
    const ip = requestIp(req);
    const ua = String(req.headers["user-agent"] || "").slice(0, 240);
    const sessionMs = trustDevice
      ? PARTNER_TRUSTED_SESSION_DAYS * 24 * 60 * 60 * 1000
      : SESSION_HOURS * 60 * 60 * 1000;
    const maxAgeSec = Math.floor(sessionMs / 1000);
    const expiresAt = new Date(Date.now() + sessionMs);
    db.prepare(
      "INSERT INTO partner_sessions (token_hash, partner_id, expires_at, created_at, ip, user_agent, trusted) VALUES (?, ?, ?, ?, ?, ?, ?)",
    ).run(sha256(token), account.id, expiresAt.toISOString(), nowIso(), ip, ua, trustDevice ? 1 : 0);
    logAudit({
      actorType: "partner",
      actorId: account.id,
      actorLabel: account.email,
      action: trustDevice ? "login_trusted_device" : "login",
      ip,
      meta: JSON.stringify({ trusted: trustDevice }),
    });
    const cookie = `${PARTNER_SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAgeSec}${IS_PRODUCTION ? "; Secure" : ""}`;
    return json(
      res,
      200,
      {
        ok: true,
        trustedIp: ip,
        trustedDevice: trustDevice,
        trustDays: trustDevice ? PARTNER_TRUSTED_SESSION_DAYS : null,
        partner: {
          id: account.id,
          company_name: account.company_name,
          contact_name: account.contact_name,
          email: account.email,
          phone: account.phone,
          city: account.city,
          website: account.website,
          commission_rate: account.commission_rate,
          status: account.status,
        },
      },
      { "Set-Cookie": cookie },
    );
  }

  if (req.method === "POST" && url.pathname === "/api/partners/logout") {
    const token = cookies(req)[PARTNER_SESSION_COOKIE];
    if (token) db.prepare("DELETE FROM partner_sessions WHERE token_hash = ?").run(sha256(token));
    const cookie = `${PARTNER_SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${IS_PRODUCTION ? "; Secure" : ""}`;
    return json(res, 200, { ok: true }, { "Set-Cookie": cookie });
  }

  if (req.method === "GET" && url.pathname === "/api/partners/dashboard") {
    const partner = requirePartner(req, res);
    if (!partner) return;
    return json(res, 200, { partner });
  }

  if (req.method === "GET" && url.pathname === "/api/partners/referrals") {
    const partner = requirePartner(req, res);
    if (!partner) return;
    const referrals = db
      .prepare(
        `SELECT id, name, phone, email, service, sector, district, notes, status, created_at, updated_at
         FROM leads
         WHERE kind = 'partner_referral' AND partner_id = ?
         ORDER BY created_at DESC
         LIMIT 100`,
      )
      .all(partner.id);
    return json(res, 200, { referrals });
  }

  if (req.method === "POST" && url.pathname === "/api/partners/referrals") {
    const partner = requirePartner(req, res);
    if (!partner) return;
    if (rateLimited(req, `partner-referral-${partner.id}`, 20, 60 * 60 * 1000)) {
      return json(res, 429, { error: "Çok fazla müşteri yönlendirmesi. Bir süre sonra tekrar deneyin." });
    }
    const body = await readJson(req, 30_000);
    const name = cleanText(body.name, 120);
    const phone = cleanText(body.phone, 40);
    const email = cleanText(body.email, 160).toLowerCase();
    const service =
      cleanText(body.service, 160) || "Bayi müşteri yönlendirmesi";
    const sector = cleanText(body.sector, 120);
    const district = cleanText(body.district, 80);
    const notes = cleanText(body.notes, 800);
    if (name.length < 2 || !validTrPhone(phone)) {
      return json(res, 400, { error: "Müşteri adı ve telefonu kontrol edin. Telefonu 05xx xxx xx xx şeklinde yazın." });
    }
    const taggedNotes = [
      `Bayi: ${partner.company_name} (#${partner.id})`,
      partner.contact_name ? `Yetkili: ${partner.contact_name}` : "",
      notes,
    ]
      .filter(Boolean)
      .join(" · ");
    const result = insertLead({
      name,
      phone,
      service,
      sourcePath: "/firma",
      kind: "partner_referral",
      email,
      sector,
      district,
      notes: taggedNotes,
      smsOk: body.smsOk === false ? 0 : 1,
      partnerId: partner.id,
    });
    return json(res, 201, { ok: true, id: Number(result.lastInsertRowid) });
  }

  if (req.method === "GET" && url.pathname === "/api/partners/quotes") {
    const partner = requirePartner(req, res);
    if (!partner) return;
    const quotes = db.prepare("SELECT id, customer_name, service, amount, notes, status, created_at, updated_at FROM partner_quotes WHERE partner_id = ? ORDER BY id DESC LIMIT 100").all(partner.id);
    return json(res, 200, { quotes });
  }

  if (req.method === "GET" && url.pathname === "/api/partners/certificate.pdf") {
    const partner = requirePartner(req, res);
    if (!partner) return;
    const code = ensurePartnerReferralCode(partner.id);
    const issuedAt = nowIso();
    const pdf = buildQuotePdf({
      title: "Yetkili Çözüm Ortağı Sertifikası",
      body: `${partner.company_name}, Hatay360 yetkili çözüm ortağı olarak kayıtlıdır.\n\nYetkili: ${partner.contact_name}\nDoğrulama kodu: ${code}\nDurum: Aktif bayi\n\nBu belge bayi hesabının mevcut durumunu gösterir. Yetki durumu Hatay360 kayıtlarından doğrulanmalıdır.`,
      companyName: partner.company_name,
      contactName: partner.contact_name,
      issuedAt,
    });
    logAudit({ actorType: "partner", actorId: partner.id, actorLabel: partner.email, action: "partner_certificate_download", detail: code, ip: requestIp(req) });
    return sendPdfBuffer(res, pdf, "hatay360-yetkili-bayi-sertifikasi.pdf");
  }

  if (req.method === "POST" && url.pathname === "/api/partners/quotes") {
    const partner = requirePartner(req, res);
    if (!partner) return;
    if (rateLimited(req, `partner-quote-${partner.id}`, 30, 60 * 60 * 1000)) return json(res, 429, { error: "Çok fazla teklif oluşturdunuz." });
    const body = await readJson(req, 20_000);
    const customerName = cleanText(body.customerName, 120);
    const service = cleanText(body.service, 160);
    const amount = numberValue(body.amount, 10_000_000);
    const notes = cleanText(body.notes, 1200);
    if (customerName.length < 2 || service.length < 2 || amount <= 0) return json(res, 400, { error: "Müşteri, hizmet ve geçerli teklif tutarı zorunludur." });
    const now = nowIso();
    const result = db.prepare("INSERT INTO partner_quotes (partner_id, customer_name, service, amount, notes, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'draft', ?, ?)").run(partner.id, customerName, service, amount, notes, now, now);
    logAudit({ actorType: "partner", actorId: partner.id, actorLabel: partner.email, action: "partner_quote_create", detail: `${customerName} · ${service} · ${amount} TL`, ip: requestIp(req) });
    return json(res, 201, { ok: true, id: Number(result.lastInsertRowid) });
  }

  const partnerDealMatch = url.pathname.match(/^\/api\/partners\/crm\/deals\/(\d+)$/);
  const partnerDealActivityMatch = url.pathname.match(/^\/api\/partners\/crm\/deals\/(\d+)\/activities$/);
  const dealStages = new Set(["new", "qualified", "proposal", "negotiation", "won", "lost"]);

  if (req.method === "GET" && url.pathname === "/api/partners/crm/deals") {
    const partner = requirePartner(req, res);
    if (!partner) return;
    const deals = db.prepare(`SELECT d.*, (SELECT COUNT(*) FROM partner_deal_activities a WHERE a.deal_id = d.id) AS activity_count FROM partner_deals d WHERE d.partner_id = ? ORDER BY d.updated_at DESC LIMIT 300`).all(partner.id);
    const activities = db.prepare(`SELECT a.id, a.deal_id, a.kind, a.detail, a.created_at FROM partner_deal_activities a JOIN partner_deals d ON d.id = a.deal_id WHERE a.partner_id = ? AND d.partner_id = ? ORDER BY a.created_at DESC LIMIT 500`).all(partner.id, partner.id);
    return json(res, 200, { deals, activities });
  }

  if (req.method === "POST" && url.pathname === "/api/partners/crm/deals") {
    const partner = requirePartner(req, res);
    if (!partner) return;
    if (rateLimited(req, `partner-crm-create-${partner.id}`, 60, 60 * 60 * 1000)) return json(res, 429, { error: "Çok fazla CRM kaydı oluşturdunuz." });
    const body = await readJson(req, 20_000);
    const companyName = cleanText(body.companyName, 120);
    const contactName = cleanText(body.contactName, 120);
    const phone = cleanText(body.phone, 40);
    const email = cleanText(body.email, 160).toLowerCase();
    const service = cleanText(body.service, 160);
    const value = numberValue(body.value, 100_000_000);
    const nextAction = cleanText(body.nextAction, 240);
    const followUpAt = cleanText(body.followUpAt, 40);
    const notes = cleanText(body.notes, 1500);
    if (companyName.length < 2 || service.length < 2 || value < 0) return json(res, 400, { error: "Firma adı, hizmet ve geçerli fırsat tutarı zorunludur." });
    const now = nowIso();
    const result = db.prepare(`INSERT INTO partner_deals (partner_id, company_name, contact_name, phone, email, service, value, stage, probability, next_action, follow_up_at, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'new', 20, ?, ?, ?, ?, ?)`).run(partner.id, companyName, contactName, phone, email, service, value, nextAction, followUpAt, notes, now, now);
    const dealId = Number(result.lastInsertRowid);
    db.prepare("INSERT INTO partner_deal_activities (deal_id, partner_id, kind, detail, created_at) VALUES (?, ?, 'created', ?, ?)").run(dealId, partner.id, "Satış fırsatı oluşturuldu.", now);
    logAudit({ actorType: "partner", actorId: partner.id, actorLabel: partner.email, action: "crm_deal_create", detail: `${companyName} · ${value} TL`, ip: requestIp(req) });
    return json(res, 201, { ok: true, id: dealId });
  }

  if (req.method === "PATCH" && partnerDealMatch) {
    const partner = requirePartner(req, res);
    if (!partner) return;
    const dealId = Number(partnerDealMatch[1]);
    const existing = db.prepare("SELECT id, stage FROM partner_deals WHERE id = ? AND partner_id = ?").get(dealId, partner.id);
    if (!existing) return json(res, 404, { error: "CRM fırsatı bulunamadı." });
    const body = await readJson(req, 15_000);
    const stage = cleanText(body.stage, 30);
    if (!dealStages.has(stage)) return json(res, 400, { error: "Geçersiz satış aşaması." });
    const probabilityByStage = { new: 20, qualified: 40, proposal: 60, negotiation: 80, won: 100, lost: 0 };
    const now = nowIso();
    db.prepare("UPDATE partner_deals SET stage = ?, probability = ?, updated_at = ? WHERE id = ? AND partner_id = ?").run(stage, probabilityByStage[stage], now, dealId, partner.id);
    db.prepare("INSERT INTO partner_deal_activities (deal_id, partner_id, kind, detail, created_at) VALUES (?, ?, 'stage', ?, ?)").run(dealId, partner.id, `Aşama ${existing.stage} → ${stage} olarak güncellendi.`, now);
    return json(res, 200, { ok: true });
  }

  if (req.method === "POST" && partnerDealActivityMatch) {
    const partner = requirePartner(req, res);
    if (!partner) return;
    const dealId = Number(partnerDealActivityMatch[1]);
    const deal = db.prepare("SELECT id FROM partner_deals WHERE id = ? AND partner_id = ?").get(dealId, partner.id);
    if (!deal) return json(res, 404, { error: "CRM fırsatı bulunamadı." });
    const body = await readJson(req, 10_000);
    const detail = cleanText(body.detail, 800);
    if (detail.length < 2) return json(res, 400, { error: "Aktivite notu boş olamaz." });
    const kind = ["note", "call", "meeting", "email"].includes(String(body.kind)) ? String(body.kind) : "note";
    const now = nowIso();
    db.prepare("INSERT INTO partner_deal_activities (deal_id, partner_id, kind, detail, created_at) VALUES (?, ?, ?, ?, ?)").run(dealId, partner.id, kind, detail, now);
    db.prepare("UPDATE partner_deals SET updated_at = ? WHERE id = ? AND partner_id = ?").run(now, dealId, partner.id);
    return json(res, 201, { ok: true });
  }

  const partnerSupportMessageMatch = url.pathname.match(/^\/api\/partners\/support\/conversations\/(\d+)\/messages$/);
  if (req.method === "GET" && url.pathname === "/api/partners/support/conversations") {
    const partner = requirePartner(req, res); if (!partner) return;
    const conversations = db.prepare("SELECT * FROM partner_support_conversations WHERE partner_id = ? ORDER BY last_message_at DESC LIMIT 100").all(partner.id);
    const messages = db.prepare(`SELECT m.* FROM partner_support_messages m JOIN partner_support_conversations c ON c.id = m.conversation_id WHERE c.partner_id = ? ORDER BY m.created_at ASC LIMIT 1000`).all(partner.id);
    return json(res, 200, { conversations, messages });
  }
  if (req.method === "GET" && url.pathname === "/api/partners/support/unread") {
    const partner = requirePartner(req, res); if (!partner) return;
    const row = db.prepare(`SELECT COUNT(*) AS count FROM partner_support_messages m JOIN partner_support_conversations c ON c.id = m.conversation_id WHERE c.partner_id = ? AND m.sender_type = 'admin' AND m.read_by_partner = 0`).get(partner.id);
    return json(res, 200, { unread: Number(row?.count || 0) });
  }
  const partnerSupportReadMatch = url.pathname.match(/^\/api\/partners\/support\/conversations\/(\d+)\/read$/);
  if (req.method === "PATCH" && partnerSupportReadMatch) {
    const partner = requirePartner(req, res); if (!partner) return; const id = Number(partnerSupportReadMatch[1]);
    const own = db.prepare("SELECT id FROM partner_support_conversations WHERE id = ? AND partner_id = ?").get(id, partner.id); if (!own) return json(res, 404, { error:"Konuşma bulunamadı." });
    db.prepare("UPDATE partner_support_messages SET read_by_partner = 1 WHERE conversation_id = ? AND sender_type = 'admin'").run(id); return json(res, 200, { ok:true });
  }
  if (req.method === "POST" && url.pathname === "/api/partners/support/conversations") {
    const partner = requirePartner(req, res); if (!partner) return;
    if (rateLimited(req, `partner-support-${partner.id}`, 30, 60 * 60 * 1000)) return json(res, 429, { error: "Çok fazla destek konuşması açtınız." });
    const body = await readJson(req, 20_000); const subject = cleanText(body.subject, 160); const message = cleanText(body.message, 3000);
    const category = ["technical","sales","finance","contract","general"].includes(body.category) ? body.category : "general";
    const priority = ["normal","high","urgent"].includes(body.priority) ? body.priority : "normal";
    if (subject.length < 3 || message.length < 5) return json(res, 400, { error: "Konu ve ilk mesaj zorunludur." });
    const now = nowIso(); const result = db.prepare("INSERT INTO partner_support_conversations (partner_id, subject, category, priority, status, last_message_at, created_at, updated_at) VALUES (?, ?, ?, ?, 'open', ?, ?, ?)").run(partner.id, subject, category, priority, now, now, now);
    const id = Number(result.lastInsertRowid); db.prepare("INSERT INTO partner_support_messages (conversation_id, sender_type, sender_name, body, created_at) VALUES (?, 'partner', ?, ?, ?)").run(id, partner.contact_name, message, now);
    logAudit({ actorType:"partner", actorId:partner.id, actorLabel:partner.email, action:"partner_support_open", detail:subject, ip:requestIp(req) });
    return json(res, 201, { ok:true, id });
  }
  if (req.method === "POST" && partnerSupportMessageMatch) {
    const partner = requirePartner(req, res); if (!partner) return; const id = Number(partnerSupportMessageMatch[1]);
    const conversation = db.prepare("SELECT id, status FROM partner_support_conversations WHERE id = ? AND partner_id = ?").get(id, partner.id); if (!conversation) return json(res, 404, { error:"Konuşma bulunamadı." });
    const body = await readJson(req, 15_000); const message = cleanText(body.message, 3000); if (message.length < 2) return json(res, 400, { error:"Mesaj boş olamaz." });
    const now = nowIso(); db.prepare("INSERT INTO partner_support_messages (conversation_id, sender_type, sender_name, body, created_at) VALUES (?, 'partner', ?, ?, ?)").run(id, partner.contact_name, message, now);
    db.prepare("UPDATE partner_support_conversations SET status = 'open', last_message_at = ?, updated_at = ? WHERE id = ? AND partner_id = ?").run(now, now, id, partner.id);
    return json(res, 201, { ok:true });
  }

  const partnerQuotePdfMatch = url.pathname.match(/^\/api\/partners\/quotes\/(\d+)\.pdf$/);
  if (req.method === "GET" && partnerQuotePdfMatch) {
    const partner = requirePartner(req, res);
    if (!partner) return;
    const row = db.prepare("SELECT * FROM partner_quotes WHERE id = ? AND partner_id = ?").get(Number(partnerQuotePdfMatch[1]), partner.id);
    if (!row) return json(res, 404, { error: "Teklif bulunamadı." });
    const pdf = buildQuotePdf({
      title: `${row.service} Teklifi`,
      body: `Hizmet: ${row.service}\nTeklif tutarı: ${Number(row.amount).toLocaleString("tr-TR")} TL\n\n${row.notes || "Hizmet kapsamı görüşme sonrasında kesinleştirilecektir."}\n\nBu belge taslak satış teklifidir; sözleşme ve fatura yerine geçmez.`,
      companyName: row.customer_name,
      contactName: `${partner.company_name} · ${partner.contact_name}`,
      issuedAt: row.created_at,
    });
    return sendPdfBuffer(res, pdf, `teklif-${row.id}.pdf`);
  }

  if (req.method === "POST" && url.pathname === "/api/partners/password") {
    const partner = requirePartner(req, res);
    if (!partner) return;
    if (rateLimited(req, `partner-password-${partner.id}`, 5, 60 * 60 * 1000)) {
      return json(res, 429, { error: "Çok fazla şifre değiştirme denemesi. Bir süre sonra tekrar deneyin." });
    }
    const body = await readJson(req, 20_000);
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    if (newPassword.length < 10 || newPassword.length > 128) {
      return json(res, 400, { error: "Yeni şifre en az 10, en fazla 128 karakter olmalıdır." });
    }
    if (currentPassword === newPassword) {
      return json(res, 400, { error: "Yeni şifre mevcut şifreden farklı olmalıdır." });
    }
    const account = db
      .prepare("SELECT password_hash, password_salt FROM partner_accounts WHERE id = ? AND status = 'active'")
      .get(partner.id);
    if (!account || !verifyPassword(currentPassword, account.password_salt, account.password_hash)) {
      return json(res, 401, { error: "Mevcut şifre hatalı." });
    }
    const credentials = hashPassword(newPassword);
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
    const changedAt = nowIso();
    db.exec("BEGIN IMMEDIATE");
    try {
      db.prepare("UPDATE partner_accounts SET password_hash = ?, password_salt = ?, updated_at = ? WHERE id = ?").run(
        credentials.hash,
        credentials.salt,
        changedAt,
        partner.id,
      );
      db.prepare("DELETE FROM partner_sessions WHERE partner_id = ?").run(partner.id);
      db.prepare("INSERT INTO partner_sessions (token_hash, partner_id, expires_at, created_at) VALUES (?, ?, ?, ?)").run(
        sha256(token),
        partner.id,
        expiresAt.toISOString(),
        changedAt,
      );
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
    const cookie = `${PARTNER_SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_HOURS * 3600}${IS_PRODUCTION ? "; Secure" : ""}`;
    return json(
      res,
      200,
      { ok: true, message: "Şifreniz güncellendi. Diğer cihazlardaki oturumlar kapatıldı." },
      { "Set-Cookie": cookie },
    );
  }

  if (req.method === "GET" && url.pathname === "/api/partners/security") {
    const partner = requirePartner(req, res);
    if (!partner) return;
    const now = nowIso();
    const email = String(partner.email || "").toLowerCase();
    const currentToken = cookies(req)[PARTNER_SESSION_COOKIE];
    const currentHash = currentToken ? sha256(currentToken) : "";
    const sessions = db
      .prepare(
        `SELECT substr(token_hash, 1, 8) AS id, created_at, expires_at, token_hash, ip, trusted
         FROM partner_sessions
         WHERE partner_id = ? AND expires_at > ?
         ORDER BY CASE WHEN token_hash = ? THEN 0 ELSE 1 END, created_at DESC
         LIMIT 20`,
      )
      .all(partner.id, now, currentHash)
      .map((row) => ({
        id: row.id,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
        ip: row.ip || "",
        trusted: Boolean(row.trusted),
        current: Boolean(currentHash && row.token_hash === currentHash),
      }));
    const activeSessions = sessions.length;
    const failed24h = Number(
      db
        .prepare("SELECT COUNT(*) AS n FROM login_events WHERE username = ? AND success = 0 AND created_at >= ?")
        .get(email, new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())?.n || 0,
    );
    const events = db
      .prepare(
        `SELECT id, username, success, created_at,
                substr(visitor_hash, 1, 8) AS visitor_tag
         FROM login_events
         WHERE username = ?
         ORDER BY created_at DESC, id DESC
         LIMIT 40`,
      )
      .all(email)
      .map((row) => ({
        id: row.id,
        username: row.username,
        success: Boolean(row.success),
        createdAt: row.created_at,
        visitorTag: row.visitor_tag,
      }));
    return json(res, 200, {
      email,
      companyName: partner.company_name,
      activeSessions,
      failed24h,
      sessions,
      events,
    });
  }

  if (req.method === "POST" && url.pathname === "/api/partners/sessions/revoke-others") {
    const partner = requirePartner(req, res);
    if (!partner) return;
    const token = cookies(req)[PARTNER_SESSION_COOKIE];
    if (!token) return json(res, 401, { error: "Oturum gerekli." });
    const currentHash = sha256(token);
    const result = db
      .prepare("DELETE FROM partner_sessions WHERE partner_id = ? AND token_hash != ?")
      .run(partner.id, currentHash);
    return json(res, 200, { ok: true, revoked: Number(result.changes || 0) });
  }

  if (req.method === "GET" && url.pathname === "/api/partners/hub") {
    const partner = requirePartner(req, res);
    if (!partner) return;
    return json(res, 200, buildPartnerHubPayload(partner));
  }

  const partnerFranchiseTermsMatch = url.pathname.match(/^\/api\/partners\/franchise-terms\/(hatay360|adana360)$/);
  if (req.method === "GET" && partnerFranchiseTermsMatch) {
    const partner = requirePartner(req, res);
    if (!partner) return;
    const brandId = partnerFranchiseTermsMatch[1];
    const row = db.prepare("SELECT json FROM franchise_terms WHERE brand_id = ?").get(brandId);
    const raw = row ? JSON.parse(row.json) : createExampleBayilikSartlari(brandId);
    return json(res, 200, { terms: normalizeBayilikSartlari(raw, brandId) });
  }

  function partnerContractPayload(partner, brandId = "hatay360") {
    const termsRow = db.prepare("SELECT json FROM franchise_terms WHERE brand_id = ?").get(brandId);
    const raw = termsRow ? JSON.parse(termsRow.json) : createExampleBayilikSartlari(brandId);
    const terms = normalizeBayilikSartlari(raw, brandId);
    const acceptance = db
      .prepare("SELECT id, full_name, accepted_at, terms_updated_at FROM partner_contract_acceptances WHERE partner_id = ? AND brand_id = ? AND terms_updated_at = ? ORDER BY id DESC LIMIT 1")
      .get(partner.id, brandId, terms.updatedAt) || null;
    return {
      title: `${brandId === "adana360" ? "Adana360" : "Hatay360"} Bayilik Sözleşmesi`,
      legalTextReady: false,
      legalNotice: "Hukuki sözleşme metni henüz hukuk danışmanı tarafından sisteme yüklenmemiştir. Bu ekran yalnızca teknik onay altyapısıdır.",
      terms,
      acceptance,
    };
  }

  if (req.method === "GET" && url.pathname === "/api/partners/contract") {
    const partner = requirePartner(req, res);
    if (!partner) return;
    return json(res, 200, partnerContractPayload(partner));
  }

  if (req.method === "POST" && url.pathname === "/api/partners/contract/accept") {
    const partner = requirePartner(req, res);
    if (!partner) return;
    const body = await readJson(req, 10_000);
    const fullName = cleanText(body.fullName, 120);
    if (!body.accepted || fullName.length < 3) return json(res, 400, { error: "Ad soyad ve kabul onayı zorunludur." });
    const payload = partnerContractPayload(partner);
    if (!payload.legalTextReady) return json(res, 409, { error: "Hukuki sözleşme metni yüklenmeden dijital onay alınamaz." });
    const acceptedAt = nowIso();
    db.prepare(
      `INSERT OR IGNORE INTO partner_contract_acceptances
       (partner_id, brand_id, full_name, terms_snapshot, terms_updated_at, accepted_at, ip, user_agent)
       VALUES (?, 'hatay360', ?, ?, ?, ?, ?, ?)`,
    ).run(partner.id, fullName, JSON.stringify(payload.terms), payload.terms.updatedAt, acceptedAt, requestIp(req), cleanText(req.headers["user-agent"], 300));
    logAudit({ actorType: "partner", actorId: partner.id, actorLabel: partner.email, action: "partner_contract_accept", detail: payload.title, ip: requestIp(req) });
    return json(res, 200, { ok: true, ...partnerContractPayload(partner) });
  }

  if (req.method === "GET" && url.pathname === "/api/partners/contract.pdf") {
    const partner = requirePartner(req, res);
    if (!partner) return;
    const payload = partnerContractPayload(partner);
    const categoryLines = payload.terms.kategoriler.map((item) => `${item.ad}: %${item.komisyonOrani} (${item.tekrarTipi})`).join("\n");
    const body = `${payload.legalNotice}\n\nKatılım ücreti: ${payload.terms.katilimUcretiTl} TL\nÖdeme periyodu: ${payload.terms.odemePeriyodu}\n\n${categoryLines}`;
    const pdf = buildContractPdf({
      title: payload.title,
      body,
      companyName: partner.company_name,
      contactName: payload.acceptance?.full_name || partner.contact_name,
      signedAt: payload.acceptance?.accepted_at || "",
      statusLabel: payload.acceptance ? "Dijital onay kaydedildi" : "Onay bekliyor",
    });
    return sendPdfBuffer(res, pdf, "bayilik-sozlesmesi.pdf");
  }

  if (req.method === "POST" && url.pathname === "/api/partners/payment-requests") {
    const partner = requirePartner(req, res);
    if (!partner) return;
    if (rateLimited(req, `partner-payment-${partner.id}`, 6, 60 * 60 * 1000)) {
      return json(res, 429, { error: "Çok fazla ödeme talebi. Bir süre sonra tekrar deneyin." });
    }
    const body = await readJson(req, 10_000);
    const amount = numberValue(body.amount, 1_000_000);
    if (amount < 100) {
      return json(res, 400, { error: "Minimum ödeme talebi 100 TL olmalıdır." });
    }
    const hub = buildPartnerHubPayload(partner);
    if (amount > hub.summary.pendingBalance) {
      return json(res, 400, { error: "Talep tutarı bekleyen bakiyeden fazla olamaz." });
    }
    const pendingExists = db
      .prepare("SELECT id FROM partner_payment_requests WHERE partner_id = ? AND status = 'pending' LIMIT 1")
      .get(partner.id);
    if (pendingExists) {
      return json(res, 409, { error: "Zaten bekleyen bir ödeme talebiniz var." });
    }
    const createdAt = nowIso();
    const result = db
      .prepare(
        "INSERT INTO partner_payment_requests (partner_id, amount, status, created_at, updated_at) VALUES (?, ?, 'pending', ?, ?)",
      )
      .run(partner.id, amount, createdAt, createdAt);
    logAudit({
      actorType: "partner",
      actorId: partner.id,
      actorLabel: partner.email,
      action: "payment_request",
      detail: `${amount} TL komisyon ödeme talebi`,
      ip: requestIp(req),
    });
    return json(res, 201, { ok: true, id: Number(result.lastInsertRowid) });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/partners") {
    if (!requireUser(req, res)) return;
    const partners = db
      .prepare(
        "SELECT id, company_name, contact_name, email, phone, city, website, notes, commission_rate, status, created_at, updated_at FROM partner_accounts ORDER BY created_at DESC",
      )
      .all();
    return json(res, 200, { partners });
  }

  const adminFranchiseTermsMatch = url.pathname.match(/^\/api\/admin\/franchise-terms\/(hatay360|adana360)$/);
  if (req.method === "GET" && adminFranchiseTermsMatch) {
    if (!requireUser(req, res)) return;
    const brandId = adminFranchiseTermsMatch[1];
    const row = db.prepare("SELECT json FROM franchise_terms WHERE brand_id = ?").get(brandId);
    const raw = row ? JSON.parse(row.json) : createExampleBayilikSartlari(brandId);
    return json(res, 200, { terms: normalizeBayilikSartlari(raw, brandId) });
  }

  if (req.method === "PUT" && adminFranchiseTermsMatch) {
    const user = requireUser(req, res);
    if (!user) return;
    const brandId = adminFranchiseTermsMatch[1];
    const body = await readJson(req, 50_000);
    const terms = normalizeBayilikSartlari(
      { ...body.terms, brandId, ornekPlaceholder: Boolean(body.terms?.ornekPlaceholder), updatedAt: nowIso() },
      brandId,
    );
    db.prepare(
      `INSERT INTO franchise_terms (brand_id, json, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(brand_id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at`,
    ).run(brandId, JSON.stringify(terms), terms.updatedAt);
    logAudit({
      actorType: "admin",
      actorId: user.id,
      actorLabel: user.username,
      action: "franchise_terms_update",
      detail: `${brandId} bayilik şartları güncellendi`,
      ip: requestIp(req),
    });
    return json(res, 200, { ok: true, terms });
  }

  const partnerMatch = url.pathname.match(/^\/api\/admin\/partners\/(\d+)$/);
  if (req.method === "PATCH" && partnerMatch) {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 10_000);
    const status = cleanText(body.status, 20);
    const commissionRate = body.commissionRate === undefined ? null : numberValue(body.commissionRate, 100);
    if (status && !["pending", "active", "paused"].includes(status)) {
      return json(res, 400, { error: "Geçersiz bayi durumu." });
    }
    const current = db.prepare("SELECT id FROM partner_accounts WHERE id = ?").get(Number(partnerMatch[1]));
    if (!current) return json(res, 404, { error: "Bayi bulunamadı." });
    db.prepare(
      `UPDATE partner_accounts
       SET status = COALESCE(?, status),
           commission_rate = COALESCE(?, commission_rate),
           updated_at = ?
       WHERE id = ?`,
    ).run(status || null, commissionRate, nowIso(), Number(partnerMatch[1]));
    return json(res, 200, { ok: true });
  }

  const partnerApproveMatch = url.pathname.match(/^\/api\/admin\/partners\/(\d+)\/approve$/);
  if (req.method === "POST" && partnerApproveMatch) {
    if (!requireUser(req, res)) return;
    const result = approvePartnerAccount(Number(partnerApproveMatch[1]));
    if (result.error) return json(res, 404, { error: result.error });
    return json(res, 200, result);
  }

  if (req.method === "POST" && url.pathname === "/api/customer/logout") {
    const token = cookies(req)[CUSTOMER_SESSION_COOKIE];
    if (token) db.prepare("DELETE FROM customer_sessions WHERE token_hash = ?").run(sha256(token));
    const cookie = `${CUSTOMER_SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${IS_PRODUCTION ? "; Secure" : ""}`;
    return json(res, 200, { ok: true }, { "Set-Cookie": cookie });
  }

  if (req.method === "GET" && url.pathname === "/api/customer/dashboard") {
    const customer = requireCustomer(req, res);
    if (!customer) return;
    return json(res, 200, customerDashboard(customer, currentCustomerRole(req)));
  }

  if (req.method === "GET" && url.pathname === "/api/customer/notifications") {
    const customer = requireCustomer(req, res);
    if (!customer) return;
    return json(res, 200, {
      notifications: customerNotifications(customer.id, { unreadOnly: false, limit: 30 }),
      unreadNotifications: unreadNotificationCount(customer.id),
    });
  }

  const customerNotificationReadMatch = url.pathname.match(/^\/api\/customer\/notifications\/(\d+)\/read$/);
  if (req.method === "POST" && customerNotificationReadMatch) {
    const customer = requireCustomer(req, res);
    if (!customer) return;
    const notificationId = Number(customerNotificationReadMatch[1]);
    const existing = db
      .prepare("SELECT id, read_at FROM customer_notifications WHERE id = ? AND customer_id = ?")
      .get(notificationId, customer.id);
    if (!existing) return json(res, 404, { error: "Bildirim bulunamadı." });
    if (!existing.read_at) {
      db.prepare("UPDATE customer_notifications SET read_at = ? WHERE id = ? AND customer_id = ?").run(
        nowIso(),
        notificationId,
        customer.id,
      );
    }
    return json(res, 200, {
      ok: true,
      unreadNotifications: unreadNotificationCount(customer.id),
      notifications: customerNotifications(customer.id, { unreadOnly: true, limit: 5 }),
    });
  }

  if (req.method === "GET" && url.pathname === "/api/customer/ads-report") {
    const customer = requireCustomer(req, res);
    if (!customer) return;
    return json(res, 200, customerAdsReport(customer, url.searchParams.get("range")));
  }

  if (req.method === "GET" && url.pathname === "/api/customer/support-live") {
    const customer = requireCustomer(req, res);
    if (!customer) return;
    return json(res, 200, supportLive(customer.id));
  }

  if (req.method === "POST" && url.pathname === "/api/customer/whatsapp-queue") {
    const customer = requireCustomer(req, res);
    if (!customer) return;
    const existing = db
      .prepare("SELECT * FROM customer_whatsapp_queue WHERE customer_id = ? AND status IN ('waiting', 'serving') ORDER BY id DESC LIMIT 1")
      .get(customer.id);
    const waOffset = ticketVitrinSettings().whatsappWaiting;
    if (existing) {
      return json(res, 200, {
        ok: true,
        id: existing.id,
        queuePosition: existing.status === "waiting" ? displayQueuePosition(existing.queue_position, waOffset) : null,
        status: existing.status,
        already: true,
      });
    }
    const createdAt = nowIso();
    const queuePosition = nextWhatsappQueuePosition();
    const result = db
      .prepare("INSERT INTO customer_whatsapp_queue (customer_id, status, queue_position, created_at, updated_at) VALUES (?, 'waiting', ?, ?, ?)")
      .run(customer.id, queuePosition, createdAt, createdAt);
    return json(res, 201, { ok: true, id: Number(result.lastInsertRowid), queuePosition: displayQueuePosition(queuePosition, waOffset), status: "waiting", already: false });
  }

  if (req.method === "POST" && url.pathname === "/api/customer/website") {
    const customer = requireCustomerFull(req, res);
    if (!customer) return;
    const account = db.prepare("SELECT package_id FROM customer_accounts WHERE id = ?").get(customer.id);
    if (!canEditSmallSiteFields(account?.package_id)) {
      return json(res, 403, { error: "Bu pakette site alanları Hatay360 panelinden düzenlenmez. Kendi site panelinizi kullanın veya paket yükseltmesi isteyin." });
    }
    const body = await readJson(req, 20_000);
    const logoUrl = body.logoUrl === undefined ? null : safeHttpUrl(body.logoUrl);
    const sitePhone = body.phone === undefined ? null : cleanText(body.phone, 40);
    const siteAddress = body.address === undefined ? null : cleanText(body.address, 240);
    const siteHours = body.hours === undefined ? null : cleanText(body.hours, 400);
    db.prepare(
      `UPDATE customer_accounts SET
        site_logo_url = COALESCE(?, site_logo_url),
        site_phone = COALESCE(?, site_phone),
        site_address = COALESCE(?, site_address),
        site_hours = COALESCE(?, site_hours),
        last_update_at = ?,
        updated_at = ?
       WHERE id = ?`,
    ).run(logoUrl, sitePhone, siteAddress, siteHours, nowIso(), nowIso(), customer.id);
    return json(res, 200, { ok: true, website: customerDashboard(customer).website });
  }

  if (req.method === "POST" && url.pathname === "/api/customer/password") {
    const customer = requireCustomer(req, res);
    if (!customer) return;
    if (rateLimited(req, `customer-password-${customer.id}`, 5, 60 * 60 * 1000)) {
      return json(res, 429, { error: "Çok fazla şifre değiştirme denemesi. Bir süre sonra tekrar deneyin." });
    }
    const body = await readJson(req, 20_000);
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    if (newPassword.length < 10 || newPassword.length > 128) {
      return json(res, 400, { error: "Yeni şifre en az 10, en fazla 128 karakter olmalıdır." });
    }
    if (currentPassword === newPassword) {
      return json(res, 400, { error: "Yeni şifre mevcut şifreden farklı olmalıdır." });
    }
    const account = db.prepare("SELECT password_hash, password_salt FROM customer_accounts WHERE id = ? AND status = 'active'").get(customer.id);
    if (!account || !verifyPassword(currentPassword, account.password_salt, account.password_hash)) {
      return json(res, 401, { error: "Mevcut şifre hatalı." });
    }
    const credentials = hashPassword(newPassword);
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
    const changedAt = nowIso();
    db.exec("BEGIN IMMEDIATE");
    try {
      db.prepare("UPDATE customer_accounts SET password_hash = ?, password_salt = ?, updated_at = ? WHERE id = ?").run(credentials.hash, credentials.salt, changedAt, customer.id);
      db.prepare("DELETE FROM customer_sessions WHERE customer_id = ?").run(customer.id);
      db.prepare("INSERT INTO customer_sessions (token_hash, customer_id, expires_at, created_at) VALUES (?, ?, ?, ?)").run(sha256(token), customer.id, expiresAt.toISOString(), changedAt);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
    logAudit({ actorType: "customer", actorId: customer.id, actorLabel: customer.email, customerId: customer.id, action: "password_change", ip: requestIp(req) });
    const cookie = `${CUSTOMER_SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_HOURS * 3600}${IS_PRODUCTION ? "; Secure" : ""}`;
    return json(res, 200, { ok: true, message: "Şifreniz güncellendi. Diğer cihazlardaki oturumlar kapatıldı." }, { "Set-Cookie": cookie });
  }

  if (req.method === "GET" && url.pathname === "/api/customer/security") {
    const customer = requireCustomerFull(req, res);
    if (!customer) return;
    const now = nowIso();
    const email = String(customer.email || "").toLowerCase();
    const currentToken = cookies(req)[CUSTOMER_SESSION_COOKIE];
    const currentHash = currentToken ? sha256(currentToken) : "";
    const sessions = db
      .prepare(
        `SELECT substr(token_hash, 1, 8) AS id, created_at, expires_at, token_hash
         FROM customer_sessions
         WHERE customer_id = ? AND expires_at > ?
         ORDER BY CASE WHEN token_hash = ? THEN 0 ELSE 1 END, created_at DESC
         LIMIT 20`,
      )
      .all(customer.id, now, currentHash)
      .map((row) => ({
        id: row.id,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
        current: Boolean(currentHash && row.token_hash === currentHash),
      }));
    const activeSessions = sessions.length;
    const failed24h = Number(
      db
        .prepare("SELECT COUNT(*) AS n FROM login_events WHERE username = ? AND success = 0 AND created_at >= ?")
        .get(email, new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())?.n || 0,
    );
    const events = db
      .prepare(
        `SELECT id, username, success, created_at,
                substr(visitor_hash, 1, 8) AS visitor_tag
         FROM login_events
         WHERE username = ?
         ORDER BY created_at DESC, id DESC
         LIMIT 40`,
      )
      .all(email)
      .map((row) => ({
        id: row.id,
        username: row.username,
        success: Boolean(row.success),
        createdAt: row.created_at,
        visitorTag: row.visitor_tag,
      }));
    return json(res, 200, {
      email,
      companyName: customer.company_name,
      activeSessions,
      failed24h,
      sessions,
      events,
    });
  }

  if (req.method === "POST" && url.pathname === "/api/customer/2fa") {
    const customer = requireCustomerFull(req, res);
    if (!customer) return;
    if (rateLimited(req, `customer-2fa-${customer.id}`, 8, 60 * 60 * 1000)) {
      return json(res, 429, { error: "Çok fazla 2FA denemesi. Bir süre sonra tekrar deneyin." });
    }
    const body = await readJson(req, 20_000);
    const enabled = Boolean(body.enabled);
    const currentPassword = String(body.currentPassword || "");
    if (!currentPassword) return json(res, 400, { error: "Mevcut şifrenizi girin." });
    if (!verifyLoggedInCustomerPassword(req, customer, currentPassword)) {
      return json(res, 401, { error: "Mevcut şifre hatalı." });
    }
    if (enabled) {
      const code = createOtp(customer.id, "stepup");
      const sent = sendCustomerOtpEmail(customer, code);
      if (!sent.ok) {
        return json(res, 400, {
          error: OTP_SMTP_UNAVAILABLE_TR,
          reason: sent.error || SMTP_NOT_CONFIGURED,
        });
      }
      db.prepare("UPDATE customer_accounts SET two_factor = 1, updated_at = ? WHERE id = ?").run(nowIso(), customer.id);
      logAudit({
        actorType: "customer",
        actorId: customer.id,
        actorLabel: customer.email,
        customerId: customer.id,
        action: "2fa_enable",
        ip: requestIp(req),
      });
      return json(res, 200, { ok: true, enabled: true });
    }
    db.prepare("UPDATE customer_accounts SET two_factor = 0, updated_at = ? WHERE id = ?").run(nowIso(), customer.id);
    logAudit({
      actorType: "customer",
      actorId: customer.id,
      actorLabel: customer.email,
      customerId: customer.id,
      action: "2fa_disable",
      ip: requestIp(req),
    });
    return json(res, 200, { ok: true, enabled: false });
  }

  if (req.method === "POST" && url.pathname === "/api/customer/2fa/stepup") {
    const customer = requireCustomerFull(req, res);
    if (!customer) return;
    if (!customerTwoFactorOn(customer.id)) {
      return json(res, 400, { error: "İki adımlı doğrulama kapalı; ek kod gerekmez." });
    }
    const code = createOtp(customer.id, "stepup");
    const sent = sendCustomerOtpEmail(customer, code);
    if (!sent.ok) {
      return json(res, 400, { error: OTP_SMTP_UNAVAILABLE_TR, reason: sent.error || SMTP_NOT_CONFIGURED });
    }
    return json(res, 200, { ok: true, needsOtp: true });
  }

  if (req.method === "POST" && url.pathname === "/api/customer/2fa/stepup/verify") {
    const customer = requireCustomerFull(req, res);
    if (!customer) return;
    if (!customerTwoFactorOn(customer.id)) {
      return json(res, 400, { error: "İki adımlı doğrulama kapalı; ek kod gerekmez." });
    }
    const body = await readJson(req, 20_000);
    const verified = verifyOtp(customer.id, "stepup", String(body.code || "").trim(), req);
    if (!verified.ok) {
      const status = verified.rateLimited || verified.locked ? 429 : 401;
      return json(res, status, { error: verified.error });
    }
    const session = currentCustomerSession(req);
    if (!session) return json(res, 401, { error: "Müşteri oturumu gerekli." });
    db.prepare("UPDATE customer_sessions SET stepup_at = ? WHERE token_hash = ?").run(nowIso(), session.token_hash);
    return json(res, 200, { ok: true });
  }

  if (req.method === "POST" && url.pathname === "/api/customer/sessions/revoke-others") {
    const customer = requireCustomerFull(req, res);
    if (!customer) return;
    const token = cookies(req)[CUSTOMER_SESSION_COOKIE];
    if (!token) return json(res, 401, { error: "Oturum gerekli." });
    const currentHash = sha256(token);
    const result = db
      .prepare("DELETE FROM customer_sessions WHERE customer_id = ? AND token_hash != ?")
      .run(customer.id, currentHash);
    return json(res, 200, { ok: true, revoked: Number(result.changes || 0) });
  }

  if (req.method === "POST" && url.pathname === "/api/customer/tickets") {
    const customer = requireCustomer(req, res);
    if (!customer) return;
    const body = await readJson(req, 30_000);
    const subject = cleanText(body.subject, 160);
    const message = cleanText(body.message, 3000);
    const priority = ["normal", "urgent"].includes(body.priority) ? body.priority : "normal";
    if (subject.length < 3 || message.length < 5) return json(res, 400, { error: "Konu ve mesaj bilgilerini kontrol edin." });
    const createdAt = nowIso();
    const queuePosition = nextTicketQueuePosition();
    const result = db.prepare("INSERT INTO customer_tickets (customer_id, subject, message, priority, queue_position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(customer.id, subject, message, priority, queuePosition, createdAt, createdAt);
    logAudit({ actorType: "customer", actorId: customer.id, actorLabel: customer.email, customerId: customer.id, action: "ticket_open", target: `ticket#${Number(result.lastInsertRowid)}`, ip: requestIp(req), meta: JSON.stringify({ priority }) });
    const shownPosition = displayQueuePosition(queuePosition, ticketVitrinSettings().open);
    return json(res, 201, { ok: true, id: Number(result.lastInsertRowid), queuePosition: shownPosition });
  }

  if (req.method === "POST" && url.pathname === "/api/customer/service-requests") {
    const customer = requireCustomer(req, res);
    if (!customer) return;
    const body = await readJson(req, 30_000);
    const service = cleanText(body.service, 160);
    const details = cleanText(body.details, 3000);
    if (service.length < 2 || details.length < 5) return json(res, 400, { error: "Hizmet ve açıklama bilgilerini kontrol edin." });
    const createdAt = nowIso();
    const result = db.prepare("INSERT INTO customer_service_requests (customer_id, service, details, created_at, updated_at) VALUES (?, ?, ?, ?, ?)").run(customer.id, service, details, createdAt, createdAt);
    return json(res, 201, { ok: true, id: Number(result.lastInsertRowid) });
  }

  if (req.method === "GET" && url.pathname === "/api/customer/extra-services") {
    const customer = requireCustomer(req, res);
    if (!customer) return;
    return json(res, 200, { extras: listExtraServices({ activeOnly: true }) });
  }

  if (req.method === "GET" && url.pathname === "/api/customer/seo") {
    const customer = requireCustomer(req, res);
    if (!customer) return;
    return json(res, 200, customerSeoPayload(customer.id));
  }

  const extraRequestMatch = url.pathname.match(/^\/api\/customer\/extra-services\/(\d+)\/request$/);
  if (req.method === "POST" && extraRequestMatch) {
    const customer = requireCustomer(req, res);
    if (!customer) return;
    if (rateLimited(req, "extra-request", 8, 10 * 60 * 1000)) {
      return json(res, 429, { error: "Çok fazla ek hizmet talebi. Biraz sonra tekrar deneyin." });
    }
    const extraId = Number(extraRequestMatch[1]);
    const extra = db.prepare("SELECT * FROM extra_services WHERE id = ? AND active = 1").get(extraId);
    if (!extra) return json(res, 404, { error: "Ek hizmet bulunamadı." });
    const pending = db
      .prepare(
        "SELECT id FROM customer_service_requests WHERE customer_id = ? AND extra_service_id = ? AND kind = 'extra' AND status IN ('new', 'reviewing') LIMIT 1",
      )
      .get(customer.id, extraId);
    if (pending) return json(res, 409, { error: "Bu hizmet için bekleyen bir talebiniz zaten var." });
    const createdAt = nowIso();
    const price = roundCatalogAmount(extra.price);
    const details = `Ek Hizmet Talebi · ${extra.name} · ${price} ₺`;
    const reqResult = db
      .prepare(
        `INSERT INTO customer_service_requests (customer_id, service, details, status, kind, extra_service_id, amount, created_at, updated_at)
         VALUES (?, ?, ?, 'new', 'extra', ?, ?, ?, ?)`,
      )
      .run(customer.id, extra.name, details, extraId, price, createdAt, createdAt);
    const requestId = Number(reqResult.lastInsertRowid);
    const catalogDetails = JSON.stringify({ extra: true, extraServiceId: extraId, requestId });
    const catResult = db
      .prepare(
        `INSERT INTO customer_catalog (customer_id, kind, title, details, amount, quantity, status, created_at, updated_at)
         VALUES (?, 'extra', ?, ?, ?, 1, 'draft', ?, ?)`,
      )
      .run(customer.id, extra.name, catalogDetails, price, createdAt, createdAt);
    const catalogId = Number(catResult.lastInsertRowid);
    db.prepare("UPDATE customer_service_requests SET catalog_id = ?, updated_at = ? WHERE id = ?").run(catalogId, createdAt, requestId);
    logAudit({
      actorType: "customer",
      actorId: customer.id,
      actorLabel: customer.email,
      customerId: customer.id,
      action: "extra_request",
      target: `extra#${extraId}`,
      ip: requestIp(req),
      meta: JSON.stringify({ requestId, catalogId, name: extra.name, price }),
    });
    return json(res, 201, { ok: true, id: requestId });
  }

  if ((req.method === "GET" || req.method === "POST") && url.pathname === "/api/customer/domain-check") {
    const customer = requireCustomer(req, res);
    if (!customer) return;
    if (rateLimited(req, "domain-check", 30, 60_000)) {
      return json(res, 429, { error: "Çok fazla domain sorgusu. Bir dakika sonra tekrar deneyin." });
    }

    let rawList = [];
    if (req.method === "POST") {
      const body = await readJson(req, 8_000);
      if (Array.isArray(body.domains)) rawList = body.domains;
      else if (body.domain) rawList = [body.domain];
    } else {
      rawList = [url.searchParams.get("domain")];
    }

    const domains = [...new Set(rawList.map(normalizeDomainInput).filter(Boolean))].slice(0, 6);
    if (!domains.length) return json(res, 400, { error: "Geçerli bir alan adı yazın. Örnek: firmam.com" });
    if (domains.some((domain) => !DOMAIN_NAME_RE.test(domain))) {
      return json(res, 400, { error: "Geçerli bir alan adı yazın. Örnek: firmam.com" });
    }

    const insert = db.prepare("INSERT INTO customer_domain_checks (customer_id, domain, result, created_at) VALUES (?, ?, ?, ?)");
    const checks = [];
    const createdAt = nowIso();
    for (const domain of domains) {
      const probed = await probeDomain(domain);
      insert.run(customer.id, probed.domain, probed.result, createdAt);
      checks.push(probed);
    }

    if (checks.length === 1) return json(res, 200, checks[0]);
    return json(res, 200, { checks });
  }

  if (req.method === "POST" && url.pathname === "/api/customer/contracts") {
    const customer = requireCustomerFull(req, res);
    if (!customer) return;
    const body = await readJson(req, 12_000_000);
    const upload = decodeContractUpload(body);
    if (upload.error) return json(res, 400, { error: upload.error });
    const saved = saveContractFile(customer.id, upload, { title: body.title, familyId: body.familyId, uploadedBy: "customer" });
    if (saved.error) return json(res, 400, { error: saved.error });
    return json(res, 201, { ok: true, id: saved.id, ...customerRecords(customer.id) });
  }

  const customerContractSignMatch = url.pathname.match(/^\/api\/customer\/contracts\/(\d+)\/sign$/);
  if (req.method === "POST" && customerContractSignMatch) {
    const customer = requireCustomerFull(req, res);
    if (!customer) return;
    const body = await readJson(req, 2_000_000);
    const decoded = decodeSignatureJpeg(body.signature);
    if (decoded.error) return json(res, 400, { error: decoded.error });
    const saved = applyContractSignature(customer.id, Number(customerContractSignMatch[1]), decoded.buffer, "customer");
    if (saved.error) return json(res, saved.error.includes("bulunamadı") ? 404 : 400, { error: saved.error });
    return json(res, 200, { ok: true, id: saved.id, ...customerRecords(customer.id) });
  }

  const customerContractFileMatch = url.pathname.match(/^\/api\/customer\/contracts\/(\d+)\/file$/);
  if (req.method === "GET" && customerContractFileMatch) {
    const customer = requireCustomerStepup(req, res);
    if (!customer) return;
    const row = db.prepare("SELECT * FROM customer_contracts WHERE id = ? AND customer_id = ?").get(Number(customerContractFileMatch[1]), customer.id);
    if (!row) return json(res, 404, { error: "Sözleşme bulunamadı." });
    logAudit({ actorType: "customer", actorId: customer.id, actorLabel: customer.email, customerId: customer.id, action: "file_download", target: `contract#${row.id}`, ip: requestIp(req) });
    return sendContractFile(res, row, url.searchParams.get("download") === "1");
  }

  const customerPaymentInvoiceMatch = url.pathname.match(/^\/api\/customer\/payments\/(\d+)\/invoice\.pdf$/);
  if (req.method === "GET" && customerPaymentInvoiceMatch) {
    const customer = requireCustomerStepup(req, res);
    if (!customer) return;
    const row = db.prepare("SELECT * FROM customer_payments WHERE id = ? AND customer_id = ?").get(Number(customerPaymentInvoiceMatch[1]), customer.id);
    if (!row) return json(res, 404, { error: "Ödeme kaydı bulunamadı." });
    const account = findCustomerAccount(customer.id);
    const pdf = buildCustomerPaymentInvoicePdf(account, row);
    logAudit({ actorType: "customer", actorId: customer.id, actorLabel: customer.email, customerId: customer.id, action: "invoice_view", target: `payment#${row.id}`, ip: requestIp(req) });
    return sendPdfBuffer(res, pdf, paymentInvoiceDownloadName(row), url.searchParams.get("download") !== "0");
  }

  const customerPaymentPayMatch = url.pathname.match(/^\/api\/customer\/payments\/(\d+)\/pay$/);
  if (req.method === "POST" && customerPaymentPayMatch) {
    const customer = requireCustomerFull(req, res);
    if (!customer) return;
    const paymentId = Number(customerPaymentPayMatch[1]);
    const row = db.prepare("SELECT * FROM customer_payments WHERE id = ? AND customer_id = ?").get(paymentId, customer.id);
    if (!row) return json(res, 404, { error: "Ödeme kaydı bulunamadı." });
    const resolved = resolvePaymentAmounts({
      amount: row.amount,
      paidAmount: row.paid_amount,
      status: row.status,
      period: row.period,
      startDate: row.start_date,
      endDate: row.end_date,
    });
    if (resolved.status === "paid" || resolved.remaining <= 0) {
      return json(res, 400, { error: "Bu ödeme zaten kapatılmış.", gateway: false });
    }
    const checkout = startIyzicoCheckout({
      id: row.id,
      remaining: resolved.remaining,
      amount: resolved.amount,
      period: resolved.period || row.period,
      status: resolved.status,
    }, process.env);
    // İskele: fatura asla ödendi yapılmaz, kart tutulmaz, iyzico API çağrılmaz.
    if (checkout.error === GATEWAY_NOT_CONFIGURED) {
      return json(res, 503, { error: GATEWAY_NOT_CONNECTED_TR, gateway: false });
    }
    return json(res, 503, { error: GATEWAY_PREPARING_TR, gateway: false });
  }

  const customerContractRestoreMatch = url.pathname.match(/^\/api\/customer\/contracts\/(\d+)\/restore$/);
  if (req.method === "POST" && customerContractRestoreMatch) {
    const customer = requireCustomerFull(req, res);
    if (!customer) return;
    const restored = restoreContractVersion(customer.id, Number(customerContractRestoreMatch[1]), "customer");
    if (restored.error) return json(res, restored.error.includes("bulunamadı") ? 404 : 400, { error: restored.error });
    return json(res, 200, { ok: true, id: restored.id, ...customerRecords(customer.id) });
  }

  if (req.method === "GET" && url.pathname === "/api/customer/approvals") {
    const customer = requireCustomer(req, res);
    if (!customer) return;
    return json(res, 200, { approvals: listCustomerApprovals(customer.id), approvalsPending: pendingApprovalsCount(customer.id) });
  }

  const customerApprovalFileMatch = url.pathname.match(/^\/api\/customer\/approvals\/(\d+)\/file$/);
  if (req.method === "GET" && customerApprovalFileMatch) {
    const customer = requireCustomer(req, res);
    if (!customer) return;
    const row = db.prepare("SELECT * FROM approvals WHERE id = ? AND customer_id = ?").get(Number(customerApprovalFileMatch[1]), customer.id);
    if (!row || !row.stored_name) return json(res, 404, { error: "Onay dosyası bulunamadı." });
    const seen = db.prepare("SELECT id FROM approval_events WHERE approval_id = ? AND actor = 'customer' AND action = 'viewed' LIMIT 1").get(row.id);
    if (!seen) addApprovalEvent(row.id, "customer", "viewed", "Müşteri görüntüledi");
    return sendApprovalFile(res, row, url.searchParams.get("download") === "1");
  }

  const customerApprovalRespondMatch = url.pathname.match(/^\/api\/customer\/approvals\/(\d+)\/respond$/);
  if (req.method === "POST" && customerApprovalRespondMatch) {
    const customer = requireCustomer(req, res);
    if (!customer) return;
    const body = await readJson(req, 20_000);
    const decision = cleanText(body.decision, 20);
    const responded = respondApproval(customer.id, Number(customerApprovalRespondMatch[1]), decision, body.feedback);
    if (responded.error) return json(res, responded.error.includes("bulunamadı") ? 404 : 400, { error: responded.error });
    logAudit({ actorType: "customer", actorId: customer.id, actorLabel: customer.email, customerId: customer.id, action: decision === "approved" ? "approval_approve" : "approval_revise", target: `approval#${Number(customerApprovalRespondMatch[1])}`, ip: requestIp(req) });
    return json(res, 200, { ok: true, approvals: listCustomerApprovals(customer.id), approvalsPending: pendingApprovalsCount(customer.id) });
  }

  if (req.method === "GET" && url.pathname === "/api/customer/quotes") {
    const customer = requireCustomer(req, res);
    if (!customer) return;
    return json(res, 200, { quotes: listCustomerQuotes(customer.id), quotesPending: pendingQuotesCount(customer.id) });
  }

  const customerQuoteFileMatch = url.pathname.match(/^\/api\/customer\/quotes\/(\d+)\/file$/);
  if (req.method === "GET" && customerQuoteFileMatch) {
    const customer = requireCustomer(req, res);
    if (!customer) return;
    const row = db.prepare("SELECT * FROM quotes WHERE id = ? AND customer_id = ?").get(Number(customerQuoteFileMatch[1]), customer.id);
    if (!row || !(row.stored_name || row.archive_name)) return json(res, 404, { error: "Teklif dosyası bulunamadı." });
    return sendQuoteFile(res, row, url.searchParams.get("download") === "1");
  }

  const customerQuoteAcceptMatch = url.pathname.match(/^\/api\/customer\/quotes\/(\d+)\/accept$/);
  if (req.method === "POST" && customerQuoteAcceptMatch) {
    const customer = requireCustomerFull(req, res);
    if (!customer) return;
    const body = await readJson(req, 20_000);
    if (body.accepted !== true) return json(res, 400, { error: "Teklifi kabul etmek için onay kutusunu işaretleyin." });
    const accepted = acceptQuote(customer.id, Number(customerQuoteAcceptMatch[1]), { name: body.name, ip: requestIp(req) });
    if (accepted.error) return json(res, accepted.status || 400, { error: accepted.error });
    logAudit({
      actorType: "customer",
      actorId: customer.id,
      actorLabel: customer.email,
      customerId: customer.id,
      action: "quote_accept",
      target: `quote#${Number(customerQuoteAcceptMatch[1])}`,
      ip: requestIp(req),
      meta: JSON.stringify({ name: cleanText(body.name, 120) }),
    });
    return json(res, 200, { ok: true, quotes: listCustomerQuotes(customer.id), quotesPending: pendingQuotesCount(customer.id) });
  }

  // === P6: Çoklu kullanıcı / rol yönetimi (owner self-service) ===
  if (req.method === "GET" && url.pathname === "/api/customer/users") {
    const customer = requireCustomerFull(req, res);
    if (!customer) return;
    return json(res, 200, { ok: true, users: listCustomerUsers(customer.id) });
  }

  if (req.method === "POST" && url.pathname === "/api/customer/users") {
    const customer = requireCustomerFull(req, res);
    if (!customer) return;
    const body = await readJson(req, 20_000);
    const name = cleanText(body.name, 120);
    const email = cleanText(body.email, 160).toLowerCase();
    const role = body.role === "full" ? "full" : "limited";
    const password = String(body.password || "");
    if (!email.includes("@") || email.length < 5) return json(res, 400, { error: "Geçerli bir e-posta yazın." });
    if (password.length < 10 || password.length > 128) return json(res, 400, { error: "Şifre en az 10, en fazla 128 karakter olmalıdır." });
    if (customerLoginEmailTaken(email)) return json(res, 409, { error: "Bu e-posta başka bir giriş için kullanılıyor." });
    const credentials = hashPassword(password);
    const createdAt = nowIso();
    try {
      db.prepare(
        "INSERT INTO customer_users (customer_id, name, email, role, password_hash, password_salt, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'active', 'owner', ?, ?)",
      ).run(customer.id, name, email, role, credentials.hash, credentials.salt, createdAt, createdAt);
    } catch (error) {
      if (String(error?.message || "").includes("UNIQUE")) return json(res, 409, { error: "Bu e-posta başka bir giriş için kullanılıyor." });
      throw error;
    }
    logAudit({ actorType: "customer", actorId: customer.id, actorLabel: customer.email, customerId: customer.id, action: "user_create", target: email, ip: requestIp(req), meta: JSON.stringify({ role }) });
    return json(res, 201, { ok: true, users: listCustomerUsers(customer.id) });
  }

  const customerUserMatch = url.pathname.match(/^\/api\/customer\/users\/(\d+)$/);
  if (req.method === "PUT" && customerUserMatch) {
    const customer = requireCustomerFull(req, res);
    if (!customer) return;
    const userId = Number(customerUserMatch[1]);
    const existing = db.prepare("SELECT * FROM customer_users WHERE id = ? AND customer_id = ?").get(userId, customer.id);
    if (!existing) return json(res, 404, { error: "Kullanıcı bulunamadı." });
    const body = await readJson(req, 20_000);
    const name = body.name === undefined ? null : cleanText(body.name, 120);
    const role = body.role === undefined ? null : body.role === "full" ? "full" : "limited";
    const status = body.status === undefined ? null : body.status === "disabled" ? "disabled" : "active";
    const password = body.password === undefined ? null : String(body.password || "");
    if (password !== null && (password.length < 10 || password.length > 128)) {
      return json(res, 400, { error: "Şifre en az 10, en fazla 128 karakter olmalıdır." });
    }
    // Şirketin son tam yetkili aktif kullanıcısını kilitleme/indirme koruması.
    // Owner (customer_accounts) her zaman tam yetkili sayılır, bu yüzden en az bir
    // tam yetkili giriş her koşulda kalır; guard yalnızca teorik sıfır duruma karşıdır.
    const willBeFull = role !== null ? role === "full" : existing.role === "full";
    const willBeActive = status !== null ? status === "active" : existing.status === "active";
    const otherFull = activeFullSubUserCount(customer.id, { exceptUserId: userId });
    const fullAfter = 1 + otherFull + (willBeFull && willBeActive ? 1 : 0);
    if (fullAfter <= 0) {
      return json(res, 409, { error: "Şirketin son tam yetkili kullanıcısı kilitlenemez veya yetkisi düşürülemez." });
    }
    const updatedAt = nowIso();
    const credentials = password !== null ? hashPassword(password) : null;
    db.prepare(
      `UPDATE customer_users SET
        name = COALESCE(?, name),
        role = COALESCE(?, role),
        status = COALESCE(?, status),
        password_hash = COALESCE(?, password_hash),
        password_salt = COALESCE(?, password_salt),
        updated_at = ?
       WHERE id = ? AND customer_id = ?`,
    ).run(name, role, status, credentials?.hash ?? null, credentials?.salt ?? null, updatedAt, userId, customer.id);
    // Rol/durum değiştiyse bu alt kullanıcının aktif oturumlarını senkronla veya kapat.
    if (role !== null || status !== null) {
      if ((status ?? existing.status) === "disabled") {
        db.prepare("DELETE FROM customer_sessions WHERE user_id = ?").run(userId);
      } else if (role !== null) {
        db.prepare("UPDATE customer_sessions SET role = ? WHERE user_id = ?").run(role, userId);
      }
    }
    return json(res, 200, { ok: true, users: listCustomerUsers(customer.id) });
  }

  if (req.method === "DELETE" && customerUserMatch) {
    const customer = requireCustomerFull(req, res);
    if (!customer) return;
    const userId = Number(customerUserMatch[1]);
    const existing = db.prepare("SELECT id FROM customer_users WHERE id = ? AND customer_id = ?").get(userId, customer.id);
    if (!existing) return json(res, 404, { error: "Kullanıcı bulunamadı." });
    db.prepare("DELETE FROM customer_sessions WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM customer_users WHERE id = ? AND customer_id = ?").run(userId, customer.id);
    return json(res, 200, { ok: true, users: listCustomerUsers(customer.id) });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/customers") {
    if (!requireUser(req, res)) return;
    const customers = db
      .prepare(
        `SELECT customer_accounts.id, customer_accounts.company_name, customer_accounts.contact_name,
          customer_accounts.email, customer_accounts.phone, customer_accounts.status, customer_accounts.created_at,
          customer_accounts.package_id, customer_accounts.website_url, customer_accounts.ssl_status, customer_accounts.site_status, customer_accounts.site_error,
          customer_accounts.site_phone, customer_accounts.site_address, customer_accounts.last_backup_at, customer_accounts.last_update_at,
          COUNT(DISTINCT ad_campaigns.id) AS campaign_count,
          COALESCE(SUM(campaign_stats.spend), 0) AS spend,
          COALESCE(SUM(campaign_stats.revenue), 0) AS revenue
         FROM customer_accounts
         LEFT JOIN ad_campaigns ON ad_campaigns.customer_id = customer_accounts.id
         LEFT JOIN campaign_stats ON campaign_stats.campaign_id = ad_campaigns.id
         GROUP BY customer_accounts.id ORDER BY customer_accounts.created_at DESC`,
      )
      .all();
    const campaigns = db.prepare("SELECT * FROM ad_campaigns ORDER BY created_at DESC").all();
    const stats = db.prepare("SELECT * FROM campaign_stats ORDER BY period_start DESC").all();
    const tickets = db
      .prepare(
        `SELECT customer_tickets.*, customer_accounts.company_name
         FROM customer_tickets
         JOIN customer_accounts ON customer_accounts.id = customer_tickets.customer_id
         ORDER BY CASE customer_tickets.status WHEN 'open' THEN 0 WHEN 'answering' THEN 1 ELSE 2 END,
                  CASE WHEN customer_tickets.queue_position > 0 THEN customer_tickets.queue_position ELSE 9999 END,
                  customer_tickets.created_at DESC`,
      )
      .all();
    const whatsappQueue = listWhatsappQueue();
    const serviceRequests = db.prepare("SELECT customer_service_requests.*, customer_accounts.company_name FROM customer_service_requests JOIN customer_accounts ON customer_accounts.id = customer_service_requests.customer_id ORDER BY customer_service_requests.created_at DESC").all();
    const domainChecks = db
      .prepare(
        `SELECT customer_domain_checks.id, customer_domain_checks.domain, customer_domain_checks.result, customer_domain_checks.created_at, customer_accounts.company_name
         FROM customer_domain_checks
         JOIN customer_accounts ON customer_accounts.id = customer_domain_checks.customer_id
         ORDER BY customer_domain_checks.created_at DESC
         LIMIT 40`,
      )
      .all();
    const maps = db.prepare("SELECT customer_maps.*, customer_accounts.company_name FROM customer_maps JOIN customer_accounts ON customer_accounts.id = customer_maps.customer_id ORDER BY customer_maps.updated_at DESC").all();
    const latestMapsByCustomer = new Map();
    for (const row of maps) {
      if (!latestMapsByCustomer.has(row.customer_id)) latestMapsByCustomer.set(row.customer_id, row);
    }
    const paymentRows = db.prepare("SELECT customer_id, amount, paid_amount, status, period, start_date, end_date FROM customer_payments").all();
    const paymentsByCustomer = new Map();
    for (const row of paymentRows) {
      const list = paymentsByCustomer.get(row.customer_id) || [];
      list.push({ amount: row.amount, paidAmount: row.paid_amount, status: row.status, period: row.period, startDate: row.start_date, endDate: row.end_date });
      paymentsByCustomer.set(row.customer_id, list);
    }
    const contractRows = db
      .prepare("SELECT customer_id, sign_status FROM customer_contracts WHERE is_current = 1")
      .all();
    const contractsByCustomer = new Map();
    for (const row of contractRows) {
      const list = contractsByCustomer.get(row.customer_id) || [];
      list.push(String(row.sign_status || "pending"));
      contractsByCustomer.set(row.customer_id, list);
    }
    const summarizeContractStatus = (statuses) => {
      if (!statuses?.length) return { status: "none", count: 0 };
      if (statuses.includes("signed")) return { status: "signed", count: statuses.length };
      if (statuses.includes("rejected")) return { status: "rejected", count: statuses.length };
      if (statuses.some((value) => value === "pending" || value === "")) return { status: "pending", count: statuses.length };
      if (statuses.every((value) => value === "approved")) return { status: "approved", count: statuses.length };
      return { status: "pending", count: statuses.length };
    };
    const customersWithPay = customers.map((customer) => ({
      ...customer,
      site_status: isSiteStatus(customer.site_status) ? customer.site_status : "open",
      site_error: Number(customer.site_error) === 1,
      paymentSummary: summarizePayments(paymentsByCustomer.get(customer.id) || []),
      contractSummary: summarizeContractStatus(contractsByCustomer.get(customer.id)),
      napIssues: accountNapIssueCount(customer, latestMapsByCustomer.get(customer.id) || null),
    }));
    return json(res, 200, { customers: customersWithPay, campaigns, stats, tickets, whatsappQueue, serviceRequests, domainChecks, maps, supportLive: supportLive(0, { admin: true }), ticketVitrin: ticketVitrinSettings() });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/customers") {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 30_000);
    const companyName = cleanText(body.companyName, 160);
    const contactName = cleanText(body.contactName, 160);
    const email = cleanText(body.email, 160).toLowerCase();
    const phone = cleanText(body.phone, 40);
    const nationalId = normalizeNationalId(body.nationalId || body.tc);
    const password = String(body.password || "");
    if (companyName.length < 2 || contactName.length < 2 || !email.includes("@") || password.length < 8) {
      return json(res, 400, { error: "Firma, yetkili, e-posta ve en az 8 karakterli şifre gereklidir." });
    }
    const duplicate = findExistingCustomer({ email, phone, nationalId });
    if (duplicate) {
      return json(res, 409, { error: duplicateCustomerMessage() });
    }
    const credentials = hashPassword(password);
    const createdAt = nowIso();
    const packageId = normalizePackageId(body.packageId);
    const referralCode = generateReferralCode();
    try {
      const result = db.prepare(
        "INSERT INTO customer_accounts (company_name, contact_name, email, phone, national_id, password_hash, password_salt, package_id, referral_code, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ).run(companyName, contactName, email, phone, nationalId, credentials.hash, credentials.salt, packageId, referralCode, createdAt, createdAt);
      return json(res, 201, { ok: true, id: Number(result.lastInsertRowid) });
    } catch (error) {
      if (String(error?.message || "").includes("UNIQUE")) return json(res, 409, { error: "Bu e-posta ile müşteri hesabı zaten var." });
      throw error;
    }
  }

  // === P6: Admin tarafından alt kullanıcı yönetimi ===
  const adminCustomerUsersMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/users$/);
  if (req.method === "GET" && adminCustomerUsersMatch) {
    if (!requireUser(req, res)) return;
    const customerId = Number(adminCustomerUsersMatch[1]);
    if (!findCustomerAccount(customerId)) return json(res, 404, { error: "Müşteri bulunamadı." });
    return json(res, 200, { ok: true, users: listCustomerUsers(customerId) });
  }
  if (req.method === "POST" && adminCustomerUsersMatch) {
    if (!requireUser(req, res)) return;
    const customerId = Number(adminCustomerUsersMatch[1]);
    if (!findCustomerAccount(customerId)) return json(res, 404, { error: "Müşteri bulunamadı." });
    const body = await readJson(req, 20_000);
    const name = cleanText(body.name, 120);
    const email = cleanText(body.email, 160).toLowerCase();
    const role = body.role === "full" ? "full" : "limited";
    const password = String(body.password || "");
    if (!email.includes("@") || email.length < 5) return json(res, 400, { error: "Geçerli bir e-posta yazın." });
    if (password.length < 10 || password.length > 128) return json(res, 400, { error: "Şifre en az 10, en fazla 128 karakter olmalıdır." });
    if (customerLoginEmailTaken(email)) return json(res, 409, { error: "Bu e-posta başka bir giriş için kullanılıyor." });
    const credentials = hashPassword(password);
    const createdAt = nowIso();
    try {
      db.prepare(
        "INSERT INTO customer_users (customer_id, name, email, role, password_hash, password_salt, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'active', 'admin', ?, ?)",
      ).run(customerId, name, email, role, credentials.hash, credentials.salt, createdAt, createdAt);
    } catch (error) {
      if (String(error?.message || "").includes("UNIQUE")) return json(res, 409, { error: "Bu e-posta başka bir giriş için kullanılıyor." });
      throw error;
    }
    return json(res, 201, { ok: true, users: listCustomerUsers(customerId) });
  }

  const adminUserMatch = url.pathname.match(/^\/api\/admin\/users\/(\d+)$/);
  if (req.method === "PUT" && adminUserMatch) {
    if (!requireUser(req, res)) return;
    const userId = Number(adminUserMatch[1]);
    const existing = db.prepare("SELECT * FROM customer_users WHERE id = ?").get(userId);
    if (!existing) return json(res, 404, { error: "Kullanıcı bulunamadı." });
    const body = await readJson(req, 20_000);
    const name = body.name === undefined ? null : cleanText(body.name, 120);
    const role = body.role === undefined ? null : body.role === "full" ? "full" : "limited";
    const status = body.status === undefined ? null : body.status === "disabled" ? "disabled" : "active";
    const password = body.password === undefined ? null : String(body.password || "");
    if (password !== null && (password.length < 10 || password.length > 128)) {
      return json(res, 400, { error: "Şifre en az 10, en fazla 128 karakter olmalıdır." });
    }
    const updatedAt = nowIso();
    const credentials = password !== null ? hashPassword(password) : null;
    db.prepare(
      `UPDATE customer_users SET
        name = COALESCE(?, name),
        role = COALESCE(?, role),
        status = COALESCE(?, status),
        password_hash = COALESCE(?, password_hash),
        password_salt = COALESCE(?, password_salt),
        updated_at = ?
       WHERE id = ?`,
    ).run(name, role, status, credentials?.hash ?? null, credentials?.salt ?? null, updatedAt, userId);
    if (role !== null || status !== null) {
      if ((status ?? existing.status) === "disabled") {
        db.prepare("DELETE FROM customer_sessions WHERE user_id = ?").run(userId);
      } else if (role !== null) {
        db.prepare("UPDATE customer_sessions SET role = ? WHERE user_id = ?").run(role, userId);
      }
    }
    return json(res, 200, { ok: true, users: listCustomerUsers(existing.customer_id) });
  }
  if (req.method === "DELETE" && adminUserMatch) {
    if (!requireUser(req, res)) return;
    const userId = Number(adminUserMatch[1]);
    const existing = db.prepare("SELECT customer_id FROM customer_users WHERE id = ?").get(userId);
    if (!existing) return json(res, 404, { error: "Kullanıcı bulunamadı." });
    db.prepare("DELETE FROM customer_sessions WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM customer_users WHERE id = ?").run(userId);
    return json(res, 200, { ok: true, users: listCustomerUsers(existing.customer_id) });
  }

  const adminCustomerMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)$/);
  if (req.method === "GET" && adminCustomerMatch) {
    if (!requireUser(req, res)) return;
    const customerId = Number(adminCustomerMatch[1]);
    const account = findCustomerAccount(customerId);
    if (!account) return json(res, 404, { error: "Müşteri bulunamadı." });
    const { password_hash, password_salt, ...safeAccount } = account;
    return json(res, 200, {
      customer: {
        ...safeAccount,
        site_status: isSiteStatus(account.site_status) ? account.site_status : "open",
        googleAdsCustomerId: String(account.google_ads_customer_id || ""),
        metaAdAccountId: String(account.meta_ad_account_id || ""),
      },
      project: customerProjectPayload(customerId),
      projectEvents: customerProjectEvents(customerId),
      renewals: customerRenewals(customerId),
      announcements: listAdminPortalAnnouncements(customerId),
      ...customerRecords(customerId),
    });
  }
  if (req.method === "PATCH" && adminCustomerMatch) {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 30_000);
    const customerId = Number(adminCustomerMatch[1]);
    const existing = findCustomerAccount(customerId);
    if (!existing) return json(res, 404, { error: "Müşteri bulunamadı." });
    const status = isAccountStatus(body.status) ? body.status : null;
    const sslStatus = ["active", "pending", "unknown"].includes(body.sslStatus) ? body.sslStatus : null;
    const packageId = body.packageId === undefined ? null : normalizePackageId(body.packageId);
    const siteStatus = body.siteStatus === undefined ? null : isSiteStatus(body.siteStatus) ? body.siteStatus : null;
    const siteError = body.siteError === undefined ? null : body.siteError ? 1 : 0;
    const companyName = body.companyName === undefined ? null : cleanText(body.companyName, 160);
    const contactName = body.contactName === undefined ? null : cleanText(body.contactName, 160);
    const email = body.email === undefined ? null : cleanText(body.email, 160).toLowerCase();
    const phone = body.phone === undefined ? null : cleanText(body.phone, 40);
    if (companyName !== null && companyName.length < 2) return json(res, 400, { error: "Firma adı en az 2 karakter olmalıdır." });
    if (contactName !== null && contactName.length < 2) return json(res, 400, { error: "Yetkili adı en az 2 karakter olmalıdır." });
    if (email !== null && !email.includes("@")) return json(res, 400, { error: "Geçerli bir e-posta yazın." });
    try {
      db.prepare(
        `UPDATE customer_accounts SET
          status = COALESCE(?, status),
          package_id = COALESCE(?, package_id),
          website_url = COALESCE(?, website_url),
          ssl_status = COALESCE(?, ssl_status),
          site_status = COALESCE(?, site_status),
          site_error = COALESCE(?, site_error),
          last_backup_at = COALESCE(?, last_backup_at),
          last_update_at = COALESCE(?, last_update_at),
          company_name = COALESCE(?, company_name),
          contact_name = COALESCE(?, contact_name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          updated_at = ?
         WHERE id = ?`,
      ).run(
        status,
        packageId,
        body.websiteUrl === undefined ? null : safeHttpUrl(body.websiteUrl),
        sslStatus,
        siteStatus,
        siteError,
        cleanText(body.lastBackupAt, 40) || null,
        cleanText(body.lastUpdateAt, 40) || null,
        companyName,
        contactName,
        email,
        phone,
        nowIso(),
        customerId,
      );
    } catch (error) {
      if (String(error?.message || "").includes("UNIQUE")) return json(res, 409, { error: "Bu e-posta ile müşteri hesabı zaten var." });
      throw error;
    }
    if (String(body.password || "").length >= 8) {
      const credentials = hashPassword(String(body.password));
      db.prepare("UPDATE customer_accounts SET password_hash = ?, password_salt = ?, updated_at = ? WHERE id = ?").run(credentials.hash, credentials.salt, nowIso(), customerId);
      db.prepare("DELETE FROM customer_sessions WHERE customer_id = ?").run(customerId);
    }
    return json(res, 200, { ok: true });
  }

  const adminAdsAccountsMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/ads-accounts$/);
  if ((req.method === "PUT" || req.method === "POST") && adminAdsAccountsMatch) {
    if (!requireUser(req, res)) return;
    const customerId = Number(adminAdsAccountsMatch[1]);
    const existing = findCustomerAccount(customerId);
    if (!existing) return json(res, 404, { error: "Müşteri bulunamadı." });
    const body = await readJson(req, 8_000);
    const google = cleanGoogleAdsCustomerId(body.googleAdsCustomerId);
    const meta = cleanMetaAdAccountId(body.metaAdAccountId);
    if (!google.ok) return json(res, 400, { error: "Google Ads Customer ID 8–12 rakam olmalıdır (tire isteğe bağlı)." });
    if (!meta.ok) return json(res, 400, { error: "Meta Ad Account ID act_ öneki veya rakam olmalıdır." });
    db.prepare(
      "UPDATE customer_accounts SET google_ads_customer_id = ?, meta_ad_account_id = ?, updated_at = ? WHERE id = ?",
    ).run(google.value, meta.value, nowIso(), customerId);
    const updated = findCustomerAccount(customerId);
    return json(res, 200, { ok: true, binding: adsAccountBinding(updated) });
  }

  const adminPasswordMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/password$/);
  if (req.method === "POST" && adminPasswordMatch) {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 20_000);
    const customerId = Number(adminPasswordMatch[1]);
    if (!findCustomerAccount(customerId)) return json(res, 404, { error: "Müşteri bulunamadı." });
    const password = String(body.password || "");
    if (password.length < 8 || password.length > 128) return json(res, 400, { error: "Şifre en az 8, en fazla 128 karakter olmalıdır." });
    const credentials = hashPassword(password);
    db.prepare("UPDATE customer_accounts SET password_hash = ?, password_salt = ?, updated_at = ? WHERE id = ?").run(credentials.hash, credentials.salt, nowIso(), customerId);
    db.prepare("DELETE FROM customer_sessions WHERE customer_id = ?").run(customerId);
    return json(res, 200, { ok: true, message: "Müşteri şifresi güncellendi. Açık oturumlar kapatıldı." });
  }

  const adminCatalogMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/catalog$/);
  if (req.method === "POST" && adminCatalogMatch) {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 30_000);
    const customerId = Number(adminCatalogMatch[1]);
    if (!findCustomerAccount(customerId)) return json(res, 404, { error: "Müşteri bulunamadı." });
    const kind = isCatalogKind(body.kind) ? body.kind : "";
    const title = cleanText(body.title, 160);
    if (!kind || title.length < 2) return json(res, 400, { error: "Satır türü ve başlık gereklidir." });
    const createdAt = nowIso();
    const result = db.prepare(
      `INSERT INTO customer_catalog (customer_id, kind, title, details, amount, quantity, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(customerId, kind, title, cleanText(body.details, 2000), roundCatalogAmount(body.amount), roundCatalogAmount(body.quantity) || 1, createdAt, createdAt);
    return json(res, 201, { ok: true, id: Number(result.lastInsertRowid), ...customerRecords(customerId) });
  }

  const adminCatalogItemMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/catalog\/(\d+)$/);
  if (req.method === "DELETE" && adminCatalogItemMatch) {
    if (!requireUser(req, res)) return;
    const customerId = Number(adminCatalogItemMatch[1]);
    const itemId = Number(adminCatalogItemMatch[2]);
    const deleted = db.prepare("DELETE FROM customer_catalog WHERE id = ? AND customer_id = ?").run(itemId, customerId);
    if (!deleted.changes) return json(res, 404, { error: "Satır bulunamadı." });
    return json(res, 200, { ok: true, ...customerRecords(customerId) });
  }

  const adminCatalogConfirmMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/catalog\/(\d+)\/confirm$/);
  if (req.method === "POST" && adminCatalogConfirmMatch) {
    if (!requireUser(req, res)) return;
    const result = applyExtraCatalogDecision(Number(adminCatalogConfirmMatch[1]), Number(adminCatalogConfirmMatch[2]), "accept");
    if (result.error) return json(res, result.status || 400, { error: result.error });
    return json(res, 200, result);
  }

  const adminCatalogRejectMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/catalog\/(\d+)\/reject$/);
  if (req.method === "POST" && adminCatalogRejectMatch) {
    if (!requireUser(req, res)) return;
    const result = applyExtraCatalogDecision(Number(adminCatalogRejectMatch[1]), Number(adminCatalogRejectMatch[2]), "reject");
    if (result.error) return json(res, result.status || 400, { error: result.error });
    return json(res, 200, result);
  }

  const adminPaymentsMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/payments$/);
  if (req.method === "POST" && adminPaymentsMatch) {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 20_000);
    const customerId = Number(adminPaymentsMatch[1]);
    if (!findCustomerAccount(customerId)) return json(res, 404, { error: "Müşteri bulunamadı." });
    const period = cleanText(body.period, 7);
    const dates = defaultPaymentDates(period, cleanText(body.startDate, 10) || null, cleanText(body.endDate, 10) || null);
    if (!/^\d{4}-\d{2}$/.test(dates.period || period) || !dates.startDate || !dates.endDate) {
      return json(res, 400, { error: "Dönem başlangıç ve bitiş tarihi gereklidir." });
    }
    const resolved = resolvePaymentAmounts({
      amount: body.amount,
      paidAmount: body.paidAmount,
      status: body.status,
      period: dates.period,
      startDate: dates.startDate,
      endDate: dates.endDate,
    });
    const createdAt = nowIso();
    db.prepare(
      `INSERT INTO customer_payments (customer_id, period, amount, paid_amount, status, note, start_date, end_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(customer_id, period) DO UPDATE SET
         amount=excluded.amount, paid_amount=excluded.paid_amount, status=excluded.status, note=excluded.note,
         start_date=excluded.start_date, end_date=excluded.end_date, updated_at=excluded.updated_at`,
    ).run(customerId, resolved.period, resolved.amount, resolved.paidAmount, resolved.status, cleanText(body.note, 400), resolved.startDate, resolved.endDate, createdAt, createdAt);
    return json(res, 200, { ok: true, ...customerRecords(customerId) });
  }

  const adminPaymentInvoiceMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/payments\/(\d+)\/invoice\.pdf$/);
  if (req.method === "GET" && adminPaymentInvoiceMatch) {
    if (!requireUser(req, res)) return;
    const customerId = Number(adminPaymentInvoiceMatch[1]);
    const paymentId = Number(adminPaymentInvoiceMatch[2]);
    const account = findCustomerAccount(customerId);
    if (!account) return json(res, 404, { error: "Müşteri bulunamadı." });
    const row = db.prepare("SELECT * FROM customer_payments WHERE id = ? AND customer_id = ?").get(paymentId, customerId);
    if (!row) return json(res, 404, { error: "Ödeme kaydı bulunamadı." });
    const pdf = buildCustomerPaymentInvoicePdf(account, row);
    return sendPdfBuffer(res, pdf, paymentInvoiceDownloadName(row, customerId), url.searchParams.get("download") !== "0");
  }

  const adminPaymentItemMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/payments\/(\d+)$/);
  if (req.method === "PATCH" && adminPaymentItemMatch) {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 20_000);
    const customerId = Number(adminPaymentItemMatch[1]);
    const paymentId = Number(adminPaymentItemMatch[2]);
    const existing = db.prepare("SELECT * FROM customer_payments WHERE id = ? AND customer_id = ?").get(paymentId, customerId);
    if (!existing) return json(res, 404, { error: "Ödeme kaydı bulunamadı." });
    const nextStart = body.startDate === undefined ? existing.start_date : cleanText(body.startDate, 10);
    const nextEnd = body.endDate === undefined ? existing.end_date : cleanText(body.endDate, 10);
    const dates = defaultPaymentDates(
      body.period === undefined ? existing.period : cleanText(body.period, 7),
      nextStart || null,
      nextEnd || null,
    );
    const resolved = resolvePaymentAmounts({
      amount: body.amount === undefined ? existing.amount : body.amount,
      paidAmount: body.paidAmount === undefined ? existing.paid_amount : body.paidAmount,
      status: body.status === undefined ? existing.status : body.status,
      period: dates.period,
      startDate: dates.startDate,
      endDate: dates.endDate,
    });
    db.prepare("UPDATE customer_payments SET amount = ?, paid_amount = ?, status = ?, note = COALESCE(?, note), start_date = ?, end_date = ?, period = ?, updated_at = ? WHERE id = ? AND customer_id = ?")
      .run(resolved.amount, resolved.paidAmount, resolved.status, body.note === undefined ? null : cleanText(body.note, 400), resolved.startDate, resolved.endDate, resolved.period, nowIso(), paymentId, customerId);
    return json(res, 200, { ok: true, ...customerRecords(customerId) });
  }
  if (req.method === "DELETE" && adminPaymentItemMatch) {
    if (!requireUser(req, res)) return;
    const customerId = Number(adminPaymentItemMatch[1]);
    const paymentId = Number(adminPaymentItemMatch[2]);
    const existing = db.prepare("SELECT id FROM customer_payments WHERE id = ? AND customer_id = ?").get(paymentId, customerId);
    if (!existing) return json(res, 404, { error: "Ödeme kaydı bulunamadı." });
    db.prepare("DELETE FROM customer_payments WHERE id = ? AND customer_id = ?").run(paymentId, customerId);
    return json(res, 200, { ok: true, ...customerRecords(customerId) });
  }

  const adminImpersonateMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/impersonate$/);
  if (req.method === "POST" && adminImpersonateMatch) {
    const actor = requireUser(req, res);
    if (!actor) return;
    const customerId = Number(adminImpersonateMatch[1]);
    const account = findCustomerAccount(customerId);
    if (!account || account.status !== "active") return json(res, 404, { error: "Aktif müşteri bulunamadı." });
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    db.prepare(
      "INSERT INTO admin_impersonation_tokens (token_hash, customer_id, admin_id, expires_at, created_at) VALUES (?, ?, ?, ?, ?)",
    ).run(sha256(token), customerId, actor.id, expiresAt, nowIso());
    return json(res, 200, { ok: true, token, portalPath: `/musteri/giris?ito=${encodeURIComponent(token)}` });
  }

  const adminSeoScoreMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/seo-score$/);
  if (req.method === "PATCH" && adminSeoScoreMatch) {
    if (!requireUser(req, res)) return;
    const customerId = Number(adminSeoScoreMatch[1]);
    if (!findCustomerAccount(customerId)) return json(res, 404, { error: "Müşteri bulunamadı." });
    const body = await readJson(req, 10_000);
    const overrideRaw = body.scoreOverride ?? body.score;
    const scoreOverride =
      overrideRaw === null || overrideRaw === "" || overrideRaw === undefined
        ? null
        : Math.min(100, Math.max(0, Math.round(Number(overrideRaw))));
    const scoreLabel = body.scoreLabel === undefined ? null : cleanText(body.scoreLabel, 80);
    const scoreNote = body.scoreNote === undefined ? null : cleanText(body.scoreNote, 200);
    db.prepare(
      `UPDATE customer_accounts SET seo_score_override = ?, seo_score_label = COALESCE(?, seo_score_label), seo_score_note = COALESCE(?, seo_score_note), updated_at = ? WHERE id = ?`,
    ).run(scoreOverride, scoreLabel, scoreNote, nowIso(), customerId);
    return json(res, 200, { ok: true, seo: customerSeoPayload(customerId) });
  }

  const adminAnnouncementsMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/announcements$/);
  if (req.method === "POST" && adminAnnouncementsMatch) {
    if (!requireUser(req, res)) return;
    const customerId = Number(adminAnnouncementsMatch[1]);
    if (!findCustomerAccount(customerId)) return json(res, 404, { error: "Müşteri bulunamadı." });
    const body = await readJson(req, 20_000);
    const title = cleanText(body.title, 160);
    if (title.length < 2) return json(res, 400, { error: "Duyuru başlığı yazın." });
    const createdAt = nowIso();
    const scopeAll = Boolean(body.global);
    const result = db.prepare(
      `INSERT INTO portal_announcements (customer_id, title, body, link_url, tone, active, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      scopeAll ? null : customerId,
      title,
      cleanText(body.body, 400),
      safeHttpUrl(body.linkUrl || body.link_url),
      ["info", "promo", "campaign", "alert"].includes(body.tone) ? body.tone : "info",
      body.active === false ? 0 : 1,
      Math.round(numberValue(body.sortOrder, 1000)),
      createdAt,
      createdAt,
    );
    return json(res, 201, { ok: true, id: Number(result.lastInsertRowid), announcements: listAdminPortalAnnouncements(customerId) });
  }

  const adminAnnouncementItemMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/announcements\/(\d+)$/);
  if (req.method === "DELETE" && adminAnnouncementItemMatch) {
    if (!requireUser(req, res)) return;
    const customerId = Number(adminAnnouncementItemMatch[1]);
    const announcementId = Number(adminAnnouncementItemMatch[2]);
    const row = db.prepare("SELECT id FROM portal_announcements WHERE id = ? AND (customer_id IS NULL OR customer_id = ?)").get(announcementId, customerId);
    if (!row) return json(res, 404, { error: "Duyuru bulunamadı." });
    db.prepare("DELETE FROM portal_announcements WHERE id = ?").run(announcementId);
    return json(res, 200, { ok: true, announcements: listAdminPortalAnnouncements(customerId) });
  }

  const adminContractsMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/contracts$/);
  if (req.method === "POST" && adminContractsMatch) {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 12_000_000);
    const customerId = Number(adminContractsMatch[1]);
    if (!findCustomerAccount(customerId)) return json(res, 404, { error: "Müşteri bulunamadı." });
    const upload = decodeContractUpload(body);
    if (upload.error) return json(res, 400, { error: upload.error });
    const saved = saveContractFile(customerId, upload, { title: body.title, familyId: body.familyId, uploadedBy: "admin" });
    if (saved.error) return json(res, 400, { error: saved.error });
    return json(res, 201, { ok: true, id: saved.id, ...customerRecords(customerId) });
  }

  const adminContractFileMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/contracts\/(\d+)\/file$/);
  if (req.method === "GET" && adminContractFileMatch) {
    if (!requireUser(req, res)) return;
    const row = db.prepare("SELECT * FROM customer_contracts WHERE id = ? AND customer_id = ?").get(Number(adminContractFileMatch[2]), Number(adminContractFileMatch[1]));
    if (!row) return json(res, 404, { error: "Sözleşme bulunamadı." });
    return sendContractFile(res, row, url.searchParams.get("download") === "1");
  }

  const adminContractRestoreMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/contracts\/(\d+)\/restore$/);
  if (req.method === "POST" && adminContractRestoreMatch) {
    if (!requireUser(req, res)) return;
    const customerId = Number(adminContractRestoreMatch[1]);
    const restored = restoreContractVersion(customerId, Number(adminContractRestoreMatch[2]), "admin");
    if (restored.error) return json(res, restored.error.includes("bulunamadı") ? 404 : 400, { error: restored.error });
    return json(res, 200, { ok: true, id: restored.id, ...customerRecords(customerId) });
  }

  const adminContractFromTemplate = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/contracts\/from-template$/);
  if (req.method === "POST" && adminContractFromTemplate) {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 20_000);
    const customerId = Number(adminContractFromTemplate[1]);
    const saved = assignContractFromTemplate(customerId, body.templateId, body.title);
    if (saved.error) return json(res, saved.error.includes("bulunamadı") ? 404 : 400, { error: saved.error });
    return json(res, 201, { ok: true, id: saved.id, ...customerRecords(customerId) });
  }

  const adminContractReview = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/contracts\/(\d+)\/review$/);
  if (req.method === "POST" && adminContractReview) {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 20_000);
    const customerId = Number(adminContractReview[1]);
    const contractId = Number(adminContractReview[2]);
    const status = cleanText(body.status, 20);
    if (!["approved", "rejected", "pending"].includes(status)) return json(res, 400, { error: "Geçersiz imza durumu." });
    const reviewed = reviewContractStatus(customerId, contractId, status, body.reason);
    if (reviewed.error) return json(res, reviewed.error.includes("bulunamadı") ? 404 : 400, { error: reviewed.error });
    return json(res, 200, { ok: true, id: reviewed.id, ...customerRecords(customerId) });
  }

  const adminProjectStageMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/project\/stage$/);
  if (req.method === "POST" && adminProjectStageMatch) {
    const actor = requireUser(req, res);
    if (!actor) return;
    const customerId = Number(adminProjectStageMatch[1]);
    if (!findCustomerAccount(customerId)) return json(res, 404, { error: "Müşteri bulunamadı." });
    const body = await readJson(req, 20_000);
    const result = setCustomerStage(customerId, body.stage, "admin", body.note);
    if (result.error) return json(res, 400, { error: result.error });
    logAudit({ actorType: "admin", actorId: actor.id, actorLabel: actor.username, customerId, action: "stage_change", target: `customer#${customerId}`, ip: requestIp(req), meta: JSON.stringify({ stage: result.project?.stage || cleanText(body.stage, 40) }) });
    return json(res, 200, { ok: true, project: result.project, events: customerProjectEvents(customerId) });
  }

  const adminProjectMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/project$/);
  if (req.method === "GET" && adminProjectMatch) {
    if (!requireUser(req, res)) return;
    const customerId = Number(adminProjectMatch[1]);
    if (!findCustomerAccount(customerId)) return json(res, 404, { error: "Müşteri bulunamadı." });
    return json(res, 200, { project: customerProjectPayload(customerId), events: customerProjectEvents(customerId) });
  }

  const adminApprovalsCreateMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/approvals$/);
  if (req.method === "POST" && adminApprovalsCreateMatch) {
    if (!requireUser(req, res)) return;
    const customerId = Number(adminApprovalsCreateMatch[1]);
    if (!findCustomerAccount(customerId)) return json(res, 404, { error: "Müşteri bulunamadı." });
    const body = await readJson(req, 12_000_000);
    const decoded = decodeApprovalUpload(body);
    if (decoded.error) return json(res, 400, { error: decoded.error });
    const saved = saveApproval(customerId, {
      title: body.title,
      description: body.description,
      kind: decoded.kind,
      bodyText: decoded.bodyText,
      upload: decoded.upload,
      createdBy: "admin",
    });
    if (saved.error) return json(res, saved.error.includes("bulunamadı") ? 404 : 400, { error: saved.error });
    return json(res, 201, { ok: true, id: saved.id, approvals: adminApprovalList({ customerId }) });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/approvals") {
    if (!requireUser(req, res)) return;
    const status = cleanText(url.searchParams.get("status"), 20);
    const customerId = Number(url.searchParams.get("customerId")) || 0;
    return json(res, 200, { approvals: adminApprovalList({ status: status || undefined, customerId: customerId || undefined }) });
  }

  const adminApprovalFileMatch = url.pathname.match(/^\/api\/admin\/approvals\/(\d+)\/file$/);
  if (req.method === "GET" && adminApprovalFileMatch) {
    if (!requireUser(req, res)) return;
    const row = db.prepare("SELECT * FROM approvals WHERE id = ?").get(Number(adminApprovalFileMatch[1]));
    if (!row || !row.stored_name) return json(res, 404, { error: "Onay dosyası bulunamadı." });
    return sendApprovalFile(res, row, url.searchParams.get("download") === "1");
  }

  const adminApprovalRemindMatch = url.pathname.match(/^\/api\/admin\/approvals\/(\d+)\/remind$/);
  if (req.method === "POST" && adminApprovalRemindMatch) {
    if (!requireUser(req, res)) return;
    const row = db.prepare("SELECT * FROM approvals WHERE id = ?").get(Number(adminApprovalRemindMatch[1]));
    if (!row) return json(res, 404, { error: "Onay kaydı bulunamadı." });
    addApprovalEvent(row.id, "admin", "reminder", "Panel içi hatırlatma");
    return json(res, 200, { ok: true, approvals: adminApprovalList({}) });
  }

  const adminQuotesTemplateMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/quotes\/from-template$/);
  if (req.method === "POST" && adminQuotesTemplateMatch) {
    const actor = requireUser(req, res);
    if (!actor) return;
    const customerId = Number(adminQuotesTemplateMatch[1]);
    if (!findCustomerAccount(customerId)) return json(res, 404, { error: "Müşteri bulunamadı." });
    const body = await readJson(req, 80_000);
    const templateKey = cleanText(body.templateKey || body.template, 20);
    const saved = createQuoteFromTemplate(customerId, templateKey, body.title, "admin");
    if (saved.error) return json(res, 400, { error: saved.error });
    logAudit({
      actorType: "admin",
      actorId: actor.id,
      actorLabel: actor.username,
      customerId,
      action: "quote_create",
      target: `quote#${saved.id}`,
      ip: requestIp(req),
      meta: JSON.stringify({ template: templateKey }),
    });
    return json(res, 201, { ok: true, id: saved.id, quotes: listCustomerQuotes(customerId) });
  }

  const adminQuotesCreateMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/quotes$/);
  if (req.method === "POST" && adminQuotesCreateMatch) {
    const actor = requireUser(req, res);
    if (!actor) return;
    const customerId = Number(adminQuotesCreateMatch[1]);
    if (!findCustomerAccount(customerId)) return json(res, 404, { error: "Müşteri bulunamadı." });
    const body = await readJson(req, 12_000_000);
    const decoded = decodeQuoteUpload(body);
    if (decoded.error) return json(res, 400, { error: decoded.error });
    const saved = saveQuote(customerId, { title: body.title, upload: decoded, createdBy: "admin" });
    if (saved.error) return json(res, saved.error.includes("bulunamadı") ? 404 : 400, { error: saved.error });
    logAudit({
      actorType: "admin",
      actorId: actor.id,
      actorLabel: actor.username,
      customerId,
      action: "quote_create",
      target: `quote#${saved.id}`,
      ip: requestIp(req),
      meta: JSON.stringify({ title: cleanText(body.title, 160) }),
    });
    return json(res, 201, { ok: true, id: saved.id, quotes: adminQuoteList({ customerId }) });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/quote-templates") {
    if (!requireUser(req, res)) return;
    return json(res, 200, {
      templates: Object.entries(QUOTE_TEMPLATE_LIBRARY).map(([key, tpl]) => ({
        key,
        name: tpl.name,
        defaultTitle: tpl.defaultTitle,
      })),
    });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/quotes") {
    if (!requireUser(req, res)) return;
    const status = cleanText(url.searchParams.get("status"), 20);
    const customerId = Number(url.searchParams.get("customerId")) || 0;
    return json(res, 200, { quotes: adminQuoteList({ status: status || undefined, customerId: customerId || undefined }) });
  }

  const adminQuoteFileMatch = url.pathname.match(/^\/api\/admin\/quotes\/(\d+)\/file$/);
  if (req.method === "GET" && adminQuoteFileMatch) {
    if (!requireUser(req, res)) return;
    const row = db.prepare("SELECT * FROM quotes WHERE id = ?").get(Number(adminQuoteFileMatch[1]));
    if (!row || !(row.stored_name || row.archive_name)) return json(res, 404, { error: "Teklif dosyası bulunamadı." });
    return sendQuoteFile(res, row, url.searchParams.get("download") === "1");
  }

  const adminQuoteWithdrawMatch = url.pathname.match(/^\/api\/admin\/quotes\/(\d+)\/withdraw$/);
  if (req.method === "POST" && adminQuoteWithdrawMatch) {
    if (!requireUser(req, res)) return;
    const withdrawn = withdrawQuote(Number(adminQuoteWithdrawMatch[1]));
    if (withdrawn.error) return json(res, withdrawn.status || 400, { error: withdrawn.error });
    return json(res, 200, { ok: true, quotes: adminQuoteList({}) });
  }

  const adminQuoteMutateMatch = url.pathname.match(/^\/api\/admin\/quotes\/(\d+)$/);
  if (adminQuoteMutateMatch && (req.method === "PUT" || req.method === "DELETE")) {
    if (!requireUser(req, res)) return;
    const quoteId = Number(adminQuoteMutateMatch[1]);
    if (req.method === "DELETE") {
      const removed = deleteQuote(quoteId);
      if (removed.error) return json(res, removed.status || 400, { error: removed.error });
      return json(res, 200, { ok: true, quotes: adminQuoteList({}) });
    }
    const body = await readJson(req, 12_000_000);
    const decoded = body.data || body.file || body.fileName ? decodeQuoteUpload(body) : null;
    if (decoded?.error) return json(res, 400, { error: decoded.error });
    const updated = updatePendingQuote(quoteId, { title: body.title, upload: decoded && !decoded.error ? decoded : undefined });
    if (updated.error) return json(res, updated.status || 400, { error: updated.error });
    return json(res, 200, { ok: true, id: updated.id, quotes: adminQuoteList({}) });
  }

  // --- Otomatik Yenileme Hatırlatması (P5) — panel içi ---
  if (req.method === "GET" && url.pathname === "/api/admin/renewals") {
    if (!requireUser(req, res)) return;
    const status = cleanText(url.searchParams.get("status"), 20);
    const bucket = cleanText(url.searchParams.get("bucket"), 20);
    const customerId = Number(url.searchParams.get("customerId")) || 0;
    return json(res, 200, {
      renewals: adminRenewalsList({
        status: status || undefined,
        bucket: bucket || undefined,
        customerId: customerId || undefined,
      }),
    });
  }

  const adminRenewalsCreateMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/renewals$/);
  if (req.method === "POST" && adminRenewalsCreateMatch) {
    const actor = requireUser(req, res);
    if (!actor) return;
    const customerId = Number(adminRenewalsCreateMatch[1]);
    if (!findCustomerAccount(customerId)) return json(res, 404, { error: "Müşteri bulunamadı." });
    const body = await readJson(req, 20_000);
    const kind = RENEWAL_KINDS.includes(body.kind) ? body.kind : "diger";
    const renewDate = cleanText(body.renew_date ?? body.renewDate, 10);
    if (!RENEW_DATE_RE.test(renewDate)) return json(res, 400, { error: "Geçerli bir yenileme tarihi (YYYY-AA-GG) girin." });
    const label = cleanText(body.label, 160);
    const amount = numberValue(body.amount);
    const note = cleanText(body.note, 400);
    const createdAt = nowIso();
    const inserted = db.prepare(
      `INSERT INTO customer_renewals (customer_id, kind, label, renew_date, amount, note, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
    ).run(customerId, kind, label, renewDate, amount, note, createdAt, createdAt);
    logAudit({ actorType: "admin", actorId: actor.id, actorLabel: actor.username, customerId, action: "renewal_add", target: `renewal#${Number(inserted.lastInsertRowid)}`, ip: requestIp(req), meta: JSON.stringify({ kind, renewDate }) });
    return json(res, 201, { ok: true, renewals: customerRenewals(customerId) });
  }

  const adminRenewalItemMatch = url.pathname.match(/^\/api\/admin\/renewals\/(\d+)$/);
  if (req.method === "PUT" && adminRenewalItemMatch) {
    if (!requireUser(req, res)) return;
    const renewalId = Number(adminRenewalItemMatch[1]);
    const existing = db.prepare("SELECT * FROM customer_renewals WHERE id = ?").get(renewalId);
    if (!existing) return json(res, 404, { error: "Yenileme kaydı bulunamadı." });
    const body = await readJson(req, 20_000);
    const rawDate = body.renew_date ?? body.renewDate;
    const renewDate = rawDate === undefined ? existing.renew_date : cleanText(rawDate, 10);
    if (!RENEW_DATE_RE.test(renewDate)) return json(res, 400, { error: "Geçerli bir yenileme tarihi (YYYY-AA-GG) girin." });
    const kind = body.kind !== undefined && RENEWAL_KINDS.includes(body.kind) ? body.kind : existing.kind;
    const label = body.label === undefined ? existing.label : cleanText(body.label, 160);
    const amount = body.amount === undefined ? existing.amount : numberValue(body.amount);
    const note = body.note === undefined ? existing.note : cleanText(body.note, 400);
    const status = body.status !== undefined && RENEWAL_STATUSES.includes(body.status) ? body.status : existing.status;
    db.prepare(
      "UPDATE customer_renewals SET kind = ?, label = ?, renew_date = ?, amount = ?, note = ?, status = ?, updated_at = ? WHERE id = ?",
    ).run(kind, label, renewDate, amount, note, status, nowIso(), renewalId);
    return json(res, 200, { ok: true, renewals: customerRenewals(existing.customer_id) });
  }

  if (req.method === "DELETE" && adminRenewalItemMatch) {
    if (!requireUser(req, res)) return;
    const renewalId = Number(adminRenewalItemMatch[1]);
    const existing = db.prepare("SELECT customer_id FROM customer_renewals WHERE id = ?").get(renewalId);
    if (!existing) return json(res, 404, { error: "Yenileme kaydı bulunamadı." });
    db.prepare("DELETE FROM customer_renewals WHERE id = ?").run(renewalId);
    return json(res, 200, { ok: true, renewals: customerRenewals(existing.customer_id) });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/contract-templates") {
    if (!requireUser(req, res)) return;
    const templates = db.prepare("SELECT * FROM contract_templates ORDER BY updated_at DESC, id DESC").all().map(publicTemplate);
    return json(res, 200, { templates });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/contract-templates") {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 80_000);
    const name = cleanText(body.name, 160);
    if (name.length < 2) return json(res, 400, { error: "Şablon adı yazın." });
    const createdAt = nowIso();
    const result = db.prepare(
      `INSERT INTO contract_templates (name, body_html, sig_x, sig_y, sig_w, sig_h, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(name, sanitizeTemplateHtml(body.bodyHtml), clampBox(body.sigX, 12), clampBox(body.sigY, 78), clampBox(body.sigW, 36), clampBox(body.sigH, 12), createdAt, createdAt);
    return json(res, 201, { ok: true, id: Number(result.lastInsertRowid), templates: db.prepare("SELECT * FROM contract_templates ORDER BY id DESC").all().map(publicTemplate) });
  }

  const templateMatch = url.pathname.match(/^\/api\/admin\/contract-templates\/(\d+)$/);
  if (req.method === "PATCH" && templateMatch) {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 80_000);
    const current = db.prepare("SELECT * FROM contract_templates WHERE id = ?").get(Number(templateMatch[1]));
    if (!current) return json(res, 404, { error: "Şablon bulunamadı." });
    const name = body.name === undefined ? current.name : cleanText(body.name, 160);
    if (name.length < 2) return json(res, 400, { error: "Şablon adı yazın." });
    db.prepare(
      `UPDATE contract_templates SET name = ?, body_html = ?, sig_x = ?, sig_y = ?, sig_w = ?, sig_h = ?, updated_at = ? WHERE id = ?`,
    ).run(
      name,
      body.bodyHtml === undefined ? current.body_html : sanitizeTemplateHtml(body.bodyHtml),
      body.sigX === undefined ? current.sig_x : clampBox(body.sigX, current.sig_x),
      body.sigY === undefined ? current.sig_y : clampBox(body.sigY, current.sig_y),
      body.sigW === undefined ? current.sig_w : clampBox(body.sigW, current.sig_w),
      body.sigH === undefined ? current.sig_h : clampBox(body.sigH, current.sig_h),
      nowIso(),
      current.id,
    );
    return json(res, 200, { ok: true, templates: db.prepare("SELECT * FROM contract_templates ORDER BY id DESC").all().map(publicTemplate) });
  }

  if (req.method === "DELETE" && templateMatch) {
    if (!requireUser(req, res)) return;
    const templateId = Number(templateMatch[1]);
    const current = db.prepare("SELECT id FROM contract_templates WHERE id = ?").get(templateId);
    if (!current) return json(res, 404, { error: "Şablon bulunamadı." });
    db.prepare("DELETE FROM contract_templates WHERE id = ?").run(templateId);
    return json(res, 200, { ok: true, templates: db.prepare("SELECT * FROM contract_templates ORDER BY id DESC").all().map(publicTemplate) });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/ticket-vitrin") {
    if (!requireUser(req, res)) return;
    return json(res, 200, { vitrin: ticketVitrinSettings(), real: ticketAggregates() });
  }

  if (req.method === "PUT" && url.pathname === "/api/admin/ticket-vitrin") {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 10_000);
    return json(res, 200, { ok: true, vitrin: saveTicketVitrin(body), real: ticketAggregates() });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/campaigns") {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 30_000);
    const customerId = Number(body.customerId);
    const name = cleanText(body.name, 160);
    const platform = ["google", "meta", "other"].includes(body.platform) ? body.platform : "other";
    const startDate = cleanText(body.startDate, 20) || new Date().toISOString().slice(0, 10);
    if (!customerId || name.length < 2) return json(res, 400, { error: "Müşteri ve kampanya adı gereklidir." });
    const createdAt = nowIso();
    const result = db.prepare("INSERT INTO ad_campaigns (customer_id, name, platform, monthly_budget, management_fee, start_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(customerId, name, platform, numberValue(body.monthlyBudget), numberValue(body.managementFee), startDate, createdAt, createdAt);
    return json(res, 201, { ok: true, id: Number(result.lastInsertRowid) });
  }

  const campaignStatsMatch = url.pathname.match(/^\/api\/admin\/campaigns\/(\d+)\/stats$/);
  if (req.method === "POST" && campaignStatsMatch) {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 40_000);
    const campaignId = Number(campaignStatsMatch[1]);
    const periodStart = cleanText(body.periodStart, 20);
    const periodEnd = cleanText(body.periodEnd, 20);
    if (!periodStart || !periodEnd) return json(res, 400, { error: "Rapor başlangıç ve bitiş tarihi gereklidir." });
    db.prepare(
      `INSERT INTO campaign_stats (campaign_id, period_start, period_end, spend, impressions, clicks, leads, conversions, revenue, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(campaign_id, period_start, period_end) DO UPDATE SET
       spend=excluded.spend, impressions=excluded.impressions, clicks=excluded.clicks, leads=excluded.leads,
       conversions=excluded.conversions, revenue=excluded.revenue, updated_at=excluded.updated_at`,
    ).run(campaignId, periodStart, periodEnd, numberValue(body.spend), Math.round(numberValue(body.impressions)), Math.round(numberValue(body.clicks)), Math.round(numberValue(body.leads)), Math.round(numberValue(body.conversions)), numberValue(body.revenue), nowIso());
    return json(res, 200, { ok: true });
  }

  const adminMapsMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/maps$/);
  if (req.method === "POST" && adminMapsMatch) {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 20_000);
    const customerId = Number(adminMapsMatch[1]);
    if (!db.prepare("SELECT id FROM customer_accounts WHERE id = ?").get(customerId)) {
      return json(res, 404, { error: "Müşteri bulunamadı." });
    }
    const businessName = cleanText(body.businessName, 160);
    if (businessName.length < 2) return json(res, 400, { error: "Harita işletme adı gereklidir." });
    const status = ["pending", "live", "paused"].includes(body.status) ? body.status : "pending";
    const mapsUrl = safeHttpUrl(body.mapsUrl);
    const address = cleanText(body.address, 240);
    const phone = cleanText(body.phone, 40);
    const updatedAt = nowIso();
    const existing = db
      .prepare("SELECT id FROM customer_maps WHERE customer_id = ? ORDER BY updated_at DESC, id DESC LIMIT 1")
      .get(customerId);
    if (existing) {
      db.prepare(
        `UPDATE customer_maps
         SET business_name = ?, status = ?, maps_url = ?, address = ?, phone = ?, updated_at = ?
         WHERE id = ?`,
      ).run(businessName, status, mapsUrl, address, phone, updatedAt, existing.id);
      return json(res, 200, { ok: true, id: Number(existing.id), updated: true });
    }
    const result = db.prepare(
      `INSERT INTO customer_maps (customer_id, business_name, status, maps_url, address, phone, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(customerId, businessName, status, mapsUrl, address, phone, updatedAt, updatedAt);
    return json(res, 201, { ok: true, id: Number(result.lastInsertRowid), updated: false });
  }

  const adminDailyMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/daily-metrics$/);
  if (req.method === "POST" && adminDailyMatch) {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 20_000);
    const customerId = Number(adminDailyMatch[1]);
    if (!db.prepare("SELECT id FROM customer_accounts WHERE id = ?").get(customerId)) {
      return json(res, 404, { error: "Müşteri bulunamadı." });
    }
    const day = cleanText(body.day, 12);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return json(res, 400, { error: "Gün YYYY-AA-GG biçiminde olmalıdır." });
    const adsClicks = Math.round(numberValue(body.adsClicks, 10_000_000));
    const siteVisitors = Math.round(numberValue(body.siteVisitors, 10_000_000));
    const siteSessions = Math.round(numberValue(body.siteSessions, 10_000_000)) || siteVisitors;
    db.prepare(
      `INSERT INTO customer_daily_metrics (customer_id, day, ads_clicks, ads_impressions, ads_spend, site_visitors, site_sessions, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'panel')
       ON CONFLICT(customer_id, day) DO UPDATE SET
         ads_clicks=excluded.ads_clicks,
         ads_impressions=excluded.ads_impressions,
         ads_spend=excluded.ads_spend,
         site_visitors=excluded.site_visitors,
         site_sessions=excluded.site_sessions,
         source='panel'`,
    ).run(
      customerId,
      day,
      adsClicks,
      Math.round(numberValue(body.adsImpressions, 100_000_000)),
      numberValue(body.adsSpend),
      siteVisitors,
      siteSessions,
    );
    return json(res, 200, { ok: true });
  }

  const adminTicketMatch = url.pathname.match(/^\/api\/admin\/tickets\/(\d+)$/);
  const adminPartnerSupportMessageMatch = url.pathname.match(/^\/api\/admin\/partner-support\/(\d+)\/messages$/);
  if (req.method === "GET" && url.pathname === "/api/admin/partner-support") {
    if (!requireUser(req, res)) return;
    const conversations = db.prepare(`SELECT c.*, p.company_name, p.contact_name, p.email FROM partner_support_conversations c JOIN partner_accounts p ON p.id = c.partner_id ORDER BY CASE c.status WHEN 'open' THEN 0 WHEN 'pending' THEN 1 ELSE 2 END, c.last_message_at DESC LIMIT 300`).all();
    const messages = db.prepare("SELECT * FROM partner_support_messages ORDER BY created_at ASC LIMIT 3000").all();
    return json(res, 200, { conversations, messages });
  }
  if (req.method === "GET" && url.pathname === "/api/admin/partner-support/unread") {
    if (!requireUser(req, res)) return; const row = db.prepare("SELECT COUNT(*) AS count FROM partner_support_messages WHERE sender_type = 'partner' AND read_by_admin = 0").get();
    return json(res, 200, { unread:Number(row?.count || 0) });
  }
  const adminPartnerSupportReadMatch = url.pathname.match(/^\/api\/admin\/partner-support\/(\d+)\/read$/);
  if (req.method === "PATCH" && adminPartnerSupportReadMatch) {
    if (!requireUser(req, res)) return; const id = Number(adminPartnerSupportReadMatch[1]); const own = db.prepare("SELECT id FROM partner_support_conversations WHERE id = ?").get(id); if (!own) return json(res, 404, { error:"Konuşma bulunamadı." });
    db.prepare("UPDATE partner_support_messages SET read_by_admin = 1 WHERE conversation_id = ? AND sender_type = 'partner'").run(id); return json(res, 200, { ok:true });
  }
  if (req.method === "POST" && adminPartnerSupportMessageMatch) {
    const user = requireUser(req, res); if (!user) return; const id = Number(adminPartnerSupportMessageMatch[1]);
    const conversation = db.prepare("SELECT id FROM partner_support_conversations WHERE id = ?").get(id); if (!conversation) return json(res, 404, { error:"Konuşma bulunamadı." });
    const body = await readJson(req, 15_000); const message = cleanText(body.message, 3000); if (message.length < 2) return json(res, 400, { error:"Yanıt boş olamaz." });
    const now = nowIso(); const senderName = cleanText(user.name || user.email || "Hatay360 Destek", 120);
    db.prepare("INSERT INTO partner_support_messages (conversation_id, sender_type, sender_name, body, created_at) VALUES (?, 'admin', ?, ?, ?)").run(id, senderName, message, now);
    db.prepare("UPDATE partner_support_conversations SET status = 'pending', assigned_to = ?, last_message_at = ?, updated_at = ? WHERE id = ?").run(senderName, now, now, id);
    return json(res, 201, { ok:true });
  }
  if (req.method === "PATCH" && adminPartnerSupportMessageMatch) {
    if (!requireUser(req, res)) return; const id = Number(adminPartnerSupportMessageMatch[1]); const body = await readJson(req, 10_000);
    const status = ["open","pending","resolved","closed"].includes(body.status) ? body.status : "open";
    const result = db.prepare("UPDATE partner_support_conversations SET status = ?, updated_at = ? WHERE id = ?").run(status, nowIso(), id);
    if (!result.changes) return json(res, 404, { error:"Konuşma bulunamadı." }); return json(res, 200, { ok:true });
  }
  if (req.method === "PATCH" && adminTicketMatch) {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 30_000);
    const ticketId = Number(adminTicketMatch[1]);
    const status = ["open", "answering", "answered", "closed"].includes(body.status) ? body.status : "open";
    const existing = db.prepare("SELECT * FROM customer_tickets WHERE id = ?").get(ticketId);
    if (!existing) return json(res, 404, { error: "Ticket bulunamadı." });
    if ((status === "answered" || status === "closed" || status === "answering") && Number(existing.queue_position) > 0) {
      leaveTicketQueue(ticketId);
    }
    const reply = body.adminReply === undefined ? existing.admin_reply : cleanText(body.adminReply, 3000);
    db.prepare("UPDATE customer_tickets SET status = ?, admin_reply = ?, updated_at = ? WHERE id = ?").run(status, reply, nowIso(), ticketId);
    return json(res, 200, { ok: true });
  }

  const adminTicketAdvanceMatch = url.pathname.match(/^\/api\/admin\/tickets\/(\d+)\/advance$/);
  if (req.method === "POST" && adminTicketAdvanceMatch) {
    if (!requireUser(req, res)) return;
    const result = advanceTicketQueue(Number(adminTicketAdvanceMatch[1]));
    if (result.error) return json(res, 404, { error: result.error });
    return json(res, 200, result);
  }

  const adminWhatsappAdvanceMatch = url.pathname.match(/^\/api\/admin\/whatsapp-queue\/(\d+)\/advance$/);
  if (req.method === "POST" && adminWhatsappAdvanceMatch) {
    if (!requireUser(req, res)) return;
    const result = advanceWhatsappQueue(Number(adminWhatsappAdvanceMatch[1]));
    if (result.error) return json(res, 404, { error: result.error });
    return json(res, 200, result);
  }

  const adminServiceMatch = url.pathname.match(/^\/api\/admin\/service-requests\/(\d+)$/);
  if (req.method === "PATCH" && adminServiceMatch) {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 10_000);
    const status = ["new", "reviewing", "quoted", "approved", "accepted", "closed"].includes(body.status) ? body.status : "new";
    db.prepare("UPDATE customer_service_requests SET status = ?, updated_at = ? WHERE id = ?").run(status, nowIso(), Number(adminServiceMatch[1]));
    return json(res, 200, { ok: true });
  }

  const adminExtraConfirmMatch = url.pathname.match(/^\/api\/admin\/service-requests\/(\d+)\/confirm-extra$/);
  if (req.method === "POST" && adminExtraConfirmMatch) {
    if (!requireUser(req, res)) return;
    const result = applyExtraRequestDecision(Number(adminExtraConfirmMatch[1]), "accept");
    if (result.error) return json(res, result.status || 400, { error: result.error });
    return json(res, 200, result);
  }

  const adminExtraRejectMatch = url.pathname.match(/^\/api\/admin\/service-requests\/(\d+)\/reject-extra$/);
  if (req.method === "POST" && adminExtraRejectMatch) {
    if (!requireUser(req, res)) return;
    const result = applyExtraRequestDecision(Number(adminExtraRejectMatch[1]), "reject");
    if (result.error) return json(res, result.status || 400, { error: result.error });
    return json(res, 200, result);
  }

  if (req.method === "GET" && url.pathname === "/api/admin/extra-services") {
    if (!requireUser(req, res)) return;
    return json(res, 200, { extras: listExtraServices() });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/extra-services") {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 20_000);
    const name = cleanText(body.name, 160);
    const description = cleanText(body.description, 2000);
    if (name.length < 2) return json(res, 400, { error: "Hizmet adı en az 2 karakter olmalıdır." });
    const createdAt = nowIso();
    const result = db
      .prepare(
        `INSERT INTO extra_services (name, description, price, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(name, description, roundCatalogAmount(body.price), body.active === false || body.active === 0 ? 0 : 1, createdAt, createdAt);
    return json(res, 201, { ok: true, id: Number(result.lastInsertRowid), extras: listExtraServices() });
  }

  const adminExtraItemMatch = url.pathname.match(/^\/api\/admin\/extra-services\/(\d+)$/);
  if (adminExtraItemMatch && (req.method === "PUT" || req.method === "DELETE")) {
    if (!requireUser(req, res)) return;
    const extraId = Number(adminExtraItemMatch[1]);
    const existing = db.prepare("SELECT * FROM extra_services WHERE id = ?").get(extraId);
    if (!existing) return json(res, 404, { error: "Ek hizmet bulunamadı." });
    if (req.method === "DELETE") {
      db.prepare("UPDATE extra_services SET active = 0, updated_at = ? WHERE id = ?").run(nowIso(), extraId);
      return json(res, 200, { ok: true, extras: listExtraServices() });
    }
    const body = await readJson(req, 20_000);
    const name = body.name === undefined ? existing.name : cleanText(body.name, 160);
    if (String(name).length < 2) return json(res, 400, { error: "Hizmet adı en az 2 karakter olmalıdır." });
    const description = body.description === undefined ? existing.description : cleanText(body.description, 2000);
    const price = body.price === undefined ? existing.price : roundCatalogAmount(body.price);
    const active = body.active === undefined ? existing.active : body.active === false || body.active === 0 ? 0 : 1;
    db.prepare("UPDATE extra_services SET name = ?, description = ?, price = ?, active = ?, updated_at = ? WHERE id = ?").run(
      name,
      description,
      price,
      active,
      nowIso(),
      extraId,
    );
    return json(res, 200, { ok: true, extras: listExtraServices() });
  }

  // --- Site Üretici (managed_sites) — admin kategori şablonundan müşteri sitesi üretir ---
  if (req.method === "GET" && url.pathname === "/api/admin/sites") {
    if (!requireUser(req, res)) return;
    return json(res, 200, { sites: listManagedSites() });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/sites") {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 200_000);
    const category = ["taxi", "generic"].includes(body.category) ? body.category : "generic";
    let slug = slugify(body.slug || body.config?.business?.name || body.domain || "");
    if (!slug) return json(res, 400, { error: "Geçerli bir slug/isim girin." });
    if (db.prepare("SELECT id FROM managed_sites WHERE slug = ?").get(slug)) {
      return json(res, 409, { error: "Bu slug zaten kullanılıyor." });
    }
    const status = ["construction", "live"].includes(body.status) ? body.status : "construction";
    const domain = cleanText(body.domain, 120).toLowerCase();
    const customerId = Number.isFinite(Number(body.customerId)) && Number(body.customerId) > 0 ? Number(body.customerId) : null;
    const config = body.config && typeof body.config === "object" ? body.config : {};
    const createdAt = nowIso();
    const result = db
      .prepare(
        `INSERT INTO managed_sites (slug, domain, category, status, customer_id, config, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(slug, domain, category, status, customerId, JSON.stringify(config), createdAt, createdAt);
    return json(res, 201, { ok: true, id: Number(result.lastInsertRowid), sites: listManagedSites() });
  }

  const adminSiteItemMatch = url.pathname.match(/^\/api\/admin\/sites\/(\d+)$/);
  if (adminSiteItemMatch && (req.method === "PATCH" || req.method === "PUT" || req.method === "DELETE")) {
    if (!requireUser(req, res)) return;
    const siteId = Number(adminSiteItemMatch[1]);
    const existing = db.prepare("SELECT * FROM managed_sites WHERE id = ?").get(siteId);
    if (!existing) return json(res, 404, { error: "Site bulunamadı." });
    if (req.method === "DELETE") {
      db.prepare("DELETE FROM managed_sites WHERE id = ?").run(siteId);
      return json(res, 200, { ok: true, sites: listManagedSites() });
    }
    const body = await readJson(req, 200_000);
    const status = body.status !== undefined && ["construction", "live"].includes(body.status) ? body.status : existing.status;
    const domain = body.domain !== undefined ? cleanText(body.domain, 120).toLowerCase() : existing.domain;
    const category = body.category !== undefined && ["taxi", "generic"].includes(body.category) ? body.category : existing.category;
    const customerId =
      body.customerId !== undefined
        ? Number.isFinite(Number(body.customerId)) && Number(body.customerId) > 0
          ? Number(body.customerId)
          : null
        : existing.customer_id;
    let config = existing.config;
    if (body.config !== undefined && body.config && typeof body.config === "object") {
      config = JSON.stringify(body.config);
    }
    db.prepare(
      "UPDATE managed_sites SET domain = ?, category = ?, status = ?, customer_id = ?, config = ?, updated_at = ? WHERE id = ?",
    ).run(domain, category, status, customerId, config, nowIso(), siteId);
    return json(res, 200, { ok: true, sites: listManagedSites() });
  }

  // --- SEO Sıralama Takip (P7) — iskelet; ranking API yok, snapshot boş kalır ---
  if (req.method === "GET" && url.pathname === "/api/admin/seo-keywords") {
    if (!requireUser(req, res)) return;
    return json(res, 200, {
      keywords: listAllSeoKeywords(),
      connected: false,
      pendingSync: collectSeoKeywordsForSync().length,
      message: SEO_RANK_WAIT_MESSAGE,
    });
  }

  const adminCustomerSeoMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)\/seo-keywords$/);
  if (req.method === "GET" && adminCustomerSeoMatch) {
    if (!requireUser(req, res)) return;
    const customerId = Number(adminCustomerSeoMatch[1]);
    if (!findCustomerAccount(customerId)) return json(res, 404, { error: "Müşteri bulunamadı." });
    return json(res, 200, { keywords: listCustomerSeo(customerId), connected: false, message: SEO_RANK_WAIT_MESSAGE });
  }
  if (req.method === "POST" && adminCustomerSeoMatch) {
    if (!requireUser(req, res)) return;
    const customerId = Number(adminCustomerSeoMatch[1]);
    if (!findCustomerAccount(customerId)) return json(res, 404, { error: "Müşteri bulunamadı." });
    const body = await readJson(req, 10_000);
    const keyword = cleanSeoKeyword(body.keyword);
    if (keyword.length < 2 || keyword.length > 80) {
      return json(res, 400, { error: "Kelime 2–80 karakter olmalıdır." });
    }
    const locale = cleanText(body.locale, 12) || "tr";
    try {
      const result = db
        .prepare("INSERT INTO seo_keywords (customer_id, keyword, locale, active, created_at) VALUES (?, ?, ?, 1, ?)")
        .run(customerId, keyword, locale, nowIso());
      return json(res, 201, {
        ok: true,
        id: Number(result.lastInsertRowid),
        keywords: listCustomerSeo(customerId),
        connected: false,
        message: SEO_RANK_WAIT_MESSAGE,
      });
    } catch (error) {
      if (String(error?.message || "").includes("UNIQUE")) {
        return json(res, 409, { error: "Bu kelime zaten ekli." });
      }
      throw error;
    }
  }

  const adminSeoKeywordItemMatch = url.pathname.match(/^\/api\/admin\/seo-keywords\/(\d+)$/);
  if (req.method === "DELETE" && adminSeoKeywordItemMatch) {
    if (!requireUser(req, res)) return;
    const keywordId = Number(adminSeoKeywordItemMatch[1]);
    const existing = db.prepare("SELECT * FROM seo_keywords WHERE id = ?").get(keywordId);
    if (!existing) return json(res, 404, { error: "Kelime bulunamadı." });
    db.prepare("DELETE FROM seo_keywords WHERE id = ?").run(keywordId);
    return json(res, 200, {
      ok: true,
      keywords: listCustomerSeo(existing.customer_id),
      connected: false,
      message: SEO_RANK_WAIT_MESSAGE,
    });
  }

  if (req.method === "GET" && url.pathname === "/api/content") {
    const rows = db.prepare("SELECT key, json, updated_at FROM content_sections").all();
    const content = {};
    let updatedAt = null;
    for (const row of rows) {
      try {
        content[row.key] = JSON.parse(row.json);
        if (!updatedAt || row.updated_at > updatedAt) updatedAt = row.updated_at;
      } catch {
        // Bozuk tek bir bölüm diğer içerikleri engellemez.
      }
    }
    return json(res, 200, { content, updatedAt });
  }

  if (req.method === "PUT" && url.pathname === "/api/content") {
    if (!requireUser(req, res)) return;
    // 10 MB logo dosyası Data URL olarak yaklaşık 13,4 MB JSON üretir.
    // Diğer yönetilebilir içeriklere de güvenli pay bırakıyoruz.
    const body = await readJson(req, 20_000_000);
    const content = body.content;
    if (!content || typeof content !== "object" || Array.isArray(content)) {
      return json(res, 400, { error: "Geçersiz içerik paketi." });
    }
    for (const key of CONTENT_KEYS) {
      if (!(key in content)) return json(res, 400, { error: `${key} bölümü eksik.` });
    }
    if (CONTENT_KEYS.slice(0, 5).some((key) => !Array.isArray(content[key]))) {
      return json(res, 400, { error: "Liste biçimindeki içeriklerden biri geçersiz." });
    }
    content.settings = { ...content.settings, aiApiKey: "" };
    const updatedAt = nowIso();
    const statement = db.prepare(
      `INSERT INTO content_sections (key, json, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at`,
    );
    db.exec("BEGIN IMMEDIATE");
    try {
      for (const key of CONTENT_KEYS) statement.run(key, JSON.stringify(content[key]), updatedAt);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
    return json(res, 200, { ok: true, updatedAt });
  }

  if (req.method === "POST" && url.pathname === "/api/leads") {
    if (rateLimited(req, "lead", 5, 60 * 60 * 1000)) {
      return json(res, 429, { error: "Çok fazla talep gönderildi. Lütfen daha sonra tekrar deneyin." });
    }
    const body = await readJson(req, 30_000);
    if (isBotTrap(body)) return json(res, 201, { ok: true, id: 0 });
    const name = cleanText(body.name, 120);
    const phone = cleanText(body.phone, 40);
    const kindRaw = cleanText(body.kind, 20);
    if (kindRaw === "partner_referral") {
      return json(res, 400, { error: "Bayi yönlendirmesi yalnızca firma panelinden gönderilir." });
    }
    const kind = LEAD_KINDS.has(kindRaw) ? kindRaw : "callback";
    const service =
      cleanText(body.service, 160) ||
      (kind === "maps"
        ? "Google Maps / harita"
        : kind === "partner"
          ? "Bayi başvurusu"
          : kind === "partner_referral"
            ? "Bayi müşteri yönlendirmesi"
            : kind === "new_customer"
              ? "Yeni müşteri kaydı"
              : "Genel bilgi");
    const sourcePath = cleanText(body.sourcePath, 200) || "/";
    const nationalId = normalizeNationalId(body.nationalId || body.tc || body.tckn);
    if (name.length < 2 || !validTrPhone(phone)) {
      return json(res, 400, { error: "Adı ve telefonu kontrol edin. Telefonu 05xx xxx xx xx şeklinde, yalnızca rakam yazın." });
    }
    if (kind === "new_customer" && !isValidNationalId(nationalId)) {
      return json(res, 400, { error: "TC kimlik numarasını 11 haneli rakam olarak yazın." });
    }
    const existingCustomer = findExistingCustomer({
      email: cleanText(body.email, 160).toLowerCase(),
      phone,
      nationalId,
    });
    if (existingCustomer) {
      return json(res, 409, {
        error: duplicateCustomerMessage(),
        existingCustomer: true,
        loginPath: "/musteri/giris",
      });
    }
    const openLeadKinds = kind === "maps" ? ["maps"] : ["maps", "new_customer", "callback"];
    const existingOpenLead = findRecentOpenLeadByPhone(phone, openLeadKinds);
    if (existingOpenLead) {
      const mergedId = mergeMapsLead(existingOpenLead, {
        email: cleanText(body.email, 160).toLowerCase(),
        sector: cleanText(body.sector, 120),
        district: cleanText(body.district, 80),
        address: cleanText(body.address, 240),
        hours: cleanText(body.hours, 400),
        website: cleanText(body.website, 200),
        notes: cleanText(body.notes, 800),
        sourcePath,
        service,
        nationalId,
      });
      return json(res, 201, { ok: true, id: mergedId, merged: true });
    }
    const referralCode = extractReferralCode(body, sourcePath);
    const referredByCustomerId = referralCode ? resolveReferral(referralCode) : null;
    const partnerFromRef = referralCode && !referredByCustomerId ? resolvePartnerReferral(referralCode) : null;
    const result = insertLead({
      name,
      phone,
      service,
      sourcePath,
      kind,
      email: cleanText(body.email, 160).toLowerCase(),
      sector: cleanText(body.sector, 120),
      district: cleanText(body.district, 80),
      address: cleanText(body.address, 240),
      hours: cleanText(body.hours, 400),
      website: cleanText(body.website, 200),
      notes: cleanText(body.notes, 800),
      smsOk: body.smsOk === false ? 0 : 1,
      partnerId: partnerFromRef,
      referralCode,
      referredByCustomerId,
      nationalId,
    });
    return json(res, 201, { ok: true, id: Number(result.lastInsertRowid) });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/referrals") {
    if (!requireUser(req, res)) return;
    const q = cleanText(url.searchParams.get("q"), 120);
    const clauses = ["(leads.referral_code != '' OR leads.referred_by_customer_id IS NOT NULL)"];
    const params = [];
    if (q) {
      const like = `%${q.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;
      clauses.push(
        "(leads.name LIKE ? ESCAPE '\\' OR leads.phone LIKE ? ESCAPE '\\' OR leads.email LIKE ? ESCAPE '\\' OR leads.referral_code LIKE ? ESCAPE '\\' OR referrer.company_name LIKE ? ESCAPE '\\')",
      );
      params.push(like, like, like, like, like);
    }
    const referrals = db
      .prepare(
        `SELECT leads.id, leads.name, leads.phone, leads.email, leads.kind, leads.status, leads.service,
                leads.referral_code, leads.referred_by_customer_id, leads.referral_rewarded, leads.created_at,
                referrer.company_name AS referrer_company_name, referrer.contact_name AS referrer_contact_name
         FROM leads
         LEFT JOIN customer_accounts AS referrer ON referrer.id = leads.referred_by_customer_id
         WHERE ${clauses.join(" AND ")}
         ORDER BY leads.created_at DESC
         LIMIT 400`,
      )
      .all(...params);
    return json(res, 200, { referrals });
  }

  const referralRewardMatch = url.pathname.match(/^\/api\/admin\/leads\/(\d+)\/referral-reward$/);
  if (req.method === "POST" && referralRewardMatch) {
    const actor = requireUser(req, res);
    if (!actor) return;
    await readJson(req, 4_000).catch(() => ({}));
    const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(Number(referralRewardMatch[1]));
    if (!lead) return json(res, 404, { error: "Başvuru bulunamadı." });
    if (!String(lead.referral_code || "") && lead.referred_by_customer_id == null) {
      return json(res, 400, { error: "Bu kayıtta tavsiye kodu yok." });
    }
    db.prepare("UPDATE leads SET referral_rewarded = 1, updated_at = ? WHERE id = ?").run(nowIso(), lead.id);
    logAudit({
      actorType: "admin",
      actorId: actor.id,
      actorLabel: actor.username,
      customerId: lead.referred_by_customer_id || null,
      action: "referral_reward",
      target: `lead#${lead.id}`,
      ip: requestIp(req),
    });
    return json(res, 200, { ok: true, id: lead.id, referral_rewarded: 1 });
  }

  if (req.method === "GET" && url.pathname === "/api/leads") {
    if (!requireUser(req, res)) return;
    const leads = db
      .prepare(
        `SELECT leads.*, referrer.company_name AS referrer_company_name
         FROM leads
         LEFT JOIN customer_accounts AS referrer ON referrer.id = leads.referred_by_customer_id
         ORDER BY leads.created_at DESC LIMIT 400`,
      )
      .all();
    return json(res, 200, { leads });
  }

  if (req.method === "GET" && url.pathname === "/api/leads/phones") {
    if (!requireUser(req, res)) return;
    const rows = db
      .prepare(
        "SELECT name, phone, kind, district, sector FROM leads WHERE sms_ok = 1 AND phone != '' ORDER BY created_at DESC LIMIT 2000",
      )
      .all();
    const seen = new Set();
    const phones = [];
    for (const row of rows) {
      const digits = String(row.phone).replace(/\D/g, "");
      if (!digits || seen.has(digits)) continue;
      seen.add(digits);
      phones.push(row);
    }
    return json(res, 200, { phones, count: phones.length });
  }

  if (req.method === "GET" && url.pathname === "/api/leads/sms.csv") {
    if (!requireUser(req, res)) return;
    const rows = db
      .prepare(
        "SELECT name, phone, kind, district, sector, created_at FROM leads WHERE sms_ok = 1 AND phone != '' ORDER BY created_at DESC LIMIT 2000",
      )
      .all();
    const csv = [
      "ad,telefon,kaynak,ilce,sektor,tarih",
      ...rows.map((row) =>
        [row.name, row.phone, row.kind, row.district, row.sector, row.created_at].map(csvEscape).join(","),
      ),
    ].join("\r\n");
    res.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="hatay360-sms.csv"',
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(`\uFEFF${csv}`);
    return;
  }

  const leadMatch = url.pathname.match(/^\/api\/leads\/(\d+)$/);
  if (req.method === "PATCH" && leadMatch) {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 10_000);
    const status = cleanText(body.status, 20);
    if (!["new", "contacted", "won", "closed"].includes(status)) {
      return json(res, 400, { error: "Geçersiz başvuru durumu." });
    }
    db.prepare("UPDATE leads SET status = ?, updated_at = ? WHERE id = ?").run(status, nowIso(), Number(leadMatch[1]));
    return json(res, 200, { ok: true });
  }

  const leadApproveMatch = url.pathname.match(/^\/api\/admin\/leads\/(\d+)\/approve$/);
  if (req.method === "POST" && leadApproveMatch) {
    if (!requireUser(req, res)) return;
    const result = approveLeadAccount(Number(leadApproveMatch[1]));
    if (result.error) return json(res, 404, { error: result.error });
    return json(res, 200, result);
  }

  if (req.method === "POST" && url.pathname === "/api/analytics/pageview") {
    if (rateLimited(req, "pageview", 120, 60 * 60 * 1000)) return json(res, 202, { ok: true });
    const body = await readJson(req, 20_000);
    const pathname = normalizeAnalyticsPath(body.path);
    if (!pathname.startsWith("/") || pathname.startsWith("/panel") || pathname.startsWith("/admin") || pathname.startsWith("/musteri") || pathname.startsWith("/bayi")) {
      return json(res, 202, { ok: true });
    }
    const utmSource = cleanText(body.utmSource, 100);
    const referrer = utmSource ? `utm:${utmSource}` : safeReferrer(body.referrer);
    db.prepare(
      "INSERT INTO pageviews (path, referrer, utm_source, utm_campaign, visitor_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(
      pathname,
      referrer,
      utmSource,
      cleanText(body.utmCampaign, 120),
      visitorHash(req),
      nowIso(),
    );
    return json(res, 201, { ok: true });
  }

  if (req.method === "GET" && url.pathname === "/api/analytics/summary") {
    if (!requireUser(req, res)) return;
    const { startIso: dayStart, endIso: dayEnd } = istanbulDayBounds();
    const monthStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const totals = db
      .prepare(
        `SELECT
           COUNT(*) AS totalViews,
           SUM(CASE WHEN created_at >= ? AND created_at < ? THEN 1 ELSE 0 END) AS todayViews,
           COUNT(DISTINCT CASE WHEN created_at >= ? AND created_at < ? THEN visitor_hash END) AS uniqueToday,
           COUNT(DISTINCT CASE WHEN created_at >= ? THEN visitor_hash END) AS unique30d
         FROM pageviews`,
      )
      .get(dayStart, dayEnd, dayStart, dayEnd, monthStart);
    const topPages = db
      .prepare(
        `SELECT path, COUNT(*) AS views
         FROM pageviews
         WHERE created_at >= ?
         GROUP BY path
         ORDER BY views DESC
         LIMIT 12`,
      )
      .all(monthStart)
      .map((row) => ({ path: row.path, views: Number(row.views || 0) }));
    const districts = db
      .prepare(
        `SELECT lower(replace(path, '/hatay/', '')) AS district, COUNT(*) AS views
         FROM pageviews
         WHERE created_at >= ?
           AND path LIKE '/hatay/%'
           AND path NOT LIKE '/hatay/%/%'
           AND length(replace(path, '/hatay/', '')) > 0
         GROUP BY lower(replace(path, '/hatay/', ''))
         ORDER BY views DESC
         LIMIT 15`,
      )
      .all(monthStart)
      .map((row) => ({ district: String(row.district || "").trim(), views: Number(row.views || 0) }))
      .filter((row) => row.district);
    const referrers = db
      .prepare(
        `SELECT
           CASE
             WHEN referrer IS NULL OR trim(referrer) = '' THEN 'direct'
             ELSE referrer
           END AS referrer,
           COUNT(*) AS views
         FROM pageviews
         WHERE created_at >= ?
         GROUP BY
           CASE
             WHEN referrer IS NULL OR trim(referrer) = '' THEN 'direct'
             ELSE referrer
           END
         ORDER BY views DESC
         LIMIT 12`,
      )
      .all(monthStart)
      .map((row) => ({ referrer: row.referrer || "direct", views: Number(row.views || 0) }));
    const daily = db
      .prepare(
        `SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS views, COUNT(DISTINCT visitor_hash) AS visitors
         FROM pageviews
         WHERE created_at >= ?
         GROUP BY day
         ORDER BY day`,
      )
      .all(monthStart)
      .map((row) => ({ day: row.day, views: Number(row.views || 0), visitors: Number(row.visitors || 0) }));
    const leadStats = db
      .prepare(
        `SELECT COUNT(*) AS total,
          SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS newCount,
          SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) AS last7d
         FROM leads`,
      )
      .get(weekStart);
    const loginStats = db
      .prepare(
        `SELECT COUNT(*) AS attempts,
          SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) AS successes
         FROM login_events WHERE created_at >= ?`,
      )
      .get(weekStart);
    return json(res, 200, {
      totals: {
        totalViews: Number(totals?.totalViews || 0),
        todayViews: Number(totals?.todayViews || 0),
        uniqueToday: Number(totals?.uniqueToday || 0),
        unique30d: Number(totals?.unique30d || 0),
      },
      topPages,
      districts,
      referrers,
      daily,
      leadStats: {
        total: Number(leadStats?.total || 0),
        newCount: Number(leadStats?.newCount || 0),
        last7d: Number(leadStats?.last7d || 0),
      },
      loginStats: {
        attempts: Number(loginStats?.attempts || 0),
        successes: Number(loginStats?.successes || 0),
      },
      timezone: "Europe/Istanbul",
    });
  }

  return json(res, 404, { error: "API adresi bulunamadı." });
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

function serveStatic(req, res, url) {
  if (!existsSync(DIST)) return json(res, 503, { error: "Önce npm run build çalıştırılmalıdır." });
  const decoded = decodeURIComponent(url.pathname);
  const requested = path.resolve(DIST, `.${decoded}`);
  const safeRequested = requested.startsWith(`${DIST}${path.sep}`) || requested === DIST;
  let file = safeRequested ? requested : "";
  if (!file || !existsSync(file) || statSync(file).isDirectory()) file = path.join(DIST, "index.html");
  const extension = path.extname(file).toLowerCase();
  const host = String(req.headers.host || "");
  const managedSite = extension === ".html" ? getManagedSiteByDomain(host) : null;
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim() || "https";
  const origin = managedSite ? `${proto}://${normalizeHost(host)}` : SITE_ORIGIN;
  res.writeHead(200, {
    "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
    "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
    ...SECURITY_HEADERS,
  });
  if (req.method === "HEAD") return res.end();
  if (managedSite && path.basename(file) === "index.html") {
    const html = injectManagedSiteHtml(readFileSync(file, "utf8"), managedSite, origin);
    return res.end(html);
  }
  createReadStream(file).pipe(res);
}

const SITE_ORIGIN = String(process.env.HATAY360_SITE_ORIGIN || "https://hatay360.com").replace(/\/$/, "");
const SITEMAP_LASTMOD = "2026-08-21";

function sitemapDistrictSlug(name) {
  return name
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const HATAY_SITEMAP_DISTRICTS = [
  "Antakya",
  "Defne",
  "Arsuz",
  "İskenderun",
  "Dörtyol",
  "Payas",
  "Erzin",
  "Kırıkhan",
  "Reyhanlı",
  "Kumlu",
  "Hassa",
  "Altınözü",
  "Yayladağı",
  "Samandağ",
  "Belen",
];

const PUBLIC_PATHS = [
  "/",
  "/pazarla",
  "/ozellikler",
  "/paketler",
  "/referanslar",
  "/google-maps-harita-kaydi",
  "/hatay-kesfet",
  "/hatayda-nerede-kahvalti-yapilir",
  "/hakkimizda",
  "/iletisim",
  "/hesap",
  "/demolar",
  "/araclar",
  "/araclar/google-sira-bulucu",
  "/araclar/meta-etiket-olusturucu",
  "/araclar/yerel-anahtar-kelime-olusturucu",
  "/araclar/yorum-mesaji",
  "/araclar/yorum-cevabi",
  "/araclar/randevu-hatirlatma",
  "/araclar/qr-menu",
  "/araclar/nap-kontrol",
  "/araclar/utm-link",
  "/araclar/reklam-metni",
  "/araclar/sosyal-onizleme",
  "/araclar/schema",
  "/araclar/musteri-linki",
  "/araclar/kartvizit",
  "/araclar/harita-linki",
  "/araclar/calisma-saati",
  "/araclar/kapaliyiz",
  "/araclar/ozel-ihtiyac-hesaplayici",
  "/gizlilik",
  "/kosullar",
  "/demo/eczane",
  "/demo/oto-yikama",
  "/demo/dugun-salonu",
  "/demo/firin",
  "/demo/cicekci",
  "/demo/dis-klinigi",
  "/demo/optik",
  "/demo/kahve",
  "/demo/lastikci",
  "/demo/pet-shop",
  "/demo/fotografci",
  "/demo/muhasebeci",
  "/demo/dershane",
  "/demo/oto-elektrik",
  "/demo/klima",
  "/demo/tesisatci",
  "/demo/otel",
  "/demo/zeytinyagi",
  "/demo/elektrikci",
  "/demo/kres",
  "/demo/camci",
  "/demo/insaat",
  "/demo/marangoz",
  "/demo/berber",
  "/demo/kombi",
  "/demo/kaporta",
  "/demo/kasap",
  "/demo/spor-salonu",
  "/demo/manav",
  "/demo/sigorta",
  "/demo/dugun-organizasyon",
  "/demo/zuccaciye",
  "/demo/hali-yikama",
  "/demo/kunefe",
  "/demo/mobilya",
  "/demo/ayakkabi",
  "/demo/pvc-dograma",
  "/demo/sucuk",
  "/demo/taksi",
  "/demo/nakliyat",
  "/demo/klinik",
  "/demo/servis",
  "/sektor/taksi",
  "/sektor/nakliyat",
  "/sektor/klinik",
  "/sektor/servis",
  "/hatay",
  ...HATAY_SITEMAP_DISTRICTS.map((name) => `/hatay/${sitemapDistrictSlug(name)}`),
];

function textResponse(res, body, type) {
  res.writeHead(200, {
    "Content-Type": type,
    "Cache-Control": "public, max-age=3600",
    ...SECURITY_HEADERS,
  });
  res.end(body);
}

function robotsTxt() {
  return `User-agent: *
Allow: /
Allow: /musteri/kayit
Allow: /firma/kayit
Disallow: /panel
Disallow: /panel/
Disallow: /musteri
Disallow: /firma
Disallow: /admin

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;
}

function sitemapXml() {
  const urls = PUBLIC_PATHS.map(
    (path) => `  <url><loc>${SITE_ORIGIN}${path}</loc><lastmod>${SITEMAP_LASTMOD}</lastmod></url>`,
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/")) return await handleApi(req, res, url);
    if (!["GET", "HEAD"].includes(req.method || "")) return json(res, 405, { error: "Yöntem desteklenmiyor." });
    if (url.pathname === "/robots.txt") return textResponse(res, robotsTxt(), "text/plain; charset=utf-8");
    if (url.pathname === "/sitemap.xml") return textResponse(res, sitemapXml(), "application/xml; charset=utf-8");
    return serveStatic(req, res, url);
  } catch (error) {
    if (error instanceof SyntaxError) return json(res, 400, { error: "Geçersiz JSON." });
    if (error?.message === "PAYLOAD_TOO_LARGE") return json(res, 413, { error: "İstek çok büyük." });
    console.error(error);
    return json(res, 500, { error: "Sunucu hatası." });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Hatay360 sunucusu: http://127.0.0.1:${PORT}`);
  console.log(`Veritabanı: ${path.join(DATA_DIR, "hatay360.sqlite")}`);
});

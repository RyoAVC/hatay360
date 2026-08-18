import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { DatabaseSync } from "node:sqlite";
import { resolveAny } from "node:dns/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, "dist");
const DATA_DIR = path.resolve(process.env.HATAY360_DATA_DIR || path.join(ROOT, "data"));
const PORT = Number(process.env.PORT || 3601);
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const SESSION_COOKIE = "hatay360_session";
const CUSTOMER_SESSION_COOKIE = "hatay360_customer_session";
const SESSION_HOURS = 12;
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
`);

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

const analyticsSalt = getOrCreateMeta("analytics_salt");

function requestIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || req.socket.remoteAddress || "unknown";
}

function visitorHash(req) {
  const day = new Date().toISOString().slice(0, 10);
  return sha256(`${analyticsSalt}|${day}|${requestIp(req)}|${req.headers["user-agent"] || ""}`);
}

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  return { salt, hash: scryptSync(password, salt, 64).toString("hex") };
}

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

function json(res, status, payload, extraHeaders = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
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

setInterval(() => {
  db.prepare("DELETE FROM admin_sessions WHERE expires_at <= ?").run(nowIso());
  db.prepare("DELETE FROM customer_sessions WHERE expires_at <= ?").run(nowIso());
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare("DELETE FROM pageviews WHERE created_at < ?").run(cutoff);
}, 60 * 60 * 1000).unref();

function customerDashboard(customer) {
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
  const tickets = db.prepare("SELECT * FROM customer_tickets WHERE customer_id = ? ORDER BY created_at DESC LIMIT 100").all(customer.id);
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
  return {
    customer,
    campaigns,
    totals: {
      ...totals,
      profit: totals.revenue - totals.spend - totals.managementFee,
      roas: totals.spend > 0 ? totals.revenue / totals.spend : 0,
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
    },
    tickets,
    serviceRequests,
    domainChecks,
    stats,
  };
}

async function handleApi(req, res, url) {
  if (!sameOrigin(req) && !["GET", "HEAD"].includes(req.method || "")) {
    return json(res, 403, { error: "Geçersiz istek kaynağı." });
  }

  if (req.method === "GET" && url.pathname === "/api/health") {
    return json(res, 200, { ok: true, database: "sqlite", time: nowIso() });
  }

  if (req.method === "GET" && url.pathname === "/api/auth/session") {
    const user = currentUser(req);
    const configured = Boolean(db.prepare("SELECT id FROM admin_users LIMIT 1").get());
    return json(res, 200, { authenticated: Boolean(user), configured, username: user?.username || null });
  }

  if (req.method === "POST" && url.pathname === "/api/auth/login") {
    if (rateLimited(req, "login", 10, 15 * 60 * 1000)) {
      return json(res, 429, { error: "Çok fazla giriş denemesi. Bir süre sonra tekrar deneyin." });
    }
    const body = await readJson(req, 20_000);
    const username = cleanText(body.username, 100);
    const password = String(body.password || "");
    const user = db.prepare("SELECT * FROM admin_users WHERE username = ?").get(username);
    const success = Boolean(user && verifyPassword(password, user.password_salt, user.password_hash));
    db.prepare("INSERT INTO login_events (username, visitor_hash, success, created_at) VALUES (?, ?, ?, ?)").run(
      username || "empty",
      visitorHash(req),
      success ? 1 : 0,
      nowIso(),
    );
    if (!success) return json(res, 401, { error: "Kullanıcı adı veya şifre hatalı." });

    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
    db.prepare("INSERT INTO admin_sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)").run(
      sha256(token),
      user.id,
      expiresAt.toISOString(),
      nowIso(),
    );
    const cookie = `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_HOURS * 3600}${IS_PRODUCTION ? "; Secure" : ""}`;
    return json(res, 200, { ok: true, username: user.username }, { "Set-Cookie": cookie });
  }

  if (req.method === "POST" && url.pathname === "/api/auth/logout") {
    const token = cookies(req)[SESSION_COOKIE];
    if (token) db.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").run(sha256(token));
    const cookie = `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${IS_PRODUCTION ? "; Secure" : ""}`;
    return json(res, 200, { ok: true }, { "Set-Cookie": cookie });
  }

  if (req.method === "GET" && url.pathname === "/api/customer/session") {
    const customer = currentCustomer(req);
    return json(res, 200, { authenticated: Boolean(customer), customer });
  }

  if (req.method === "POST" && url.pathname === "/api/customer/login") {
    if (rateLimited(req, "customer-login", 10, 15 * 60 * 1000)) {
      return json(res, 429, { error: "Çok fazla giriş denemesi. Bir süre sonra tekrar deneyin." });
    }
    const body = await readJson(req, 20_000);
    const email = cleanText(body.email, 160).toLowerCase();
    const password = String(body.password || "");
    const account = db.prepare("SELECT * FROM customer_accounts WHERE email = ? AND status = 'active'").get(email);
    if (!account || !verifyPassword(password, account.password_salt, account.password_hash)) {
      return json(res, 401, { error: "E-posta veya şifre hatalı." });
    }
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
    db.prepare("INSERT INTO customer_sessions (token_hash, customer_id, expires_at, created_at) VALUES (?, ?, ?, ?)").run(
      sha256(token),
      account.id,
      expiresAt.toISOString(),
      nowIso(),
    );
    const cookie = `${CUSTOMER_SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_HOURS * 3600}${IS_PRODUCTION ? "; Secure" : ""}`;
    return json(res, 200, { ok: true, customer: { id: account.id, company_name: account.company_name, contact_name: account.contact_name, email: account.email, phone: account.phone } }, { "Set-Cookie": cookie });
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
    return json(res, 200, customerDashboard(customer));
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
    const cookie = `${CUSTOMER_SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_HOURS * 3600}${IS_PRODUCTION ? "; Secure" : ""}`;
    return json(res, 200, { ok: true, message: "Şifreniz güncellendi." }, { "Set-Cookie": cookie });
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
    const result = db.prepare("INSERT INTO customer_tickets (customer_id, subject, message, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)").run(customer.id, subject, message, priority, createdAt, createdAt);
    return json(res, 201, { ok: true, id: Number(result.lastInsertRowid) });
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

  if (req.method === "GET" && url.pathname === "/api/customer/domain-check") {
    const customer = requireCustomer(req, res);
    if (!customer) return;
    const domain = cleanText(url.searchParams.get("domain"), 253).toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/.test(domain)) {
      return json(res, 400, { error: "Geçerli bir alan adı yazın. Örnek: firmam.com" });
    }
    let result = "unknown";
    try {
      const records = await resolveAny(domain);
      result = records.length ? "registered" : "unknown";
    } catch (error) {
      result = ["ENOTFOUND", "ENODATA"].includes(error?.code) ? "potentially_available" : "unknown";
    }
    db.prepare("INSERT INTO customer_domain_checks (customer_id, domain, result, created_at) VALUES (?, ?, ?, ?)").run(customer.id, domain, result, nowIso());
    return json(res, 200, { domain, result, note: result === "potentially_available" ? "DNS kaydı bulunamadı; kesin uygunluk kayıt kuruluşunda doğrulanmalıdır." : "DNS ve alan adı ön kontrol sonucu." });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/customers") {
    if (!requireUser(req, res)) return;
    const customers = db
      .prepare(
        `SELECT customer_accounts.id, customer_accounts.company_name, customer_accounts.contact_name,
          customer_accounts.email, customer_accounts.phone, customer_accounts.status, customer_accounts.created_at,
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
    const tickets = db.prepare("SELECT customer_tickets.*, customer_accounts.company_name FROM customer_tickets JOIN customer_accounts ON customer_accounts.id = customer_tickets.customer_id ORDER BY customer_tickets.created_at DESC").all();
    const serviceRequests = db.prepare("SELECT customer_service_requests.*, customer_accounts.company_name FROM customer_service_requests JOIN customer_accounts ON customer_accounts.id = customer_service_requests.customer_id ORDER BY customer_service_requests.created_at DESC").all();
    return json(res, 200, { customers, campaigns, stats, tickets, serviceRequests });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/customers") {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 30_000);
    const companyName = cleanText(body.companyName, 160);
    const contactName = cleanText(body.contactName, 160);
    const email = cleanText(body.email, 160).toLowerCase();
    const phone = cleanText(body.phone, 40);
    const password = String(body.password || "");
    if (companyName.length < 2 || contactName.length < 2 || !email.includes("@") || password.length < 8) {
      return json(res, 400, { error: "Firma, yetkili, e-posta ve en az 8 karakterli şifre gereklidir." });
    }
    const credentials = hashPassword(password);
    const createdAt = nowIso();
    try {
      const result = db.prepare("INSERT INTO customer_accounts (company_name, contact_name, email, phone, password_hash, password_salt, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(companyName, contactName, email, phone, credentials.hash, credentials.salt, createdAt, createdAt);
      return json(res, 201, { ok: true, id: Number(result.lastInsertRowid) });
    } catch (error) {
      if (String(error?.message || "").includes("UNIQUE")) return json(res, 409, { error: "Bu e-posta ile müşteri hesabı zaten var." });
      throw error;
    }
  }

  const adminCustomerMatch = url.pathname.match(/^\/api\/admin\/customers\/(\d+)$/);
  if (req.method === "PATCH" && adminCustomerMatch) {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 30_000);
    const customerId = Number(adminCustomerMatch[1]);
    const status = ["active", "paused"].includes(body.status) ? body.status : "active";
    db.prepare("UPDATE customer_accounts SET status = ?, updated_at = ? WHERE id = ?").run(status, nowIso(), customerId);
    if (String(body.password || "").length >= 8) {
      const credentials = hashPassword(String(body.password));
      db.prepare("UPDATE customer_accounts SET password_hash = ?, password_salt = ?, updated_at = ? WHERE id = ?").run(credentials.hash, credentials.salt, nowIso(), customerId);
      db.prepare("DELETE FROM customer_sessions WHERE customer_id = ?").run(customerId);
    }
    return json(res, 200, { ok: true });
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

  const adminTicketMatch = url.pathname.match(/^\/api\/admin\/tickets\/(\d+)$/);
  if (req.method === "PATCH" && adminTicketMatch) {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 30_000);
    const status = ["open", "answered", "closed"].includes(body.status) ? body.status : "open";
    db.prepare("UPDATE customer_tickets SET status = ?, admin_reply = ?, updated_at = ? WHERE id = ?").run(status, cleanText(body.adminReply, 3000), nowIso(), Number(adminTicketMatch[1]));
    return json(res, 200, { ok: true });
  }

  const adminServiceMatch = url.pathname.match(/^\/api\/admin\/service-requests\/(\d+)$/);
  if (req.method === "PATCH" && adminServiceMatch) {
    if (!requireUser(req, res)) return;
    const body = await readJson(req, 10_000);
    const status = ["new", "reviewing", "quoted", "approved", "closed"].includes(body.status) ? body.status : "new";
    db.prepare("UPDATE customer_service_requests SET status = ?, updated_at = ? WHERE id = ?").run(status, nowIso(), Number(adminServiceMatch[1]));
    return json(res, 200, { ok: true });
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
    const name = cleanText(body.name, 120);
    const phone = cleanText(body.phone, 40);
    const service = cleanText(body.service, 160) || "Genel bilgi";
    const sourcePath = cleanText(body.sourcePath, 200) || "/";
    if (name.length < 2 || phone.replace(/\D/g, "").length < 10) {
      return json(res, 400, { error: "Ad ve telefon bilgilerini kontrol edin." });
    }
    const createdAt = nowIso();
    const result = db
      .prepare(
        "INSERT INTO leads (name, phone, service, source_path, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'new', ?, ?)",
      )
      .run(name, phone, service, sourcePath, createdAt, createdAt);
    return json(res, 201, { ok: true, id: Number(result.lastInsertRowid) });
  }

  if (req.method === "GET" && url.pathname === "/api/leads") {
    if (!requireUser(req, res)) return;
    const leads = db.prepare("SELECT * FROM leads ORDER BY created_at DESC LIMIT 200").all();
    return json(res, 200, { leads });
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

  if (req.method === "POST" && url.pathname === "/api/analytics/pageview") {
    if (rateLimited(req, "pageview", 120, 60 * 60 * 1000)) return json(res, 202, { ok: true });
    const body = await readJson(req, 20_000);
    const pathname = cleanText(body.path, 200);
    if (!pathname.startsWith("/") || pathname.startsWith("/panel") || pathname === "/admin") {
      return json(res, 202, { ok: true });
    }
    db.prepare(
      "INSERT INTO pageviews (path, referrer, utm_source, utm_campaign, visitor_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(
      pathname,
      safeReferrer(body.referrer),
      cleanText(body.utmSource, 100),
      cleanText(body.utmCampaign, 120),
      visitorHash(req),
      nowIso(),
    );
    return json(res, 201, { ok: true });
  }

  if (req.method === "GET" && url.pathname === "/api/analytics/summary") {
    if (!requireUser(req, res)) return;
    const dayStart = `${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`;
    const monthStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const totals = db
      .prepare(
        `SELECT
           COUNT(*) AS totalViews,
           SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) AS todayViews,
           COUNT(DISTINCT CASE WHEN created_at >= ? THEN visitor_hash END) AS uniqueToday,
           COUNT(DISTINCT CASE WHEN created_at >= ? THEN visitor_hash END) AS unique30d
         FROM pageviews`,
      )
      .get(dayStart, dayStart, monthStart);
    const topPages = db
      .prepare("SELECT path, COUNT(*) AS views FROM pageviews WHERE created_at >= ? GROUP BY path ORDER BY views DESC LIMIT 10")
      .all(monthStart);
    const districts = db
      .prepare(
        `SELECT REPLACE(path, '/hatay/', '') AS district, COUNT(*) AS views
         FROM pageviews WHERE created_at >= ? AND path LIKE '/hatay/%'
         GROUP BY path ORDER BY views DESC LIMIT 15`,
      )
      .all(monthStart);
    const referrers = db
      .prepare("SELECT referrer, COUNT(*) AS views FROM pageviews WHERE created_at >= ? GROUP BY referrer ORDER BY views DESC LIMIT 10")
      .all(monthStart);
    const daily = db
      .prepare(
        "SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS views, COUNT(DISTINCT visitor_hash) AS visitors FROM pageviews WHERE created_at >= ? GROUP BY day ORDER BY day",
      )
      .all(monthStart);
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
    return json(res, 200, { totals, topPages, districts, referrers, daily, leadStats, loginStats });
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
  res.writeHead(200, {
    "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
    "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  });
  if (req.method === "HEAD") return res.end();
  createReadStream(file).pipe(res);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/")) return await handleApi(req, res, url);
    if (!["GET", "HEAD"].includes(req.method || "")) return json(res, 405, { error: "Yöntem desteklenmiyor." });
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

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("SQLite API giriş, içerik, hit ve başvuru akışını çalıştırır", async (context) => {
  const dataDir = await mkdtemp(path.join(tmpdir(), "hatay360-api-test-"));
  const port = 3700 + Math.floor(Math.random() * 200);
  const base = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, [path.join(root, "server.mjs")], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      NODE_ENV: "development",
      HATAY360_DATA_DIR: dataDir,
      HATAY360_ADMIN_USER: "test_admin",
      HATAY360_ADMIN_PASSWORD: "test-password-api",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  context.after(async () => {
    if (server.exitCode === null) {
      const exited = new Promise((resolve) => server.once("exit", resolve));
      server.kill();
      await exited;
    }
    await rm(dataDir, { recursive: true, force: true });
  });

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Test sunucusu başlamadı.")), 8_000);
    server.stdout.on("data", (chunk) => {
      if (String(chunk).includes("Hatay360 sunucusu")) {
        clearTimeout(timeout);
        resolve();
      }
    });
    server.stderr.on("data", (chunk) => reject(new Error(String(chunk))));
    server.once("exit", (code) => reject(new Error(`Test sunucusu erken kapandı: ${code}`)));
  });

  const health = await fetch(`${base}/api/health`).then((response) => response.json());
  assert.equal(health.ok, true);
  assert.equal(health.database, "sqlite");

  const unauthorizedSave = await fetch(`${base}/api/content`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: {} }),
  });
  assert.equal(unauthorizedSave.status, 401);

  const wrongLogin = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "test_admin", password: "wrong-password" }),
  });
  assert.equal(wrongLogin.status, 401);

  const loginResponse = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "test_admin", password: "test-password-api" }),
  });
  assert.equal(loginResponse.status, 200);
  const cookie = loginResponse.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie?.startsWith("hatay360_session="));

  const content = {
    plans: [],
    slides: [],
    services: [],
    sectors: [],
    references: [],
    settings: { siteTitle: "Hatay360 Test", aiApiKey: "must-not-persist" },
  };
  const saveResponse = await fetch(`${base}/api/content`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ content }),
  });
  assert.equal(saveResponse.status, 200);
  const savedContent = await fetch(`${base}/api/content`).then((response) => response.json());
  assert.equal(savedContent.content.settings.siteTitle, "Hatay360 Test");
  assert.equal(savedContent.content.settings.aiApiKey, "");

  const pageviewResponse = await fetch(`${base}/api/analytics/pageview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: "/hatay/antakya", referrer: "https://www.google.com/search?q=hatay" }),
  });
  assert.equal(pageviewResponse.status, 201);

  const leadResponse = await fetch(`${base}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Test Müşteri", phone: "0555 111 22 33", service: "Web tasarım", sourcePath: "/iletisim" }),
  });
  assert.equal(leadResponse.status, 201);

  const summary = await fetch(`${base}/api/analytics/summary`, { headers: { Cookie: cookie } }).then((response) => response.json());
  assert.equal(summary.totals.totalViews, 1);
  assert.equal(summary.districts[0].district, "antakya");
  assert.equal(summary.leadStats.total, 1);

  const leads = await fetch(`${base}/api/leads`, { headers: { Cookie: cookie } }).then((response) => response.json());
  assert.equal(leads.leads[0].name, "Test Müşteri");

  const customerCreate = await fetch(`${base}/api/admin/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ companyName: "A Firması", contactName: "Ayşe Test", email: "a@example.com", phone: "0850 308 68 37", password: "customer-test-123" }),
  });
  assert.equal(customerCreate.status, 201);
  const customerId = (await customerCreate.json()).id;

  const campaignCreate = await fetch(`${base}/api/admin/campaigns`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ customerId, name: "Hatay Arama Reklamı", platform: "google", monthlyBudget: 5000, managementFee: 750, startDate: "2026-08-01" }),
  });
  assert.equal(campaignCreate.status, 201);
  const campaignId = (await campaignCreate.json()).id;

  const statsSave = await fetch(`${base}/api/admin/campaigns/${campaignId}/stats`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ periodStart: "2026-08-01", periodEnd: "2026-08-31", spend: 3200, impressions: 48000, clicks: 1800, leads: 120, conversions: 24, revenue: 14000 }),
  });
  assert.equal(statsSave.status, 200);

  const customerLogin = await fetch(`${base}/api/customer/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "a@example.com", password: "customer-test-123" }),
  });
  assert.equal(customerLogin.status, 200);
  let customerCookie = customerLogin.headers.get("set-cookie")?.split(";")[0];
  assert.ok(customerCookie?.startsWith("hatay360_customer_session="));

  const customerDashboard = await fetch(`${base}/api/customer/dashboard`, { headers: { Cookie: customerCookie } }).then((response) => response.json());
  assert.equal(customerDashboard.customer.company_name, "A Firması");
  assert.equal(customerDashboard.totals.monthlyBudget, 5000);
  assert.equal(customerDashboard.totals.spend, 3200);
  assert.equal(customerDashboard.totals.revenue, 14000);
  assert.equal(customerDashboard.totals.profit, 10050);
  assert.equal(customerDashboard.stats.length, 1);
  assert.equal(customerDashboard.stats[0].campaign_name, "Hatay Arama Reklamı");

  const wrongPasswordChange = await fetch(`${base}/api/customer/password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: customerCookie },
    body: JSON.stringify({ currentPassword: "yanlis-sifre", newPassword: "customer-new-456" }),
  });
  assert.equal(wrongPasswordChange.status, 401);

  const passwordChange = await fetch(`${base}/api/customer/password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: customerCookie },
    body: JSON.stringify({ currentPassword: "customer-test-123", newPassword: "customer-new-456" }),
  });
  assert.equal(passwordChange.status, 200);
  customerCookie = passwordChange.headers.get("set-cookie")?.split(";")[0];
  assert.ok(customerCookie?.startsWith("hatay360_customer_session="));

  const oldPasswordLogin = await fetch(`${base}/api/customer/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "a@example.com", password: "customer-test-123" }),
  });
  assert.equal(oldPasswordLogin.status, 401);

  const ticketCreate = await fetch(`${base}/api/customer/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: customerCookie },
    body: JSON.stringify({ subject: "Reklam sorusu", message: "Anahtar kelime raporunu paylaşır mısınız?", priority: "normal" }),
  });
  assert.equal(ticketCreate.status, 201);

  const serviceCreate = await fetch(`${base}/api/customer/service-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: customerCookie },
    body: JSON.stringify({ service: "Meta reklam yönetimi", details: "Yeni ürün grubumuz için teklif istiyoruz." }),
  });
  assert.equal(serviceCreate.status, 201);

  const invalidDomain = await fetch(`${base}/api/customer/domain-check?domain=gecersiz`, { headers: { Cookie: customerCookie } });
  assert.equal(invalidDomain.status, 400);

  const adminCustomers = await fetch(`${base}/api/admin/customers`, { headers: { Cookie: cookie } }).then((response) => response.json());
  assert.equal(adminCustomers.customers[0].company_name, "A Firması");
  assert.equal(adminCustomers.tickets[0].subject, "Reklam sorusu");
  assert.equal(adminCustomers.serviceRequests[0].service, "Meta reklam yönetimi");
});

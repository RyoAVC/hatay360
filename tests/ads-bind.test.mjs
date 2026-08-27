import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("Reklam hesap ID iskeleti canlı Google/Meta API çağırmaz", async (context) => {
  const dataDir = await mkdtemp(path.join(tmpdir(), "hatay360-ads-bind-"));
  const port = 3820 + Math.floor(Math.random() * 200);
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
    const timeout = setTimeout(() => reject(new Error("Test sunucusu başlamadı.")), 20_000);
    server.stdout.on("data", (chunk) => {
      if (String(chunk).includes("Hatay360 sunucusu")) {
        clearTimeout(timeout);
        resolve();
      }
    });
    server.stderr.on("data", (chunk) => reject(new Error(String(chunk))));
    server.once("exit", (code) => reject(new Error(`Test sunucusu erken kapandı: ${code}`)));
  });

  const noCookieReport = await fetch(`${base}/api/customer/ads-report`);
  assert.equal(noCookieReport.status, 401);
  const noCookieAdmin = await fetch(`${base}/api/admin/customers/1/ads-accounts`, { method: "PUT" });
  assert.equal(noCookieAdmin.status, 401);

  const login = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "test_admin", password: "test-password-api" }),
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie);

  const created = await fetch(`${base}/api/admin/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      companyName: "Ads Bind Firma",
      contactName: "Ali Test",
      email: "ads-bind@example.com",
      phone: "0555 111 22 33",
      password: "musteri-sifre-99",
    }),
  }).then((response) => response.json());
  const customerId = Number(created.id);
  assert.ok(customerId > 0);

  const profile = await fetch(`${base}/api/admin/customers/${customerId}`, { headers: { Cookie: cookie } }).then((response) =>
    response.json(),
  );
  assert.equal(profile.customer.googleAdsCustomerId, "");
  assert.equal(profile.customer.metaAdAccountId, "");

  const badGoogle = await fetch(`${base}/api/admin/customers/${customerId}/ads-accounts`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ googleAdsCustomerId: "123", metaAdAccountId: "" }),
  });
  assert.equal(badGoogle.status, 400);

  const badMeta = await fetch(`${base}/api/admin/customers/${customerId}/ads-accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ googleAdsCustomerId: "", metaAdAccountId: "act_abc" }),
  });
  assert.equal(badMeta.status, 400);

  const saved = await fetch(`${base}/api/admin/customers/${customerId}/ads-accounts`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ googleAdsCustomerId: "123-456-7890", metaAdAccountId: "act_9876543210" }),
  }).then(async (response) => {
    assert.equal(response.status, 200);
    return response.json();
  });
  assert.equal(saved.ok, true);
  assert.equal(saved.binding.live, false);
  assert.equal(saved.binding.googleBound, true);
  assert.equal(saved.binding.metaBound, true);
  assert.equal(saved.binding.googleId, "1234567890");
  assert.equal(saved.binding.metaId, "act_9876543210");
  assert.match(saved.binding.detail, /canlı API henüz bağlı değil/);

  const profileAfter = await fetch(`${base}/api/admin/customers/${customerId}`, { headers: { Cookie: cookie } }).then(
    (response) => response.json(),
  );
  assert.equal(profileAfter.customer.googleAdsCustomerId, "1234567890");
  assert.equal(profileAfter.customer.metaAdAccountId, "act_9876543210");

  const customerLogin = await fetch(`${base}/api/customer/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "ads-bind@example.com", password: "musteri-sifre-99" }),
  });
  assert.equal(customerLogin.status, 200);
  const customerCookie = customerLogin.headers.get("set-cookie")?.split(";")[0];
  assert.ok(customerCookie);

  const dash = await fetch(`${base}/api/customer/dashboard`, { headers: { Cookie: customerCookie } }).then((response) =>
    response.json(),
  );
  assert.equal(dash.adsConnection.live, false);
  assert.equal(dash.adsConnection.googleBound, true);
  assert.equal(dash.adsConnection.metaBound, true);
  assert.match(dash.adsConnection.detail, /Hatay360 kaydıdır/);

  const emptyReport = await fetch(`${base}/api/customer/ads-report?range=7`, { headers: { Cookie: customerCookie } }).then(
    (response) => response.json(),
  );
  assert.equal(emptyReport.range, 7);
  assert.equal(emptyReport.source, "none");
  assert.deepEqual(emptyReport.series, []);
  assert.equal(emptyReport.binding.live, false);

  const today = new Date();
  const day = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const dailySave = await fetch(`${base}/api/admin/customers/${customerId}/daily-metrics`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ day, adsClicks: 12, adsImpressions: 400, adsSpend: 9, siteVisitors: 3, siteSessions: 4 }),
  });
  assert.equal(dailySave.status, 200);

  const panelReport = await fetch(`${base}/api/customer/ads-report?range=30`, { headers: { Cookie: customerCookie } }).then(
    (response) => response.json(),
  );
  assert.equal(panelReport.range, 30);
  assert.equal(panelReport.source, "hatay360");
  assert.ok(panelReport.series.length >= 1);
  assert.equal(panelReport.series.some((row) => row.day === day && row.adsClicks === 12), true);
  assert.equal(panelReport.binding.live, false);
});

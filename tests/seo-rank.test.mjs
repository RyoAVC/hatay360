import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("SEO sıralama iskeleti kelime tutar, konum uydurmaz", async (context) => {
  const dataDir = await mkdtemp(path.join(tmpdir(), "hatay360-seo-rank-"));
  const port = 3800 + Math.floor(Math.random() * 200);
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

  const noCookieSeo = await fetch(`${base}/api/customer/seo`);
  assert.equal(noCookieSeo.status, 401);
  const noCookieDash = await fetch(`${base}/api/customer/dashboard`);
  assert.equal(noCookieDash.status, 401);
  const noCookieAdmin = await fetch(`${base}/api/admin/seo-keywords`);
  assert.equal(noCookieAdmin.status, 401);
  const noCookieExtras = await fetch(`${base}/api/admin/extra-services`);
  assert.equal(noCookieExtras.status, 401);

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
      companyName: "SEO Test Firma",
      contactName: "Ali Test",
      email: "seo-rank@example.com",
      phone: "0555 111 22 33",
      password: "musteri-sifre-99",
    }),
  }).then((response) => response.json());
  const customerId = Number(created.id);
  assert.ok(customerId > 0);

  const shortKw = await fetch(`${base}/api/admin/customers/${customerId}/seo-keywords`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ keyword: "a" }),
  });
  assert.equal(shortKw.status, 400);

  const added = await fetch(`${base}/api/admin/customers/${customerId}/seo-keywords`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ keyword: "  hatay web tasarım  " }),
  });
  assert.equal(added.status, 201);
  const addedBody = await added.json();
  assert.equal(addedBody.keywords.length, 1);
  assert.equal(addedBody.keywords[0].keyword, "hatay web tasarım");
  assert.equal(addedBody.keywords[0].position, null);
  assert.equal(addedBody.keywords[0].previousPosition, null);
  assert.equal(addedBody.keywords[0].delta, null);
  assert.equal(addedBody.keywords[0].lastChecked, null);
  assert.equal(addedBody.connected, false);

  const dup = await fetch(`${base}/api/admin/customers/${customerId}/seo-keywords`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ keyword: "hatay web tasarım" }),
  });
  assert.equal(dup.status, 409);

  const listed = await fetch(`${base}/api/admin/seo-keywords`, { headers: { Cookie: cookie } }).then((response) =>
    response.json(),
  );
  assert.equal(listed.connected, false);
  assert.equal(listed.keywords[0].position, null);
  assert.equal(listed.keywords[0].keyword, "hatay web tasarım");

  const customerLogin = await fetch(`${base}/api/customer/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "seo-rank@example.com", password: "musteri-sifre-99" }),
  });
  assert.equal(customerLogin.status, 200);
  const customerCookie = customerLogin.headers.get("set-cookie")?.split(";")[0];
  assert.ok(customerCookie);

  const seo = await fetch(`${base}/api/customer/seo`, { headers: { Cookie: customerCookie } }).then((response) =>
    response.json(),
  );
  assert.equal(seo.connected, false);
  assert.equal(seo.keywords.length, 1);
  assert.equal(seo.keywords[0].position, null);
  assert.match(seo.message, /bekleniyor/);

  const dash = await fetch(`${base}/api/customer/dashboard`, { headers: { Cookie: customerCookie } }).then((response) =>
    response.json(),
  );
  assert.equal(dash.seo.connected, false);
  assert.equal(dash.seo.keywords[0].position, null);

  const removed = await fetch(`${base}/api/admin/seo-keywords/${addedBody.keywords[0].id}`, {
    method: "DELETE",
    headers: { Cookie: cookie },
  });
  assert.equal(removed.status, 200);
  const after = await removed.json();
  assert.equal(after.keywords.length, 0);
});

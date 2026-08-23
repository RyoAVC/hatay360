import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("P6 çoklu kullanıcı / rol yönetimi akışı", async (context) => {
  const dataDir = await mkdtemp(path.join(tmpdir(), "hatay360-p6-test-"));
  const port = 3900 + Math.floor(Math.random() * 200);
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

  const jsonHeaders = { "Content-Type": "application/json" };
  const adminLogin = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ username: "test_admin", password: "test-password-api" }),
  });
  const adminCookie = adminLogin.headers.get("set-cookie")?.split(";")[0];

  // Firma (owner) oluştur
  const create = await fetch(`${base}/api/admin/customers`, {
    method: "POST",
    headers: { ...jsonHeaders, Cookie: adminCookie },
    body: JSON.stringify({ companyName: "C Firması", contactName: "Cem Test", email: "owner@example.com", phone: "0850 308 68 37", password: "owner-pass-1234" }),
  });
  assert.equal(create.status, 201);
  const customerId = (await create.json()).id;

  // Owner girişi -> tam yetki
  const ownerLogin = await fetch(`${base}/api/customer/login`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email: "owner@example.com", password: "owner-pass-1234" }),
  });
  assert.equal(ownerLogin.status, 200);
  const ownerBody = await ownerLogin.json();
  assert.equal(ownerBody.role, "full");
  const ownerCookie = ownerLogin.headers.get("set-cookie")?.split(";")[0];

  // Owner dashboard finansal alanları görür
  const ownerDash = await fetch(`${base}/api/customer/dashboard`, { headers: { Cookie: ownerCookie } }).then((r) => r.json());
  assert.equal(ownerDash.role, "full");
  assert.ok(Array.isArray(ownerDash.payments));
  assert.ok(Array.isArray(ownerDash.contracts));

  // Owner alt kullanıcı ekler (sınırlı)
  const addLimited = await fetch(`${base}/api/customer/users`, {
    method: "POST",
    headers: { ...jsonHeaders, Cookie: ownerCookie },
    body: JSON.stringify({ name: "Sınırlı Kişi", email: "limited@example.com", role: "limited", password: "limited-pass-1234" }),
  });
  assert.equal(addLimited.status, 201);
  const usersAfter = (await addLimited.json()).users;
  assert.equal(usersAfter.length, 1);
  assert.equal(usersAfter[0].role, "limited");
  assert.equal(usersAfter[0].email, "limited@example.com");
  assert.equal(usersAfter[0].password_hash, undefined);

  // Short password reddedilir
  const shortPass = await fetch(`${base}/api/customer/users`, {
    method: "POST",
    headers: { ...jsonHeaders, Cookie: ownerCookie },
    body: JSON.stringify({ name: "Kısa", email: "kisa@example.com", role: "limited", password: "short" }),
  });
  assert.equal(shortPass.status, 400);

  // Owner e-postası ile çakışma reddedilir
  const collide = await fetch(`${base}/api/customer/users`, {
    method: "POST",
    headers: { ...jsonHeaders, Cookie: ownerCookie },
    body: JSON.stringify({ name: "Çakışma", email: "owner@example.com", role: "limited", password: "collide-pass-1234" }),
  });
  assert.equal(collide.status, 409);

  // Sınırlı kullanıcı girişi -> rol limited
  const limitedLogin = await fetch(`${base}/api/customer/login`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email: "limited@example.com", password: "limited-pass-1234" }),
  });
  assert.equal(limitedLogin.status, 200);
  const limitedBody = await limitedLogin.json();
  assert.equal(limitedBody.role, "limited");
  assert.equal(limitedBody.customer.company_name, "C Firması");
  const limitedCookie = limitedLogin.headers.get("set-cookie")?.split(";")[0];

  // Sınırlı dashboard: finansal alanlar YOK
  const limitedDash = await fetch(`${base}/api/customer/dashboard`, { headers: { Cookie: limitedCookie } }).then((r) => r.json());
  assert.equal(limitedDash.role, "limited");
  assert.equal(limitedDash.payments, undefined);
  assert.equal(limitedDash.contracts, undefined);
  assert.equal(limitedDash.renewals, undefined);
  assert.equal(limitedDash.paymentSummary, undefined);
  assert.equal(limitedDash.invoices, undefined);

  // Sınırlı kullanıcı: güvenlik 403
  const limitedSecurity = await fetch(`${base}/api/customer/security`, { headers: { Cookie: limitedCookie } });
  assert.equal(limitedSecurity.status, 403);
  // Sınırlı kullanıcı: kullanıcı yönetimi 403
  const limitedUsers = await fetch(`${base}/api/customer/users`, { headers: { Cookie: limitedCookie } });
  assert.equal(limitedUsers.status, 403);
  // Sınırlı kullanıcı: website edit 403
  const limitedWebsite = await fetch(`${base}/api/customer/website`, {
    method: "POST",
    headers: { ...jsonHeaders, Cookie: limitedCookie },
    body: JSON.stringify({ phone: "0555 000 00 00" }),
  });
  assert.equal(limitedWebsite.status, 403);
  // Sınırlı kullanıcı: onaylar açık (200)
  const limitedApprovals = await fetch(`${base}/api/customer/approvals`, { headers: { Cookie: limitedCookie } });
  assert.equal(limitedApprovals.status, 200);

  // Owner kullanıcı listesi (200)
  const ownerUsers = await fetch(`${base}/api/customer/users`, { headers: { Cookie: ownerCookie } });
  assert.equal(ownerUsers.status, 200);
  assert.equal((await ownerUsers.json()).users.length, 1);

  // Admin firma alt kullanıcıları görür
  const adminUsers = await fetch(`${base}/api/admin/customers/${customerId}/users`, { headers: { Cookie: adminCookie } });
  assert.equal(adminUsers.status, 200);
  const adminUsersBody = await adminUsers.json();
  assert.equal(adminUsersBody.users.length, 1);
  const subUserId = adminUsersBody.users[0].id;

  // Admin rolü tam yetkiliye çıkarır -> aktif oturum rolü senkronlanır
  const promote = await fetch(`${base}/api/admin/users/${subUserId}`, {
    method: "PUT",
    headers: { ...jsonHeaders, Cookie: adminCookie },
    body: JSON.stringify({ role: "full" }),
  });
  assert.equal(promote.status, 200);
  const promotedDash = await fetch(`${base}/api/customer/dashboard`, { headers: { Cookie: limitedCookie } }).then((r) => r.json());
  assert.equal(promotedDash.role, "full");
  assert.ok(Array.isArray(promotedDash.payments));

  // Admin pasifleştirir -> oturum düşer
  const disable = await fetch(`${base}/api/admin/users/${subUserId}`, {
    method: "PUT",
    headers: { ...jsonHeaders, Cookie: adminCookie },
    body: JSON.stringify({ status: "disabled" }),
  });
  assert.equal(disable.status, 200);
  const disabledSession = await fetch(`${base}/api/customer/dashboard`, { headers: { Cookie: limitedCookie } });
  assert.equal(disabledSession.status, 401);
  const disabledLogin = await fetch(`${base}/api/customer/login`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email: "limited@example.com", password: "limited-pass-1234" }),
  });
  assert.equal(disabledLogin.status, 401);

  // Admin siler
  const del = await fetch(`${base}/api/admin/users/${subUserId}`, { method: "DELETE", headers: { Cookie: adminCookie } });
  assert.equal(del.status, 200);
  assert.equal((await del.json()).users.length, 0);

  // Owner hâlâ giriş yapabiliyor (geriye dönük uyumluluk)
  const ownerReLogin = await fetch(`${base}/api/customer/login`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email: "owner@example.com", password: "owner-pass-1234" }),
  });
  assert.equal(ownerReLogin.status, 200);
  assert.equal((await ownerReLogin.json()).role, "full");
});

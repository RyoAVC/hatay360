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
      CRON_SECRET: "",
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

  const health = await fetch(`${base}/api/health`).then((response) => response.json());
  assert.equal(health.ok, true);
  assert.equal(health.database, "sqlite");

  const unauthorizedSave = await fetch(`${base}/api/content`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: {} }),
  });
  assert.equal(unauthorizedSave.status, 401);
  const unauthorizedTerms = await fetch(`${base}/api/admin/franchise-terms/hatay360`);
  assert.equal(unauthorizedTerms.status, 401);

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
  let cookie = loginResponse.headers.get("set-cookie")?.split(";")[0];
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

  const initialTerms = await fetch(`${base}/api/admin/franchise-terms/hatay360`, { headers: { Cookie: cookie } }).then((response) => response.json());
  assert.equal(initialTerms.terms.brandId, "hatay360");
  assert.equal(initialTerms.terms.ornekPlaceholder, true);
  const savedTermsResponse = await fetch(`${base}/api/admin/franchise-terms/hatay360`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      terms: {
        katilimUcretiTl: 12500,
        odemePeriyodu: "ceyreklik",
        ornekPlaceholder: false,
        kategoriler: [{ id: "web", ad: "Web Tasarım", tekrarTipi: "tek_seferlik", komisyonOrani: 22.5 }],
      },
    }),
  });
  assert.equal(savedTermsResponse.status, 200);
  const savedTerms = await savedTermsResponse.json();
  assert.equal(savedTerms.terms.katilimUcretiTl, 12500);
  assert.equal(savedTerms.terms.kategoriler[0].komisyonOrani, 22.5);
  const persistedTerms = await fetch(`${base}/api/admin/franchise-terms/hatay360`, { headers: { Cookie: cookie } }).then((response) => response.json());
  assert.equal(persistedTerms.terms.odemePeriyodu, "ceyreklik");

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
    body: JSON.stringify({ companyName: "A Firması", contactName: "Ayşe Test", nationalId: "12345678901", email: "a@example.com", phone: "0850 308 68 37", password: "customer-test-123" }),
  });
  assert.equal(customerCreate.status, 201);
  const customerId = (await customerCreate.json()).id;

  const duplicatePhoneCustomer = await fetch(`${base}/api/admin/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ companyName: "Çift Firma", contactName: "Çift Test", email: "cift@example.com", phone: "0850 308 68 37", password: "customer-dup-123" }),
  });
  assert.equal(duplicatePhoneCustomer.status, 409);

  const duplicateLead = await fetch(`${base}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Çift Müşteri", phone: "0850 308 68 37", service: "Web tasarım", sourcePath: "/iletisim" }),
  });
  assert.equal(duplicateLead.status, 409);

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
  assert.equal(customerDashboard.adsConnection.live, false);
  assert.equal(customerDashboard.adsConnection.googleBound, false);
  assert.equal(customerDashboard.adsConnection.metaBound, false);
  assert.match(String(customerDashboard.adsConnection.detail), /eşleşmedi/);
  assert.ok(customerDashboard.dailyMetrics.length >= 7);
  const sampleDay = customerDashboard.dailyMetrics[customerDashboard.dailyMetrics.length - 1];
  assert.notEqual(sampleDay.adsClicks, sampleDay.siteVisitors);
  assert.ok(sampleDay.adsClicks > sampleDay.siteVisitors);
  assert.equal(customerDashboard.website.canEdit, false);
  assert.ok(customerDashboard.project);
  assert.equal(typeof customerDashboard.project.lastNote, "string");
  assert.equal(typeof customerDashboard.project.lastNoteAt, "string");

  const blockedWebsite = await fetch(`${base}/api/customer/website`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: customerCookie },
    body: JSON.stringify({ phone: "0850 308 68 37", address: "Kıbrıs Caddesi No:13", hours: "09:00–18:00", logoUrl: "" }),
  });
  assert.equal(blockedWebsite.status, 403);

  const packageAssign = await fetch(`${base}/api/admin/customers/${customerId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ packageId: "start", websiteUrl: "https://ornek-firma.hatay360.com", sslStatus: "active", lastBackupAt: "2026-08-18", lastUpdateAt: "2026-08-20" }),
  });
  assert.equal(packageAssign.status, 200);

  const contractDetailsSave = await fetch(`${base}/api/admin/customers/${customerId}/contracts/details`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ nationalId: "12345678901", packageId: "start", yearlyAmount: 120000, packageDescription: "Google Ads ve Meta reklam yönetimi", websiteUrl: "https://ornek-firma.hatay360.com" }),
  });
  assert.equal(contractDetailsSave.status, 200);
  const automaticContract = await fetch(`${base}/api/admin/customers/${customerId}/contracts/automatic`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({}),
  });
  assert.equal(automaticContract.status, 201);
  const automaticPayload = await automaticContract.json();
  assert.deepEqual(automaticPayload.missingFields, []);
  assert.match(automaticPayload.contracts[0].bodyHtml, /120\.000,00/);
  assert.doesNotMatch(automaticPayload.contracts[0].bodyHtml, /Alan Adı \(Domain\):/);
  const automaticFile = await fetch(`${base}/api/admin/customers/${customerId}/contracts/${automaticPayload.id}/file`, { headers: { Cookie: cookie } });
  assert.equal(automaticFile.status, 200);
  const automaticPdf = Buffer.from(await automaticFile.arrayBuffer());
  assert.equal(automaticPdf.subarray(0, 5).toString("ascii"), "%PDF-");
  assert.ok((automaticPdf.toString("latin1").match(/\/Type \/Page\b/g) || []).length >= 3);

  const emptyDatePatch = await fetch(`${base}/api/admin/customers/${customerId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ packageId: "start", lastBackupAt: "", lastUpdateAt: "" }),
  });
  assert.equal(emptyDatePatch.status, 200);
  const afterEmptyDates = await fetch(`${base}/api/customer/dashboard`, { headers: { Cookie: customerCookie } }).then((response) => response.json());
  assert.equal(afterEmptyDates.website.lastBackupAt, "2026-08-18");
  assert.equal(afterEmptyDates.website.lastUpdateAt, "2026-08-20");

  const mapsAttach = await fetch(`${base}/api/admin/customers/${customerId}/maps`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ businessName: "A Firması", status: "live", mapsUrl: "https://maps.google.com/?q=A+Firmasi", address: "Kıbrıs Caddesi No:13", phone: "0850 308 68 37" }),
  });
  assert.equal(mapsAttach.status, 201);

  const mapsPause = await fetch(`${base}/api/admin/customers/${customerId}/maps`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      businessName: "A Firması",
      status: "paused",
      mapsUrl: "https://maps.google.com/?q=A+Firmasi",
      address: "Kıbrıs Caddesi No:13",
      phone: "0850 308 68 37",
    }),
  });
  assert.equal(mapsPause.status, 200);
  const mapsPauseBody = await mapsPause.json();
  assert.equal(mapsPauseBody.updated, true);

  const adminCustomersAfterMaps = await fetch(`${base}/api/admin/customers`, { headers: { Cookie: cookie } }).then((response) =>
    response.json(),
  );
  const savedMaps = (adminCustomersAfterMaps.maps || []).find((row) => Number(row.customer_id) === Number(customerId));
  assert.ok(savedMaps);
  assert.equal(savedMaps.status, "paused");

  const dailySave = await fetch(`${base}/api/admin/customers/${customerId}/daily-metrics`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ day: "2026-08-20", adsClicks: 1000, adsImpressions: 18000, adsSpend: 410, siteVisitors: 5, siteSessions: 6 }),
  });
  assert.equal(dailySave.status, 200);

  const websiteSave = await fetch(`${base}/api/customer/website`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: customerCookie },
    body: JSON.stringify({ phone: "0850 308 68 37", address: "Kıbrıs Caddesi No:13", hours: "Pzt–Cuma 09:00–18:00", logoUrl: "https://hatay360.com/logo.png" }),
  });
  assert.equal(websiteSave.status, 200);

  const portalAfter = await fetch(`${base}/api/customer/dashboard`, { headers: { Cookie: customerCookie } }).then((response) => response.json());
  assert.equal(portalAfter.website.canEdit, true);
  assert.equal(portalAfter.website.phone, "0850 308 68 37");
  assert.equal(portalAfter.website.siteStatus, "open");
  assert.equal(portalAfter.maps[0].businessName, "A Firması");
  assert.equal(portalAfter.maps[0].status, "paused");
  const day20 = portalAfter.dailyMetrics.find((row) => row.day === "2026-08-20");
  assert.equal(day20.adsClicks, 1000);
  assert.equal(day20.siteVisitors, 5);
  assert.equal(day20.source, "panel");

  const siteStatusSave = await fetch(`${base}/api/admin/customers/${customerId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ siteStatus: "maintenance", companyName: "A Firması", status: "active" }),
  });
  assert.equal(siteStatusSave.status, 200);

  const paymentUnpaid = await fetch(`${base}/api/admin/customers/${customerId}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ period: "2026-09", amount: 1000, status: "unpaid", startDate: "2026-09-01", endDate: "2026-09-30" }),
  });
  assert.equal(paymentUnpaid.status, 200);
  const paymentPaid = await fetch(`${base}/api/admin/customers/${customerId}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ period: "2026-06", amount: 1000, status: "paid", startDate: "2026-06-01", endDate: "2026-06-30" }),
  });
  assert.equal(paymentPaid.status, 200);
  const paymentPartial = await fetch(`${base}/api/admin/customers/${customerId}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ period: "2026-08", amount: 1000, paidAmount: 400, status: "remaining", startDate: "2026-08-01", endDate: "2026-08-31" }),
  });
  assert.equal(paymentPartial.status, 200);
  const paymentPartialBody = await paymentPartial.json();
  assert.equal(paymentPartialBody.paymentSummary.unpaid, 1600);
  assert.equal(paymentPartialBody.paymentSummary.remaining, 1600);
  assert.equal(paymentPartialBody.paymentSummary.penalty, 0);

  const catalogAdd = await fetch(`${base}/api/admin/customers/${customerId}/catalog`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ kind: "invoice", title: "Ağustos bakım", amount: 1000, quantity: 1 }),
  });
  assert.equal(catalogAdd.status, 201);

  const pdfData = Buffer.from("%PDF-1.1\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF").toString("base64");
  const contractUpload = await fetch(`${base}/api/admin/customers/${customerId}/contracts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ title: "Hizmet sözleşmesi", fileName: "sozlesme.pdf", data: pdfData }),
  });
  assert.equal(contractUpload.status, 201);
  const contractPayload = await contractUpload.json();
  const contractId = contractPayload.id;
  assert.equal(contractPayload.contracts[0].current, true);

  const contractFile = await fetch(`${base}/api/admin/customers/${customerId}/contracts/${contractId}/file`, { headers: { Cookie: cookie } });
  assert.equal(contractFile.status, 200);
  assert.equal(contractFile.headers.get("content-type"), "application/pdf");
  assert.ok((await contractFile.text()).startsWith("%PDF-"));

  const secondContract = await fetch(`${base}/api/admin/customers/${customerId}/contracts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ title: "Hizmet sözleşmesi v2", fileName: "sozlesme-v2.pdf", data: pdfData, familyId: contractPayload.contracts[0].familyId }),
  });
  assert.equal(secondContract.status, 201);
  const restored = await fetch(`${base}/api/admin/customers/${customerId}/contracts/${contractId}/restore`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({}),
  });
  assert.equal(restored.status, 200);

  const otherCustomer = await fetch(`${base}/api/admin/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ companyName: "B Firması", contactName: "Berk Test", email: "b@example.com", phone: "0532 111 22 33", password: "customer-b-123" }),
  });
  assert.equal(otherCustomer.status, 201);
  const otherLogin = await fetch(`${base}/api/customer/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "b@example.com", password: "customer-b-123" }),
  });
  const otherCookie = otherLogin.headers.get("set-cookie")?.split(";")[0];
  const leaked = await fetch(`${base}/api/customer/contracts/${contractId}/file`, { headers: { Cookie: otherCookie } });
  assert.equal(leaked.status, 404);

  const passwordReset = await fetch(`${base}/api/admin/customers/${customerId}/password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ password: "admin-set-pass-99" }),
  });
  assert.equal(passwordReset.status, 200);

  const oldCustomerSession = await fetch(`${base}/api/customer/dashboard`, { headers: { Cookie: customerCookie } });
  assert.equal(oldCustomerSession.status, 401);

  const newCustomerLogin = await fetch(`${base}/api/customer/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "a@example.com", password: "admin-set-pass-99" }),
  });
  assert.equal(newCustomerLogin.status, 200);
  customerCookie = newCustomerLogin.headers.get("set-cookie")?.split(";")[0];

  const billedPortal = await fetch(`${base}/api/customer/dashboard`, { headers: { Cookie: customerCookie } }).then((response) => response.json());
  assert.equal(billedPortal.website.siteStatus, "maintenance");
  assert.equal(billedPortal.paymentSummary.paid, 1400);
  assert.equal(billedPortal.paymentSummary.unpaid, 1600);
  assert.equal(billedPortal.paymentSummary.remaining, 1600);
  assert.equal(billedPortal.paymentSummary.penalty, 0);

  const overduePay = await fetch(`${base}/api/admin/customers/${customerId}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ period: "2026-04", amount: 200, status: "unpaid", startDate: "2026-04-01", endDate: "2026-04-30" }),
  });
  assert.equal(overduePay.status, 200);
  const overdueBody = await overduePay.json();
  assert.equal(overdueBody.paymentSummary.remaining, 1830);
  assert.equal(overdueBody.paymentSummary.penalty, 30);
  const april = overdueBody.payments.find((item) => item.period === "2026-04");
  assert.ok(april);
  const aprilEdit = await fetch(`${base}/api/admin/customers/${customerId}/payments/${april.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ amount: 400, startDate: "2026-04-01", endDate: "2026-04-30", status: "unpaid" }),
  });
  assert.equal(aprilEdit.status, 200);
  const aprilEdited = await aprilEdit.json();
  assert.equal(aprilEdited.paymentSummary.remaining, 2060);
  assert.equal(aprilEdited.payments.find((item) => item.id === april.id).endDate, "2026-04-30");
  assert.equal(billedPortal.invoices[0].title, "Ağustos bakım");
  assert.ok(billedPortal.contracts.length >= 2);

  const customerSigned = await fetch(`${base}/api/customer/contracts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: customerCookie },
    body: JSON.stringify({ title: "İmzalı kopya", fileName: "imzali.pdf", data: pdfData }),
  });
  assert.equal(customerSigned.status, 201);
  const adminSeesUpload = await fetch(`${base}/api/admin/customers/${customerId}`, { headers: { Cookie: cookie } }).then((response) => response.json());
  assert.ok(adminSeesUpload.contracts.some((item) => item.uploadedBy === "customer"));
  assert.equal(adminSeesUpload.customer.password_hash, undefined);

  const badFile = await fetch(`${base}/api/admin/customers/${customerId}/contracts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ fileName: "../secret.txt", data: Buffer.from("not-a-pdf").toString("base64") }),
  });
  assert.equal(badFile.status, 400);

  const wrongPasswordChange = await fetch(`${base}/api/customer/password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: customerCookie },
    body: JSON.stringify({ currentPassword: "yanlis-sifre", newPassword: "customer-new-456" }),
  });
  assert.equal(wrongPasswordChange.status, 401);

  const unauthorizedCustomerSecurity = await fetch(`${base}/api/customer/security`);
  assert.equal(unauthorizedCustomerSecurity.status, 401);

  const customerSecurity = await fetch(`${base}/api/customer/security`, { headers: { Cookie: customerCookie } }).then((response) => response.json());
  assert.equal(customerSecurity.email, "a@example.com");
  assert.ok(customerSecurity.activeSessions >= 1);
  assert.ok(Array.isArray(customerSecurity.events));
  assert.ok(Array.isArray(customerSecurity.sessions));
  assert.ok(customerSecurity.sessions.some((session) => session.current === true));
  assert.ok(customerSecurity.sessions.every((session) => typeof session.id === "string" && session.id.length === 8));
  assert.ok(!JSON.stringify(customerSecurity.sessions).includes("token_hash"));

  const secondCustomerLogin = await fetch(`${base}/api/customer/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "a@example.com", password: "admin-set-pass-99" }),
  });
  assert.equal(secondCustomerLogin.status, 200);
  const secondCustomerCookie = secondCustomerLogin.headers.get("set-cookie")?.split(";")[0];
  assert.ok(secondCustomerCookie?.startsWith("hatay360_customer_session="));

  const customerRevokeOthers = await fetch(`${base}/api/customer/sessions/revoke-others`, {
    method: "POST",
    headers: { Cookie: customerCookie },
  }).then((response) => response.json());
  assert.equal(customerRevokeOthers.ok, true);
  assert.ok(customerRevokeOthers.revoked >= 1);

  const revokedCustomerSession = await fetch(`${base}/api/customer/security`, { headers: { Cookie: secondCustomerCookie } });
  assert.equal(revokedCustomerSession.status, 401);

  const passwordChange = await fetch(`${base}/api/customer/password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: customerCookie },
    body: JSON.stringify({ currentPassword: "admin-set-pass-99", newPassword: "customer-new-456" }),
  });
  assert.equal(passwordChange.status, 200);
  customerCookie = passwordChange.headers.get("set-cookie")?.split(";")[0];
  assert.ok(customerCookie?.startsWith("hatay360_customer_session="));
  const passwordPayload = await passwordChange.json();
  assert.match(passwordPayload.message || "", /oturum/i);

  const oldPasswordLogin = await fetch(`${base}/api/customer/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "a@example.com", password: "customer-test-123" }),
  });
  assert.equal(oldPasswordLogin.status, 401);

  // Vitrin sıfırla: müşteri sıra numarası gerçek kuyrukla birebir eşleşsin (test deterministik).
  const vitrinZero = await fetch(`${base}/api/admin/ticket-vitrin`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ open: 0, answering: 0, answered: 0, whatsappWaiting: 0 }),
  });
  assert.equal(vitrinZero.status, 200);

  const ticketCreate = await fetch(`${base}/api/customer/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: customerCookie },
    body: JSON.stringify({ subject: "Reklam sorusu", message: "Anahtar kelime raporunu paylaşır mısınız?", priority: "normal" }),
  });
  assert.equal(ticketCreate.status, 201);
  const ticketA = await ticketCreate.json();
  assert.equal(ticketA.queuePosition, 1);

  const serviceCreate = await fetch(`${base}/api/customer/service-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: customerCookie },
    body: JSON.stringify({ service: "Meta reklam yönetimi", details: "Yeni ürün grubumuz için teklif istiyoruz." }),
  });
  assert.equal(serviceCreate.status, 201);

  const invalidDomain = await fetch(`${base}/api/customer/domain-check?domain=gecersiz`, { headers: { Cookie: customerCookie } });
  assert.equal(invalidDomain.status, 400);

  const batchDomain = await fetch(`${base}/api/customer/domain-check`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: customerCookie },
    body: JSON.stringify({ domains: ["example.com", "hatay360-unlikely-xyz-test.com"] }),
  });
  assert.equal(batchDomain.status, 200);
  const batchBody = await batchDomain.json();
  assert.ok(Array.isArray(batchBody.checks));
  assert.equal(batchBody.checks.length, 2);
  assert.ok(batchBody.checks.every((item) => item.domain && item.result && item.note && item.signals));
  assert.equal(batchBody.checks[0].domain, "example.com");
  assert.equal(batchBody.checks[0].result, "registered");

  const adminCustomers = await fetch(`${base}/api/admin/customers`, { headers: { Cookie: cookie } }).then((response) => response.json());
  assert.ok(adminCustomers.customers.some((customer) => customer.company_name === "A Firması"));
  assert.ok(Array.isArray(adminCustomers.domainChecks));
  assert.ok(adminCustomers.domainChecks.some((item) => item.domain === "example.com"));
  assert.equal(adminCustomers.tickets[0].subject, "Reklam sorusu");
  assert.equal(adminCustomers.serviceRequests[0].service, "Meta reklam yönetimi");

  const ticketBCreate = await fetch(`${base}/api/customer/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: otherCookie },
    body: JSON.stringify({ subject: "Site sorusu", message: "SSL ne zaman açılır, bekliyoruz.", priority: "normal" }),
  });
  assert.equal(ticketBCreate.status, 201);
  const ticketB = await ticketBCreate.json();
  assert.equal(ticketB.queuePosition, 2);

  const liveA = await fetch(`${base}/api/customer/support-live`, { headers: { Cookie: customerCookie } }).then((response) => response.json());
  assert.ok(liveA.hatay360.waiting >= 2);
  assert.equal(liveA.mine.ticketPosition, 1);
  assert.equal(liveA.ecosystem.sisterSystems, 2);
  assert.ok(liveA.hatay360.answering >= 0);

  const liveB = await fetch(`${base}/api/customer/support-live`, { headers: { Cookie: otherCookie } }).then((response) => response.json());
  assert.equal(liveB.mine.ticketPosition, 2);

  const advanceTicket = await fetch(`${base}/api/admin/tickets/${ticketA.id}/advance`, { method: "POST", headers: { Cookie: cookie } });
  assert.equal(advanceTicket.status, 200);

  const liveBAfter = await fetch(`${base}/api/customer/support-live`, { headers: { Cookie: otherCookie } }).then((response) => response.json());
  assert.equal(liveBAfter.mine.ticketPosition, 1);
  const liveAAfter = await fetch(`${base}/api/customer/support-live`, { headers: { Cookie: customerCookie } }).then((response) => response.json());
  assert.equal(liveAAfter.mine.ticketServing, true);
  assert.ok(liveAAfter.hatay360.waiting >= 1);

  const wpA = await fetch(`${base}/api/customer/whatsapp-queue`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: customerCookie },
    body: JSON.stringify({}),
  });
  assert.equal(wpA.status, 201);
  const wpABody = await wpA.json();
  assert.equal(wpABody.queuePosition, 1);

  const wpB = await fetch(`${base}/api/customer/whatsapp-queue`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: otherCookie },
    body: JSON.stringify({}),
  });
  assert.equal(wpB.status, 201);
  const wpBBody = await wpB.json();
  assert.equal(wpBBody.queuePosition, 2);

  const wpAdvance = await fetch(`${base}/api/admin/whatsapp-queue/${wpABody.id}/advance`, { method: "POST", headers: { Cookie: cookie } });
  assert.equal(wpAdvance.status, 200);
  const liveBWp = await fetch(`${base}/api/customer/support-live`, { headers: { Cookie: otherCookie } }).then((response) => response.json());
  assert.equal(liveBWp.mine.whatsappPosition, 1);
  const adminQueue = await fetch(`${base}/api/admin/customers`, { headers: { Cookie: cookie } }).then((response) => response.json());
  assert.ok(adminQueue.whatsappQueue.some((item) => item.id === wpBBody.id && item.queue_position === 1));

  const mapsLead = await fetch(`${base}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Harita Yetkili",
      phone: "0555 333 44 55",
      email: "harita@example.com",
      kind: "maps",
      sector: "Klinik",
      district: "Defne",
      address: "Atatürk Cad. No:10",
      hours: "Pazartesi 09:00–18:00",
      smsOk: true,
    }),
  });
  assert.equal(mapsLead.status, 201);
  const mapsLeadBody = await mapsLead.json();

  const mapsLeadAgain = await fetch(`${base}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.0.24" },
    body: JSON.stringify({
      name: "Harita Yetkili",
      phone: "0555 333 44 55",
      email: "harita-ek@example.com",
      kind: "maps",
      notes: "Müşteri başvurusu · /musteri/kayit",
      sourcePath: "/musteri/kayit",
    }),
  });
  assert.equal(mapsLeadAgain.status, 201);
  const mapsLeadAgainBody = await mapsLeadAgain.json();
  assert.equal(mapsLeadAgainBody.merged, true);
  assert.equal(mapsLeadAgainBody.id, mapsLeadBody.id);

  const mapsLeads = await fetch(`${base}/api/leads`, { headers: { Cookie: cookie } }).then((response) => response.json());
  const mapsPhoneTail = (value) => String(value || "").replace(/\D/g, "").slice(-10);
  const mapsSamePhone = mapsLeads.leads.filter(
    (lead) => lead.kind === "maps" && mapsPhoneTail(lead.phone) === "5553334455",
  );
  assert.equal(mapsSamePhone.length, 1);
  assert.equal(mapsLeads.leads[0].kind, "maps");
  assert.equal(mapsLeads.leads[0].district, "Defne");

  const approveMaps = await fetch(`${base}/api/admin/leads/${mapsLeads.leads[0].id}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({}),
  });
  assert.equal(approveMaps.status, 200);
  const approvedMaps = await approveMaps.json();
  assert.equal(approvedMaps.email, "harita@example.com");
  assert.ok(String(approvedMaps.generatedPassword).length >= 12);
  const mapsCustomerLogin = await fetch(`${base}/api/customer/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "harita@example.com", password: approvedMaps.generatedPassword }),
  });
  assert.equal(mapsCustomerLogin.status, 200);
  const mapsAccount = await fetch(`${base}/api/admin/customers/${approvedMaps.customerId}`, { headers: { Cookie: cookie } }).then((response) => response.json());
  assert.equal(mapsAccount.customer.password_hash, undefined);
  assert.equal(mapsAccount.customer.contact_name, "Harita Yetkili");

  const templates = await fetch(`${base}/api/admin/contract-templates`, { headers: { Cookie: cookie } }).then((response) => response.json());
  assert.ok(templates.templates.length >= 1);
  const fromTemplate = await fetch(`${base}/api/admin/customers/${approvedMaps.customerId}/contracts/from-template`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ templateId: templates.templates[0].id }),
  });
  assert.equal(fromTemplate.status, 201);
  const assigned = await fromTemplate.json();
  assert.equal(assigned.contracts[0].signStatus, "pending");

  const vitrinSave = await fetch(`${base}/api/admin/ticket-vitrin`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ open: 21, answering: 4, answered: 90 }),
  });
  assert.equal(vitrinSave.status, 200);
  const vitrinPayload = await vitrinSave.json();
  assert.equal(vitrinPayload.vitrin.open, 21);
  assert.ok(vitrinPayload.real);

  const botLead = await fetch(`${base}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Bot",
      phone: "0555 111 22 33",
      company_fax: "spam",
    }),
  });
  assert.equal(botLead.status, 201);
  const afterBot = await fetch(`${base}/api/leads`, { headers: { Cookie: cookie } }).then((response) => response.json());
  assert.equal(afterBot.leads.some((lead) => lead.name === "Bot"), false);
  assert.equal(mapsLead.headers.get("x-frame-options"), "SAMEORIGIN");

  const notJson = await fetch(`${base}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: "name=Bot",
  });
  assert.equal(notJson.status, 415);

  const partnerRegister = await fetch(`${base}/api/partners/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      companyName: "Örnek Web Tasarım",
      contactName: "Ali Bayi",
      email: "bayi@example.com",
      phone: "0555 444 55 66",
      city: "Antakya",
      password: "partner-test-123",
    }),
  });
  assert.equal(partnerRegister.status, 201);

  const pendingLogin = await fetch(`${base}/api/partners/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "bayi@example.com", password: "partner-test-123" }),
  });
  assert.equal(pendingLogin.status, 403);

  const partners = await fetch(`${base}/api/admin/partners`, { headers: { Cookie: cookie } }).then((response) => response.json());
  assert.equal(partners.partners[0].company_name, "Örnek Web Tasarım");
  const partnerId = partners.partners[0].id;

  const activatePartner = await fetch(`${base}/api/admin/partners/${partnerId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ status: "active", commissionRate: 18 }),
  });
  assert.equal(activatePartner.status, 200);

  const partnerLogin = await fetch(`${base}/api/partners/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "bayi@example.com", password: "partner-test-123" }),
  });
  assert.equal(partnerLogin.status, 200);
  const partnerCookie = partnerLogin.headers.get("set-cookie")?.split(";")[0];
  assert.ok(partnerCookie?.startsWith("hatay360_partner_session="));
  const partnerTerms = await fetch(`${base}/api/partners/franchise-terms/hatay360`, { headers: { Cookie: partnerCookie } }).then((response) => response.json());
  assert.equal(partnerTerms.terms.katilimUcretiTl, 12500);
  assert.equal(partnerTerms.terms.kategoriler[0].komisyonOrani, 22.5);
  const contractData = await fetch(`${base}/api/partners/contract`, { headers: { Cookie: partnerCookie } }).then((response) => response.json());
  assert.equal(contractData.legalTextReady, false);
  assert.equal(contractData.terms.katilimUcretiTl, 12500);
  const contractPdf = await fetch(`${base}/api/partners/contract.pdf`, { headers: { Cookie: partnerCookie } });
  assert.equal(contractPdf.status, 200);
  assert.equal(contractPdf.headers.get("content-type"), "application/pdf");
  const blockedContractAccept = await fetch(`${base}/api/partners/contract/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: partnerCookie },
    body: JSON.stringify({ fullName: "Ali Bayi", accepted: true }),
  });
  assert.equal(blockedContractAccept.status, 409);
  const partnerQuoteCreate = await fetch(`${base}/api/partners/quotes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: partnerCookie },
    body: JSON.stringify({ customerName: "Defne Klinik", service: "Kurumsal web sitesi", amount: 45000, notes: "Mobil uyumlu kurumsal site" }),
  });
  assert.equal(partnerQuoteCreate.status, 201);
  const partnerQuoteId = (await partnerQuoteCreate.json()).id;
  const partnerQuotes = await fetch(`${base}/api/partners/quotes`, { headers: { Cookie: partnerCookie } }).then((response) => response.json());
  assert.equal(partnerQuotes.quotes[0].customer_name, "Defne Klinik");
  const partnerQuotePdf = await fetch(`${base}/api/partners/quotes/${partnerQuoteId}.pdf`, { headers: { Cookie: partnerCookie } });
  assert.equal(partnerQuotePdf.status, 200);
  assert.equal(partnerQuotePdf.headers.get("content-type"), "application/pdf");
  const partnerCertificate = await fetch(`${base}/api/partners/certificate.pdf`, { headers: { Cookie: partnerCookie } });
  assert.equal(partnerCertificate.status, 200);
  assert.equal(partnerCertificate.headers.get("content-type"), "application/pdf");

  // Onay endpoint'i kayıt şifresini korumalı (şifre yeniden üretmemeli)
  const partnerRegister2 = await fetch(`${base}/api/partners/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      companyName: "Onay Test Firma",
      contactName: "Onay Bayi",
      email: "bayi-onay@example.com",
      phone: "0555 444 55 77",
      city: "İskenderun",
      password: "partner-approve-123",
    }),
  });
  assert.equal(partnerRegister2.status, 201);
  const partners2 = await fetch(`${base}/api/admin/partners`, { headers: { Cookie: cookie } }).then((response) => response.json());
  const partner2 = partners2.partners.find((item) => item.email === "bayi-onay@example.com");
  assert.ok(partner2);
  const approvePartner = await fetch(`${base}/api/admin/partners/${partner2.id}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({}),
  });
  assert.equal(approvePartner.status, 200);
  const approveBody = await approvePartner.json();
  assert.equal(approveBody.passwordKept, true);
  assert.equal(approveBody.email, "bayi-onay@example.com");
  const approvedLogin = await fetch(`${base}/api/partners/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "bayi-onay@example.com", password: "partner-approve-123" }),
  });
  assert.equal(approvedLogin.status, 200);

  const partnerDashboard = await fetch(`${base}/api/partners/dashboard`, { headers: { Cookie: partnerCookie } }).then((response) => response.json());
  assert.equal(partnerDashboard.partner.commission_rate, 18);

  const unauthorizedReferral = await fetch(`${base}/api/partners/referrals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Kaçak Lead", phone: "0555 111 22 33" }),
  });
  assert.equal(unauthorizedReferral.status, 401);

  const publicReferralBlocked = await fetch(`${base}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Kaçak Lead", phone: "0555 111 22 33", kind: "partner_referral" }),
  });
  assert.equal(publicReferralBlocked.status, 400);

  const partnerReferral = await fetch(`${base}/api/partners/referrals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: partnerCookie },
    body: JSON.stringify({
      name: "Defne Eczanesi",
      phone: "0555 222 33 44",
      email: "eczane@example.com",
      service: "Web sitesi",
      sector: "Eczane",
      district: "Defne",
      notes: "Paket B konuşuldu",
    }),
  });
  assert.equal(partnerReferral.status, 201);
  const partnerReferralBody = await partnerReferral.json();
  assert.ok(partnerReferralBody.id > 0);

  const partnerReferrals = await fetch(`${base}/api/partners/referrals`, { headers: { Cookie: partnerCookie } }).then((response) => response.json());
  assert.equal(partnerReferrals.referrals.length, 1);
  assert.equal(partnerReferrals.referrals[0].name, "Defne Eczanesi");
  assert.equal(partnerReferrals.referrals[0].status, "new");

  const adminLeadsAfterReferral = await fetch(`${base}/api/leads`, { headers: { Cookie: cookie } }).then((response) => response.json());
  const referralLead = adminLeadsAfterReferral.leads.find((lead) => lead.id === partnerReferralBody.id);
  assert.ok(referralLead);
  assert.equal(referralLead.kind, "partner_referral");
  assert.equal(referralLead.partner_id, partnerId);
  assert.match(String(referralLead.notes || ""), /Örnek Web Tasarım/);

  const unauthorizedPartnerSecurity = await fetch(`${base}/api/partners/security`);
  assert.equal(unauthorizedPartnerSecurity.status, 401);

  const partnerSecurity = await fetch(`${base}/api/partners/security`, { headers: { Cookie: partnerCookie } }).then((response) => response.json());
  assert.equal(partnerSecurity.email, "bayi@example.com");
  assert.ok(partnerSecurity.activeSessions >= 1);
  assert.ok(Array.isArray(partnerSecurity.events));
  assert.ok(Array.isArray(partnerSecurity.sessions));
  assert.ok(partnerSecurity.sessions.some((session) => session.current === true));
  assert.ok(partnerSecurity.sessions.every((session) => typeof session.id === "string" && session.id.length === 8));
  assert.ok(!JSON.stringify(partnerSecurity.sessions).includes("token_hash"));

  const wrongPartnerPassword = await fetch(`${base}/api/partners/password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: partnerCookie },
    body: JSON.stringify({ currentPassword: "yanlis-sifre", newPassword: "partner-new-456" }),
  });
  assert.equal(wrongPartnerPassword.status, 401);

  const secondPartnerLogin = await fetch(`${base}/api/partners/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "bayi@example.com", password: "partner-test-123" }),
  });
  assert.equal(secondPartnerLogin.status, 200);
  const secondPartnerCookie = secondPartnerLogin.headers.get("set-cookie")?.split(";")[0];
  assert.ok(secondPartnerCookie?.startsWith("hatay360_partner_session="));

  const partnerRevokeOthers = await fetch(`${base}/api/partners/sessions/revoke-others`, {
    method: "POST",
    headers: { Cookie: partnerCookie },
  }).then((response) => response.json());
  assert.equal(partnerRevokeOthers.ok, true);
  assert.ok(partnerRevokeOthers.revoked >= 1);

  const revokedPartnerSession = await fetch(`${base}/api/partners/security`, { headers: { Cookie: secondPartnerCookie } });
  assert.equal(revokedPartnerSession.status, 401);

  const partnerPasswordChange = await fetch(`${base}/api/partners/password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: partnerCookie },
    body: JSON.stringify({ currentPassword: "partner-test-123", newPassword: "partner-new-456" }),
  });
  assert.equal(partnerPasswordChange.status, 200);
  const partnerCookieAfterPw = partnerPasswordChange.headers.get("set-cookie")?.split(";")[0];
  assert.ok(partnerCookieAfterPw?.startsWith("hatay360_partner_session="));
  const partnerPwPayload = await partnerPasswordChange.json();
  assert.match(partnerPwPayload.message || "", /oturum/i);

  const oldPartnerPasswordLogin = await fetch(`${base}/api/partners/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "bayi@example.com", password: "partner-test-123" }),
  });
  assert.equal(oldPartnerPasswordLogin.status, 401);

  const unauthorizedSecurity = await fetch(`${base}/api/admin/security`);
  assert.equal(unauthorizedSecurity.status, 401);

  const unauthorizedOps = await fetch(`${base}/api/admin/ops-alerts`);
  assert.equal(unauthorizedOps.status, 401);

  const unauthorizedInbox = await fetch(`${base}/api/admin/inbox`);
  assert.equal(unauthorizedInbox.status, 401);

  const unauthorizedConnections = await fetch(`${base}/api/admin/connections`);
  assert.equal(unauthorizedConnections.status, 401);

  const cronNoSecret = await fetch(`${base}/api/cron/renewals`, { method: "POST" });
  assert.equal(cronNoSecret.status, 401);
  const cronNoSecretBody = await cronNoSecret.json();
  assert.equal(cronNoSecretBody.error, "cron kapalı");

  const unauthorizedCronAdmin = await fetch(`${base}/api/admin/cron/renewals`);
  assert.equal(unauthorizedCronAdmin.status, 401);

  const connections = await fetch(`${base}/api/admin/connections`, { headers: { Cookie: cookie } }).then((response) =>
    response.json(),
  );
  assert.equal(typeof connections.smtp.configured, "boolean");
  assert.equal(typeof connections.iyzico.configured, "boolean");
  assert.equal(typeof connections.googleAds.configured, "boolean");
  assert.equal(typeof connections.metaAds.configured, "boolean");
  assert.equal(typeof connections.seoRank.configured, "boolean");
  assert.equal(typeof connections.cron.configured, "boolean");
  assert.ok(Array.isArray(connections.envHint));
  assert.ok(connections.envHint.includes("SMTP_HOST"));
  assert.ok(connections.envHint.includes("CRON_SECRET"));
  const connectionsBlob = JSON.stringify(connections);
  assert.equal(connectionsBlob.includes("SMTP_PASS="), false);
  assert.ok(!Object.values(connections).some((value) => typeof value === "string" && value.length > 80 && /secret|password|token/i.test(value)));

  const opsAlerts = await fetch(`${base}/api/admin/ops-alerts`, { headers: { Cookie: cookie } }).then((response) => response.json());
  assert.ok(opsAlerts.alerts);
  assert.equal(typeof opsAlerts.alerts.total, "number");
  assert.equal(typeof opsAlerts.alerts.overdueCustomers, "number");
  assert.equal(typeof opsAlerts.alerts.contractsAwaitingApprove, "number");
  assert.ok(opsAlerts.alerts.overdueCustomers >= 1);
  assert.ok(opsAlerts.alerts.overduePenalty > 0);
  assert.equal(typeof opsAlerts.alerts.napCustomers, "number");
  assert.equal(typeof opsAlerts.alerts.napIssues, "number");

  const securitySnapshot = await fetch(`${base}/api/admin/security`, { headers: { Cookie: cookie } }).then((response) => response.json());
  assert.equal(securitySnapshot.username, "test_admin");
  assert.ok(securitySnapshot.activeSessions >= 1);
  assert.ok(Array.isArray(securitySnapshot.events));
  assert.ok(securitySnapshot.events.some((event) => event.success === false));

  const wrongAdminPassword = await fetch(`${base}/api/admin/password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ currentPassword: "wrong-password", newPassword: "admin-new-pass-99" }),
  });
  assert.equal(wrongAdminPassword.status, 401);

  const secondAdminLogin = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "test_admin", password: "test-password-api" }),
  });
  assert.equal(secondAdminLogin.status, 200);
  const secondAdminCookie = secondAdminLogin.headers.get("set-cookie")?.split(";")[0];
  assert.ok(secondAdminCookie?.startsWith("hatay360_session="));

  const revokeOthers = await fetch(`${base}/api/admin/sessions/revoke-others`, {
    method: "POST",
    headers: { Cookie: cookie },
  }).then((response) => response.json());
  assert.equal(revokeOthers.ok, true);
  assert.ok(revokeOthers.revoked >= 1);

  const revokedSession = await fetch(`${base}/api/admin/security`, { headers: { Cookie: secondAdminCookie } });
  assert.equal(revokedSession.status, 401);

  const adminPasswordChange = await fetch(`${base}/api/admin/password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ currentPassword: "test-password-api", newPassword: "admin-new-pass-99" }),
  });
  assert.equal(adminPasswordChange.status, 200);
  cookie = adminPasswordChange.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie?.startsWith("hatay360_session="));

  const oldAdminLogin = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "test_admin", password: "test-password-api" }),
  });
  assert.equal(oldAdminLogin.status, 401);

  const newAdminLogin = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "test_admin", password: "admin-new-pass-99" }),
  });
  assert.equal(newAdminLogin.status, 200);

  const smsCsv = await fetch(`${base}/api/leads/sms.csv`, { headers: { Cookie: cookie } });
  assert.equal(smsCsv.status, 200);
  const csvText = await smsCsv.text();
  assert.ok(csvText.includes("0555 333 44 55"));
});

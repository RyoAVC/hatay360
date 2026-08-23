import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultDayHours,
  applyMapsQueryDistrict,
  districtFromMapsSearch,
  emptyMapsDraft,
  firstIncompleteMapsStep,
  isMapsStepComplete,
  mapsDraftHasProgress,
  maxReachableMapsStep,
  minutesFromHhmm,
  resolveMapsOpenNow,
} from "../src/app/lib/maps-signup.ts";

test("minutesFromHhmm geçerli ve geçersiz saatleri ayırır", () => {
  assert.equal(minutesFromHhmm("09:30"), 9 * 60 + 30);
  assert.equal(minutesFromHhmm("23:59"), 23 * 60 + 59);
  assert.equal(minutesFromHhmm("24:00"), null);
  assert.equal(minutesFromHhmm("abc"), null);
});

test("resolveMapsOpenNow: açık gün içinde Açık, dışında Kapalı", () => {
  const dayHours = defaultDayHours();
  dayHours.pazartesi = { closed: false, open: "09:00", close: "18:00" };

  const openAt = resolveMapsOpenNow(dayHours, new Date("2026-08-17T10:00:00+03:00"));
  assert.equal(openAt.todayLabel, "Pazartesi");
  assert.equal(openAt.open, true);
  assert.equal(openAt.statusLabel, "Açık");

  const closedAt = resolveMapsOpenNow(dayHours, new Date("2026-08-17T20:00:00+03:00"));
  assert.equal(closedAt.open, false);
  assert.equal(closedAt.statusLabel, "Kapalı");
});

test("resolveMapsOpenNow: kapalı gün ve gece yarısı aşan vardiya", () => {
  const dayHours = defaultDayHours();
  dayHours.pazar = { closed: true, open: "09:00", close: "18:00" };
  dayHours.cumartesi = { closed: false, open: "22:00", close: "02:00" };

  const sundayClosed = resolveMapsOpenNow(dayHours, new Date("2026-08-16T15:00:00+03:00"));
  assert.equal(sundayClosed.open, false);
  assert.match(sundayClosed.detail, /kapalı/i);

  const overnight = resolveMapsOpenNow(dayHours, new Date("2026-08-16T01:00:00+03:00"));
  assert.equal(overnight.open, true);
  assert.equal(overnight.statusLabel, "Açık");
});

test("firstIncompleteMapsStep / maxReachable: taslaktan doğru adıma dön", () => {
  const empty = emptyMapsDraft();
  assert.equal(mapsDraftHasProgress(empty), false);
  assert.equal(firstIncompleteMapsStep(empty), 1);
  assert.equal(maxReachableMapsStep(empty), 1);

  const named = { ...empty, businessName: "Defne Dental" };
  assert.equal(isMapsStepComplete(1, named), true);
  assert.equal(firstIncompleteMapsStep(named), 2);
  assert.equal(maxReachableMapsStep(named), 2);

  const mid = {
    ...named,
    sector: "Diş kliniği",
    address: "Yeni Mahalle Cad. No:12",
    phone: "0544 444 44 44",
  };
  assert.equal(firstIncompleteMapsStep(mid), 6);
  assert.equal(maxReachableMapsStep(mid), 6);

  const full = { ...mid, description: "Defne’de 12 yıldır diş tedavisi sunuyoruz." };
  assert.equal(firstIncompleteMapsStep(full), 6);
  assert.equal(isMapsStepComplete(6, full), true);
});

test("ilce query boş taslağa resmi ilçe yazar, ilerlemiş taslağı ezmez", () => {
  assert.equal(districtFromMapsSearch("?ilce=iskenderun"), "İskenderun");
  assert.equal(districtFromMapsSearch("?district=DEFNE"), "Defne");
  assert.equal(districtFromMapsSearch("?ilce=Mars"), "");

  const empty = emptyMapsDraft();
  const applied = applyMapsQueryDistrict(empty, "?ilce=İskenderun");
  assert.equal(applied.district, "İskenderun");
  assert.equal(mapsDraftHasProgress(applied), false);

  const progressed = { ...empty, businessName: "Avcı Eczane", district: "Antakya" };
  assert.equal(applyMapsQueryDistrict(progressed, "?ilce=İskenderun").district, "Antakya");
});

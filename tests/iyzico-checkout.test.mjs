import assert from "node:assert/strict";
import test from "node:test";

import {
  GATEWAY_NOT_CONFIGURED,
  GATEWAY_NOT_CONNECTED_TR,
  GATEWAY_PREPARING,
  iyzicoKeysConfigured,
  paymentGatewayStatus,
  startIyzicoCheckout,
} from "../src/app/lib/iyzico-checkout.ts";

test("iyzico anahtarı yokken checkout yapılandırılmamış döner", () => {
  const env = { IYZICO_API_KEY: "", IYZICO_SECRET: "" };
  assert.equal(iyzicoKeysConfigured(env), false);
  assert.deepEqual(startIyzicoCheckout({ id: 1, remaining: 1500 }, env), {
    ok: false,
    error: GATEWAY_NOT_CONFIGURED,
  });
});

test("anahtar olsa bile iyzico API çağrılmaz, hazırlanıyor döner", () => {
  const env = { IYZICO_API_KEY: "sandbox-key", IYZICO_SECRET: "sandbox-secret" };
  assert.equal(iyzicoKeysConfigured(env), true);
  assert.deepEqual(startIyzicoCheckout({ id: 9, remaining: 200 }, env), {
    ok: false,
    error: GATEWAY_PREPARING,
  });
});

test("panel gateway bu turda her zaman kapalıdır", () => {
  const status = paymentGatewayStatus({ IYZICO_API_KEY: "x", IYZICO_SECRET: "y" });
  assert.equal(status.available, false);
  assert.equal(status.provider, "iyzico");
  assert.equal(status.message, GATEWAY_NOT_CONNECTED_TR);
});

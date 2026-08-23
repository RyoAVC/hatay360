/**
 * iyzico ödeme iskelesi (P3). Kart numarası burada tutulmaz, fatura ödendi işaretlenmez,
 * iyzico/PayTR API çağrılmaz. Gerçek checkout oturumu ayrı bir işte bağlanır.
 */

export const IYZICO_PROVIDER = "iyzico" as const;

export const GATEWAY_NOT_CONFIGURED = "gateway-not-configured";
export const GATEWAY_PREPARING = "hazırlanıyor";

export const GATEWAY_NOT_CONNECTED_TR =
  "Online ödeme henüz bağlanmadı. Hatay360 ile iletişime geçin veya havale/EFT kullanın.";

export const GATEWAY_PREPARING_TR =
  "Online ödeme hazırlanıyor. Kart bilgisi Hatay360’da tutulmaz; iyzico güvenli formu bağlanınca açılır.";

export const GATEWAY_CARD_NOTE_TR =
  "Kart numarası Hatay360’da tutulmaz. Ödeme, iyzico güvenli formunda açılır (bağlanınca).";

export type PaymentGatewayStatus = {
  available: false;
  provider: typeof IYZICO_PROVIDER;
  message: string;
};

export type IyzicoCheckoutInput = {
  id?: number;
  remaining?: number;
  amount?: number;
  period?: string;
  status?: string;
};

export type IyzicoCheckoutResult =
  | { ok: false; error: typeof GATEWAY_NOT_CONFIGURED }
  | { ok: false; error: typeof GATEWAY_PREPARING };

type EnvLike = Record<string, string | undefined>;

export function iyzicoKeysConfigured(env: EnvLike = {}) {
  return Boolean(String(env.IYZICO_API_KEY || "").trim() && String(env.IYZICO_SECRET || "").trim());
}

/** Panel: bu turda her zaman kapalı. Anahtar olsa bile checkout henüz yok. */
export function paymentGatewayStatus(_env: EnvLike = {}): PaymentGatewayStatus {
  return {
    available: false,
    provider: IYZICO_PROVIDER,
    message: GATEWAY_NOT_CONNECTED_TR,
  };
}

/**
 * Checkout dikişi. Anahtar yoksa gateway-not-configured.
 * Anahtar olsa bile bu turda API çağrılmaz; hazırlanıyor döner.
 */
export function startIyzicoCheckout(paymentRow: IyzicoCheckoutInput | null | undefined, env: EnvLike = {}): IyzicoCheckoutResult {
  void paymentRow;
  if (!iyzicoKeysConfigured(env)) {
    return { ok: false, error: GATEWAY_NOT_CONFIGURED };
  }
  return { ok: false, error: GATEWAY_PREPARING };
}

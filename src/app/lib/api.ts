export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: "same-origin",
  });

  const payload = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) {
    const fallback =
      response.status === 401
        ? "E-posta veya şifre hatalı."
        : response.status === 403
          ? "Bu işlem şu an kapalı. Onay veya yetki gerekir."
          : response.status === 409
            ? "Bu kayıt zaten var. Farklı bilgi deneyin."
            : response.status === 429
              ? "Çok fazla deneme yaptınız. Biraz bekleyip tekrar deneyin."
              : response.status >= 500
                ? "Sunucu hatası. Lütfen birkaç saniye sonra tekrar deneyin."
                : "Bilgiler hatalı. Kırmızı uyarıyı okuyup düzeltin.";
    throw new ApiError(payload.error || fallback, response.status);
  }
  return payload;
}


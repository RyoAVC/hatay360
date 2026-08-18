/** Telefondaki boşluk ve parantezleri temizler: "tel:+908508880000" */
export function toTelHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits}`;
}

/** WhatsApp linki üretir; istenirse hazır mesaj ekler. */
export function toWhatsAppHref(phone: string, message?: string) {
  const digits = phone.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

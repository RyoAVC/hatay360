import { FormEvent, useState } from "react";
import { Link, useLocation } from "react-router";
import { motion } from "motion/react";
import { PhoneCall, Send, CheckCircle2 } from "lucide-react";
import { useContent } from "../context/content-context";
import { isValidTrPhone, PHONE_ERROR, toWhatsAppHref } from "../lib/contact";
import { turkishFormProps } from "../lib/form-validation";
import { apiRequest } from "../lib/api";
import { FormError } from "./form-error";
import { PhoneField } from "./phone-field";

const SERVICES = [
  "E-Ticaret altyapısı",
  "Web tasarım",
  "Google / Meta reklam",
  "Pazaryeri entegrasyonu",
  "Özel yazılım",
  "Diğer",
];

type CallbackFormProps = {
  compact?: boolean;
};

export function CallbackForm({ compact = false }: CallbackFormProps) {
  const { settings } = useContent();
  const { pathname } = useLocation();
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValidTrPhone(phone)) {
      setError(PHONE_ERROR);
      return;
    }
    const formElement = e.currentTarget;
    const form = new FormData(formElement);
    const name = String(form.get("name") || "").trim();
    const service = String(form.get("service") || "Genel bilgi").trim();
    if (name.length < 2) {
      setError("Adınızı ve soyadınızı yazın.");
      return;
    }
    const message = [
      "Merhaba Hatay360, web sitenizden teklif almak istiyorum.",
      `Ad Soyad: ${name}`,
      `Telefon: ${phone}`,
      `İlgilendiğim hizmet: ${service}`,
    ].join("\n");

    const whatsappWindow = window.open("about:blank", "_blank");
    setSubmitting(true);
    setError("");
    try {
      await apiRequest<{ ok: boolean; id: number }>("/api/leads", {
        method: "POST",
        body: JSON.stringify({ name, phone, service, sourcePath: pathname }),
      });
      const href = toWhatsAppHref(settings.phone, message);
      if (whatsappWindow) {
        whatsappWindow.opener = null;
        whatsappWindow.location.href = href;
      } else {
        window.location.href = href;
      }
      setSent(true);
      formElement.reset();
      setPhone("");
    } catch (submitError) {
      whatsappWindow?.close();
      setError(submitError instanceof Error ? submitError.message : "Talep kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-[#b3e5ee] bg-[#e8f8fb] p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-[#00a8c4]" />
        <p className="mt-3 text-[18px] font-semibold text-[#1a1a1a]">WhatsApp teklifiniz hazırlandı</p>
        <p className="mt-2 text-[15px] text-[#6f6c8f]">
          Açılan WhatsApp ekranında gönder düğmesine basarak talebinizi Hatay360 ekibine iletebilirsiniz.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-4 text-[13px] font-semibold text-[#00a8c4] hover:underline"
        >
          Yeni bir talep oluştur
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} {...turkishFormProps} className="space-y-4">
      {!compact && (
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00a8c4] text-white">
            <PhoneCall className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-[20px] font-bold text-[#1a1a1a]">Numaranızı bırakın, sizi arayalım</h3>
            <p className="text-[14px] text-[#6f6c8f]">Ücretsiz keşif görüşmesi. Kredi kartı gerekmez.</p>
          </div>
        </div>
      )}
      {compact && (
        <p className="text-[15px] font-semibold text-[#1a1a1a]">Numaranızı bırakın, sizi arayalım</p>
      )}

      {error && <FormError>{error}</FormError>}

      <div className={compact ? "grid gap-3 sm:grid-cols-2" : "grid gap-4 sm:grid-cols-2"}>
        <input
          required
          name="name"
          autoComplete="name"
          minLength={2}
          maxLength={80}
          placeholder="Adınız Soyadınız"
          className="w-full rounded-xl border border-[#ecebf5] bg-white px-4 py-3 text-[15px] text-[#1a1a1a] outline-none transition focus:border-[#00a8c4]"
        />
        <PhoneField value={phone} onChange={setPhone} />
      </div>

      <select
        required
        name="service"
        defaultValue=""
        className="w-full rounded-xl border border-[#ecebf5] bg-white px-4 py-3 text-[15px] text-[#1a1a1a] outline-none transition focus:border-[#00a8c4]"
      >
        <option value="" disabled>
          İlgilendiğiniz hizmet
        </option>
        {SERVICES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <label className="flex items-start gap-2 text-[13px] leading-relaxed text-[#6f6c8f]">
        <input required type="checkbox" className="mt-1 accent-[#00a8c4]" />
        <span>
          <Link to="/gizlilik" className="font-medium text-[#00a8c4] hover:underline">
            Gizlilik
          </Link>{" "}
          ve KVKK metnini okudum, aranmayı kabul ediyorum.
        </span>
      </label>

      <motion.button
        type="submit"
        disabled={submitting}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#00a8c4] px-6 py-3.5 text-[16px] font-semibold text-white shadow-[0px_10px_28px_rgba(0,168,196,0.35)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "Kaydediliyor…" : "Beni Arayın"} <Send className="h-[18px] w-[18px]" />
      </motion.button>
    </form>
  );
}

import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SiteLogo } from "../components/site-logo";
import { FormError } from "../components/form-error";
import { PhoneField } from "../components/phone-field";
import { apiRequest } from "../lib/api";
import { isValidTrPhone, PHONE_ERROR } from "../lib/contact";
import { turkishFormProps } from "../lib/form-validation";

export function PartnerSignupPage() {
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    city: "Antakya",
    website: "",
    notes: "",
    password: "",
    smsOk: true,
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isValidTrPhone(form.phone)) {
      setError(PHONE_ERROR);
      return;
    }
    if (form.password.length < 10) {
      setError("Şifre en az 10 karakter olmalıdır.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apiRequest("/api/partners/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSent(true);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Başvuru gönderilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = "text") => (
    <label className="mt-4 block text-[11px] font-black text-[#425965]">
      {label}
      <input
        required={key !== "website" && key !== "notes"}
        type={type}
        minLength={key === "password" ? 10 : key === "email" ? undefined : 2}
        maxLength={key === "password" ? 128 : 80}
        value={typeof form[key] === "string" ? form[key] : ""}
        onChange={(event) => setForm({ ...form, [key]: event.target.value })}
        className="mt-2 w-full rounded-xl border border-[#dbe6ea] px-4 py-3 text-[13px] outline-none focus:border-[#3b4fd4]"
      />
    </label>
  );

  return (
    <div className="grid min-h-screen bg-[#06121c] lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden overflow-hidden border-r border-white/10 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(91,110,240,0.28),transparent_34%)]" />
        <div className="relative">
          <SiteLogo variant="onDark" />
          <p className="mt-12 text-[11px] font-black uppercase tracking-[0.23em] text-[#a5b4fc]">Bayilik başvurusu</p>
          <h1 className="mt-4 max-w-xl text-[44px] font-black leading-[0.98] tracking-[-0.055em] text-white">
            Siz satarsınız, Hatay360 üretir.
          </h1>
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-white/58">
            Web tasarım firmanız müşteri getirir; site, reklam ve harita kaydını birlikte yürütürüz. Komisyon oranı onay sonrası belirlenir.
          </p>
        </div>
        <ul className="relative space-y-2 text-[13px] font-bold text-white/70">
          <li>Müşteri sizde kalır, teslimat Hatay360’ta.</li>
          <li>Komisyon panoda görünür, gizli kesinti yok.</li>
          <li>Onaylanmadan giriş açılmaz.</li>
        </ul>
      </div>
      <div className="flex items-center justify-center p-5 sm:p-10">
        {sent ? (
          <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-white p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-[#3b4fd4]" />
            <h2 className="mt-5 text-[26px] font-black text-[#102b35]">Başvurunuz alındı</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-[#5b6b75]">Ekibimiz sizi arayıp komisyon ve çalışma düzenini konuşur. Onay sonrası firma girişi açılır.</p>
            <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#3b4fd4] px-5 py-3 text-[13px] font-black text-white">
              Ana sayfa <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} {...turkishFormProps} className="w-full max-w-md rounded-[30px] border border-white/10 bg-white p-7 sm:p-9">
            <h2 className="text-[26px] font-black text-[#102b35]">Firma kaydı</h2>
            <p className="mt-2 text-[12px] text-[#71818a]">Bayilik için firmanızı, yetkiliyi ve şifrenizi yazın.</p>
            {error && <div className="mt-4"><FormError>{error}</FormError></div>}
            {field("companyName", "Firma adı")}
            {field("contactName", "Yetkili adı")}
            {field("email", "E-posta", "email")}
            <label className="mt-4 block text-[11px] font-black text-[#425965]">
              Telefon
              <div className="mt-2"><PhoneField value={form.phone} onChange={(phone) => setForm({ ...form, phone })} /></div>
            </label>
            {field("city", "Şehir")}
            {field("website", "Web siteniz")}
            {field("password", "Şifre (en az 10 karakter)", "password")}
            <label className="mt-4 block text-[11px] font-black text-[#425965]">
              Not
              <textarea rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="mt-2 w-full rounded-xl border border-[#dbe6ea] px-4 py-3 text-[13px] outline-none focus:border-[#3b4fd4]" />
            </label>
            <label className="mt-4 flex items-start gap-2 text-[12px] text-[#5b6b75]">
              <input type="checkbox" checked={form.smsOk} onChange={(event) => setForm({ ...form, smsOk: event.target.checked })} className="mt-1 accent-[#3b4fd4]" />
              SMS ve arama ile bilgi almak istiyorum.
            </label>
            <button disabled={busy} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3b4fd4] px-5 py-3.5 text-[13px] font-black text-white disabled:opacity-60">
              {busy ? "Gönderiliyor…" : "Bayilik başvurusu"} <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-5 text-center text-[11px] text-[#87959c]">
              Hesabınız varsa <Link to="/firma/giris" className="font-black text-[#3b4fd4]">firma girişi</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

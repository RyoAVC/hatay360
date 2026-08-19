import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router";
import { ArrowRight, CheckCircle2, MapPinned, ShieldCheck } from "lucide-react";
import { SiteLogo } from "../components/site-logo";
import { FormError } from "../components/form-error";
import { PhoneField } from "../components/phone-field";
import { HoneypotField } from "../components/honeypot-field";
import { apiRequest } from "../lib/api";
import { isValidTrPhone, PHONE_ERROR, sanitizePhoneInput } from "../lib/contact";
import { turkishFormProps } from "../lib/form-validation";
import { clearMapsDraft, readMapsDraft, type MapsDraft } from "../lib/maps-signup";

type LocationState = { fromMaps?: boolean; draft?: MapsDraft };

export function CustomerSignupPage() {
  const location = useLocation();
  const mapsDraft = useMemo(() => {
    const state = (location.state || {}) as LocationState;
    return state.draft || readMapsDraft();
  }, [location.state]);
  const fromMaps = Boolean(mapsDraft?.businessName);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState(mapsDraft?.phone ? sanitizePhoneInput(mapsDraft.phone) : "");
  const [email, setEmail] = useState("");
  const [smsOk, setSmsOk] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (mapsDraft?.phone) setPhone(sanitizePhoneInput(mapsDraft.phone));
  }, [mapsDraft?.phone]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError("Adınızı ve soyadınızı yazın.");
      setBusy(false);
      return;
    }
    if (!isValidTrPhone(phone)) {
      setError(PHONE_ERROR);
      setBusy(false);
      return;
    }
    const formElement = event.currentTarget as HTMLFormElement;
    const companyFax = String(new FormData(formElement).get("company_fax") || "").trim();
    setBusy(true);
    setError("");
    try {
      await apiRequest("/api/leads", {
        method: "POST",
        body: JSON.stringify({
          name,
          phone,
          email,
          kind: fromMaps ? "maps" : "new_customer",
          service: fromMaps ? `Google harita kaydı · ${mapsDraft?.sector || ""}` : "Yeni müşteri kaydı",
          sourcePath: fromMaps ? "/google-maps-harita-kaydi" : "/musteri/kayit",
          sector: mapsDraft?.sector || "",
          district: mapsDraft?.district || "",
          address: mapsDraft?.address || "",
          hours: mapsDraft?.hours || "",
          website: mapsDraft?.website || "",
          notes: [mapsDraft?.businessName && `İşletme: ${mapsDraft.businessName}`, mapsDraft?.description].filter(Boolean).join("\n"),
          smsOk,
          company_fax: companyFax,
        }),
      });
      clearMapsDraft();
      setSent(true);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Kayıt gönderilemedi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[#061a20] lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden overflow-hidden border-r border-white/10 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(0,168,196,0.24),transparent_34%),radial-gradient(circle_at_85%_80%,rgba(26,168,119,0.18),transparent_30%)]" />
        <div className="relative">
          <SiteLogo variant="onDark" />
          <p className="mt-12 text-[11px] font-black uppercase tracking-[0.23em] text-[#7ee0ec]">Davetli müşteri kaydı</p>
          <h1 className="mt-4 max-w-xl text-[44px] font-black leading-[0.98] tracking-[-0.055em] text-white">
            {fromMaps ? "Harita kaydı için sizi arayalım." : "Herkes üye olamaz."}
          </h1>
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-white/58">
            Sistemde yalnızca Hatay360’ın onayladığı kıymetli müşteriler aktif olur. Şifre sormuyoruz; hesabınız açılırsa şifreniz size Hatay360 tarafından gönderilir.
          </p>
          <ul className="relative mt-8 space-y-3 text-[13px] font-bold text-white/72">
            <li>Bu form panel şifresi oluşturmaz.</li>
            <li>Ekibimiz sizi arar, işi netleştirir.</li>
            <li>Uygun görülen müşteriye şifre ayrıca iletilir.</li>
          </ul>
        </div>
        {fromMaps && mapsDraft && (
          <div className="relative rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#82f0c2]">
              <MapPinned className="h-4 w-4" /> Harita taslağı
            </p>
            <p className="mt-3 text-[16px] font-black text-white">{mapsDraft.businessName}</p>
            <p className="mt-1 text-[12px] text-white/60">{mapsDraft.sector} · {mapsDraft.district}</p>
            <p className="mt-1 text-[12px] text-white/50">{mapsDraft.address}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center p-5 sm:p-10">
        {sent ? (
          <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-white p-8 text-center shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
            <CheckCircle2 className="mx-auto h-12 w-12 text-[#12865f]" />
            <h2 className="mt-5 text-[26px] font-black text-[#102b35]">Başvurunuz alındı</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-[#5b6b75]">
              Şifre bu ekranda verilmez. Hatay360 sizi arar; uygun görülürseniz panel şifreniz size gönderilir.
            </p>
            <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#008fac] px-5 py-3 text-[13px] font-black text-white">
              Ana sayfaya dön <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} {...turkishFormProps} className="w-full max-w-md rounded-[30px] border border-white/10 bg-white p-7 shadow-[0_28px_90px_rgba(0,0,0,0.28)] sm:p-9">
            <h2 className="text-[28px] font-black tracking-[-0.04em] text-[#102b35]">Hatay360 kayıt</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-[#71818a]">
              {fromMaps ? "Harita bilgileriniz hazır. Yetkili ve telefon yeterli; şifre sormuyoruz." : "Ad, telefon ve e-posta yeterli. Şifre sormuyoruz."}
            </p>
            <div className="mt-5 rounded-2xl border border-[#d4af37]/40 bg-[#fff8e8] p-4">
              <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#8a6a12]">
                <ShieldCheck className="h-4 w-4" /> Elit müşteri sistemi
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-[#6b5420]">
                Hatay360 panelinde herkes üye olamaz. Yalnızca kıymetli, onaylı müşteriler aktif edilir. Şifreniz bu formda seçilmez; uygun görüldüğünüzde Hatay360 tarafından size gönderilir.
              </p>
            </div>
            {error && <div className="mt-4"><FormError>{error}</FormError></div>}
            <HoneypotField />
            <label className="mt-6 block text-[11px] font-black text-[#425965]">
              Ad soyad
              <input required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-[#dbe6ea] px-4 py-3 text-[13px] outline-none focus:border-[#00a8c4]" />
            </label>
            <label className="mt-4 block text-[11px] font-black text-[#425965]">
              Telefon
              <div className="mt-2"><PhoneField value={phone} onChange={setPhone} /></div>
            </label>
            <label className="mt-4 block text-[11px] font-black text-[#425965]">
              E-posta
              <input type="email" maxLength={80} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ornek@firma.com" className="mt-2 w-full rounded-xl border border-[#dbe6ea] px-4 py-3 text-[13px] outline-none focus:border-[#00a8c4]" />
            </label>
            <label className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-[#5b6b75]">
              <input type="checkbox" checked={smsOk} onChange={(event) => setSmsOk(event.target.checked)} className="mt-1 accent-[#00a8c4]" />
              SMS ve arama ile bilgi almak istiyorum.
            </label>
            <button disabled={busy} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#008fac] px-5 py-3.5 text-[13px] font-black text-white disabled:opacity-60">
              {busy ? "Kaydediliyor…" : "Başvuruyu gönder"} <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-5 text-center text-[11px] leading-relaxed text-[#87959c]">
              Şifreniz varsa <Link to="/musteri/giris" className="font-black text-[#008fac]">müşteri girişi</Link>
              {" · "}
              <Link to="/hesap" className="font-black text-[#008fac]">Hesap seçimi</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

import { useState, type FormEvent } from "react";
import { ArrowRight, BarChart3, LockKeyhole, MessagesSquare, ShieldCheck } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router";
import { SiteLogo } from "../components/site-logo";
import { FormError } from "../components/form-error";
import { turkishFormProps } from "../lib/form-validation";
import { useCustomerAuth } from "../context/customer-auth-context";

export function CustomerLoginPage() {
  const { customer, isChecking, login } = useCustomerAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!isChecking && customer) return <Navigate to="/musteri" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      navigate("/musteri", { replace: true });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Giriş yapılamadı.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[#061a20] lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden overflow-hidden border-r border-white/10 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(0,168,196,0.24),transparent_34%),radial-gradient(circle_at_85%_80%,rgba(34,197,94,0.15),transparent_30%)]" />
        <div className="relative"><SiteLogo variant="onDark" /><p className="mt-12 text-[11px] font-black uppercase tracking-[0.23em] text-[#7ee0ec]">Müşteri kontrol merkezi</p><h1 className="mt-4 max-w-xl text-[52px] font-black leading-[0.98] tracking-[-0.055em] text-white">Reklamınızın parasını, sonucunu ve sürecini görün.</h1><p className="mt-6 max-w-lg text-[15px] leading-relaxed text-white/58">Google ve Meta kampanyaları, bütçe, harcama, dönüşüm, gelir, destek ve yeni hizmet talepleri tek güvenli hesapta.</p></div>
        <div className="relative grid grid-cols-3 gap-3">{[{ icon: BarChart3, text: "Canlı metrik" }, { icon: MessagesSquare, text: "Destek" }, { icon: ShieldCheck, text: "AVC güvencesi" }].map(({ icon: Icon, text }) => <div key={text} className="rounded-2xl border border-white/10 bg-white/5 p-4"><Icon className="h-5 w-5 text-[#7ee0ec]" /><p className="mt-3 text-[11px] font-black text-white/75">{text}</p></div>)}</div>
      </div>
      <div className="flex items-center justify-center p-5 sm:p-10">
        <form onSubmit={submit} {...turkishFormProps} className="w-full max-w-md rounded-[30px] border border-white/10 bg-white p-7 shadow-[0_28px_90px_rgba(0,0,0,0.28)] sm:p-9">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9f8fa] text-[#008eaa]"><LockKeyhole className="h-5 w-5" /></span><h2 className="mt-6 text-[28px] font-black tracking-[-0.04em] text-[#102b35]">Müşteri paneli girişi</h2><p className="mt-2 text-[12px] leading-relaxed text-[#71818a]">Şifreniz Hatay360 tarafından size gönderildiyse buradan girin. Herkes üye olamaz; panel yalnızca onaylı müşterilere açılır.</p>
          {error && <div className="mt-4"><FormError>{error}</FormError></div>}
          <label className="mt-6 block text-[11px] font-black text-[#425965]">E-posta<input type="email" required maxLength={80} value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[#dbe6ea] px-4 py-3 text-[13px] outline-none focus:border-[#00a8c4]" /></label>
          <label className="mt-4 block text-[11px] font-black text-[#425965]">Şifre<input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-[#dbe6ea] px-4 py-3 text-[13px] outline-none focus:border-[#00a8c4]" /></label>
          <button disabled={busy} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#008fac] px-5 py-3.5 text-[13px] font-black text-white disabled:opacity-60">{busy ? "Giriş yapılıyor…" : "Paneli aç"}<ArrowRight className="h-4 w-4" /></button>
          <p className="mt-5 text-center text-[10px] font-semibold leading-relaxed text-[#87959c]">Şifreniz yoksa burada üretilemez. Yeni başvuru bırakın; uygun görülürseniz Hatay360 şifreyi size gönderir.</p>
          <p className="mt-3 text-center text-[11px] text-[#87959c]">
            <Link to="/musteri/kayit" className="font-black text-[#008fac]">Yeni müşteri kaydı</Link>
            {" · "}
            <Link to="/firma/giris" className="font-black text-[#008fac]">Firma girişi</Link>
            {" · "}
            <Link to="/hesap" className="font-black text-[#008fac]">Hesap seçimi</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

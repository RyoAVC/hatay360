import { useState, type FormEvent } from "react";
import { ArrowRight, Handshake, LockKeyhole } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router";
import { SiteLogo } from "../components/site-logo";
import { FormError } from "../components/form-error";
import { turkishFormProps } from "../lib/form-validation";
import { usePartnerAuth } from "../context/partner-auth-context";

export function PartnerLoginPage() {
  const { partner, isChecking, login } = usePartnerAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!isChecking && partner) return <Navigate to="/firma" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      navigate("/firma", { replace: true });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Giriş yapılamadı.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[#06121c] lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden overflow-hidden border-r border-white/10 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(91,110,240,0.28),transparent_34%),radial-gradient(circle_at_85%_80%,rgba(0,168,196,0.16),transparent_30%)]" />
        <div className="relative">
          <SiteLogo variant="onDark" />
          <p className="mt-12 text-[11px] font-black uppercase tracking-[0.23em] text-[#a5b4fc]">Hatay360 bayilik</p>
          <h1 className="mt-4 max-w-xl text-[48px] font-black leading-[0.98] tracking-[-0.055em] text-white">
            Web tasarım firmanız bizimle satış yapsın.
          </h1>
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-white/58">
            Bayilik alan firmalar müşteriye site ve reklam satar; Hatay360 komisyon alır. Onaylı hesapla buradan girin.
          </p>
        </div>
        <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <Handshake className="h-5 w-5 text-[#a5b4fc]" />
          <p className="text-[12px] font-bold text-white/70">Komisyon oranı hesabınız onaylandıktan sonra panelde görünür.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-5 sm:p-10">
        <form onSubmit={submit} {...turkishFormProps} className="w-full max-w-md rounded-[30px] border border-white/10 bg-white p-7 shadow-[0_28px_90px_rgba(0,0,0,0.28)] sm:p-9">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef0ff] text-[#3b4fd4]">
            <LockKeyhole className="h-5 w-5" />
          </span>
          <h2 className="mt-6 text-[28px] font-black tracking-[-0.04em] text-[#102b35]">Firma girişi</h2>
          <p className="mt-2 text-[12px] leading-relaxed text-[#71818a]">Bayilik hesabınız onaylandıysa e-posta ve şifrenizle girin.</p>
          {error && <div className="mt-4"><FormError>{error}</FormError></div>}
          <label className="mt-6 block text-[11px] font-black text-[#425965]">
            E-posta
            <input type="email" required maxLength={80} value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[#dbe6ea] px-4 py-3 text-[13px] outline-none focus:border-[#3b4fd4]" />
          </label>
          <label className="mt-4 block text-[11px] font-black text-[#425965]">
            Şifre
            <input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-[#dbe6ea] px-4 py-3 text-[13px] outline-none focus:border-[#3b4fd4]" />
          </label>
          <button disabled={busy} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3b4fd4] px-5 py-3.5 text-[13px] font-black text-white disabled:opacity-60">
            {busy ? "Giriş yapılıyor…" : "Firma paneli"} <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-5 text-center text-[11px] text-[#87959c]">
            Bayiliğiniz yoksa <Link to="/firma/kayit" className="font-black text-[#3b4fd4]">firma kaydı</Link> açın.
            {" · "}
            <Link to="/hesap" className="font-black text-[#3b4fd4]">Hesap seçimi</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

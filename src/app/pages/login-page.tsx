import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { Lock, User } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { SiteLogo } from "../components/site-logo";
import { FormError } from "../components/form-error";
import { turkishFormProps } from "../lib/form-validation";

export function LoginPage() {
  const { isLoggedIn, isConfigured, isChecking, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isLoggedIn) {
    return <Navigate to="/panel" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await login(username, password);
    setSubmitting(false);
    if (ok) {
      navigate("/panel", { replace: true });
      return;
    }
    setError("Kullanıcı adı veya şifre hatalı.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-5">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a0a] p-8 shadow-[0_24px_80px_rgba(0,168,196,0.18)]">
        <div className="mb-8 flex flex-col items-center text-center">
          <SiteLogo variant="onDark" />
          <p className="mt-4 text-[14px] font-medium text-white/60">Yönetim paneli girişi</p>
        </div>

        <form onSubmit={handleSubmit} {...turkishFormProps} className="space-y-4">
          {!isChecking && !isConfigured && (
            <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-[13px] font-medium text-amber-200">
              Veritabanı sunucusu veya yönetici hesabı henüz hazır değil. Sunucuyu başlatıp yönetici bilgilerini ortam değişkenlerine ekleyin.
            </p>
          )}
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-white/70">
              <User className="h-4 w-4 text-[#00a8c4]" /> Kullanıcı adı
            </span>
            <input
              type="text"
              autoComplete="username"
              placeholder="mahir"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-[15px] text-white outline-none transition focus:border-[#00a8c4]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-white/70">
              <Lock className="h-4 w-4 text-[#00a8c4]" /> Şifre
            </span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-[15px] text-white outline-none transition focus:border-[#00a8c4]"
            />
          </label>

          {error && <FormError tone="dark">{error}</FormError>}

          <button
            type="submit"
            disabled={!isConfigured || isChecking || submitting}
            className="mt-2 w-full rounded-xl bg-[#00a8c4] py-3 text-[16px] font-semibold text-white shadow-[0_10px_28px_rgba(0,168,196,0.35)] transition hover:bg-[#0088a0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Kontrol ediliyor…" : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}

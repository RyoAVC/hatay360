import { FormEvent, useEffect, useState } from "react";
import { KeyRound, RefreshCw, ShieldCheck, LogOut, ShieldAlert } from "lucide-react";
import { apiRequest } from "../lib/api";
import { FormError } from "../components/form-error";
import { EmptyRow } from "../components/empty-row";

type SecurityEvent = {
  id: number;
  username: string;
  success: boolean;
  createdAt: string;
  visitorTag: string;
};

type SecurityData = {
  username: string;
  activeSessions: number;
  failed24h: number;
  events: SecurityEvent[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export function AdminSecurityPanel() {
  const [data, setData] = useState<SecurityData | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const load = async () => {
    try {
      const next = await apiRequest<SecurityData>("/api/admin/security");
      setData(next);
      setError("");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Güvenlik özeti yüklenemedi.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Yeni şifre ve tekrarı aynı olmalıdır.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      await apiRequest("/api/admin/password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setNotice("Şifre güncellendi. Diğer cihazlardaki oturumlar kapatıldı.");
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Şifre değiştirilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const revokeOthers = async () => {
    setBusy(true);
    setNotice("");
    try {
      const result = await apiRequest<{ ok: boolean; revoked: number }>("/api/admin/sessions/revoke-others", {
        method: "POST",
      });
      setNotice(
        result.revoked
          ? `${result.revoked} diğer oturum kapatıldı. Bu tarayıcı açık kaldı.`
          : "Kapatılacak başka oturum yoktu.",
      );
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Oturumlar kapatılamadı.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#3ec8dc]">Yönetici güvenliği</p>
          <h2 className="mt-1 text-[24px] font-black text-white">Şifre, oturum ve giriş denemeleri</h2>
          <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-white/55">
            Panel şifresini buradan yenileyin, şüpheli girişleri izleyin, diğer cihazlardaki oturumları tek tıkla kapatın.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-black text-white/80 hover:bg-white/10 disabled:opacity-40"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Yenile
        </button>
      </div>

      {error ? <FormError tone="dark">{error}</FormError> : null}
      {notice ? <p className="rounded-xl border border-emerald-400/25 bg-emerald-950/40 px-3 py-2 text-[12px] font-medium text-emerald-100">{notice}</p> : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#18181f] px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-wide text-[#70dce9]">Hesap</p>
          <p className="mt-1 truncate text-[20px] font-black text-white">{data?.username || "—"}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#18181f] px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-wide text-emerald-200">Aktif oturum</p>
          <p className="mt-1 text-[28px] font-black text-white">{data?.activeSessions ?? "—"}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#18181f] px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-wide text-rose-200">Başarısız (24s)</p>
          <p className="mt-1 text-[28px] font-black text-white">{data?.failed24h ?? "—"}</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={changePassword} className="rounded-[24px] border border-white/10 bg-[#18181f] p-5">
          <KeyRound className="h-5 w-5 text-[#3ec8dc]" />
          <h3 className="mt-4 text-[18px] font-black text-white">Yönetici şifresini değiştir</h3>
          <p className="mt-2 text-[11px] leading-relaxed text-white/50">
            En az 10 karakter. Değişince diğer cihazlardaki oturumlar düşer; bu tarayıcıda kalırsınız.
          </p>
          <div className="mt-5 grid gap-3">
            <label className="text-[9px] font-black uppercase tracking-wide text-white/45">
              Mevcut şifre
              <input
                required
                type="password"
                autoComplete="current-password"
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-[12px] text-white outline-none focus:border-[#00a8c4]"
              />
            </label>
            <label className="text-[9px] font-black uppercase tracking-wide text-white/45">
              Yeni şifre
              <input
                required
                minLength={10}
                maxLength={128}
                type="password"
                autoComplete="new-password"
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-[12px] text-white outline-none focus:border-[#00a8c4]"
              />
            </label>
            <label className="text-[9px] font-black uppercase tracking-wide text-white/45">
              Yeni şifre tekrar
              <input
                required
                minLength={10}
                maxLength={128}
                type="password"
                autoComplete="new-password"
                value={passwordForm.confirmPassword}
                onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-[12px] text-white outline-none focus:border-[#00a8c4]"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[11px] font-black text-white disabled:opacity-40"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> {busy ? "Kaydediliyor…" : "Şifreyi güncelle"}
          </button>
        </form>

        <section className="rounded-[24px] border border-white/10 bg-[#18181f] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-[18px] font-black text-white">Son giriş denemeleri</h3>
              <p className="mt-2 text-[11px] leading-relaxed text-white/50">
                IP saklanmaz; ziyaretçi etiketi anonim hash’ten kısaltılır.
              </p>
            </div>
            <button
              type="button"
              disabled={busy || !data || data.activeSessions <= 1}
              onClick={() => void revokeOthers()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[10px] font-black text-white/80 hover:bg-white/10 disabled:opacity-40"
            >
              <LogOut className="h-3.5 w-3.5" /> Diğer oturumları kapat
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {data?.events?.length ? (
              data.events.map((event) => (
                <div
                  key={event.id}
                  className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2.5 ${
                    event.success ? "border-white/10 bg-black/25" : "border-rose-400/20 bg-rose-950/25"
                  }`}
                >
                  <div>
                    <p className="text-[12px] font-black text-white">{event.username || "—"}</p>
                    <p className="mt-0.5 text-[10px] text-white/45">
                      {formatDate(event.createdAt)} · etiket {event.visitorTag}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${
                      event.success ? "bg-emerald-500/15 text-emerald-200" : "bg-rose-500/20 text-rose-100"
                    }`}
                  >
                    {event.success ? "Başarılı" : "Başarısız"}
                  </span>
                </div>
              ))
            ) : (
              <EmptyRow dark icon={ShieldAlert} title="Henüz giriş kaydı yok" hint="Panel girişi denendiğinde burada görünür." />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

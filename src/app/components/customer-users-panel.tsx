import { useEffect, useState, type FormEvent } from "react";
import { KeyRound, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";
import { EmptyRow } from "./empty-row";
import { apiRequest } from "../lib/api";

export type PortalUserRole = "full" | "limited";
export type PortalUserStatus = "active" | "disabled";
export type PortalUser = {
  id: number;
  name: string;
  email: string;
  role: PortalUserRole;
  status: PortalUserStatus;
  created_at: string;
};

const ROLE_LABEL: Record<PortalUserRole, string> = {
  full: "Tam Yetkili",
  limited: "Sınırlı",
};

const emptyForm = { name: "", email: "", role: "limited" as PortalUserRole, password: "" };

export function CustomerUsersPanel({ onError }: { onError: (message: string) => void }) {
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [resetFor, setResetFor] = useState<number | null>(null);
  const [resetValue, setResetValue] = useState("");

  const load = async () => {
    try {
      const next = await apiRequest<{ users: PortalUser[] }>("/api/customer/users");
      setUsers(next.users || []);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Kullanıcılar yüklenemedi.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const addUser = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    onError("");
    try {
      const next = await apiRequest<{ users: PortalUser[] }>("/api/customer/users", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setUsers(next.users || []);
      setForm(emptyForm);
      setNotice("Kullanıcı eklendi. Giriş bilgilerini kullanıcıya siz iletin.");
    } catch (error) {
      onError(error instanceof Error ? error.message : "Kullanıcı eklenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const patchUser = async (id: number, body: Record<string, unknown>, message: string) => {
    setBusy(true);
    setNotice("");
    onError("");
    try {
      const next = await apiRequest<{ users: PortalUser[] }>(`/api/customer/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      setUsers(next.users || []);
      setNotice(message);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Kullanıcı güncellenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const removeUser = async (id: number) => {
    setBusy(true);
    setNotice("");
    onError("");
    try {
      const next = await apiRequest<{ users: PortalUser[] }>(`/api/customer/users/${id}`, { method: "DELETE" });
      setUsers(next.users || []);
      setNotice("Kullanıcı silindi.");
    } catch (error) {
      onError(error instanceof Error ? error.message : "Kullanıcı silinemedi.");
    } finally {
      setBusy(false);
    }
  };

  const submitReset = async (id: number) => {
    if (resetValue.length < 10) {
      onError("Yeni şifre en az 10 karakter olmalıdır.");
      return;
    }
    await patchUser(id, { password: resetValue }, "Şifre güncellendi.");
    setResetFor(null);
    setResetValue("");
  };

  return (
    <section className="mt-7 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <form onSubmit={addUser} className="rounded-[22px] border border-[#dce7e9] bg-white p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00a8c4]/12 text-[#007f98]">
            <UserPlus className="h-5 w-5" />
          </span>
          <h2 className="text-[20px] font-black">Kullanıcı ekle</h2>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-[#64767e]">
          Ekip arkadaşlarınıza ayrı giriş açın. Şifreyi siz belirlersiniz ve kullanıcıya iletirsiniz (e-posta daveti henüz gönderilmez).
        </p>
        <div className="mt-4 grid gap-3">
          <label className="text-[9px] font-black uppercase tracking-wide text-[#718188]">
            Ad soyad
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-xl border border-[#dbe5e8] px-3 py-2.5 text-[12px] normal-case outline-none focus:border-[#00a8c4]" placeholder="Örnek: Ayşe Yılmaz" />
          </label>
          <label className="text-[9px] font-black uppercase tracking-wide text-[#718188]">
            E-posta (giriş)
            <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 w-full rounded-xl border border-[#dbe5e8] px-3 py-2.5 text-[12px] normal-case outline-none focus:border-[#00a8c4]" placeholder="kullanici@firma.com" />
          </label>
          <label className="text-[9px] font-black uppercase tracking-wide text-[#718188]">
            Rol
            <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as PortalUserRole })} className="mt-2 w-full rounded-xl border border-[#dbe5e8] px-3 py-2.5 text-[12px] outline-none focus:border-[#00a8c4]">
              <option value="limited">Sınırlı (fatura/sözleşme göremez)</option>
              <option value="full">Tam Yetkili</option>
            </select>
          </label>
          <label className="text-[9px] font-black uppercase tracking-wide text-[#718188]">
            Şifre (en az 10 karakter)
            <input required minLength={10} maxLength={128} type="text" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 w-full rounded-xl border border-[#dbe5e8] px-3 py-2.5 text-[12px] normal-case outline-none focus:border-[#00a8c4]" placeholder="Güçlü bir şifre yazın" />
          </label>
        </div>
        <button disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#00a8c4] px-4 py-3 text-[11px] font-black text-white disabled:opacity-50">
          <UserPlus className="h-4 w-4" /> {busy ? "Ekleniyor…" : "Kullanıcı oluştur"}
        </button>
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[10px] font-bold leading-relaxed text-amber-800">
          Sınırlı kullanıcılar faturaları, ödemeleri, sözleşmeleri, yenilemeleri ve güvenlik/oturum ayarlarını göremez.
        </p>
      </form>

      <div className="space-y-3">
        {notice ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[11px] font-bold text-emerald-700" role="status">{notice}</p> : null}
        {users.length ? (
          users.map((user) => (
            <article key={user.id} className="rounded-2xl border border-[#dce7e9] bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#00a8c4]" />
                    <h3 className="truncate text-[14px] font-black">{user.name || user.email}</h3>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-[#64767e]">{user.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${user.role === "full" ? "bg-[#00a8c4]/12 text-[#007f98]" : "bg-slate-100 text-slate-600"}`}>{ROLE_LABEL[user.role]}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${user.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>{user.status === "active" ? "Aktif" : "Pasif"}</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <select
                  value={user.role}
                  disabled={busy}
                  onChange={(event) => void patchUser(user.id, { role: event.target.value }, "Rol güncellendi.")}
                  className="rounded-lg border border-[#dbe5e8] px-2.5 py-1.5 text-[10px] font-black outline-none focus:border-[#00a8c4]"
                  aria-label="Rol"
                >
                  <option value="limited">Sınırlı</option>
                  <option value="full">Tam Yetkili</option>
                </select>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void patchUser(user.id, { status: user.status === "active" ? "disabled" : "active" }, user.status === "active" ? "Kullanıcı pasifleştirildi." : "Kullanıcı aktifleştirildi.")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#dbe5e8] bg-[#f5f8f9] px-2.5 py-1.5 text-[10px] font-black text-[#355661] disabled:opacity-40"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> {user.status === "active" ? "Pasifleştir" : "Aktifleştir"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => { setResetFor(resetFor === user.id ? null : user.id); setResetValue(""); }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#dbe5e8] bg-[#f5f8f9] px-2.5 py-1.5 text-[10px] font-black text-[#355661] disabled:opacity-40"
                >
                  <KeyRound className="h-3.5 w-3.5" /> Şifre sıfırla
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void removeUser(user.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[10px] font-black text-rose-700 disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Sil
                </button>
              </div>
              {resetFor === user.id ? (
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-[#e4ecee] bg-[#f7fafb] p-3">
                  <input
                    type="text"
                    value={resetValue}
                    minLength={10}
                    maxLength={128}
                    onChange={(event) => setResetValue(event.target.value)}
                    placeholder="Yeni şifre (en az 10 karakter)"
                    className="min-w-0 flex-1 rounded-lg border border-[#dbe5e8] px-3 py-2 text-[11px] normal-case outline-none focus:border-[#00a8c4]"
                  />
                  <button type="button" disabled={busy} onClick={() => void submitReset(user.id)} className="rounded-lg bg-[#00a8c4] px-3 py-2 text-[10px] font-black text-white disabled:opacity-40">
                    Kaydet
                  </button>
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <EmptyRow icon={Users} title="Henüz alt kullanıcı yok" hint="Soldaki formdan ekip arkadaşınız için giriş açın." />
        )}
      </div>
    </section>
  );
}

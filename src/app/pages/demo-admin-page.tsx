import { FormEvent, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import {
  Bell,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { DEMO_ADMIN_PASS, DEMO_ADMIN_USER, demoAdminKey, getDemoAdminSite, type DemoAdminWidget } from "../lib/demo-admin";
import { FormError } from "../components/form-error";

function isAuthed(slug: string) {
  try {
    return sessionStorage.getItem(demoAdminKey(slug)) === "1";
  } catch {
    return false;
  }
}

function setAuthed(slug: string, on: boolean) {
  try {
    if (on) sessionStorage.setItem(demoAdminKey(slug), "1");
    else sessionStorage.removeItem(demoAdminKey(slug));
  } catch {
    /* ignore */
  }
}

function copyFor(widget: DemoAdminWidget) {
  const table: Record<DemoAdminWidget, { inbox: string; col: string; rows: string[][]; stats: [string, string][]; content: [string, string][] }> = {
    taxi: {
      inbox: "Çağrılar",
      col: "Rota",
      rows: [
        ["#1042", "Defne → Antakya", "Bekliyor", "şimdi"],
        ["#1041", "Havalimanı karşılama", "Yolda", "05:10"],
        ["#1040", "İskenderun transfer", "Tamam", "dün"],
      ],
      stats: [["Bugün çağrı", "18"], ["Aktif araç", "6"], ["Ort. varış", "9 dk"]],
      content: [["Tarife: Defne–Merkez", "₺280"], ["Gece zammı", "Açık"], ["VIP araç", "2 adet"]],
    },
    move: {
      inbox: "Keşif talepleri",
      col: "Ev / güzergah",
      rows: [
        ["#88", "Defne 3+1 → İskenderun", "Keşif", "bugün"],
        ["#87", "Ofis cumartesi", "Yazılı fiyat", "yarın"],
        ["#86", "Adana hattı 2+1", "Teslim", "pazartesi"],
      ],
      stats: [["Açık keşif", "5"], ["Bu hafta iş", "3"], ["Kamyon", "14 m³ dolu"]],
      content: [["Asansör notu", "Zorunlu alan"], ["Sigorta", "Açık"], ["Teslim tutanağı", "PDF"]],
    },
    repair: {
      inbox: "Arıza kayıtları",
      col: "Cihaz",
      rows: [
        ["#221", "Klima · soğutmuyor", "Usta yolda", "Antakya"],
        ["#220", "Kombi ateşleme", "Parça onayı", "Defne"],
        ["#219", "Çamaşır makinesi", "Bitti", "İskenderun"],
      ],
      stats: [["Açık iş", "7"], ["Aynı gün", "4"], ["Parça bekleyen", "2"]],
      content: [["Bakış ücreti klima", "₺450’den"], ["Mesai dışı", "Aramada"], ["Marka listesi", "Yayında"]],
    },
    book: {
      inbox: "Randevular",
      col: "Hizmet",
      rows: [
        ["#55", "Bugün 16:30", "Onaylı", "Elif A."],
        ["#54", "Yarın 10:00", "Bekliyor", "Yeni hasta"],
        ["#53", "Cuma 09:30", "Onaylı", "Kontrol"],
      ],
      stats: [["Bu hafta", "12"], ["Boş saat", "5"], ["İptal", "1"]],
      content: [["Çalışma", "09:00–19:00"], ["WhatsApp randevu", "Açık"], ["Hatırlatma SMS", "Kapalı"]],
    },
    call: {
      inbox: "Gelen talepler",
      col: "Konu",
      rows: [
        ["#31", "WhatsApp sipariş", "Yeni", "şimdi"],
        ["#30", "Servis / keşif", "Arandı", "12:40"],
        ["#29", "Fiyat sorusu", "Kapandı", "dün"],
      ],
      stats: [["Bugün talep", "9"], ["Cevapsız", "2"], ["Teslim", "4"]],
      content: [["Çalışma saati", "Yayında"], ["Mahalle servisi", "Açık"], ["Stok notu", "Elle"]],
    },
    shop: {
      inbox: "Siparişler",
      col: "Ürün",
      rows: [
        ["#901", "Kolye · kargo", "Hazırlanıyor", "₺390"],
        ["#900", "Matkap", "Ödendi", "₺2.450"],
        ["#899", "İade talebi", "İnceleme", "—"],
      ],
      stats: [["Bugün sipariş", "6"], ["Stok uyarı", "3"], ["İade", "1"]],
      content: [["Kapıda ödeme", "Açık"], ["Kargo", "Hatay içi ertesi gün"], ["Stok eşiği", "5 adet"]],
    },
    menu: {
      inbox: "Rezervasyonlar",
      col: "Masa",
      rows: [
        ["#12", "4 kişilik 20:00", "Onaylı", "Asmalı"],
        ["#11", "Paket künefe", "Hazır", "Defne"],
        ["#10", "2 kişilik", "Bekliyor", "21:00"],
      ],
      stats: [["Bu akşam masa", "8"], ["Paket", "5"], ["İptal", "0"]],
      content: [["Menü künefe", "₺180 · yayında"], ["Stok biten", "İçli köfte gizli"], ["Paket saat", "21:30 son"]],
    },
    listing: {
      inbox: "İlanlar",
      col: "Portföy",
      rows: [
        ["#D-12", "Defne 3+1", "Yayında", "₺4.25M"],
        ["#K-04", "Antakya kiralık 2+1", "Yayında", "₺18.500"],
        ["#V-01", "İskenderun villa", "Taslak", "Teklif"],
      ],
      stats: [["Yayında ilan", "11"], ["Bu hafta gezi", "4"], ["Taslak", "2"]],
      content: [["Aidat alanı", "Zorunlu"], ["m² doğrulama", "Açık"], ["Danışman", "2 kişi"]],
    },
    software: {
      inbox: "Modül istekleri",
      col: "Modül",
      rows: [
        ["#P-3", "Stok hareketi", "Yapımda", "depo"],
        ["#P-2", "Rapor Excel", "Kuyruk", "muhasebe"],
        ["#P-1", "Randevu SMS", "Bitti", "—"],
      ],
      stats: [["Açık iş", "4"], ["Kullanıcı", "8"], ["Entegrasyon", "2"]],
      content: [["Canlı ortam", "demo"], ["Yedekleme", "gecelik"], ["Yetki", "rol bazlı"]],
    },
    app: {
      inbox: "Uygulama kullanıcıları",
      col: "Cihaz",
      rows: [
        ["#u19", "Android 14", "Aktif", "bildirim açık"],
        ["#u18", "iOS 18", "Aktif", "sipariş"],
        ["#u17", "Android", "Pasif", "—"],
      ],
      stats: [["Yüklü", "124"], ["Bugün açılış", "41"], ["Push", "açık"]],
      content: [["Play sürüm", "1.0.4"], ["App Store", "incelemede"], ["Zorunlu güncelleme", "Kapalı"]],
    },
  };
  return table[widget];
}

function DemoPanelNotice({ dark }: { dark?: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4">
      <div
        className={`pointer-events-auto mx-auto flex max-w-3xl flex-col gap-3 rounded-[22px] px-4 py-3.5 shadow-[0_18px_50px_rgba(15,23,42,0.18)] sm:flex-row sm:items-center sm:gap-5 ${
          dark ? "border border-white/15 bg-[#0b1c24]/95 text-white backdrop-blur" : "border border-[#fde68a] bg-white/95 text-[#0f172a] backdrop-blur"
        }`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#fff7ed] text-[#d97706]">
          <Sparkles className="h-5 w-5" />
        </span>
        <p className={`flex-1 text-[13px] leading-relaxed font-semibold ${dark ? "text-white/85" : "text-[#334155]"}`}>
          Bu ekran <b>sadece demo tasarımı</b> — gerçek panel değil. Hatay360’ın asıl e-ticaret yönetim paneli bundan çok daha dolu ve profesyonel. İsterseniz canlısını gösterelim.
        </p>
        <Link
          to="/iletisim"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[13px] font-black text-white shadow-[0_8px_20px_rgba(0,168,196,0.35)]"
        >
          Demo isteyin
        </Link>
      </div>
    </div>
  );
}

export function DemoAdminLoginPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const site = getDemoAdminSite(slug);
  const [user, setUser] = useState(DEMO_ADMIN_USER);
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  if (!site) return <Navigate to="/demolar" replace />;
  if (isAuthed(slug)) return <Navigate to={`/demo/${slug}/panel`} replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (user.trim().toLocaleLowerCase("tr-TR") === DEMO_ADMIN_USER && pass === DEMO_ADMIN_PASS) {
      setAuthed(slug, true);
      navigate(`/demo/${slug}/panel`, { replace: true });
      return;
    }
    setError("Kullanıcı veya şifre hatalı. Örnek: avc / demo360");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#071018] px-5 pb-36">
      <form onSubmit={submit} className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0c1620] p-8 text-white">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7ee0ec]">Demo panel girişi</p>
        <h1 className="mt-3 text-[28px] font-black">{site.brand}</h1>
        <p className="mt-2 text-[14px] text-white/60">Gezmek için örnek hesap. Gerçek yönetim paneli teslimde size özel açılır.</p>
        <p className="mt-4 rounded-xl bg-white/5 px-3 py-2 text-[12px] font-bold text-[#9beaf2]">
          Kullanıcı: {DEMO_ADMIN_USER} · Şifre: {DEMO_ADMIN_PASS}
        </p>
        <label className="mt-5 block text-[12px] font-black text-white/70">
          Kullanıcı adı
          <input required autoComplete="username" value={user} onChange={(e) => { setUser(e.target.value); setError(""); }} className="mt-2 w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" />
        </label>
        <label className="mt-4 block text-[12px] font-black text-white/70">
          Şifre
          <input required type="password" autoComplete="current-password" value={pass} onChange={(e) => { setPass(e.target.value); setError(""); }} className="mt-2 w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" />
        </label>
        {error && <div className="mt-3"><FormError tone="dark">{error}</FormError></div>}
        <button type="submit" className="mt-6 w-full rounded-xl bg-[#00a8c4] py-3 text-[15px] font-black">Panele gir</button>
        <Link to={`/demo/${slug}`} className="mt-4 block text-center text-[12px] font-bold text-white/45">Siteye dön</Link>
      </form>
      <DemoPanelNotice dark />
    </div>
  );
}

export function DemoAdminPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const site = getDemoAdminSite(slug);
  const [tab, setTab] = useState<"ozet" | "kayit" | "icerik">("ozet");
  const data = useMemo(() => (site ? copyFor(site.widget) : null), [site]);

  if (!site || !data) return <Navigate to="/demolar" replace />;
  if (!isAuthed(slug)) return <Navigate to={`/demo/${slug}/panel/giris`} replace />;

  return (
    <div className="min-h-screen bg-[#f4f7fa] pb-36 text-[#0f172a]">
      <header className="border-b border-[#e2e8f0] bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00a8c4]">Hatay360 · demo müşteri paneli</p>
            <p className="text-[16px] font-black">{site.brand}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/demo/${slug}`} className="rounded-xl border border-[#e2e8f0] px-3 py-2 text-[12px] font-black">Siteyi gör</Link>
            <button
              type="button"
              onClick={() => { setAuthed(slug, false); navigate(`/demo/${slug}/panel/giris`); }}
              className="inline-flex items-center gap-1 rounded-xl bg-[#0f172a] px-3 py-2 text-[12px] font-black text-white"
            >
              <LogOut className="h-3.5 w-3.5" /> Çıkış
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { id: "ozet" as const, icon: LayoutDashboard, l: "Özet" },
            { id: "kayit" as const, icon: Bell, l: data.inbox },
            { id: "icerik" as const, icon: Settings, l: "İçerik / ayar" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-black ${tab === t.id ? "bg-[#0f172a] text-white" : "bg-white text-[#475569] ring-1 ring-[#e2e8f0]"}`}
            >
              <t.icon className="h-4 w-4" /> {t.l}
            </button>
          ))}
        </div>

        {tab === "ozet" && (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {data.stats.map(([k, v]) => (
              <div key={k} className="rounded-[24px] bg-white p-5 shadow-sm">
                <p className="text-[12px] font-black uppercase tracking-wider text-[#64748b]">{k}</p>
                <p className="mt-2 text-[28px] font-black" style={{ color: site.accent }}>{v}</p>
              </div>
            ))}
            <div className="rounded-[24px] bg-white p-5 shadow-sm sm:col-span-3">
              <p className="flex items-center gap-2 text-[14px] font-black"><Users className="h-4 w-4 text-[#00a8c4]" /> Kim yönetir?</p>
              <p className="mt-2 text-[14px] leading-relaxed text-[#475569]">
                Giriş yapan: <b>avc</b> · yetki: işletme sahibi. Personel eklenince herkese ayrı şifre verilir. Hatay360 asıl siteyi kurar; günlük iş gerçek panelden yürür.
              </p>
            </div>
          </div>
        )}

        {tab === "kayit" && (
          <div className="mt-6 overflow-hidden rounded-[24px] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#eef2f7] px-5 py-4">
              <p className="font-black">{data.inbox}</p>
              <span className="text-[11px] font-bold text-[#64748b]">Örnek kayıt · kaydetmez</span>
            </div>
            <div className="grid grid-cols-4 gap-2 bg-[#f8fafc] px-5 py-2 text-[11px] font-black uppercase tracking-wider text-[#94a3b8]">
              <span>No</span><span>{data.col}</span><span>Durum</span><span>Not</span>
            </div>
            {data.rows.map((row) => (
              <div key={row[0]} className="grid grid-cols-4 gap-2 border-t border-[#eef2f7] px-5 py-3 text-[13px] font-bold">
                {row.map((c) => <span key={c}>{c}</span>)}
              </div>
            ))}
          </div>
        )}

        {tab === "icerik" && (
          <div className="mt-6 grid gap-3">
            {data.content.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-sm">
                <span className="font-black">{k}</span>
                <span className="rounded-full bg-[#ecfeff] px-3 py-1 text-[12px] font-black text-[#0e7490]">{v}</span>
              </div>
            ))}
            <div className="flex items-start gap-3 rounded-2xl border border-dashed border-[#cbd5e1] px-5 py-4 text-[13px] text-[#64748b]">
              <Package className="mt-0.5 h-4 w-4" /> Fotoğraf, fiyat, menü, ilan ve çalışma saati gerçek panelde buradan değişir.
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-[#0f172a] px-5 py-4 text-[13px] text-white/80">
              <Shield className="mt-0.5 h-4 w-4 text-[#7ee0ec]" />
              <span><CalendarDays className="mr-1 inline h-3.5 w-3.5" /> Hatay360 kendi /panel’i ayrıdır. Bu ekran müşteri sitesinin yönetimidir.</span>
            </div>
          </div>
        )}
      </div>
      <DemoPanelNotice />
    </div>
  );
}

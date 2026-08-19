import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Download, Handshake, Phone, RefreshCw } from "lucide-react";
import { apiRequest } from "../lib/api";

type LeadKind = "callback" | "maps" | "new_customer" | "partner" | string;
type Lead = {
  id: number;
  name: string;
  phone: string;
  email?: string;
  service: string;
  source_path: string;
  status: "new" | "contacted" | "won" | "closed";
  kind?: LeadKind;
  sector?: string;
  district?: string;
  address?: string;
  hours?: string;
  website?: string;
  notes?: string;
  sms_ok?: number;
  created_at: string;
};
type Partner = {
  id: number;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  city: string;
  website: string;
  notes: string;
  commission_rate: number;
  status: "pending" | "active" | "paused";
  created_at: string;
};

const KIND_LABELS: Record<string, string> = {
  callback: "Sizi arayalım",
  maps: "Harita kaydı",
  new_customer: "Yeni müşteri",
  partner: "Bayi",
};
const STATUS_LABELS = { new: "Yeni", contacted: "Arandı", won: "Müşteri oldu", closed: "Kapatıldı" };
const PARTNER_STATUS = { pending: "Onay bekliyor", active: "Aktif", paused: "Duraklatıldı" };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export function AdminSignupsPanel() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filter, setFilter] = useState<"all" | LeadKind>("all");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [leadsResult, partnersResult] = await Promise.all([
        apiRequest<{ leads: Lead[] }>("/api/leads"),
        apiRequest<{ partners: Partner[] }>("/api/admin/partners"),
      ]);
      setLeads(leadsResult.leads);
      setPartners(partnersResult.partners);
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Kayıtlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(
    () => (filter === "all" ? leads : leads.filter((lead) => (lead.kind || "callback") === filter)),
    [filter, leads],
  );

  const copyPhones = async () => {
    const phones = [...new Set(leads.filter((lead) => lead.sms_ok !== 0).map((lead) => lead.phone).filter(Boolean))];
    await navigator.clipboard.writeText(phones.join("\n"));
    setNotice(`${phones.length} numara kopyalandı. Toplu SMS aracıza yapıştırın.`);
  };

  const updateLead = async (id: number, status: Lead["status"]) => {
    await apiRequest(`/api/leads/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    await load();
  };

  const updatePartner = async (id: number, payload: { status?: Partner["status"]; commissionRate?: number }) => {
    await apiRequest(`/api/admin/partners/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
    await load();
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#3ec8dc]">Kayıt kutusu</p>
          <h2 className="mt-1 text-[26px] font-black text-white">Yeni müşteri, harita ve bayi başvuruları</h2>
          <p className="mt-1 max-w-3xl text-[13px] text-white/55">Sizi arayın, sonra müşteriye çevirin. SMS onayı veren numaralar toplu dışa aktarılır.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void copyPhones()} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-white/10">
            <Copy className="h-4 w-4" /> Numaraları kopyala
          </button>
          <a href="/api/leads/sms.csv" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-white/10">
            <Download className="h-4 w-4" /> SMS CSV
          </a>
          <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-white/10">
            <RefreshCw className="h-4 w-4" /> Yenile
          </button>
        </div>
      </div>

      {notice && <p className="rounded-2xl border border-cyan-400/25 bg-cyan-950/40 px-4 py-3 text-[13px] font-bold text-cyan-100">{notice}</p>}

      <div className="flex flex-wrap gap-2">
        {(["all", "maps", "new_customer", "partner", "callback"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-black ${filter === item ? "bg-[#00a8c4] text-white" : "bg-white/5 text-white/60"}`}
          >
            {item === "all" ? "Tümü" : KIND_LABELS[item]}
          </button>
        ))}
      </div>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#18181f]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-[12px]">
            <thead className="bg-black/25 text-white/45">
              <tr>
                <th className="px-5 py-3">Tarih</th>
                <th className="px-5 py-3">Kaynak</th>
                <th className="px-5 py-3">Kişi</th>
                <th className="px-5 py-3">Telefon</th>
                <th className="px-5 py-3">İş / sektör</th>
                <th className="px-5 py-3">Adres</th>
                <th className="px-5 py-3">SMS</th>
                <th className="px-5 py-3">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visible.map((lead) => (
                <tr key={lead.id} className="align-top text-white/75 hover:bg-white/[0.03]">
                  <td className="whitespace-nowrap px-5 py-3">{formatDate(lead.created_at)}</td>
                  <td className="px-5 py-3 font-black text-[#7ee0ec]">{KIND_LABELS[lead.kind || "callback"] || lead.kind}</td>
                  <td className="px-5 py-3">
                    <p className="font-bold text-white">{lead.name}</p>
                    <p className="text-[10px] text-white/40">{lead.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <a className="inline-flex items-center gap-1 text-[#7ee0ec] hover:underline" href={`tel:${lead.phone}`}>
                      <Phone className="h-3.5 w-3.5" /> {lead.phone}
                    </a>
                  </td>
                  <td className="px-5 py-3">
                    <p>{lead.service}</p>
                    <p className="text-[10px] text-white/40">{[lead.sector, lead.district].filter(Boolean).join(" · ")}</p>
                    {lead.notes && <p className="mt-1 max-w-xs text-[10px] leading-relaxed text-white/45">{lead.notes}</p>}
                    {lead.hours && <p className="mt-1 max-w-xs text-[10px] text-white/35">{lead.hours}</p>}
                  </td>
                  <td className="max-w-[220px] px-5 py-3 text-white/60">{lead.address || "—"}</td>
                  <td className="px-5 py-3">{lead.sms_ok === 0 ? "Hayır" : "Evet"}</td>
                  <td className="px-5 py-3">
                    <select
                      value={lead.status}
                      onChange={(event) => void updateLead(lead.id, event.target.value as Lead["status"])}
                      className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 font-bold text-white"
                    >
                      {(Object.keys(STATUS_LABELS) as Array<Lead["status"]>).map((status) => (
                        <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {!visible.length && !loading && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-white/40">Bu filtrede kayıt yok.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#18181f] p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Handshake className="h-5 w-5 text-[#a5b4fc]" />
          <h3 className="text-[17px] font-black text-white">Bayi firmalar</h3>
        </div>
        <p className="mt-1 text-[12px] text-white/45">Onaylayınca firma girişi açılır. Komisyon yüzdesini buradan yazın.</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {partners.map((partner) => (
            <article key={partner.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[14px] font-black text-white">{partner.company_name}</p>
                  <p className="mt-1 text-[11px] text-white/50">{partner.contact_name} · {partner.email} · {partner.phone}</p>
                  <p className="mt-1 text-[11px] text-white/40">{partner.city} {partner.website ? `· ${partner.website}` : ""}</p>
                </div>
                <span className="rounded-full bg-white/8 px-2 py-1 text-[9px] font-black text-white/70">{PARTNER_STATUS[partner.status]}</span>
              </div>
              {partner.notes && <p className="mt-3 text-[11px] leading-relaxed text-white/50">{partner.notes}</p>}
              <div className="mt-4 flex flex-wrap items-end gap-2">
                <label className="text-[10px] font-black text-white/45">
                  Komisyon %
                  <input
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={partner.commission_rate}
                    onBlur={(event) => void updatePartner(partner.id, { commissionRate: Number(event.target.value) })}
                    className="mt-1 w-24 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-[12px] font-bold text-white"
                  />
                </label>
                <select
                  value={partner.status}
                  onChange={(event) => void updatePartner(partner.id, { status: event.target.value as Partner["status"] })}
                  className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-[12px] font-bold text-white"
                >
                  <option value="pending">Onay bekliyor</option>
                  <option value="active">Aktif et</option>
                  <option value="paused">Duraklat</option>
                </select>
              </div>
            </article>
          ))}
          {!partners.length && <p className="rounded-xl bg-black/20 p-4 text-[12px] text-white/40">Henüz bayi başvurusu yok.</p>}
        </div>
      </section>
    </div>
  );
}

import { Plus, Trash2, Scale } from "lucide-react";
import type { SiteSettings } from "../context/content-context";
import {
  DEFAULT_CORPORATE_CONTENT,
  emptyCorporateValue,
  normalizeCorporateContent,
  type CorporateContent,
  type LegalDoc,
  type LegalDocId,
} from "../lib/corporate-content";

type Props = {
  settings: SiteSettings;
  onChange: (next: SiteSettings) => void;
};

const LEGAL_LABELS: Record<LegalDocId, string> = {
  kvkk: "KVKK Aydınlatma",
  gizlilik: "Gizlilik Politikası",
  mesafeli: "Mesafeli Satış",
  kosullar: "Kullanım Koşulları",
};

function setCorporate(settings: SiteSettings, corporate: CorporateContent): SiteSettings {
  return { ...settings, corporate };
}

export function AdminCorporatePanel({ settings, onChange }: Props) {
  const c = normalizeCorporateContent(settings.corporate);

  const patch = (partial: Partial<CorporateContent>) => {
    onChange(setCorporate(settings, { ...c, ...partial }));
  };

  const setLegal = (id: LegalDocId, next: LegalDoc) => {
    patch({
      legalDocs: c.legalDocs.map((d) => (d.id === id ? next : d)),
    });
  };

  const field = (label: string, value: string, onVal: (v: string) => void, rows = 1) => (
    <div>
      <label className="text-[11px] font-bold uppercase tracking-wide text-white/50">{label}</label>
      {rows > 1 ? (
        <textarea
          value={value}
          rows={rows}
          onChange={(e) => onVal(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-[13px] font-medium text-white"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onVal(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-[13px] font-medium text-white"
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00a8c4]/20 text-[#70dce9]">
            <Scale className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[15px] font-black text-white">Kurumsal & yasal sayfalar</p>
            <p className="mt-1 text-[12px] leading-relaxed text-white/50">
              /kurumsal, /hakkimizda, /misyon, /vizyon, /kvkk, /gizlilik, /mesafeli-satis, /kosullar — metinler buradan canlıya yansır. Kaydet’e basmayı unutmayın.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange(setCorporate(settings, JSON.parse(JSON.stringify(DEFAULT_CORPORATE_CONTENT))))}
          className="mt-4 rounded-xl border border-white/15 px-3 py-2 text-[12px] font-bold text-white/70 hover:bg-white/5"
        >
          Varsayılan metinlere sıfırla
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-3">
        <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#70dce9]">Kurumsal hub</p>
        {field("Üst etiket", c.hubEyebrow, (hubEyebrow) => patch({ hubEyebrow }))}
        {field("Başlık", c.hubTitle, (hubTitle) => patch({ hubTitle }))}
        {field("Özet", c.hubLead, (hubLead) => patch({ hubLead }), 3)}
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-3">
        <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#70dce9]">Biz kimiz / Hakkımızda</p>
        {field("Başlık etiketi", c.aboutTitle, (aboutTitle) => patch({ aboutTitle }))}
        {field("Ana başlık", c.aboutLead, (aboutLead) => patch({ aboutLead }))}
        {field("Metin", c.aboutBody, (aboutBody) => patch({ aboutBody }), 5)}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-3">
          <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#70dce9]">Misyon</p>
          {field("Başlık", c.missionTitle, (missionTitle) => patch({ missionTitle }))}
          {field("Metin", c.missionBody, (missionBody) => patch({ missionBody }), 6)}
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-3">
          <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#70dce9]">Vizyon</p>
          {field("Başlık", c.visionTitle, (visionTitle) => patch({ visionTitle }))}
          {field("Metin", c.visionBody, (visionBody) => patch({ visionBody }), 6)}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#70dce9]">Değerler</p>
          <button
            type="button"
            onClick={() => patch({ values: [...c.values, emptyCorporateValue()] })}
            className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-bold text-white/80"
          >
            <Plus className="h-3.5 w-3.5" /> Ekle
          </button>
        </div>
        {field("Bölüm başlığı", c.valuesTitle, (valuesTitle) => patch({ valuesTitle }))}
        <div className="space-y-3">
          {c.values.map((v, i) => (
            <div key={v.id} className="rounded-xl border border-white/10 bg-black/25 p-3 space-y-2">
              <div className="flex justify-between gap-2">
                <input
                  value={v.title}
                  onChange={(e) => {
                    const values = c.values.map((row, idx) => (idx === i ? { ...row, title: e.target.value } : row));
                    patch({ values });
                  }}
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-2.5 py-2 text-[13px] font-bold text-white"
                />
                <button
                  type="button"
                  onClick={() => patch({ values: c.values.filter((_, idx) => idx !== i) })}
                  className="rounded-lg border border-red-500/30 p-2 text-red-300"
                  aria-label="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                value={v.text}
                rows={2}
                onChange={(e) => {
                  const values = c.values.map((row, idx) => (idx === i ? { ...row, text: e.target.value } : row));
                  patch({ values });
                }}
                className="w-full rounded-lg border border-white/15 bg-black/40 px-2.5 py-2 text-[12px] text-white/90"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {(
          [
            { key: "policies" as const, titleKey: "policiesTitle" as const, label: "Politika maddeleri" },
            { key: "principles" as const, titleKey: "principlesTitle" as const, label: "İlke maddeleri" },
          ] as const
        ).map((block) => (
          <div key={block.key} className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#70dce9]">{block.label}</p>
              <button
                type="button"
                onClick={() => patch({ [block.key]: [...c[block.key], "Yeni madde"] })}
                className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-bold text-white/80"
              >
                <Plus className="h-3.5 w-3.5" /> Ekle
              </button>
            </div>
            {field("Başlık", c[block.titleKey], (val) => patch({ [block.titleKey]: val }))}
            {c[block.key].map((item, i) => (
              <div key={`${block.key}-${i}`} className="flex gap-2">
                <textarea
                  value={item}
                  rows={2}
                  onChange={(e) => {
                    const next = c[block.key].map((row, idx) => (idx === i ? e.target.value : row));
                    patch({ [block.key]: next });
                  }}
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-2.5 py-2 text-[12px] text-white"
                />
                <button
                  type="button"
                  onClick={() => patch({ [block.key]: c[block.key].filter((_, idx) => idx !== i) })}
                  className="rounded-lg border border-red-500/30 p-2 text-red-300 self-start"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-3">
        <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#70dce9]">İstatistik şeridi</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {c.stats.map((s, i) => (
            <div key={s.id} className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 p-3">
              <input
                value={s.value}
                onChange={(e) => {
                  const stats = c.stats.map((row, idx) => (idx === i ? { ...row, value: e.target.value } : row));
                  patch({ stats });
                }}
                placeholder="Değer"
                className="rounded-lg border border-white/15 bg-black/40 px-2.5 py-2 text-[13px] font-bold text-white"
              />
              <input
                value={s.label}
                onChange={(e) => {
                  const stats = c.stats.map((row, idx) => (idx === i ? { ...row, label: e.target.value } : row));
                  patch({ stats });
                }}
                placeholder="Etiket"
                className="rounded-lg border border-white/15 bg-black/40 px-2.5 py-2 text-[13px] text-white"
              />
            </div>
          ))}
        </div>
      </div>

      {c.legalDocs.map((doc) => (
        <div key={doc.id} className="rounded-2xl border border-[#00a8c4]/25 bg-black/30 p-5 space-y-3">
          <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#70dce9]">
            Yasal · {LEGAL_LABELS[doc.id]}
          </p>
          <p className="text-[11px] text-white/40">
            Yol: /{doc.id === "mesafeli" ? "mesafeli-satis" : doc.id}
          </p>
          {field("Üst etiket", doc.eyebrow, (eyebrow) => setLegal(doc.id, { ...doc, eyebrow }))}
          {field("Başlık", doc.title, (title) => setLegal(doc.id, { ...doc, title }))}
          {field("Özet", doc.summary, (summary) => setLegal(doc.id, { ...doc, summary }), 2)}
          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] font-bold text-white/50">Bölümler</p>
            <button
              type="button"
              onClick={() =>
                setLegal(doc.id, {
                  ...doc,
                  sections: [
                    ...doc.sections,
                    {
                      id: `sec-${Date.now()}`,
                      heading: "Yeni bölüm",
                      body: "İçerik",
                    },
                  ],
                })
              }
              className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-bold text-white/80"
            >
              <Plus className="h-3.5 w-3.5" /> Bölüm ekle
            </button>
          </div>
          <div className="space-y-3">
            {doc.sections.map((sec, si) => (
              <div key={sec.id} className="rounded-xl border border-white/10 bg-black/25 p-3 space-y-2">
                <div className="flex gap-2">
                  <input
                    value={sec.heading}
                    onChange={(e) => {
                      const sections = doc.sections.map((row, idx) =>
                        idx === si ? { ...row, heading: e.target.value } : row,
                      );
                      setLegal(doc.id, { ...doc, sections });
                    }}
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-2.5 py-2 text-[13px] font-bold text-white"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setLegal(doc.id, { ...doc, sections: doc.sections.filter((_, idx) => idx !== si) })
                    }
                    className="rounded-lg border border-red-500/30 p-2 text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  value={sec.body}
                  rows={4}
                  onChange={(e) => {
                    const sections = doc.sections.map((row, idx) =>
                      idx === si ? { ...row, body: e.target.value } : row,
                    );
                    setLegal(doc.id, { ...doc, sections });
                  }}
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-2.5 py-2 text-[12px] leading-relaxed text-white/90"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, Clock, HelpCircle, MessageCircle, MessageSquareText, Send } from "lucide-react";
import { useContent } from "../context/content-context";
import { supportDeskStatus, supportHoursCopy, ticketQueueConfirmCopy } from "../lib/contact";
import { EmptyRow } from "./empty-row";
import { SisterBrandRow } from "./sister-brands";

export type PortalTicket = {
  id: number;
  subject: string;
  message: string;
  status: string;
  priority: string;
  admin_reply: string;
  created_at: string;
  queue_position?: number;
};

export type TicketQueueConfirm = {
  id: number;
  queuePosition: number | null;
};

export type SupportLive = {
  hatay360: {
    open: number;
    answering: number;
    answered: number;
    waiting: number;
    operatorWatching: number;
    avgReplyMinutes: number | null;
    whatsappWaiting: number;
  };
  ecosystem: {
    label: string;
    note: string;
    sisterSystems: number;
    hatay360Waiting: number;
    whatsappWaiting: number;
  };
  mine: {
    ticketId: number | null;
    ticketPosition: number | null;
    ticketServing: boolean;
    whatsappId: number | null;
    whatsappPosition: number | null;
    whatsappServing: boolean;
  };
};

const statusLabel: Record<string, string> = {
  open: "Açık",
  answering: "Cevaplanıyor",
  answered: "Yanıtlandı",
  closed: "Kapalı",
};

function formatMinutes(value: number | null) {
  if (value == null) return "—";
  if (value < 60) return `${value} dk`;
  const hours = Math.round(value / 60);
  return `${hours} sa`;
}

function LiveChip({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className={`live-chip-pulse rounded-2xl border border-[#d5e6ea] bg-white px-3 py-3 ${tone || ""}`}>
      <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-[#6e8188]">
        <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00a8c4]" />
        {label}
      </span>
      <p className="mt-1 text-[20px] font-black tabular-nums text-[#102b35]">{value}</p>
    </div>
  );
}

function QueueDigit({ value, serving, empty }: { value: number | null; serving: boolean; empty: string }) {
  const [flash, setFlash] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current === value) return;
    setFlash(true);
    const timer = window.setTimeout(() => setFlash(false), 280);
    prev.current = value;
    return () => window.clearTimeout(timer);
  }, [value]);
  const text = serving ? "Bakılıyor" : value != null ? String(value) : empty;
  return <span className={`queue-digit inline-block tabular-nums ${flash ? "queue-digit-flash" : ""}`}>{text}</span>;
}

export function CustomerHelpCenter({
  tickets,
  live,
  ticket,
  busy,
  confirm,
  onTicketChange,
  onSubmitTicket,
  onDismissConfirm,
  onWhatsApp,
}: {
  tickets: PortalTicket[];
  live: SupportLive | null;
  ticket: { subject: string; message: string; priority: string };
  busy: boolean;
  confirm?: TicketQueueConfirm | null;
  onTicketChange: (next: { subject: string; message: string; priority: string }) => void;
  onSubmitTicket: (event: FormEvent) => void;
  onDismissConfirm?: () => void;
  onWhatsApp: () => void;
}) {
  const { settings } = useContent();
  const desk = supportDeskStatus(settings.supportWeekdayHours, settings.supportSaturdayHours);
  const hours = supportHoursCopy(settings.supportWeekdayHours, settings.supportSaturdayHours);
  const confirmHeadingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!confirm) return;
    confirmHeadingRef.current?.focus();
  }, [confirm]);
  const rank = (status: string) => (status === "open" ? 0 : status === "answering" ? 1 : 2);
  const ordered = [...tickets].sort((a, b) => rank(a.status) - rank(b.status));
  const openCount = ordered.filter((item) => item.status === "open" || item.status === "answering").length;
  const mine = live?.mine;
  const stats = live?.hatay360;
  const etaMinutes =
    mine?.ticketServing
      ? 0
      : mine?.ticketPosition && stats?.avgReplyMinutes
        ? Math.max(1, Math.round(mine.ticketPosition * stats.avgReplyMinutes))
        : null;

  return (
    <section className="mt-7 space-y-5" aria-labelledby="customer-help-heading">
      <div className="rounded-[24px] border border-[#b7e0e8] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">Sıranız</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#071b22] px-4 py-4 text-white">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#70dce9]">Ticket</p>
            <p className="mt-2 text-[28px] font-black leading-none">
              <QueueDigit value={mine?.ticketPosition ?? null} serving={Boolean(mine?.ticketServing)} empty="—" />
            </p>
            <p className="mt-2 text-[10px] text-white/50">
              {mine?.ticketServing
                ? "Operatör bakıyor"
                : mine?.ticketPosition
                  ? etaMinutes
                    ? `Kuyruk · tahmini ~${formatMinutes(etaMinutes)}`
                    : "Kuyruktaki yeriniz"
                  : "Açık ticket yok"}
            </p>
          </div>
          <div className="rounded-2xl border border-[#dce7e9] bg-[#f7fbfc] px-4 py-4">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#00a8c4]">WhatsApp</p>
            <p className="mt-2 text-[28px] font-black leading-none text-[#102b35]">
              <QueueDigit value={mine?.whatsappPosition ?? null} serving={Boolean(mine?.whatsappServing)} empty="—" />
            </p>
            <p className="mt-2 text-[10px] text-[#6d7f86]">{mine?.whatsappServing ? "Operatör bakıyor" : mine?.whatsappPosition ? "WP kuyruğundaki yeriniz" : "WhatsApp sırası yok"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <LiveChip label="Açık" value={stats?.open ?? 0} />
        <LiveChip label="Cevaplanıyor" value={stats?.answering ?? 0} />
        <LiveChip label="Ort. yanıt" value={formatMinutes(stats?.avgReplyMinutes ?? null)} />
      </div>

      <div className="rounded-[22px] border border-[#dce7e9] bg-[#f7fbfc] p-4">
        <p className="text-[11px] leading-relaxed text-[#64767e]">Sayılar yalnızca Hatay360 kuyruğudur; Avcı E-Ticaret ve AvcNova ayrıdır.</p>
        <SisterBrandRow className="mt-3" compact />
      </div>

      {confirm ? (
        <div className="rounded-[24px] border border-[#9ad7e2] bg-[#e8f8fb] p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)]" role="status" aria-live="polite">
          <CheckCircle2 className="h-9 w-9 text-[#00a8c4]" aria-hidden />
          <h3
            ref={confirmHeadingRef}
            tabIndex={-1}
            className="mt-3 text-[20px] font-black text-[#102b35] outline-none focus-visible:ring-2 focus-visible:ring-[#00a8c4] focus-visible:ring-offset-2"
          >
            Talebiniz kuyruğa alındı
          </h3>
          {confirm.queuePosition != null && confirm.queuePosition > 0 ? (
            <p className="mt-3 text-[28px] font-black leading-none tabular-nums text-[#071b22]">Sıra {confirm.queuePosition}</p>
          ) : null}
          <p className="mt-3 text-[13px] leading-relaxed text-[#4d6169]">
            {ticketQueueConfirmCopy(settings.supportWeekdayHours, settings.supportSaturdayHours)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="inline-flex min-h-[44px] items-center rounded-xl bg-[#071b22] px-4 py-2.5 text-[12px] font-black text-white"
            >
              Ticketlerinize bakın
            </button>
            {onDismissConfirm ? (
              <button
                type="button"
                onClick={() => {
                  onDismissConfirm();
                  document.getElementById("new-ticket-heading")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="inline-flex min-h-[44px] items-center rounded-xl border border-[#bfe1e6] bg-white px-4 py-2.5 text-[12px] font-black text-[#007f98]"
              >
                Yeni ticket
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div ref={listRef} className="flex items-end justify-between gap-3 scroll-mt-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">Destek</p>
          <h2 id="customer-help-heading" className="mt-1 text-[22px] font-black">Ticketleriniz</h2>
        </div>
        {openCount > 0 ? <span className="rounded-full bg-[#00a8c4] px-2.5 py-1 text-[9px] font-black text-white">{openCount} açık</span> : null}
      </div>

      <div
        role="status"
        aria-live="polite"
        className={`flex items-start gap-3 rounded-[20px] border px-4 py-3 ${
          desk.open ? "border-emerald-200 bg-emerald-50/80" : "border-amber-200 bg-amber-50/80"
        }`}
      >
        <Clock className={`mt-0.5 h-4 w-4 shrink-0 ${desk.open ? "text-emerald-700" : "text-amber-700"}`} aria-hidden />
        <div className="min-w-0">
          <p className={`text-[11px] font-black ${desk.open ? "text-emerald-800" : "text-amber-900"}`}>
            {desk.badge}
            {desk.nextLabel ? <span className="ml-2 font-bold">· {desk.nextLabel}</span> : null}
            <span className="ml-2 font-bold text-[#5a6d75]">· {hours.weekdayLine}</span>
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-[#4d6169]">{desk.detail}</p>
        </div>
      </div>

      <div className="space-y-3">
        {ordered.length ? ordered.map((item) => {
          const open = item.status === "open" || item.status === "answering";
          return (
            <article key={item.id} className={`rounded-[24px] border p-5 shadow-sm ${confirm?.id === item.id ? "border-[#00a8c4] bg-[#f1fafb]" : open ? "border-[#9ad7e2] bg-white" : "border-[#dce7e9] bg-white"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-[17px] font-black">{item.subject}</h3>
                  <p className="mt-1 text-[10px] font-bold text-[#7a8b92]">{new Date(item.created_at).toLocaleString("tr-TR")}</p>
                </div>
                <div className="flex items-center gap-2">
                  {item.queue_position && item.queue_position > 0 ? <span className="rounded-full bg-[#071b22] px-2.5 py-1 text-[8px] font-black text-white">Sıra {item.queue_position}</span> : null}
                  <span className={`rounded-full px-2.5 py-1 text-[8px] font-black ${item.status === "open" ? "bg-amber-100 text-amber-800" : item.status === "answering" ? "bg-sky-100 text-sky-800" : "bg-emerald-50 text-emerald-700"}`}>{statusLabel[item.status] || item.status}</span>
                </div>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-[#4d6169]">{item.message}</p>
              {item.admin_reply ? (
                <div className="mt-4 rounded-xl border-l-2 border-[#00a8c4] bg-[#f1fafb] p-3">
                  <p className="text-[8px] font-black uppercase text-[#00a8c4]">Hatay360 yanıtı</p>
                  <p className="mt-1 text-[12px] text-[#405963]">{item.admin_reply}</p>
                </div>
              ) : open ? (
                <p className="mt-4 text-[11px] font-bold text-[#00a8c4]">Yanıt bekleniyor.</p>
              ) : null}
            </article>
          );
        }) : (
          <EmptyRow icon={HelpCircle} title="Açık ticket yok" hint="Aşağıdan yazın veya WhatsApp sırasına girin." />
        )}
      </div>

      <button type="button" onClick={onWhatsApp} className="flex w-full items-center justify-between rounded-[22px] bg-[#16a34a] p-5 text-left text-white">
        <span>
          <b className="block text-[14px] font-black">WhatsApp sırası</b>
          <span className="mt-1 block text-[11px] text-white/80">Sıraya girer, sonra sohbet açılır.</span>
        </span>
        <MessageCircle className="h-5 w-5" />
      </button>

      <form onSubmit={onSubmitTicket} className="rounded-[22px] border border-[#dce7e9] bg-white p-5" aria-labelledby="new-ticket-heading">
        <div className="flex items-center gap-3">
          <MessageSquareText className="h-5 w-5 text-[#00a8c4]" aria-hidden />
          <div>
            <h3 id="new-ticket-heading" className="text-[16px] font-black">Yeni ticket</h3>
            <p className="text-[11px] text-[#718188]">Yeni hizmet talebi ayrı menüdedir.</p>
          </div>
        </div>
        <label className="mt-4 block text-[10px] font-black uppercase tracking-[0.12em] text-[#6e8188]" htmlFor="ticket-subject">
          Konu
          <input
            id="ticket-subject"
            required
            value={ticket.subject}
            onChange={(event) => onTicketChange({ ...ticket, subject: event.target.value })}
            placeholder="Örn. Site yavaş açılıyor"
            className="mt-2 w-full rounded-xl border border-[#dbe5e8] px-3 py-2.5 text-[12px] font-bold normal-case tracking-normal text-[#102b35] outline-none focus:border-[#00a8c4]"
          />
        </label>
        <label className="mt-3 block text-[10px] font-black uppercase tracking-[0.12em] text-[#6e8188]" htmlFor="ticket-priority">
          Öncelik
          <select
            id="ticket-priority"
            value={ticket.priority}
            onChange={(event) => onTicketChange({ ...ticket, priority: event.target.value })}
            className="mt-2 w-full rounded-xl border border-[#dbe5e8] px-3 py-2.5 text-[12px] font-bold normal-case tracking-normal text-[#102b35]"
          >
            <option value="normal">Normal</option>
            <option value="urgent">Acil</option>
          </select>
        </label>
        <label className="mt-3 block text-[10px] font-black uppercase tracking-[0.12em] text-[#6e8188]" htmlFor="ticket-message">
          Mesaj
          <textarea
            id="ticket-message"
            required
            rows={4}
            value={ticket.message}
            onChange={(event) => onTicketChange({ ...ticket, message: event.target.value })}
            placeholder="Sorunu kısaca yazın"
            className="mt-2 w-full rounded-xl border border-[#dbe5e8] p-3 text-[12px] font-bold normal-case tracking-normal text-[#102b35] outline-none focus:border-[#00a8c4]"
          />
        </label>
        <button type="submit" disabled={busy} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#00a8c4] px-4 py-3 text-[11px] font-black text-white disabled:opacity-50">
          <Send className="h-4 w-4" aria-hidden /> Gönder
        </button>
      </form>
    </section>
  );
}

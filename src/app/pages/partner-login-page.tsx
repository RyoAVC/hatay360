import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Handshake, LockKeyhole, ShieldAlert, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { Link, Navigate, useNavigate } from "react-router";
import { SiteLogo } from "../components/site-logo";
import { FormError } from "../components/form-error";
import { LoginPromoBannerSlider, LoginPromoLineChart, LoginPromoStats } from "../components/login-promo-panel";
import { turkishFormProps } from "../lib/form-validation";
import { useSiteReducedMotion } from "../lib/site-motion";
import { usePartnerAuth } from "../context/partner-auth-context";
import { useContent } from "../context/content-context";
import {
  DEFAULT_PARTNER_LOGIN_CHART,
  DEFAULT_PARTNER_LOGIN_STATS,
} from "../lib/login-promo";
import {
  clearPartnerTrustedDevice,
  partnerTrustRiskDisclaimer,
  readPartnerTrustedDevice,
  revealPartnerTrustedPassword,
  savePartnerTrustedDevice,
  updatePartnerTrustedIp,
} from "../lib/partner-trusted-device";

const CHART_BARS = [28, 42, 35, 52, 44, 68, 58, 76, 64, 82];

function PartnerLoginAmbient({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.25]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(#1e1b4b 1px, transparent 1px), linear-gradient(90deg, #1e1b4b 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <motion.div
        className="pointer-events-none absolute -left-[8%] top-[10%] h-[360px] w-[360px] rounded-full bg-indigo-500/[0.14] blur-[100px]"
        aria-hidden="true"
        animate={reducedMotion ? undefined : { x: [0, 32, 8, 0], y: [0, -20, 12, 0] }}
        transition={reducedMotion ? undefined : { duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-[5%] bottom-[15%] h-[280px] w-[280px] rounded-full bg-violet-500/[0.1] blur-[90px]"
        aria-hidden="true"
        animate={reducedMotion ? undefined : { x: [0, -24, -4, 0], y: [0, 16, -8, 0] }}
        transition={reducedMotion ? undefined : { duration: 32, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
      />
      <div className="pointer-events-none absolute bottom-0 right-0 flex items-end gap-2 px-8 pb-10 opacity-[0.22]" aria-hidden="true">
        {CHART_BARS.map((height, index) => (
          <motion.div
            key={index}
            className="w-2 rounded-t-sm bg-gradient-to-t from-indigo-600/40 to-violet-300/70"
            initial={{ height: reducedMotion ? height : 8 }}
            animate={
              reducedMotion
                ? { height }
                : { height: [height * 0.55, height, height * 0.72, height * 0.92, height] }
            }
            transition={
              reducedMotion
                ? undefined
                : {
                    duration: 7 + index * 0.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.15,
                  }
            }
            style={{ maxHeight: 96 }}
          />
        ))}
      </div>
      <svg
        className="pointer-events-none absolute bottom-[18%] right-[6%] h-32 w-48 opacity-[0.18]"
        viewBox="0 0 192 96"
        fill="none"
        aria-hidden="true"
      >
        <motion.path
          d="M0 72 L24 58 L48 64 L72 42 L96 50 L120 28 L144 36 L168 18 L192 24"
          stroke="#a5b4fc"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: reducedMotion ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reducedMotion ? 0 : 2.2, ease: "easeOut", delay: 0.3 }}
        />
        <motion.path
          d="M0 88 L24 76 L48 80 L72 62 L96 68 L120 48 L144 54 L168 38 L192 42"
          stroke="#6366f1"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity={0.5}
          initial={{ pathLength: reducedMotion ? 1 : 0 }}
          animate={reducedMotion ? undefined : { pathLength: [0.4, 1, 0.7, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent"
        aria-hidden="true"
      />
    </>
  );
}

function StaggeredFormCard({
  reducedMotion,
  children,
  className,
  onSubmit,
}: {
  reducedMotion: boolean;
  children: ReactNode;
  className?: string;
  onSubmit: (event: FormEvent) => void;
}) {
  const intro = useMemo(
    () => ({
      container: {
        hidden: {},
        show: {
          transition: {
            staggerChildren: reducedMotion ? 0 : 0.09,
            delayChildren: reducedMotion ? 0 : 0.08,
          },
        },
      },
    }),
    [reducedMotion],
  );

  return (
    <motion.form
      onSubmit={onSubmit}
      {...turkishFormProps}
      variants={intro.container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.form>
  );
}

function StaggerItem({
  reducedMotion,
  children,
  className,
}: {
  reducedMotion: boolean;
  children: ReactNode;
  className?: string;
}) {
  const variants = useMemo(
    () => ({
      hidden: { opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 18 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: reducedMotion ? 0 : 0.52, ease: [0.22, 1, 0.36, 1] as const },
      },
    }),
    [reducedMotion],
  );

  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}

export function PartnerLoginPage() {
  const { partner, isChecking, login } = usePartnerAuth();
  const { settings } = useContent();
  const navigate = useNavigate();
  const trusted = useMemo(() => readPartnerTrustedDevice(), []);
  const [email, setEmail] = useState(trusted?.email || "");
  const [password, setPassword] = useState(() => (trusted ? revealPartnerTrustedPassword(trusted) : ""));
  const [trustDevice, setTrustDevice] = useState(Boolean(trusted));
  const [acceptedRisk, setAcceptedRisk] = useState(Boolean(trusted?.acceptedRiskAt));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [autoHint, setAutoHint] = useState(Boolean(trusted));
  const reducedMotion = useSiteReducedMotion();
  const autoTried = useRef(false);

  const runLogin = async (nextEmail: string, nextPassword: string, trust: boolean) => {
    setBusy(true);
    setError("");
    try {
      const result = await login(nextEmail, nextPassword, { trustDevice: trust });
      if (trust) {
        savePartnerTrustedDevice({
          email: nextEmail,
          password: nextPassword,
          ip: result.trustedIp || "",
        });
        if (result.trustedIp) updatePartnerTrustedIp(result.trustedIp);
      } else {
        clearPartnerTrustedDevice();
      }
      navigate("/firma", { replace: true });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Giriş yapılamadı.");
      setAutoHint(false);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (isChecking || partner || autoTried.current || !trusted) return;
    const secret = revealPartnerTrustedPassword(trusted);
    if (!trusted.email || !secret) return;
    autoTried.current = true;
    void runLogin(trusted.email, secret, true);
  }, [isChecking, partner, trusted]);

  if (!isChecking && partner) return <Navigate to="/firma" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (trustDevice && !acceptedRisk) {
      setError("Bu PC’ye güven için risk uyarısını onaylamanız gerekir.");
      return;
    }
    await runLogin(email, password, trustDevice);
  };

  const forgetDevice = () => {
    clearPartnerTrustedDevice();
    setTrustDevice(false);
    setAcceptedRisk(false);
    setAutoHint(false);
    setPassword("");
  };

  const formClass =
    "w-full max-w-md rounded-[30px] border border-white/10 bg-white p-7 shadow-[0_28px_90px_rgba(99,102,241,0.18)] sm:p-9";

  return (
    <div className="relative grid min-h-screen overflow-hidden bg-[#0c0a18] lg:grid-cols-[1.05fr_0.95fr]">
      <PartnerLoginAmbient reducedMotion={reducedMotion} />
      <div className="relative hidden overflow-y-auto overflow-x-hidden border-r border-indigo-500/15 p-12 lg:flex lg:flex-col lg:justify-between">
        <motion.div
          initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <SiteLogo variant="onDark" />
          <p className="mt-10 text-[11px] font-black uppercase tracking-[0.23em] text-[#a5b4fc]">Hatay360 bayilik</p>
          <h1 className="mt-4 max-w-xl text-[42px] font-black leading-[0.98] tracking-[-0.055em] text-white xl:text-[48px]">
            Web tasarım firmanız bizimle satış yapsın.
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/58">
            Bayilik alan firmalar müşteriye site ve reklam satar; Hatay360 komisyon alır. Onaylı hesapla buradan girin.
          </p>
          <LoginPromoBannerSlider banners={settings.partnerLoginBanners} accentDot="bg-[#a5b4fc]" borderClass="border-indigo-400/20" />
          <LoginPromoStats stats={DEFAULT_PARTNER_LOGIN_STATS} tone="text-[#a5b4fc]" cardClass="rounded-2xl border border-indigo-400/15 bg-indigo-500/10 px-3 py-3" />
          <LoginPromoLineChart points={DEFAULT_PARTNER_LOGIN_CHART} stroke="#a5b4fc" fill="rgba(99,102,241,0.22)" title="Son 6 ay bayi büyümesi" borderClass="border-indigo-400/15" />
        </motion.div>
        <div className="relative mt-8 space-y-3">
          <motion.div
            initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.55, delay: reducedMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center gap-3 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4"
          >
            <TrendingUp className="h-5 w-5 text-[#a5b4fc]" />
            <p className="text-[12px] font-bold text-white/70">
              Komisyon oranı ve kazanç takibi onay sonrası bayilik panelinde açılır.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.55, delay: reducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <Handshake className="h-5 w-5 text-[#a5b4fc]" />
            <p className="text-[12px] font-bold text-white/70">Referans linkinizle getirdiğiniz müşterilerden komisyon kazanın.</p>
          </motion.div>
        </div>
      </div>
      <div className="relative flex items-center justify-center p-5 sm:p-10">
        <StaggeredFormCard reducedMotion={reducedMotion} className={formClass} onSubmit={submit}>
          <StaggerItem reducedMotion={reducedMotion}>
            <Link
              to="/hesap"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg text-[13px] font-black text-[#3b4fd4] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#3b4fd4] focus-visible:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Hesap seçimine dön
            </Link>
          </StaggerItem>
          <StaggerItem reducedMotion={reducedMotion}>
            <span className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef0ff] text-[#3b4fd4]">
              <LockKeyhole className="h-5 w-5" />
            </span>
          </StaggerItem>
          <StaggerItem reducedMotion={reducedMotion}>
            <h2 className="mt-6 text-[28px] font-black tracking-[-0.04em] text-[#102b35]">Firma girişi</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-[#71818a]">Bayilik hesabınız onaylandıysa e-posta ve şifrenizle girin.</p>
          </StaggerItem>

          {autoHint ? (
            <StaggerItem reducedMotion={reducedMotion}>
              <div className="mt-4 rounded-xl border border-amber-300/60 bg-amber-50 px-3.5 py-3 text-[11px] leading-relaxed text-amber-950">
                <p className="font-black">Kayıtlı cihaz — otomatik giriş</p>
                <p className="mt-1 text-amber-900/80">
                  Bu PC’de kayıtlı hesap bulundu
                  {trusted?.ip ? (
                    <>
                      {" "}
                      · son güvenilen IP: <span className="font-mono font-bold">{trusted.ip}</span>
                    </>
                  ) : null}
                  . Şifre bu cihazda saklı; doğrudan giriş deneniyor.
                </p>
                <button type="button" onClick={forgetDevice} className="mt-2 text-[11px] font-black text-[#3b4fd4] underline">
                  Bu cihazı unut
                </button>
              </div>
            </StaggerItem>
          ) : null}

          {error ? (
            <StaggerItem reducedMotion={reducedMotion}>
              <div className="mt-4">
                <FormError>{error}</FormError>
              </div>
            </StaggerItem>
          ) : null}
          <StaggerItem reducedMotion={reducedMotion}>
            <label className="mt-6 block text-[11px] font-black text-[#425965]">
              E-posta
              <input
                type="email"
                required
                maxLength={80}
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#dbe6ea] px-4 py-3 text-[13px] outline-none focus:border-[#3b4fd4]"
              />
            </label>
          </StaggerItem>
          <StaggerItem reducedMotion={reducedMotion}>
            <label className="mt-4 block text-[11px] font-black text-[#425965]">
              Şifre
              <input
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#dbe6ea] px-4 py-3 text-[13px] outline-none focus:border-[#3b4fd4]"
              />
            </label>
          </StaggerItem>

          <StaggerItem reducedMotion={reducedMotion}>
            <div className="mt-5 rounded-2xl border border-[#f3d9a8] bg-[#fff8eb] p-3.5">
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={trustDevice}
                  onChange={(event) => {
                    setTrustDevice(event.target.checked);
                    if (!event.target.checked) setAcceptedRisk(false);
                  }}
                  className="mt-1 h-4 w-4 accent-[#3b4fd4]"
                />
                <span>
                  <span className="block text-[12px] font-black text-[#102b35]">Beni hatırla / Bu PC’ye güven</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-[#6b5a3c]">
                    Şifre bu cihazda saklanır, oturum uzar ve giriş IP’si hatırlanır. Ortak bilgisayarda işaretlemeyin.
                  </span>
                </span>
              </label>

              {trustDevice ? (
                <div className="mt-3 border-t border-[#f0d7a0] pt-3">
                  <div className="flex gap-2 text-[10px] leading-relaxed text-[#7a5c28]">
                    <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    <p>{partnerTrustRiskDisclaimer()}</p>
                  </div>
                  <label className="mt-3 flex cursor-pointer items-start gap-2">
                    <input
                      type="checkbox"
                      checked={acceptedRisk}
                      onChange={(event) => setAcceptedRisk(event.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[#b45309]"
                      required={trustDevice}
                    />
                    <span className="text-[11px] font-bold text-[#7c2d12]">
                      Riski okudum; Hatay360’ın bu tercih nedeniyle sorumluluk almadığını kabul ediyorum.
                    </span>
                  </label>
                </div>
              ) : null}
            </div>
          </StaggerItem>

          <StaggerItem reducedMotion={reducedMotion}>
            <button
              disabled={busy || (trustDevice && !acceptedRisk)}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3b4fd4] px-5 py-3.5 text-[13px] font-black text-white disabled:opacity-60"
            >
              {busy ? "Giriş yapılıyor…" : "Firma paneli"} <ArrowRight className="h-4 w-4" />
            </button>
          </StaggerItem>
          <StaggerItem reducedMotion={reducedMotion}>
            <p className="mt-5 text-center text-[11px] text-[#87959c]">
              Bayiliğiniz yoksa{" "}
              <Link
                to="/firma/kayit"
                className="rounded-sm font-black text-[#3b4fd4] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#3b4fd4] focus-visible:ring-offset-2"
              >
                firma kaydı
              </Link>{" "}
              açın.
            </p>
          </StaggerItem>
        </StaggeredFormCard>
      </div>
    </div>
  );
}

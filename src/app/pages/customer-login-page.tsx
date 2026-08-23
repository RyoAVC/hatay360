import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, BarChart3, LockKeyhole, MessagesSquare, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { SiteLogo } from "../components/site-logo";
import { FormError } from "../components/form-error";
import { LoginPromoBannerSlider, LoginPromoLineChart, LoginPromoStats } from "../components/login-promo-panel";
import { turkishFormProps } from "../lib/form-validation";
import { useCustomerAuth } from "../context/customer-auth-context";
import { useContent } from "../context/content-context";
import { apiRequest } from "../lib/api";
import {
  DEFAULT_CUSTOMER_LOGIN_CHART,
  DEFAULT_CUSTOMER_LOGIN_STATS,
} from "../lib/login-promo";

function CustomerLoginAmbient({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(125deg, transparent 42%, rgba(0,168,196,0.07) 50%, transparent 58%), linear-gradient(55deg, transparent 40%, rgba(126,224,236,0.05) 48%, transparent 56%)",
          backgroundSize: "200% 200%",
        }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden="true"
        animate={reducedMotion ? undefined : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={reducedMotion ? undefined : { duration: 22, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage:
            "repeating-linear-gradient(100deg, transparent, transparent 80px, rgba(0,168,196,0.04) 80px, rgba(0,168,196,0.04) 81px)",
          backgroundSize: "200% 100%",
        }}
      />
      <motion.div
        className="pointer-events-none absolute -left-[10%] top-[12%] h-[380px] w-[380px] rounded-full bg-[#00a8c4]/[0.12] blur-[100px]"
        aria-hidden="true"
        animate={reducedMotion ? undefined : { x: [0, 40, 10, 0], y: [0, -24, 8, 0] }}
        transition={reducedMotion ? undefined : { duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-[6%] bottom-[8%] h-[320px] w-[320px] rounded-full bg-[#22c55e]/[0.06] blur-[90px]"
        aria-hidden="true"
        animate={reducedMotion ? undefined : { x: [0, -28, -6, 0], y: [0, 20, -10, 0] }}
        transition={reducedMotion ? undefined : { duration: 30, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00a8c4]/45 to-transparent"
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
  onSubmit?: (event: FormEvent) => void;
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
      item: {
        hidden: { opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 18 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: reducedMotion ? 0 : 0.52, ease: [0.22, 1, 0.36, 1] as const },
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

export function CustomerLoginPage() {
  const { customer, isChecking, login, completeLoginOtp } = useCustomerAuth();
  const { settings } = useContent();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [needsOtp, setNeedsOtp] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    const ito = searchParams.get("ito");
    if (!ito || customer) return;
    let alive = true;
    void apiRequest<{ customer?: { company_name?: string } }>("/api/customer/impersonate", {
      method: "POST",
      body: JSON.stringify({ token: ito }),
    })
      .then(() => {
        if (alive) window.location.href = "/musteri";
      })
      .catch(() => {
        /* normal giriş formu */
      });
    return () => {
      alive = false;
    };
  }, [searchParams, customer, navigate]);

  if (!isChecking && customer) return <Navigate to="/musteri" replace />;

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await login(email, password);
      if (result.needsOtp) {
        setNeedsOtp(true);
        setOtp("");
        return;
      }
      navigate("/musteri", { replace: true });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Giriş yapılamadı.");
    } finally {
      setBusy(false);
    }
  };

  const submitOtp = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await completeLoginOtp(otp.replace(/\D/g, "").slice(0, 6));
      navigate("/musteri", { replace: true });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Kod doğrulanamadı.");
    } finally {
      setBusy(false);
    }
  };

  const formClass =
    "w-full max-w-md rounded-[30px] border border-white/10 bg-white p-7 shadow-[0_28px_90px_rgba(0,168,196,0.12)] sm:p-9";

  return (
    <div className="relative grid min-h-screen overflow-hidden bg-[#061a20] lg:grid-cols-[1.05fr_0.95fr]">
      <CustomerLoginAmbient reducedMotion={reducedMotion} />
      <div className="relative hidden overflow-y-auto overflow-x-hidden border-r border-white/10 p-12 lg:flex lg:flex-col lg:justify-between">
        <motion.div
          initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <SiteLogo variant="onDark" />
          <p className="mt-10 text-[11px] font-black uppercase tracking-[0.23em] text-[#7ee0ec]">Müşteri kontrol merkezi</p>
          <h1 className="mt-4 max-w-xl text-[42px] font-black leading-[0.98] tracking-[-0.055em] text-white xl:text-[48px]">
            Sitenizi, reklamınızı ve haritanızı aynı hesapta görün.
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/58">
            Web sitesi yönetimi, reklam sayıları, harita kaydı ve destek. Reklam tıklaması ile siteye giren kişi ayrı tutulur.
            WhatsApp ve ticket açık; telefon beklemeyin.
          </p>
          <LoginPromoBannerSlider banners={settings.customerLoginBanners} accentDot="bg-[#7ee0ec]" />
          <LoginPromoStats stats={DEFAULT_CUSTOMER_LOGIN_STATS} tone="text-[#7ee0ec]" />
          <LoginPromoLineChart points={DEFAULT_CUSTOMER_LOGIN_CHART} stroke="#7ee0ec" fill="rgba(0,168,196,0.18)" title="Son 6 ay büyüme" />
        </motion.div>
        <div className="relative mt-8 grid grid-cols-3 gap-3">
          {[
            { icon: BarChart3, text: "Site + reklam" },
            { icon: MessagesSquare, text: "Destek" },
            { icon: ShieldCheck, text: "AVC güvencesi" },
          ].map(({ icon: Icon, text }, index) => (
            <motion.div
              key={text}
              initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.5,
                delay: reducedMotion ? 0 : 0.15 + index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <Icon className="h-5 w-5 text-[#7ee0ec]" />
              <p className="mt-3 text-[11px] font-black text-white/75">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="relative flex items-center justify-center p-5 sm:p-10">
        {needsOtp ? (
          <StaggeredFormCard reducedMotion={reducedMotion} className={formClass} onSubmit={submitOtp}>
            <StaggerItem reducedMotion={reducedMotion}>
              <Link
                to="/hesap"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg text-[13px] font-black text-[#008fac] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#008fac] focus-visible:ring-offset-2"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Hesap seçimine dön
              </Link>
            </StaggerItem>
            <StaggerItem reducedMotion={reducedMotion}>
              <span className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9f8fa] text-[#008eaa]">
                <ShieldCheck className="h-5 w-5" />
              </span>
            </StaggerItem>
            <StaggerItem reducedMotion={reducedMotion}>
              <h2 className="mt-6 text-[28px] font-black tracking-[-0.04em] text-[#102b35]">Doğrulama kodu</h2>
              <p className="mt-2 text-[12px] leading-relaxed text-[#71818a]">
                Şifre doğru. E-posta ile 6 haneli kod geldiğinde buraya yazın. Kod 10 dakika geçerlidir.
              </p>
            </StaggerItem>
            {error ? (
              <StaggerItem reducedMotion={reducedMotion}>
                <div className="mt-4"><FormError>{error}</FormError></div>
              </StaggerItem>
            ) : null}
            <StaggerItem reducedMotion={reducedMotion}>
              <label className="mt-6 block text-[11px] font-black text-[#425965]">
                6 haneli kod
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  minLength={6}
                  maxLength={6}
                  pattern="[0-9]{6}"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="mt-2 w-full rounded-xl border border-[#dbe6ea] px-4 py-3 text-center text-[22px] font-black tracking-[0.4em] outline-none focus:border-[#00a8c4]"
                />
              </label>
            </StaggerItem>
            <StaggerItem reducedMotion={reducedMotion}>
              <button
                disabled={busy || otp.length !== 6}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#008fac] px-5 py-3.5 text-[13px] font-black text-white disabled:opacity-60"
              >
                {busy ? "Doğrulanıyor…" : "Girişi tamamla"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </StaggerItem>
            <StaggerItem reducedMotion={reducedMotion}>
              <button
                type="button"
                className="mt-4 w-full text-center text-[11px] font-black text-[#008fac]"
                onClick={() => {
                  setNeedsOtp(false);
                  setOtp("");
                  setError("");
                }}
              >
                Şifre ekranına dön
              </button>
            </StaggerItem>
          </StaggeredFormCard>
        ) : (
          <StaggeredFormCard reducedMotion={reducedMotion} className={formClass} onSubmit={submitPassword}>
            <StaggerItem reducedMotion={reducedMotion}>
              <Link
                to="/hesap"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg text-[13px] font-black text-[#008fac] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#008fac] focus-visible:ring-offset-2"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Hesap seçimine dön
              </Link>
            </StaggerItem>
            <StaggerItem reducedMotion={reducedMotion}>
              <span className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9f8fa] text-[#008eaa]">
                <LockKeyhole className="h-5 w-5" />
              </span>
            </StaggerItem>
            <StaggerItem reducedMotion={reducedMotion}>
              <h2 className="mt-6 text-[28px] font-black tracking-[-0.04em] text-[#102b35]">Müşteri paneli girişi</h2>
              <p className="mt-2 text-[12px] leading-relaxed text-[#71818a]">
                Şifreniz Hatay360 tarafından size gönderildiyse buradan girin. Herkes üye olamaz; panel yalnızca onaylı müşterilere açılır.
              </p>
            </StaggerItem>
            {error ? (
              <StaggerItem reducedMotion={reducedMotion}>
                <div className="mt-4"><FormError>{error}</FormError></div>
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
                  className="mt-2 w-full rounded-xl border border-[#dbe6ea] px-4 py-3 text-[13px] outline-none focus:border-[#00a8c4]"
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
                  className="mt-2 w-full rounded-xl border border-[#dbe6ea] px-4 py-3 text-[13px] outline-none focus:border-[#00a8c4]"
                />
              </label>
            </StaggerItem>
            <StaggerItem reducedMotion={reducedMotion}>
              <button
                disabled={busy}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#008fac] px-5 py-3.5 text-[13px] font-black text-white disabled:opacity-60"
              >
                {busy ? "Giriş yapılıyor…" : "Paneli aç"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </StaggerItem>
            <StaggerItem reducedMotion={reducedMotion}>
              <p className="mt-5 text-center text-[10px] font-semibold leading-relaxed text-[#87959c]">
                Şifreniz yoksa burada üretilemez. Yeni başvuru bırakın; uygun görülürseniz Hatay360 şifreyi size gönderir.
              </p>
              <p className="mt-3 text-center text-[11px] text-[#87959c]">
                <Link
                  to="/musteri/kayit"
                  className="rounded-sm font-black text-[#008fac] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#008fac] focus-visible:ring-offset-2"
                >
                  Yeni müşteri kaydı
                </Link>
                {" · "}
                <Link
                  to="/firma/giris"
                  className="rounded-sm font-black text-[#008fac] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#008fac] focus-visible:ring-offset-2"
                >
                  Firma girişi
                </Link>
              </p>
            </StaggerItem>
          </StaggeredFormCard>
        )}
      </div>
    </div>
  );
}

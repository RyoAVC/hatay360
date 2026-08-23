/**
 * Dikkat çekici efekt kataloğu.
 * Animate.css (https://github.com/animate-css/animate.css) attention seekers + Hatay360 özel katman efektleri.
 */

export type AttentionEffectId =
  | "none"
  | "pulse"
  | "bounce"
  | "flash"
  | "rubberBand"
  | "shakeX"
  | "headShake"
  | "swing"
  | "tada"
  | "wobble"
  | "jello"
  | "heartBeat"
  | "glow"
  | "neon"
  | "spotlight"
  | "float"
  | "drift"
  | "shimmer"
  | "wiggle";

export type AttentionEffect = {
  id: AttentionEffectId;
  /** Admin’de görünen Türkçe ad */
  name: string;
  hint: string;
  source: "animate.css" | "Hatay360";
  /** animate.css sınıfları (infinite loop) */
  animateClass?: string;
  /** Özel CSS sınıfı (styles/attention-effects.css) */
  customClass?: string;
};

export const ATTENTION_EFFECTS: AttentionEffect[] = [
  { id: "none", name: "Yok", hint: "Efekt yok", source: "Hatay360" },
  {
    id: "pulse",
    name: "Nabız",
    hint: "Büyüyüp küçülür",
    source: "animate.css",
    animateClass: "animate__animated animate__pulse animate__infinite",
  },
  {
    id: "bounce",
    name: "Zıpla",
    hint: "Yukarı-aşağı zıplar",
    source: "animate.css",
    animateClass: "animate__animated animate__bounce animate__infinite",
  },
  {
    id: "flash",
    name: "Flaş",
    hint: "Yanıp söner",
    source: "animate.css",
    animateClass: "animate__animated animate__flash animate__infinite",
  },
  {
    id: "rubberBand",
    name: "Lastik",
    hint: "Esneyerek çekilir",
    source: "animate.css",
    animateClass: "animate__animated animate__rubberBand animate__infinite",
  },
  {
    id: "shakeX",
    name: "Salla",
    hint: "Yatay sarsıntı",
    source: "animate.css",
    animateClass: "animate__animated animate__shakeX animate__infinite",
  },
  {
    id: "headShake",
    name: "Baş salla",
    hint: "Hayır der gibi",
    source: "animate.css",
    animateClass: "animate__animated animate__headShake animate__infinite",
  },
  {
    id: "swing",
    name: "Salıncak",
    hint: "Sallanan hareket",
    source: "animate.css",
    animateClass: "animate__animated animate__swing animate__infinite",
  },
  {
    id: "tada",
    name: "Ta-da",
    hint: "Kutlama vurgusu",
    source: "animate.css",
    animateClass: "animate__animated animate__tada animate__infinite",
  },
  {
    id: "wobble",
    name: "Sallan",
    hint: "Sağa-sola yalpa",
    source: "animate.css",
    animateClass: "animate__animated animate__wobble animate__infinite",
  },
  {
    id: "jello",
    name: "Jöle",
    hint: "Jöle gibi titrer",
    source: "animate.css",
    animateClass: "animate__animated animate__jello animate__infinite",
  },
  {
    id: "heartBeat",
    name: "Kalp atışı",
    hint: "Kalp ritmi",
    source: "animate.css",
    animateClass: "animate__animated animate__heartBeat animate__infinite",
  },
  { id: "glow", name: "Parıltı halkası", hint: "Cyan glow", source: "Hatay360", customClass: "h360-fx-glow" },
  { id: "neon", name: "Neon kenar", hint: "Neon çerçeve", source: "Hatay360", customClass: "h360-fx-neon" },
  { id: "spotlight", name: "Spot ışık", hint: "Işık süpürme", source: "Hatay360", customClass: "h360-fx-spotlight" },
  { id: "float", name: "Yüzer", hint: "Hafif yükselme", source: "Hatay360", customClass: "h360-fx-float" },
  { id: "drift", name: "Kaydır", hint: "Yavaş kayma", source: "Hatay360", customClass: "h360-fx-drift" },
  { id: "shimmer", name: "Işıltı", hint: "Parlaklık dalgası", source: "Hatay360", customClass: "h360-fx-shimmer" },
  { id: "wiggle", name: "Titre", hint: "Hafif titreşim", source: "Hatay360", customClass: "h360-fx-wiggle" },
];

const EFFECT_IDS = new Set(ATTENTION_EFFECTS.map((e) => e.id));

export function isAttentionEffectId(value: unknown): value is AttentionEffectId {
  return typeof value === "string" && EFFECT_IDS.has(value as AttentionEffectId);
}

export function normalizeAttentionEffect(value: unknown, fallback: AttentionEffectId = "none"): AttentionEffectId {
  return isAttentionEffectId(value) ? value : fallback;
}

export function getAttentionEffect(id: unknown): AttentionEffect {
  const normalized = normalizeAttentionEffect(id);
  return ATTENTION_EFFECTS.find((e) => e.id === normalized) || ATTENTION_EFFECTS[0];
}

/** Element’e uygulanacak className */
export function attentionEffectClass(id: unknown, reducedMotion = false): string {
  if (reducedMotion) return "";
  const effect = getAttentionEffect(id);
  if (effect.id === "none") return "";
  return [effect.animateClass, effect.customClass].filter(Boolean).join(" ");
}

export function attentionEffectName(id: unknown): string {
  return getAttentionEffect(id).name;
}

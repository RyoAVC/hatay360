import {
  DEFAULT_SEO_PAGES,
  districtBlurb,
  type District,
  type SeoPage,
  type SeoPageId,
} from "./seo";

export type SeoAiInput = {
  siteTitle: string;
  districts: District[];
  aiProvider: "gemini" | "openai" | "none";
  aiApiKey: string;
  aiModel: string;
};


export type SeoPack = {
  keywords: string;
  localLead: string;
  pages: Record<SeoPageId, SeoPage>;
  districts: District[];
};

function keywordsFromDistricts(districts: District[]) {
  const parts = [
    "hatay reklam",
    "hatay web tasarım",
    "hatay web sitesi",
    "hatay web siteciler",
    "hatay ajans",
    "hatay reklam ajansı",
    "hatay e-ticaret",
    "hatay yazılım",
    "hatay360",
  ];
  for (const d of districts) {
    const n = d.name.toLocaleLowerCase("tr-TR");
    parts.push(`${n} web tasarım`, `${n} reklam`, `${n} web sitesi`, `${n} e-ticaret`);
  }
  return [...new Set(parts)].join(", ");
}

export function buildLocalSeoPack(districts: District[], siteTitle = "Hatay360"): SeoPack {
  const names = districts.map((d) => d.name);
  const listed = names.join(", ");
  const pages = { ...DEFAULT_SEO_PAGES };
  pages.home = {
    title: `${siteTitle} | Hatay Web Tasarım, Reklam Ajansı ve E-Ticaret`,
    description: `Hatay reklam, web tasarım ve e-ticaret. ${listed} ilçelerinde web sitesi, Google Ads ve mağaza altyapısı.`,
  };
  pages.hizmetler = {
    title: `Hatay Web Tasarım ve Reklam | Hizmetler | ${siteTitle}`,
    description: `${listed} için web sitesi, Google Ads, Meta reklam ve Google Maps. Tek ekip.`,
  };
  pages.iletisim = {
    title: `İletişim | Hatay Web Siteciler | ${siteTitle}`,
    description: `Hatay reklam ve web tasarım teklifi. Hizmet: ${listed}. Numaranızı bırakın, sizi arayalım.`,
  };
  pages.hakkimizda = {
    title: `Hakkımızda | Hatay Ajans ve Yazılım | ${siteTitle}`,
    description: `Antakya merkezli ${siteTitle}. ${listed} ilçelerinde web tasarım, reklam ve e-ticaret.`,
  };

  return {
    keywords: keywordsFromDistricts(districts),
    localLead: `${siteTitle}; ${listed} ilçelerinde web tasarım, Google Ads/Meta ve Google Maps / yerel görünürlük sunar. Hatay web siteciler ve Hatay ajans arayan işletmeler için tek muhatap.`,
    pages,
    districts: districts.map((d) => ({ name: d.name, blurb: d.blurb || districtBlurb(d.name) })),
  };
}

function extractJson(text: string): SeoPack | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const raw = JSON.parse(match[0]) as Partial<SeoPack>;
    if (!raw.keywords || !raw.pages) return null;
    return {
      keywords: String(raw.keywords),
      localLead: String(raw.localLead || ""),
      pages: { ...DEFAULT_SEO_PAGES, ...(raw.pages as Record<SeoPageId, SeoPage>) },
      districts: Array.isArray(raw.districts)
        ? raw.districts.map((d) => ({ name: String(d.name), blurb: String(d.blurb || districtBlurb(d.name)) }))
        : [],
    };
  } catch {
    return null;
  }
}

function seoPrompt(settings: SeoAiInput) {
  const districts = settings.districts.map((d) => d.name).join(", ");
  return `Sen yerel SEO uzmanısın. Firma: ${settings.siteTitle}. Hatay merkezli yazılım + reklam + web tasarım + e-ticaret altyapısı.
İlçeler: ${districts}
Türkçe yaz. Keyword stuffing yapma ama her title ve description'da Hatay / ilgili ilçe + (web tasarım | reklam | web sitesi | e-ticaret) geçsin.
SADECE JSON döndür, markdown yok:
{
  "keywords": "virgüllü uzun anahtar kelime listesi",
  "localLead": "sitede görünecek 2-3 cümle, tüm ilçeleri anan doğal paragraf",
  "pages": {
    "home": {"title":"","description":""},
    "hizmetler": {"title":"","description":""},
    "ozellikler": {"title":"","description":""},
    "paketler": {"title":"","description":""},
    "referanslar": {"title":"","description":""},
    "hakkimizda": {"title":"","description":""},
    "kurumsal": {"title":"","description":""},
    "misyon": {"title":"","description":""},
    "vizyon": {"title":"","description":""},
    "iletisim": {"title":"","description":""},
    "gizlilik": {"title":"","description":""},
    "kvkk": {"title":"","description":""},
    "mesafeli": {"title":"","description":""},
    "kosullar": {"title":"","description":""}
  },
  "districts": [{"name":"Antakya","blurb":"kısa yerel cümle"}]
}
districts dizisinde verilen TÜM ilçeler olsun. Title max 60 karakter, description max 155 karakter.`;
}

async function callGemini(apiKey: string, model: string, prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 4096 },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err.slice(0, 280) || `Gemini ${res.status}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join("") || "";
  return text;
}

async function callOpenAI(apiKey: string, model: string, prompt: string) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        { role: "system", content: "Sadece geçerli JSON üret." },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err.slice(0, 280) || `OpenAI ${res.status}`);
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}

export async function generateSeoPack(settings: SeoAiInput): Promise<{ pack: SeoPack; source: "ai" | "local" }> {
  const prompt = seoPrompt(settings);
  const provider = settings.aiProvider || "none";
  const key = (settings.aiApiKey || "").trim();

  if (provider !== "none" && key) {
    const text =
      provider === "openai"
        ? await callOpenAI(key, settings.aiModel || "gpt-4o-mini", prompt)
        : await callGemini(key, settings.aiModel || "gemini-2.0-flash", prompt);
    const parsed = extractJson(text);
    if (parsed) {
      if (!parsed.districts.length) parsed.districts = settings.districts;
      return { pack: parsed, source: "ai" };
    }
    throw new Error("Yapay zeka JSON üretemedi. Şablon motorunu dene.");
  }

  return { pack: buildLocalSeoPack(settings.districts, settings.siteTitle), source: "local" };
}

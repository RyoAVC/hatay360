const STORAGE_KEY = "hatay360_ref";

export function readReferralCode(search: string): string {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const fromQuery = String(params.get("ref") || params.get("referralCode") || "").trim();
  if (fromQuery) {
    try {
      sessionStorage.setItem(STORAGE_KEY, fromQuery);
    } catch {
      // tarayıcı depolama kapalıysa sessiz geç
    }
    return fromQuery;
  }
  try {
    return String(sessionStorage.getItem(STORAGE_KEY) || "").trim();
  } catch {
    return "";
  }
}

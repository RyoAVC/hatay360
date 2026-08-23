export const MAX_CONTRACT_UPLOAD_BYTES = 8 * 1024 * 1024;

export async function contractFilePayload(file: File) {
  if (file.size > MAX_CONTRACT_UPLOAD_BYTES) throw new Error("Dosya en fazla 8 MB olabilir.");
  const name = file.name.toLowerCase();
  if (!name.endsWith(".pdf") && !name.endsWith(".jpg") && !name.endsWith(".jpeg")) {
    throw new Error("Yalnızca PDF veya JPG yükleyin.");
  }
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      resolve(text.includes(",") ? text.slice(text.indexOf(",") + 1) : text);
    };
    reader.onerror = () => reject(new Error("Dosya okunamadı."));
    reader.readAsDataURL(file);
  });
  return { fileName: file.name.slice(0, 160), data };
}

const APPROVAL_UPLOAD_EXT = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];

export async function approvalFilePayload(file: File) {
  if (file.size > MAX_CONTRACT_UPLOAD_BYTES) throw new Error("Dosya en fazla 8 MB olabilir.");
  const name = file.name.toLowerCase();
  if (!APPROVAL_UPLOAD_EXT.some((ext) => name.endsWith(ext))) {
    throw new Error("Yalnızca PDF, JPG, PNG veya WebP yükleyin.");
  }
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      resolve(text.includes(",") ? text.slice(text.indexOf(",") + 1) : text);
    };
    reader.onerror = () => reject(new Error("Dosya okunamadı."));
    reader.readAsDataURL(file);
  });
  return { fileName: file.name.slice(0, 160), data };
}

export async function openContractFile(url: string, fileName?: string) {
  const response = await fetch(url, { credentials: "same-origin" });
  if (!response.ok) throw new Error("Dosya alınamadı.");
  const blob = await response.blob();
  const href = URL.createObjectURL(blob);
  if (fileName) {
    const link = document.createElement("a");
    link.href = href;
    link.download = fileName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } else {
    window.open(href, "_blank", "noopener");
  }
  window.setTimeout(() => URL.revokeObjectURL(href), 30_000);
}

export const MAX_LOGO_FILE_BYTES = 10 * 1024 * 1024;

type ProcessedLogo = {
  dataUrl: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
};

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Görsel okunamadı."));
    };
    image.src = url;
  });
}

/** Logoyu tarayıcıda kırpar, oranını korur, web ölçüsüne getirir ve PNG üretir. */
export async function processLogoFile(file: File): Promise<ProcessedLogo> {
  if (!file.type.startsWith("image/")) throw new Error("Lütfen geçerli bir görsel dosyası seçin.");
  if (file.size > MAX_LOGO_FILE_BYTES) throw new Error("Logo dosyası en fazla 10 MB olabilir.");

  const image = await loadImage(file);
  if (!image.naturalWidth || !image.naturalHeight) throw new Error("Görsel ölçüleri okunamadı.");

  // Çok büyük kaynakları önce güvenli bir çalışma tuvaline küçültürüz.
  const analysisScale = Math.min(1, 2400 / image.naturalWidth, 1600 / image.naturalHeight);
  const workWidth = Math.max(1, Math.round(image.naturalWidth * analysisScale));
  const workHeight = Math.max(1, Math.round(image.naturalHeight * analysisScale));
  const work = document.createElement("canvas");
  work.width = workWidth;
  work.height = workHeight;
  const context = work.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Görsel işleme başlatılamadı.");
  context.clearRect(0, 0, workWidth, workHeight);
  context.drawImage(image, 0, 0, workWidth, workHeight);

  const pixels = context.getImageData(0, 0, workWidth, workHeight).data;
  const corners = [
    0,
    (workWidth - 1) * 4,
    (workHeight - 1) * workWidth * 4,
    ((workHeight - 1) * workWidth + workWidth - 1) * 4,
  ];
  const cornerAlpha = corners.reduce((sum, index) => sum + pixels[index + 3], 0) / corners.length;
  const background = corners.reduce(
    (color, index) => ({ r: color.r + pixels[index], g: color.g + pixels[index + 1], b: color.b + pixels[index + 2] }),
    { r: 0, g: 0, b: 0 },
  );
  background.r /= corners.length;
  background.g /= corners.length;
  background.b /= corners.length;

  let left = workWidth;
  let top = workHeight;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < workHeight; y += 1) {
    for (let x = 0; x < workWidth; x += 1) {
      const index = (y * workWidth + x) * 4;
      const alpha = pixels[index + 3];
      const distance = Math.max(
        Math.abs(pixels[index] - background.r),
        Math.abs(pixels[index + 1] - background.g),
        Math.abs(pixels[index + 2] - background.b),
      );
      const isVisible = cornerAlpha < 24 ? alpha > 12 : alpha > 12 && distance > 22;
      if (!isVisible) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }

  if (right < left || bottom < top) {
    left = 0;
    top = 0;
    right = workWidth - 1;
    bottom = workHeight - 1;
  }

  // Otomatik kırpımın logoya yapışmaması için küçük ve dengeli bir güven payı.
  const padding = Math.max(2, Math.round(Math.max(right - left, bottom - top) * 0.025));
  left = Math.max(0, left - padding);
  top = Math.max(0, top - padding);
  right = Math.min(workWidth - 1, right + padding);
  bottom = Math.min(workHeight - 1, bottom + padding);

  const cropWidth = right - left + 1;
  const cropHeight = bottom - top + 1;
  const outputScale = Math.min(1, 1600 / cropWidth, 800 / cropHeight);
  const width = Math.max(1, Math.round(cropWidth * outputScale));
  const height = Math.max(1, Math.round(cropHeight * outputScale));
  const output = document.createElement("canvas");
  output.width = width;
  output.height = height;
  const outputContext = output.getContext("2d");
  if (!outputContext) throw new Error("PNG çıktısı oluşturulamadı.");
  outputContext.imageSmoothingEnabled = true;
  outputContext.imageSmoothingQuality = "high";
  outputContext.drawImage(work, left, top, cropWidth, cropHeight, 0, 0, width, height);

  return {
    dataUrl: output.toDataURL("image/png"),
    width,
    height,
    originalWidth: image.naturalWidth,
    originalHeight: image.naturalHeight,
  };
}

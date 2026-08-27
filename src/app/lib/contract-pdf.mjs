
import { createRequire } from "node:module";
import path from "node:path";
import PDFDocument from "pdfkit";

const require = createRequire(import.meta.url);
const DEJAVU_ROOT = path.dirname(require.resolve("dejavu-fonts-ttf/package.json"));
const CONTRACT_FONT = path.join(DEJAVU_ROOT, "ttf", "DejaVuSans.ttf");
const CONTRACT_FONT_BOLD = path.join(DEJAVU_ROOT, "ttf", "DejaVuSans-Bold.ttf");

function latinize(value) {
  return String(value || "")
    .replace(/[Ğ]/g, "G").replace(/[ğ]/g, "g")
    .replace(/[Ü]/g, "U").replace(/[ü]/g, "u")
    .replace(/[Ş]/g, "S").replace(/[ş]/g, "s")
    .replace(/[İI]/g, "I").replace(/[ıi]/g, "i")
    .replace(/[Ö]/g, "O").replace(/[ö]/g, "o")
    .replace(/[Ç]/g, "C").replace(/[ç]/g, "c")
    .replace(/[^\x20-\x7E\n]/g, "?");
}

function escapePdf(text) {
  return latinize(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function jpegSize(buffer) {
  if (!buffer || buffer.length < 8 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    const size = (buffer[offset + 2] << 8) + buffer[offset + 3];
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { height: (buffer[offset + 5] << 8) + buffer[offset + 6], width: (buffer[offset + 7] << 8) + buffer[offset + 8] };
    }
    offset += 2 + size;
  }
  return null;
}

function wrapBody(text, width = 92, maxLines = 48) {
  const lines = [];
  for (const raw of latinize(text).replace(/\r/g, "").split("\n")) {
    const words = raw.split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push("");
      continue;
    }
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (next.length > width) {
        if (current) lines.push(current);
        current = word;
      } else current = next;
    }
    if (current) lines.push(current);
  }
  return lines.slice(0, maxLines);
}

export function htmlToPlain(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function formatMoneyAscii(value) {
  const n = Math.round(Number(value || 0) * 100) / 100;
  const [whole, frac = "00"] = n.toFixed(2).split(".");
  const withDots = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withDots},${frac} TL`;
}

function assembleSimplePdf(drawCommands, pageW = 595, pageH = 842) {
  const objects = [];
  const add = (content) => {
    objects.push(content);
    return objects.length;
  };
  const fontId = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const stream = Buffer.from(drawCommands.join("\n"), "latin1");
  const contentId = add(`<< /Length ${stream.length} >>\nstream\n`);
  const resources = `<< /Font << /F1 ${fontId} 0 R >> >>`;
  const pageId = add(
    `<< /Type /Page /Parent 0 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources ${resources} /Contents ${contentId} 0 R >>`,
  );
  const pagesId = add(`<< /Type /Pages /Kids [${pageId} 0 R] /Count 1 >>`);
  const catalogId = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  const chunks = ["%PDF-1.4\n"];
  const offsets = [0];
  const pushObj = (id, bodyBuf) => {
    offsets[id] = Buffer.byteLength(chunks.join(""), "latin1");
    chunks.push(`${id} 0 obj\n`);
    chunks.push(bodyBuf);
    if (!String(bodyBuf).includes("endstream")) chunks.push("\nendobj\n");
    else chunks.push("\nendstream\nendobj\n");
  };

  const bodies = objects.slice();
  bodies[contentId - 1] = `<< /Length ${stream.length} >>\nstream\n${stream.toString("latin1")}`;
  bodies[pageId - 1] = bodies[pageId - 1].replace("/Parent 0 0 R", `/Parent ${pagesId} 0 R`);

  for (let i = 0; i < bodies.length; i += 1) pushObj(i + 1, bodies[i]);
  const xrefAt = Buffer.byteLength(chunks.join(""), "latin1");
  let xref = `xref\n0 ${bodies.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= bodies.length; i += 1) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  chunks.push(xref);
  chunks.push(`trailer\n<< /Size ${bodies.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefAt}\n%%EOF`);
  return Buffer.from(chunks.join(""), "latin1");
}

function brandPdfLines() {
  return [
    "HATAY360",
    "Web tasarim · Reklam · Dijital",
    "hatay360.com · Avcı E-Ticaret",
    "",
  ];
}

/**
 * Aylık ödeme özeti PDF.
 */
export function buildInvoicePdf({
  companyName,
  contactName,
  email,
  phone,
  period,
  startDate,
  endDate,
  statusLabel,
  amount,
  paidAmount,
  unpaidBase,
  penalty,
  remaining,
  overdue,
  daysOverdue,
  note,
  issuedAt,
}) {
  const lines = [
    ...brandPdfLines(),
    "Odeme ozeti",
    "",
    `Firma: ${companyName || "-"}`,
    `Yetkili: ${contactName || "-"}`,
    email ? `E-posta: ${email}` : "",
    phone ? `Telefon: ${phone}` : "",
    "",
    `Donem: ${period || "-"}`,
    startDate || endDate ? `Vade: ${startDate || "-"} -> ${endDate || "-"}` : "",
    `Durum: ${statusLabel || "-"}`,
    overdue ? `Gecikme: ${Number(daysOverdue || 0)} gun` : "",
    "",
    `Tutar: ${formatMoneyAscii(amount)}`,
    `Odenen: ${formatMoneyAscii(paidAmount)}`,
    `Odenmeyen: ${formatMoneyAscii(unpaidBase)}`,
  ].filter((line) => line !== undefined);

  if (overdue && Number(penalty || 0) > 0) {
    lines.push(`CEZA %15: ${formatMoneyAscii(penalty)}`);
    lines.push(`Hesap: odenmeyen x 1,15 = ${formatMoneyAscii(remaining)}`);
  } else {
    lines.push("CEZA %15: yok");
  }
  lines.push(`Odenecek: ${formatMoneyAscii(remaining)}`);
  if (note) {
    lines.push("");
    lines.push(`Not: ${note}`);
  }
  lines.push("");
  lines.push(`Duzenleme: ${issuedAt || new Date().toISOString().slice(0, 10)}`);
  lines.push("Reklam tiklamasi bu tutara girmez.");
  lines.push("hatay360.com / musteri paneli");

  const draw = [];
  draw.push("BT /F1 16 Tf 48 800 Td (HATAY360) Tj ET");
  draw.push("BT /F1 9 Tf 48 782 Td (hatay360.com · Avcı E-Ticaret) Tj ET");
  draw.push("BT /F1 14 Tf 48 760 Td (Hatay360 fatura / odeme ozeti) Tj ET");
  let y = 736;
  for (const line of wrapBody(lines.join("\n"), 88)) {
    draw.push(`BT /F1 10 Tf 48 ${y} Td (${escapePdf(line)}) Tj ET`);
    y -= 14;
    if (y < 48) break;
  }
  return assembleSimplePdf(draw);
}

function stampDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const day = raw.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : latinize(raw).slice(0, 32);
}

export function buildContractPdf({ title, body, companyName, contactName, signatureJpeg, sigBox, signedAt, approvedAt, statusLabel }) {
  const pageW = 595;
  const pageH = 842;
  const meta = [
    statusLabel ? `Durum: ${statusLabel}` : "",
    signedAt ? `Imza tarihi: ${stampDate(signedAt)}` : "",
    approvedAt ? `Hatay360 onay: ${stampDate(approvedAt)}` : "",
  ].filter(Boolean);
  const lines = wrapBody(
    `${title || "Sozlesme"}\n\n${companyName || ""} / ${contactName || ""}\n\n${htmlToPlain(body)}${meta.length ? `\n\n---\n${meta.join("\n")}` : ""}`,
  );
  const box = {
    x: Math.max(24, Math.min(pageW - 80, Number(sigBox?.x || 12) / 100 * pageW)),
    y: Math.max(24, Math.min(pageH - 80, pageH - Number(sigBox?.y || 82) / 100 * pageH)),
    w: Math.max(80, Math.min(pageW - 48, Number(sigBox?.w || 38) / 100 * pageW)),
    h: Math.max(36, Math.min(160, Number(sigBox?.h || 12) / 100 * pageH)),
  };

  const jpeg = signatureJpeg && jpegSize(signatureJpeg) ? signatureJpeg : null;
  const objects = [];
  const add = (content) => {
    objects.push(content);
    return objects.length;
  };

  const fontId = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  let imageId = 0;
  if (jpeg) {
    const size = jpegSize(jpeg);
    imageId = add(
      `<< /Type /XObject /Subtype /Image /Width ${size.width} /Height ${size.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
    );
  }

  const draw = [];
  draw.push("BT /F1 16 Tf 48 800 Td (HATAY360) Tj ET");
  draw.push("BT /F1 9 Tf 48 782 Td (hatay360.com · Avcı E-Ticaret) Tj ET");
  draw.push("BT /F1 14 Tf 48 760 Td (Hatay360 sozlesme) Tj ET");
  let y = 736;
  for (const line of lines) {
    draw.push(`BT /F1 10 Tf 48 ${y} Td (${escapePdf(line)}) Tj ET`);
    y -= 14;
    if (y < 160) break;
  }
  draw.push(`${box.x.toFixed(1)} ${box.y.toFixed(1)} ${box.w.toFixed(1)} ${box.h.toFixed(1)} re S`);
  const boxLabel = approvedAt ? "Imza + onay" : jpeg ? "Imza (kayitli)" : "Imza alani";
  draw.push(`BT /F1 8 Tf ${box.x.toFixed(1)} ${(box.y + box.h + 8).toFixed(1)} Td (${escapePdf(boxLabel)}) Tj ET`);
  if (signedAt) {
    draw.push(`BT /F1 7 Tf ${box.x.toFixed(1)} ${Math.max(24, box.y - 12).toFixed(1)} Td (${escapePdf(`Imza: ${stampDate(signedAt)}`)}) Tj ET`);
  }
  if (approvedAt) {
    draw.push(`BT /F1 7 Tf ${box.x.toFixed(1)} ${Math.max(14, box.y - 24).toFixed(1)} Td (${escapePdf(`Onay: ${stampDate(approvedAt)}`)}) Tj ET`);
  }
  if (imageId) {
    draw.push("q");
    draw.push(`${box.w.toFixed(1)} 0 0 ${box.h.toFixed(1)} ${box.x.toFixed(1)} ${box.y.toFixed(1)} cm`);
    draw.push(`/Im1 Do`);
    draw.push("Q");
  }

  const stream = Buffer.from(draw.join("\n"), "latin1");
  const contentId = add(`<< /Length ${stream.length} >>\nstream\n`);
  const resources = imageId
    ? `<< /Font << /F1 ${fontId} 0 R >> /XObject << /Im1 ${imageId} 0 R >> >>`
    : `<< /Font << /F1 ${fontId} 0 R >> >>`;
  const pageId = add(
    `<< /Type /Page /Parent 0 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources ${resources} /Contents ${contentId} 0 R >>`,
  );
  const pagesId = add(`<< /Type /Pages /Kids [${pageId} 0 R] /Count 1 >>`);
  const catalogId = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  const chunks = ["%PDF-1.4\n"];
  const offsets = [0];
  const pushObj = (id, bodyBuf) => {
    offsets[id] = Buffer.byteLength(chunks.join(""), "latin1");
    chunks.push(`${id} 0 obj\n`);
    chunks.push(bodyBuf);
    if (!String(bodyBuf).includes("endstream")) chunks.push("\nendobj\n");
    else chunks.push("\nendstream\nendobj\n");
  };

  const bodies = objects.slice();
  bodies[contentId - 1] = `<< /Length ${stream.length} >>\nstream\n${stream.toString("latin1")}`;
  if (imageId) {
    bodies[imageId - 1] = `${String(objects[imageId - 1])}${jpeg.toString("latin1")}`;
  }
  bodies[pageId - 1] = bodies[pageId - 1].replace("/Parent 0 0 R", `/Parent ${pagesId} 0 R`);

  for (let i = 0; i < bodies.length; i += 1) pushObj(i + 1, bodies[i]);
  const xrefAt = Buffer.byteLength(chunks.join(""), "latin1");
  let xref = `xref\n0 ${bodies.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= bodies.length; i += 1) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  chunks.push(xref);
  chunks.push(`trailer\n<< /Size ${bodies.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefAt}\n%%EOF`);
  return Buffer.from(chunks.join(""), "latin1");
}

function decodeContractHtml(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
}

function automaticContractBlocks(html) {
  const blocks = [];
  const matcher = /<(h[1-3]|p)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  for (const match of String(html || "").matchAll(matcher)) {
    const text = decodeContractHtml(match[2]);
    if (text) blocks.push({ type: match[1].toLowerCase(), text });
  }
  return blocks.length ? blocks : [{ type: "p", text: decodeContractHtml(html) }];
}

/** Çok sayfalı, Unicode destekli otomatik müşteri sözleşmesi. İmza çizimi içermez. */
export async function buildAutomaticContractPdf({ title, body, logoPng, logoJpeg }) {
  const doc = new PDFDocument({ size: "A4", margins: { top: 96, right: 48, bottom: 34, left: 48 }, bufferPages: true, info: { Title: title || "Hatay360 Hizmet ve Abonelik Sözleşmesi", Author: "Avcı E-Ticaret / Hatay360.com" } });
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const finished = new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  doc.registerFont("Contract", CONTRACT_FONT);
  doc.registerFont("ContractBold", CONTRACT_FONT_BOLD);
  const logo = logoPng || logoJpeg || null;
  let pageNumber = 0;

  const drawHeader = () => {
    pageNumber += 1;
    if (logo) doc.image(logo, 48, 28, { fit: [112, 42], align: "left", valign: "center" });
    else doc.font("ContractBold").fontSize(17).fillColor("#06151f").text("HATAY360", 48, 38, { width: 112 });
    doc.font("ContractBold").fontSize(12).fillColor("#06151f").text("HATAY360 HİZMET VE ABONELİK SÖZLEŞMESİ", 174, 39, { width: 373, align: "right" });
    doc.moveTo(48, 78).lineTo(547, 78).lineWidth(1).strokeColor("#00a8c4").stroke();
    doc.font("Contract").fontSize(7).fillColor("#667085").text("hatay360.com  •  Avcı E-Ticaret", 48, 795, { width: 360, lineBreak: false });
    doc.text(`Sayfa ${pageNumber}`, 467, 795, { width: 80, align: "right", lineBreak: false });
    doc.x = 48;
    doc.y = 96;
  };
  drawHeader();
  const startNewPage = () => {
    doc.addPage();
    drawHeader();
  };

  const blocks = automaticContractBlocks(body);
  for (const block of blocks) {
    if (block.type === "h1") continue;
    if (block.type === "h2" || block.type === "h3") {
      const fontSize = block.type === "h2" ? 10.5 : 10;
      doc.font("ContractBold").fontSize(fontSize);
      const needed = doc.heightOfString(block.text, { width: 499, lineGap: 2 }) + 18;
      if (doc.y + needed > 750) startNewPage();
      doc.moveDown(0.45).font("ContractBold").fontSize(fontSize).fillColor("#007f95").text(block.text, { lineGap: 2, keepTogether: true }).moveDown(0.2);
    } else {
      doc.font("Contract").fontSize(8.6);
      const needed = doc.heightOfString(block.text, { width: 499, align: "justify", lineGap: 2.1 }) + 8;
      if (doc.y + needed + 20 > 770) startNewPage();
      doc.font("Contract").fontSize(8.6).fillColor("#1f2937").text(block.text, { align: "justify", lineGap: 2.1, paragraphGap: 6 });
    }
  }

  doc.end();
  return finished;
}

/** Teklif PDF — kurumsal / Prime şablonlarından üretilir. */
export function buildQuotePdf({ title, body, companyName, contactName, issuedAt }) {
  const lines = wrapBody(
    [...brandPdfLines(), title || "Teklif", "", `${companyName || ""} / ${contactName || ""}`, "", htmlToPlain(body), "", `Duzenleme: ${issuedAt || new Date().toISOString().slice(0, 10)}`].join("\n"),
    88,
  );
  const draw = [];
  draw.push("BT /F1 16 Tf 48 800 Td (HATAY360 TEKLIF) Tj ET");
  draw.push("BT /F1 9 Tf 48 782 Td (hatay360.com · Avcı E-Ticaret) Tj ET");
  let y = 758;
  for (const line of lines) {
    draw.push(`BT /F1 10 Tf 48 ${y} Td (${escapePdf(line)}) Tj ET`);
    y -= 14;
    if (y < 48) break;
  }
  return assembleSimplePdf(draw);
}

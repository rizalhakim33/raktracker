import QRCode from "qrcode";
import jsPDF from "jspdf";
import { NAMA_PERUSAHAAN, CODE_TO_CATEGORY } from "./constants.js";

// Format options:
// "a4-2x2"       -> A4 portrait, 2x2 grid (4 label per halaman, 100x143mm per label)
// "label-100x150" -> 100x150mm single label (standar label printer 4x6 inch)
const FORMAT_OPTIONS = {
  "a4-2x2": {
    pageW: 210,
    pageH: 297,
    cols: 2,
    rows: 2,
    margin: 5,
    label: "A4 2x2",
  },
  "label-100x150": {
    pageW: 100,
    pageH: 150,
    cols: 1,
    rows: 1,
    margin: 0,
    label: "100x150mm",
  },
};

function resolveKategori(loc) {
  if (loc.kategori) return loc.kategori;
  if (loc.kode_kategori) return CODE_TO_CATEGORY[loc.kode_kategori] || loc.kode_kategori;
  return "";
}

async function drawLabel(pdf, x, y, w, h, loc, fmt) {
  const isSmall = fmt === "a4-2x2";
  const pad = isSmall ? 4 : 5;

  // Border
  if (fmt === "a4-2x2") {
    pdf.setDrawColor(200);
    pdf.rect(x, y, w, h);
  }

  const centerX = x + w / 2;
  const contentW = w - pad * 2;

  // Font sizes
  const companyFontSize = isSmall ? 12 : 16;
  const idFontSize = isSmall ? 14 : 16;
  const catFontSize = isSmall ? 11 : 12;
  const secFontSize = isSmall ? 10 : 12;
  const descFontSize = isSmall ? 9 : 12;

  // QR code
  const qrSize = isSmall ? 65 : 70;
  const qrX = centerX - qrSize / 2;

  // Line heights
  const lineH = (size) => size * 0.45;
  const companyLines = pdf.splitTextToSize(NAMA_PERUSAHAAN, contentW);
  const companyBlockH = companyLines.length * lineH(companyFontSize);
  const idLineH = lineH(idFontSize);
  const catLineH = lineH(catFontSize);
  const secLineH = lineH(secFontSize);

  let descLines = [];
  if (loc.deskripsi_lokasi) {
    descLines = pdf.splitTextToSize(loc.deskripsi_lokasi, contentW).slice(0, 2);
  }
  const hasDesc = descLines.length > 0;
  const descLineH = lineH(descFontSize);
  const descBlockH = hasDesc ? descLines.length * descLineH : 0;

  // Fixed gap from QR code
  const qrGap = 15;

  // Bottom text block
  const bottomBlockH = idLineH + catLineH + secLineH + descBlockH;
  const bottomGapCount = hasDesc ? 3 : 2;
  const bottomGapSmall = (isSmall ? 2 : 2.5);
  const bottomBlockTotal = bottomBlockH + bottomGapCount * bottomGapSmall;

  // Total content height & center on page
  const totalContentH = companyBlockH + qrGap + qrSize + qrGap + bottomBlockTotal;
  const startY = y + (h - totalContentH) / 2;

  // --- Draw ---
  let currentY = startY;

  // 1. Company name
  pdf.setFontSize(companyFontSize);
  pdf.setFont("courier", "normal");
  pdf.setTextColor(0);
  pdf.text(companyLines, centerX, currentY + companyFontSize * 0.35, { align: "center" });
  currentY += companyBlockH + qrGap;

  // 2. QR code
  const qrY = currentY;
  const qrDataUrl = await QRCode.toDataURL(loc.location_id, { margin: 1, width: 400 });
  pdf.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
  currentY += qrSize + qrGap;

  // 3. Kode Rak
  pdf.setFontSize(idFontSize);
  pdf.setFont("courier", "bold");
  pdf.setTextColor(0);
  pdf.text(loc.location_id, centerX, currentY + idFontSize * 0.35, { align: "center" });
  currentY += idLineH + bottomGapSmall;

  // 4. Nama Rak
  const kategori = resolveKategori(loc);
  pdf.setFontSize(catFontSize);
  pdf.setFont("courier", "normal");
  pdf.setTextColor(0);
  pdf.text(kategori, centerX, currentY + catFontSize * 0.35, { align: "center" });
  currentY += catLineH + bottomGapSmall;

  // 5. Section + Bin
  const secText = `Section ${loc.section_rak || "?"} \u00B7 Bin ${loc.kode_bin || "?"}`;
  pdf.setFontSize(secFontSize);
  pdf.setFont("courier", "normal");
  pdf.setTextColor(0);
  pdf.text(secText, centerX, currentY + secFontSize * 0.35, { align: "center" });
  currentY += secLineH + bottomGapSmall;

  // 6. Deskripsi (optional)
  if (hasDesc) {
    pdf.setFontSize(descFontSize);
    pdf.setFont("courier", "normal");
    pdf.setTextColor(0);
    pdf.text(descLines, centerX, currentY + descFontSize * 0.35, { align: "center" });
  }
}

/**
 * Export QR labels as PDF
 * @param {Array} locations - array of location objects
 * @param {string} format - "a4-2x2" | "label-100x150"
 */
export async function exportQrPdf(locations, format = "a4-2x2") {
  if (!locations.length) return;

  const fmt = FORMAT_OPTIONS[format] || FORMAT_OPTIONS["a4-2x2"];
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [fmt.pageW, fmt.pageH],
  });

  const cellW = (fmt.pageW - fmt.margin * 2) / fmt.cols;
  const cellH = (fmt.pageH - fmt.margin * 2) / fmt.rows;
  const perPage = fmt.cols * fmt.rows;

  for (let i = 0; i < locations.length; i++) {
    const idxInPage = i % perPage;
    if (i > 0 && idxInPage === 0) pdf.addPage();

    const col = idxInPage % fmt.cols;
    const row = Math.floor(idxInPage / fmt.cols);
    const x = fmt.margin + col * cellW;
    const y = fmt.margin + row * cellH;

    await drawLabel(pdf, x, y, cellW, cellH, locations[i], format);
  }

  const suffix = fmt.label.replace(/\s+/g, "_");
  pdf.save(`QR_${locations.length}lokasi_${suffix}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Export single location QR label
 * @param {object} loc - location object
 * @param {string} format - "a4-2x2" | "label-100x150"
 */
export async function exportSingleQrPdf(loc, format = "label-100x150") {
  return exportQrPdf([loc], format);
}

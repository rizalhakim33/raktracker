import QRCode from "qrcode";
import jsPDF from "jspdf";

// A4 dibagi 4 => 2x2 grid, tiap QR 105 x 148.5 mm (105 = 210/2, 148.5 = 297/2)
export async function exportQrPdf(locations) {
  if (!locations.length) return;
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 10;
  const cellW = (210 - margin * 2) / 2; // ~95
  const cellH = (297 - margin * 2) / 2; // ~138.5
  // Posisi 4 cell: (0,0) (1,0) (0,1) (1,1)
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const idxInPage = i % 4;
    if (i > 0 && idxInPage === 0) pdf.addPage();
    const col = idxInPage % 2;
    const row = Math.floor(idxInPage / 2);
    const x = margin + col * cellW;
    const y = margin + row * cellH;

    // Border tipis
    pdf.setDrawColor(200);
    pdf.rect(x, y, cellW, cellH);

    // QR code dataURL
    const qrDataUrl = await QRCode.toDataURL(loc.location_id, { margin: 1, width: 400 });
    const qrSize = 75;
    const qrX = x + (cellW - qrSize) / 2;
    const qrY = y + 8;
    pdf.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

    // Teks
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(loc.location_id, x + cellW / 2, qrY + qrSize + 10, { align: "center" });

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    const cat = loc.kategori || loc.kode_kategori || "";
    pdf.text(`${cat} | Sec ${loc.section_rak} | Bin ${loc.kode_bin}`, x + cellW / 2, qrY + qrSize + 16, { align: "center" });

    if (loc.deskripsi_lokasi) {
      pdf.setFontSize(7);
      pdf.setTextColor(80);
      const lines = pdf.splitTextToSize(loc.deskripsi_lokasi, cellW - 10);
      pdf.text(lines.slice(0, 2), x + cellW / 2, qrY + qrSize + 21, { align: "center" });
      pdf.setTextColor(0);
    }
  }
  pdf.save(`QR_${locations.length}bin_A4x4_${new Date().toISOString().slice(0, 10)}.pdf`);
}

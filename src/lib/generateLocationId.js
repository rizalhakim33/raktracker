import { LOCATION_REGEX } from "./constants.js";

export function buildLocationId(kodeKategori, sectionRak, kodeBin) {
  // kodeKategori: EL, sectionRak: A, kodeBin: B01 -> EL-A-B01
  const sk = String(sectionRak || "").trim().toUpperCase();
  const kb = String(kodeBin || "").trim().toUpperCase();
  const kk = String(kodeKategori || "").trim().toUpperCase();
  return `${kk}-${sk}-${kb}`;
}

export function validateLocationId(id) {
  return LOCATION_REGEX.test(String(id).trim().toUpperCase());
}

export function parseLocationId(id) {
  const parts = String(id).trim().toUpperCase().split("-");
  if (parts.length !== 3) return null;
  const [kodeKategori, sectionRak, kodeBin] = parts;
  return { kodeKategori, sectionRak, kodeBin, binGroupId: `${kodeKategori}-${sectionRak}` };
}

// Bulk helper: B01 + 6 -> B01,B02,...B06 (huruf tetap, angka increment, zero-pad 2)
export function generateBulkIds(kodeKategori, sectionRak, kodeBinAwal, jumlah) {
  const m = String(kodeBinAwal).toUpperCase().match(/^([A-Z])([0-9]+)$/);
  if (!m) throw new Error("Format Kode Bin awal salah, contoh B01");
  const prefix = m[1];
  const num = parseInt(m[2], 10);
  const padLen = m[2].length;
  const out = [];
  for (let i = 0; i < jumlah; i++) {
    const n = num + i;
    const kodeBin = `${prefix}${String(n).padStart(padLen, "0")}`;
    out.push(buildLocationId(kodeKategori, sectionRak, kodeBin));
  }
  return out;
}

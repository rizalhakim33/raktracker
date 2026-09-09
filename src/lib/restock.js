import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase.js";
import { RESTOCK_PERIODE_HARI, RESTOCK_MIN_TRANSAKSI, RESTOCK_MIN_HARI_DATA } from "./constants.js";

/**
 * Hitung estimasi restock untuk 1 part.
 * Logika: total keluar 90 hari / 90 hari = rata_per_hari; hari_tersisa = stok / rata
 * Fallback jika data tipis (< MIN_TRANSAKSI atau rentang < MIN_HARI_DATA) → status data_tipis.
 * Tidak ubah stock.js transaction — dipanggil after-commit agar tidak bebani transaction.
 */
export async function hitungEstimasi(partId, stokSaatIni) {
  if (!isFirebaseConfigured()) return { status: "no_firebase", rata: 0, hari: null, tanggal: null, totalKeluar: 0, count: 0 };
  const stok = Number(stokSaatIni ?? 0);
  const periodeHari = RESTOCK_PERIODE_HARI;
  const since = new Date();
  since.setDate(since.getDate() - periodeHari);
  // query hanya keluar, part_id sama, timestamp >= since (butuh index part_id+timestamp sudah ada)
  const q = query(
    collection(db, "stock_history"),
    where("part_id", "==", partId),
    where("tipe", "==", "keluar")
  );
  // ambil semua keluar part ini (limit 200 biar tidak berat), filter tanggal client-side
  const snap = await getDocs(q);
  const rows = snap.docs.map(d=>d.data()).filter(d=>{
    try{
      const t = d.timestamp?.toDate ? d.timestamp.toDate() : new Date(d.timestamp);
      return t >= since;
    } catch { return false; }
  }).slice(0,200);

  const totalKeluar = rows.reduce((s,r)=> s + Number(r.jumlah||0), 0);
  const count = rows.length;

  // tentukan rentang hari data
  let minDate = null, maxDate = null;
  rows.forEach(r=>{
    const t = r.timestamp?.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
    if(!minDate || t < minDate) minDate = t;
    if(!maxDate || t > maxDate) maxDate = t;
  });
  const rentangHari = (minDate && maxDate) ? Math.max(1, Math.ceil((maxDate - minDate)/(1000*60*60*24)) + 1) : 0;

  if (count < RESTOCK_MIN_TRANSAKSI || rentangHari < RESTOCK_MIN_HARI_DATA) {
    // cek juga totalKeluar 0 → tidak ada pakai
    if (totalKeluar === 0) return { status: "tidak_ada_pakai", rata: 0, hari: null, tanggal: null, totalKeluar, count, rentangHari };
    return { status: "data_tipis", rata: 0, hari: null, tanggal: null, totalKeluar, count, rentangHari };
  }

  const rata = totalKeluar / periodeHari; // pcs/hari
  if (rata <= 0) return { status: "tidak_ada_pakai", rata: 0, hari: null, tanggal: null, totalKeluar, count, rentangHari };
  const hari = stok / rata;
  const tanggal = new Date();
  tanggal.setDate(tanggal.getDate() + Math.floor(hari));
  return { status: "ok", rata, hari, tanggal, totalKeluar, count, rentangHari };
}

// Helper untuk update field estimasi di parts (dipanggil after commit)
export async function updateEstimasiDiPart(partId, stokSaatIni) {
  if (!isFirebaseConfigured()) return null;
  const est = await hitungEstimasi(partId, stokSaatIni);
  const ref = doc(db, "parts", partId);
  const payload = {
    rata_pakai_per_hari: est.rata,
    estimasi_hari_tersisa: est.hari,
    estimasi_tanggal_habis: est.tanggal,
    last_estimasi_at: serverTimestamp(),
    total_keluar_90h: est.totalKeluar,
    hitung_status: est.status,
    hitung_count_90h: est.count,
  };
  // null handling untuk tanggal
  if (!est.tanggal) payload.estimasi_tanggal_habis = null;
  if (est.hari === null) payload.estimasi_hari_tersisa = null;
  await updateDoc(ref, payload);
  return est;
}

export function formatHari(hari){
  if (hari == null || !isFinite(hari)) return "—";
  if (hari < 1) return "<1 hari";
  if (hari < 30) return `${Math.round(hari)} hari`;
  const minggu = Math.round(hari/7);
  if (hari < 90) return `${minggu} minggu`;
  return `${(hari/30).toFixed(1)} bulan`;
}

import { doc, collection, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase.js";

export async function submitStockTransaction({ partId, locationId, tipe, jumlah, namaPengambil, keperluan, catatan }) {
  const n = Number(jumlah);
  if (!n || n <= 0) throw new Error("Jumlah harus > 0");
  if (!namaPengambil?.trim()) throw new Error("Nama pengambil wajib");
  if (!["keluar", "masuk"].includes(tipe)) throw new Error("Tipe harus keluar/masuk");

  const partRef = doc(db, "parts", partId);
  const historyRef = doc(collection(db, "stock_history"));

  const result = await runTransaction(db, async (tx) => {
    const partSnap = await tx.get(partRef);
    if (!partSnap.exists()) throw new Error("Part tidak ditemukan: " + partId);
    const part = partSnap.data();
    const stokNow = Number(part.stok_saat_ini ?? 0);
    const delta = tipe === "keluar" ? -n : n;
    const stokSesudah = stokNow + delta;
    if (stokSesudah < 0) throw new Error(`Stok tidak cukup. Stok sekarang ${stokNow}, diminta ${n} keluar.`);
    // update part
    tx.update(partRef, { stok_saat_ini: stokSesudah, updatedAt: serverTimestamp() });
    // snapshot harga untuk akurasi historis (harga saat transaksi, bukan harga sekarang)
    const hargaSnapshot = part.harga_satuan != null ? Number(part.harga_satuan) : null;
    const totalBiaya = hargaSnapshot != null ? n * hargaSnapshot : null;
    const mesinSnap = Array.isArray(part.kompatibel_mesin) ? part.kompatibel_mesin : [];
    // create history
    const hist = {
      part_id: partId,
      location_id: locationId || part.location_id || "",
      tipe,
      jumlah: n,
      timestamp: serverTimestamp(),
      nama_pengambil: namaPengambil.trim(),
      keperluan: keperluan || "",
      catatan: catatan || "",
      stok_sesudah: stokSesudah,
      stok_sebelum: stokNow,
      harga_satuan_snapshot: hargaSnapshot,
      total_biaya: totalBiaya,
      mesin_snapshot: mesinSnap,
    };
    tx.set(historyRef, hist);
    return { stokSesudah, stokNow, historyId: historyRef.id };
  });
  return result;
}

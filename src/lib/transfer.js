import { doc, collection, runTransaction, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase.js";

/**
 * Transfer stok dari satu lokasi ke lokasi lain (atomic).
 * Kalau part dengan nama_part + part_number sama sudah ada di lokasi tujuan,
 * tambahkan stoknya. Kalau belum ada, buat entry baru (kopipe metadata dari asal).
 */
export async function submitTransfer({ partAsalId, locationIdTujuan, jumlah, namaPengambil, catatan }) {
  const n = Number(jumlah);
  if (!n || n <= 0) throw new Error("Jumlah harus > 0");
  if (!namaPengambil?.trim()) throw new Error("Nama pengambil wajib");
  if (!locationIdTujuan?.trim()) throw new Error("Lokasi tujuan wajib");

  const partAsalRef = doc(db, "parts", partAsalId);
  const historyRef = doc(collection(db, "stock_history"));

  const result = await runTransaction(db, async (tx) => {
    // 1. Baca part asal
    const partAsalSnap = await tx.get(partAsalRef);
    if (!partAsalSnap.exists()) throw new Error("Part asal tidak ditemukan: " + partAsalId);
    const partAsal = partAsalSnap.data();
    const stokNow = Number(partAsal.stok_saat_ini ?? 0);

    // 2. Validasi anti-minus
    if (n > stokNow) throw new Error(`Stok tidak cukup. Stok sekarang ${stokNow}, diminta transfer ${n}.`);
    const stokAsalBaru = stokNow - n;

    // 3. Cari part di lokasi tujuan dengan nama_part + part_number yang sama
    const qTujuan = query(
      collection(db, "parts"),
      where("location_id", "==", locationIdTujuan),
      where("nama_part", "==", partAsal.nama_part),
      where("part_number", "==", partAsal.part_number)
    );
    const snapTujuan = await getDocs(qTujuan);
    let partTujuanRef;
    let stokTujuanBaru;

    if (!snapTujuan.empty) {
      // 4a. Part sudah ada di lokasi tujuan → tambahkan stok
      const partTujuanDoc = snapTujuan.docs[0];
      partTujuanRef = doc(db, "parts", partTujuanDoc.id);
      const stokTujuanNow = Number(partTujuanDoc.data().stok_saat_ini ?? 0);
      stokTujuanBaru = stokTujuanNow + n;
      tx.update(partTujuanRef, { stok_saat_ini: stokTujuanBaru, updatedAt: serverTimestamp() });
    } else {
      // 4b. Part belum ada di lokasi tujuan → buat baru (kopipe metadata dari asal)
      partTujuanRef = doc(collection(db, "parts"));
      stokTujuanBaru = n;
      tx.set(partTujuanRef, {
        nama_part: partAsal.nama_part,
        location_id: locationIdTujuan,
        kategori: partAsal.kategori || "",
        brand: partAsal.brand || "",
        part_number: partAsal.part_number || "",
        part_number_alternatif: partAsal.part_number_alternatif || [],
        kompatibel_mesin: partAsal.kompatibel_mesin || [],
        satuan: partAsal.satuan || "pcs",
        stok_saat_ini: n,
        stok_minimum: partAsal.stok_minimum ?? 2,
        no_induk: partAsal.no_induk || "",
        kekritisan: partAsal.kekritisan || "Desirable",
        harga_satuan: partAsal.harga_satuan ?? null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // 5. Update stok part asal
    tx.update(partAsalRef, { stok_saat_ini: stokAsalBaru, updatedAt: serverTimestamp() });

    // 6. Buat 1 record stock_history
    const hargaSnapshot = partAsal.harga_satuan != null ? Number(partAsal.harga_satuan) : null;
    const totalBiaya = hargaSnapshot != null ? n * hargaSnapshot : null;
    const mesinSnap = Array.isArray(partAsal.kompatibel_mesin) ? partAsal.kompatibel_mesin : [];

    const hist = {
      part_id: partAsalId,
      location_id: partAsal.location_id || "",
      location_id_asal: partAsal.location_id || "",
      location_id_tujuan: locationIdTujuan,
      tipe: "transfer",
      jumlah: n,
      timestamp: serverTimestamp(),
      nama_pengambil: namaPengambil.trim(),
      keperluan: "Transfer",
      catatan: catatan || "",
      stok_sesudah: stokAsalBaru,
      stok_sebelum: stokNow,
      harga_satuan_snapshot: hargaSnapshot,
      total_biaya: totalBiaya,
      mesin_snapshot: mesinSnap,
    };
    tx.set(historyRef, hist);

    return {
      stokAsalBaru,
      stokTujuanBaru,
      historyId: historyRef.id,
      partTujuanBaru: snapTujuan.empty,
    };
  });

  return result;
}

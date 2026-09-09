import { submitStockTransaction } from "./stock.js";
import { submitTransfer } from "./transfer.js";

const STORAGE_KEY = "raktrack_pending_transactions";

/**
 * Ambil semua transaksi pending dari localStorage.
 */
export function getPendingTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Simpan daftar pending ke localStorage.
 */
function savePendingList(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Gagal simpan ke localStorage:", e);
  }
}

/**
 * Simpan transaksi baru ke queue offline.
 * Returns: object transaksi yang tersimpan (dengan id).
 */
export function savePendingTransaction(data) {
  const list = getPendingTransactions();
  const entry = {
    id: `offline_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    data,
    status: "pending",
    error: null,
  };
  list.push(entry);
  savePendingList(list);
  return entry;
}

/**
 * Hapus transaksi dari queue berdasarkan id.
 */
export function removePendingTransaction(id) {
  const list = getPendingTransactions().filter((t) => t.id !== id);
  savePendingList(list);
}

/**
 * Tandai transaksi gagal dengan error message.
 */
export function markTransactionFailed(id, errorMessage) {
  const list = getPendingTransactions().map((t) =>
    t.id === id ? { ...t, status: "failed", error: errorMessage } : t
  );
  savePendingList(list);
}

/**
 * Jumlah transaksi yang masih pending (belum sync).
 */
export function getPendingCount() {
  return getPendingTransactions().filter((t) => t.status === "pending").length;
}

/**
 * Jumlah transaksi yang gagal sync.
 */
export function getFailedCount() {
  return getPendingTransactions().filter((t) => t.status === "failed").length;
}

/**
 * Sync semua transaksi pending ke Firestore.
 * Returns: { synced: number, failed: number, errors: string[] }
 */
export async function syncPendingTransactions() {
  const list = getPendingTransactions();
  const pending = list.filter((t) => t.status === "pending");
  if (pending.length === 0) return { synced: 0, failed: 0, errors: [] };

  let synced = 0;
  let failed = 0;
  const errors = [];

  for (const entry of pending) {
    try {
      const d = entry.data;
      if (d.locationIdTujuan) {
        // Transfer
        await submitTransfer({
          partAsalId: d.partId,
          locationIdTujuan: d.locationIdTujuan,
          jumlah: d.jumlah,
          namaPengambil: d.namaPengambil,
          catatan: d.catatan || "",
        });
      } else {
        // Transaksi biasa (keluar/masuk)
        await submitStockTransaction({
          partId: d.partId,
          locationId: d.locationId,
          tipe: d.tipe,
          jumlah: d.jumlah,
          namaPengambil: d.namaPengambil,
          keperluan: d.keperluan,
          catatan: d.catatan || "",
        });
      }
      // Berhasil → hapus dari queue
      removePendingTransaction(entry.id);
      synced++;
    } catch (e) {
      // Gagal → tandai failed
      markTransactionFailed(entry.id, e.message);
      errors.push(e.message);
      failed++;
    }
  }

  return { synced, failed, errors };
}

/**
 * Clear semua data pending (termasuk yang gagal).
 * Berguna untuk reset manual.
 */
export function clearAllPending() {
  savePendingList([]);
}

import { useOnlineStatus } from "../hooks/useOnlineStatus.js";

export default function OfflineQueueBanner() {
  const { isOnline, pendingCount, failedCount, syncing, syncPending } = useOnlineStatus();

  // Tidak perlu tampilkan apa-apa kalau tidak ada pending/failed
  if (pendingCount === 0 && failedCount === 0 && isOnline) return null;

  return (
    <div className="mx-4 mt-3">
      {!isOnline ? (
        <div className="flex items-center gap-3 bg-warning/10 border border-warning/20 rounded-xl px-4 py-3 text-sm">
          <div className="w-2 h-2 rounded-full bg-warning animate-pulse flex-shrink-0" />
          <div className="flex-1">
            <span className="font-medium text-text-main">Offline</span>
            {pendingCount > 0 && (
              <span className="text-text-secondary"> · {pendingCount} transaksi menunggu sinkronisasi</span>
            )}
          </div>
          {pendingCount > 0 && (
            <button onClick={syncPending} disabled={syncing}
              className="text-xs font-medium text-primary hover:text-primary/80 disabled:opacity-50 flex-shrink-0">
              {syncing ? "Menyinkronkan..." : "Coba Sekarang"}
            </button>
          )}
        </div>
      ) : failedCount > 0 ? (
        <div className="flex items-center gap-3 bg-danger/5 border border-danger/20 rounded-xl px-4 py-3 text-sm">
          <div className="w-2 h-2 rounded-full bg-danger flex-shrink-0" />
          <div className="flex-1">
            <span className="font-medium text-danger">{failedCount} transaksi gagal sync</span>
            <span className="text-text-secondary"> (stok tidak cukup atau error lain)</span>
          </div>
          <button onClick={syncPending} disabled={syncing}
            className="text-xs font-medium text-primary hover:text-primary/80 disabled:opacity-50 flex-shrink-0">
            {syncing ? "Menyinkronkan..." : "Coba Lagi"}
          </button>
        </div>
      ) : pendingCount > 0 && isOnline ? (
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
          <div className="flex-1">
            <span className="text-text-secondary">Menyinkronkan {pendingCount} transaksi...</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { getPendingCount, getFailedCount, syncPendingTransactions } from "../lib/offline.js";

/**
 * Hook untuk deteksi status online/offline + manage pending queue.
 * Returns: { isOnline, pendingCount, failedCount, syncPending }
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(() => getPendingCount());
  const [failedCount, setFailedCount] = useState(() => getFailedCount());
  const [syncing, setSyncing] = useState(false);

  // Refresh counts dari localStorage
  const refreshCounts = useCallback(() => {
    setPendingCount(getPendingCount());
    setFailedCount(getFailedCount());
  }, []);

  // Sync pending transactions
  const syncPending = useCallback(async () => {
    if (syncing || !navigator.onLine) return;
    setSyncing(true);
    try {
      await syncPendingTransactions();
    } catch (e) {
      console.warn("Sync error:", e);
    }
    refreshCounts();
    setSyncing(false);
  }, [syncing, refreshCounts]);

  useEffect(() => {
    function onOnline() {
      setIsOnline(true);
      // Auto-sync saat kembali online
      syncPending();
    }
    function onOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    // Cek pending saat mount
    refreshCounts();

    // Auto-sync kalau ada pending dan online
    if (navigator.onLine && getPendingCount() > 0) {
      syncPending();
    }

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { isOnline, pendingCount, failedCount, syncing, syncPending, refreshCounts };
}

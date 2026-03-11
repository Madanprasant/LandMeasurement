import { useState, useEffect } from 'react';
import { offlineDb } from '../db/offlineDb';
import { API_BASE_URL } from '../config/api';

export default function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial count
    updatePendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updatePendingCount = async () => {
    const count = await offlineDb.pendingLands.count();
    setPendingCount(count);
  };

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline) {
      syncOfflineData();
    }
  }, [isOnline]);

  const saveOffline = async (record) => {
    await offlineDb.pendingLands.add({
      ...record,
      createdAt: new Date().toISOString(),
      isOffline: true
    });
    updatePendingCount();
  };

  const syncOfflineData = async () => {
    const records = await offlineDb.pendingLands.toArray();
    if (records.length === 0) return;

    setIsSyncing(true);
    try {
      // Loop through and sync each record
      // In a real production app, you might use a batch endpoint
      for (const record of records) {
        const { id, ...data } = record;
        const response = await fetch(`${API_BASE_URL}/lands`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          await offlineDb.pendingLands.delete(id);
        }
      }
      updatePendingCount();
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  return { isOnline, isSyncing, pendingCount, saveOffline, syncOfflineData };
}

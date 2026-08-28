"use client";

import { useEffect, useState } from "react";
import { getOfflineQueue, isOnline, syncOfflineQueue } from "@/lib/sync/offlineSync";

export default function OfflineSyncStatus() {
  const [online, setOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [justSynced, setJustSynced] = useState<boolean>(false);

  useEffect(() => {
    setOnline(isOnline());
    setPendingCount(getOfflineQueue().length);

    const handleOnline = async () => {
      setOnline(true);
      setSyncing(true);
      const res = await syncOfflineQueue();
      setSyncing(false);
      setPendingCount(getOfflineQueue().length);
      if (res.synced > 0) {
        setJustSynced(true);
        setTimeout(() => setJustSynced(false), 4000);
      }
    };

    const handleOffline = () => {
      setOnline(false);
    };

    const handleQueueChange = (e: Event) => {
      const custom = e as CustomEvent<{ count: number }>;
      setPendingCount(custom.detail?.count ?? getOfflineQueue().length);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("growlab:offline-queue-changed", handleQueueChange);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("growlab:offline-queue-changed", handleQueueChange);
    };
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    const res = await syncOfflineQueue();
    setSyncing(false);
    setPendingCount(getOfflineQueue().length);
    if (res.synced > 0) {
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 4000);
    }
  };

  if (online && pendingCount === 0 && !justSynced) {
    return null;
  }

  return (
    <aside
      aria-live="polite"
      aria-label="حالة الاتصال ومزامنة البيانات"
      className="fixed bottom-4 start-4 z-50 flex max-w-md items-center gap-3 rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md transition-all duration-300"
    >
      <div className="flex items-center gap-2.5">
        {!online ? (
          <span className="flex size-3 rounded-full bg-amber-500 animate-pulse" />
        ) : syncing ? (
          <span className="flex size-3 rounded-full bg-sky-500 animate-spin" />
        ) : (
          <span className="flex size-3 rounded-full bg-emerald-500" />
        )}

        <div className="text-xs">
          {!online ? (
            <div>
              <p className="font-semibold text-frost">وضع عدم الاتصال بالإنترنت</p>
              <p className="text-frost-dim">
                بياناتك محفوظة محلياً ({pendingCount} عمليات معلقة)
              </p>
            </div>
          ) : syncing ? (
            <div>
              <p className="font-semibold text-frost">جاري مزامنة البيانات...</p>
              <p className="text-frost-dim">يتم حفظ التعديلات في الخادم</p>
            </div>
          ) : justSynced ? (
            <div>
              <p className="font-semibold text-emerald-700">تمت المزامنة بنجاح ✓</p>
              <p className="text-frost-dim">جميع البيانات محدثة في الخادم</p>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-frost">{pendingCount} تعديلات بانتظار المزامنة</p>
            </div>
          )}
        </div>
      </div>

      {online && pendingCount > 0 && (
        <button
          type="button"
          onClick={handleManualSync}
          disabled={syncing}
          className="ms-auto rounded-xl bg-frost px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-black active:scale-95 disabled:opacity-50"
        >
          {syncing ? "..." : "مزامنة الآن"}
        </button>
      )}
    </aside>
  );
}

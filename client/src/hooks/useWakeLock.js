import { useState, useEffect, useRef } from "react";

export function useWakeLock(active = true) {
  const [supported, setSupported] = useState(false);
  const [held, setHeld] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "wakeLock" in navigator) {
      setSupported(true);
    }
  }, []);

  useEffect(() => {
    if (!supported || !active) {
      if (sentinelRef.current) {
        sentinelRef.current.release().catch(() => {});
        sentinelRef.current = null;
        setHeld(false);
      }
      return;
    }

    let isMounted = true;

    async function requestLock() {
      try {
        if ("wakeLock" in navigator && !sentinelRef.current) {
          const sentinel = await navigator.wakeLock.request("screen");
          if (isMounted) {
            sentinelRef.current = sentinel;
            setHeld(true);
            sentinel.addEventListener("release", () => {
              if (isMounted) {
                setHeld(false);
                sentinelRef.current = null;
              }
            });
          }
        }
      } catch {
        if (isMounted) setHeld(false);
      }
    }

    requestLock();

    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && active) {
        requestLock();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (sentinelRef.current) {
        sentinelRef.current.release().catch(() => {});
        sentinelRef.current = null;
      }
    };
  }, [supported, active]);

  return { supported, held };
}

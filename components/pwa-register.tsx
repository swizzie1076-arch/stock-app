"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration is opportunistic; the app should never fail because PWA support is unavailable.
    });
  }, []);

  return null;
}

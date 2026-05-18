"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function InstallActions() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    function handleInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  if (installed) {
    return (
      <div className="rounded-lg border border-[#6ee7d8]/30 bg-[#6ee7d8]/10 px-4 py-3 text-sm font-black text-[#6ee7d8]">
        Atlas Invest is installed.
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleInstall}
      disabled={!installPrompt}
      className="premium-button inline-flex h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-black disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Download size={17} />
      {installPrompt ? "Install app" : "Install from browser menu"}
    </button>
  );
}

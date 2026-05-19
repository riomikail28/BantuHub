"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(display-mode: standalone)").matches || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplay() || window.localStorage.getItem("bantuhub-install-dismissed") === "true") {
      setDismissed(true);
      return;
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setInstallEvent(null);
      setDismissed(true);
      window.localStorage.setItem("bantuhub-install-dismissed", "true");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function installApp() {
    if (!installEvent) return;

    await installEvent.prompt();
    const choice = await installEvent.userChoice;

    if (choice.outcome === "accepted") {
      window.localStorage.setItem("bantuhub-install-dismissed", "true");
      setDismissed(true);
    }

    setInstallEvent(null);
  }

  function dismissPrompt() {
    window.localStorage.setItem("bantuhub-install-dismissed", "true");
    setDismissed(true);
  }

  if (!installEvent || dismissed) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-lg border border-line bg-white p-3 shadow-soft sm:inset-x-auto sm:right-5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-600 text-white">
          <Download size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-ink">Install BantuHub</div>
          <p className="mt-1 text-xs leading-5 text-muted">Akses marketplace jasa lebih cepat dari home screen desktop atau Android.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={installApp} className="min-h-9 px-3 text-xs">Install</Button>
            <Button variant="ghost" onClick={dismissPrompt} className="min-h-9 px-3 text-xs">Nanti</Button>
          </div>
        </div>
        <button className="rounded-md p-1 text-muted hover:bg-canvas hover:text-ink" aria-label="Tutup install prompt" onClick={dismissPrompt} type="button">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

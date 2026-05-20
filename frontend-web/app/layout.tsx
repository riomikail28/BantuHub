import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { ToastProvider } from "@/components/ui/ToastProvider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://bantuhub.vercel.app"),
  applicationName: "BantuHub",
  title: "BantuHub",
  description: "Marketplace jasa serba bisa untuk mencari, booking, dan mengelola layanan jasa terpercaya.",
  manifest: "/manifest.webmanifest",
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BantuHub",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#14916d",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body>
        {children}
        <InstallPrompt />
        <ToastProvider />
      </body>
    </html>
  );
}

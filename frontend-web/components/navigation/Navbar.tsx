"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { clearAuthSession, getAuthSession } from "@/lib/auth";

export function Navbar({ onMenu }: { onMenu?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const session = getAuthSession();

  function logout() {
    clearAuthSession();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {onMenu ? (
            <button className="rounded-lg p-2 text-muted lg:hidden" onClick={onMenu} aria-label="Open navigation">
              <Menu size={20} />
            </button>
          ) : null}
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-ink">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white">B</span>
            BantuHub
          </Link>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
          <Link className={pathname === "/services" ? "text-ink" : "hover:text-ink"} href="/services">
            Layanan
          </Link>
          <Link className={pathname === "/register" ? "text-ink" : "hover:text-ink"} href="/register">
            Daftar
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {session ? (
            <Button variant="ghost" onClick={logout}>
              <LogOut size={16} />
              Keluar
            </Button>
          ) : (
            <Link href="/login">
              <Button>Masuk</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

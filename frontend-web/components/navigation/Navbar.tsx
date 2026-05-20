"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut, Menu, Settings, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { NotificationCenter } from "@/components/navigation/NotificationCenter";
import { clearAuthSession, dashboardPathForRole, getAuthSession } from "@/lib/auth";
import type { AuthUserPayload } from "@/types/user";

export function Navbar({ onMenu }: { onMenu?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isAdminArea = pathname.startsWith("/admin");
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<AuthUserPayload | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSession(getAuthSession());
  }, []);

  function logout() {
    clearAuthSession();
    setSession(null);
    setAccountOpen(false);
    router.push("/login");
  }

  const authArea = !mounted ? (
    <>
      <Link href="/register" className="hidden sm:block">
        <Button variant="secondary">Daftar</Button>
      </Link>
      <Link href="/login">
        <Button>Masuk</Button>
      </Link>
    </>
  ) : session && isAdminArea ? (
    <div className="relative">
      <button
        type="button"
        className="flex items-center gap-3 rounded-lg border border-line bg-white px-2.5 py-2 text-left shadow-sm transition hover:bg-canvas"
        onClick={() => setAccountOpen((current) => !current)}
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
          {session.user?.name?.charAt(0) || "A"}
        </span>
        <span className="hidden leading-tight sm:block">
          <span className="block text-sm font-semibold text-ink">{session.user?.name || "Admin"}</span>
          <span className="block text-xs text-muted">Administrator</span>
        </span>
        <ChevronDown size={16} className="text-muted" />
      </button>
      {accountOpen ? (
        <div className="absolute right-0 mt-2 w-52 rounded-lg border border-line bg-white p-2 shadow-soft">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted hover:bg-canvas hover:text-ink"
            onClick={() => setAccountOpen(false)}
          >
            <UserCircle size={16} />
            Profil
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted hover:bg-canvas hover:text-ink"
            onClick={() => setAccountOpen(false)}
          >
            <Settings size={16} />
            Settings
          </Link>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  ) : session ? (
    <>
      <Link href={dashboardPathForRole(session.role?.name)}>
        <Button variant="secondary">Dashboard</Button>
      </Link>
      <Button variant="ghost" onClick={logout}>
        <LogOut size={16} />
        Keluar
      </Button>
    </>
  ) : (
    <>
      <Link href="/register" className="hidden sm:block">
        <Button variant="secondary">Daftar</Button>
      </Link>
      <Link href="/login">
        <Button>Masuk</Button>
      </Link>
    </>
  );

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
          {isHomePage ? (
            <>
              <Link className="hover:text-ink" href="#cara-kerja">Cara Kerja</Link>
              <Link className="hover:text-ink" href="#kategori">Kategori</Link>
              <Link className="hover:text-ink" href="#keunggulan">Keunggulan</Link>
              <Link className="hover:text-ink" href="#faq">FAQ</Link>
              <Link className="hover:text-ink" href="/register">Untuk Mitra</Link>
            </>
          ) : (
            <>
              <Link className={pathname === "/services" ? "text-ink" : "hover:text-ink"} href="/services">
                Layanan
              </Link>
              <Link className={pathname === "/register" ? "text-ink" : "hover:text-ink"} href="/register">
                Daftar
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {mounted && session ? <NotificationCenter role={session.role?.name} /> : null}
          {authArea}
        </div>
      </div>
    </header>
  );
}

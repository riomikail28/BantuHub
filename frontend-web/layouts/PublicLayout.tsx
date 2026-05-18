import type { ReactNode } from "react";
import { Navbar } from "@/components/navigation/Navbar";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      {children}
    </div>
  );
}

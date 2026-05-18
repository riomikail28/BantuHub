import type { ReactNode } from "react";
import { ProviderLayout } from "@/layouts/ProviderLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return <ProviderLayout>{children}</ProviderLayout>;
}

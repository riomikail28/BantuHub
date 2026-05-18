import type { ReactNode } from "react";
import { CustomerLayout } from "@/layouts/CustomerLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return <CustomerLayout>{children}</CustomerLayout>;
}

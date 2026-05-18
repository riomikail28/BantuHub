import { DashboardPage } from "@/components/pages/DashboardPage";

export default function Page() {
  return <DashboardPage title="Customer Dashboard" description="Pantau order, review, dan complaint milikmu." items={["Order aktif", "Layanan favorit", "Status complaint"]} />;
}

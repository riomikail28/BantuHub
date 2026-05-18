import { DashboardPage } from "@/components/pages/DashboardPage";

export default function Page() {
  return <DashboardPage title="Admin Dashboard" description="Ringkasan operasional marketplace BantuHub." items={["Users", "Booking", "Revenue"]} />;
}

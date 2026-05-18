import { DashboardPage } from "@/components/pages/DashboardPage";

export default function Page() {
  return <DashboardPage title="Provider Dashboard" description="Ringkasan layanan, booking, dan status verifikasi mitra." items={["Layanan aktif", "Booking masuk", "Earnings"]} />;
}

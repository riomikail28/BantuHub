import type { Booking } from "./booking";

export interface Payment {
  id: number;
  booking_id: number;
  service_price: string | number;
  platform_fee_percent: string | number;
  platform_fee_amount: string | number;
  provider_earning: string | number;
  total_payment: string | number;
  payment_method: "manual_transfer" | "cash";
  payment_status: "pending" | "paid" | "rejected" | "failed" | "refunded";
  payment_proof?: string | null;
  paid_at?: string | null;
  booking?: Booking;
}

import type { Booking } from "./booking";
import type { User } from "./user";

export interface Complaint {
  id: number;
  booking_id: number;
  customer_id: number;
  provider_id: number;
  complaint_text: string;
  status: "pending" | "process" | "resolved" | "rejected";
  admin_response?: string | null;
  resolved_by?: number | null;
  resolved_at?: string | null;
  created_at?: string;
  updated_at?: string;
  booking?: Booking;
  customer?: User;
  provider?: User;
}

import type { Service } from "./service";
import type { User } from "./user";
import type { Payment } from "./payment";

export type BookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "on_the_way"
  | "arrived_at_location"
  | "in_progress"
  | "waiting_payment"
  | "paid"
  | "completed"
  | "cancelled"
  | "complaint";

export interface Booking {
  id: number;
  booking_code: string;
  customer_id: number;
  provider_id: number;
  service_id: number;
  booking_date: string;
  booking_time: string;
  service_method: string;
  address?: string | null;
  customer_note?: string | null;
  status: BookingStatus;
  total_price: string | number;
  created_at?: string;
  updated_at?: string;
  service?: Service;
  customer?: User;
  provider?: User;
  payment?: Payment | null;
}

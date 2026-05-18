import type { Booking } from "./booking";
import type { User } from "./user";

export interface Review {
  id: number;
  booking_id: number;
  customer_id: number;
  provider_id: number;
  rating: number;
  review_text?: string | null;
  booking?: Booking;
  customer?: User;
  provider?: User;
}

import type { User } from "./user";

export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
}

export interface Service {
  id: number;
  provider_id: number;
  category_id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: string | number;
  duration_minutes?: number | null;
  service_method: "home_service" | "visit_store" | "online_service";
  image?: string | null;
  status: string;
  category?: ServiceCategory;
  provider?: User & {
    provider_profile?: {
      business_name?: string | null;
      rating_average?: string | number;
      rating_count?: number;
      city?: string | null;
      province?: string | null;
      verification_status?: string;
    };
  };
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

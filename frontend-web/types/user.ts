export type UserRoleName = "admin" | "customer" | "provider";

export interface Role {
  id: number;
  name: UserRoleName;
  display_name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  status: string;
  role?: Role;
  provider_profile?: AuthProfile | null;
  customer_profile?: AuthProfile | null;
}

export interface AuthProfile {
  id: number;
  user_id: number;
  business_name?: string | null;
  bio?: string | null;
  verification_status?: string;
  rating_average?: string | number;
  rating_count?: number;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
}

export interface AuthUserPayload {
  token?: string;
  user: User;
  role: Role;
  profile?: AuthProfile | null;
}

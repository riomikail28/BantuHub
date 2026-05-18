import type { AuthUserPayload, UserRoleName } from "@/types/user";

const TOKEN_KEY = "bantuhub_token";
const USER_KEY = "bantuhub_user";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthSession(payload: AuthUserPayload): void {
  if (typeof window === "undefined") return;
  if (payload.token) {
    localStorage.setItem(TOKEN_KEY, payload.token);
  }
  localStorage.setItem(USER_KEY, JSON.stringify(payload));
}

export function getAuthSession(): AuthUserPayload | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUserPayload;
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function dashboardPathForRole(role?: UserRoleName): string {
  if (role === "admin") return "/admin/dashboard";
  if (role === "provider") return "/provider/dashboard";
  return "/customer/dashboard";
}

export function isRoleAllowed(role: UserRoleName | undefined, allowedRole: UserRoleName): boolean {
  return role === allowedRole;
}

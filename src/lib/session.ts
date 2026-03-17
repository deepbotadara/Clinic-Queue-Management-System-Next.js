export type UserRole = "admin" | "patient" | "doctor" | "receptionist";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  clinicId?: number;
  clinicName?: string;
  clinicCode?: string;
};

export function getStoredSession() {
  if (typeof window === "undefined") {
    return { token: "", user: null as User | null };
  }
  const token = localStorage.getItem("cms_token") || "";
  const raw = localStorage.getItem("cms_user");
  const user = raw ? (JSON.parse(raw) as User) : null;
  return { token, user };
}

export function saveSession(token: string, user: User) {
  localStorage.setItem("cms_token", token);
  localStorage.setItem("cms_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("cms_token");
  localStorage.removeItem("cms_user");
}

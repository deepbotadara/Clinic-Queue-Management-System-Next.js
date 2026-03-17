"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getStoredSession, type User, type UserRole } from "./session";

export function useAuth(requiredRole?: UserRole) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getStoredSession();
    if (!session.user || !session.token) {
      router.push("/");
      return;
    }
    if (requiredRole && session.user.role !== requiredRole) {
      router.push("/");
      return;
    }
    setUser(session.user);
    setToken(session.token);
    setReady(true);
  }, [requiredRole, router]);

  const logout = () => {
    clearSession();
    router.push("/");
  };

  return { user, token, ready, logout };
}

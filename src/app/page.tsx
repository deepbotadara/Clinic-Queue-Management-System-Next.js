"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { getStoredSession, saveSession, type User } from "@/lib/session";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const session = getStoredSession();
    if (session.user && session.token) {
      redirectByRole(session.user);
    }
  }, []);

  const redirectByRole = (user: User) => {
    if (user.role === "admin") {
      router.push("/admin");
    } else if (user.role === "patient") {
      router.push("/patient");
    } else if (user.role === "receptionist") {
      router.push("/receptionist");
    } else if (user.role === "doctor") {
      router.push("/doctor");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("Signing in...");
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      saveSession(data.token, data.user);
      setStatus("Login successful. Redirecting...");
      redirectByRole(data.user);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <>
      <header>
        <h1>Clinic Queue Management</h1>
        <p>Sign in to access your clinic workspace.</p>
      </header>
      <main className="auth-shell">
        <section className="card auth-card">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@clinic.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button type="submit">Sign In</button>
            </div>
          </form>
          <p className="empty" style={{ marginTop: 10 }}>{status}</p>
        </section>
      </main>
    </>
  );
}

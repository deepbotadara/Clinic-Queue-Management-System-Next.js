"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

type ClinicInfo = {
  name?: string;
  clinicName?: string;
  code?: string;
  clinicCode?: string;
  counts?: Record<string, number>;
  doctors?: number;
  receptionists?: number;
  patients?: number;
  appointments?: number;
  userCount?: number;
};

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function AdminPage() {
  const { token, ready, logout } = useAuth("admin");
  const [clinicName, setClinicName] = useState("Clinic");
  const [clinicMeta, setClinicMeta] = useState("Loading clinic info...");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [usersStatus, setUsersStatus] = useState("No data loaded yet.");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("doctor");
  const [createStatus, setCreateStatus] = useState("");

  useEffect(() => {
    if (ready) {
      loadClinic();
    }
  }, [ready]);

  const loadClinic = async () => {
    try {
      const data = (await apiRequest("/admin/clinic", {}, token)) as ClinicInfo;
      const name = data.name || data.clinicName || "Clinic";
      const code = data.code || data.clinicCode || "";
      setClinicName(name);
      const countPieces: string[] = [];
      if (data.counts) {
        if (data.counts.doctors !== undefined) countPieces.push(`Doctors: ${data.counts.doctors}`);
        if (data.counts.receptionists !== undefined) countPieces.push(`Receptionists: ${data.counts.receptionists}`);
        if (data.counts.patients !== undefined) countPieces.push(`Patients: ${data.counts.patients}`);
        if (data.counts.appointments !== undefined) countPieces.push(`Appointments: ${data.counts.appointments}`);
      } else {
        if (data.doctors !== undefined) countPieces.push(`Doctors: ${data.doctors}`);
        if (data.receptionists !== undefined) countPieces.push(`Receptionists: ${data.receptionists}`);
        if (data.patients !== undefined) countPieces.push(`Patients: ${data.patients}`);
        if (data.appointments !== undefined) countPieces.push(`Appointments: ${data.appointments}`);
        if (data.userCount !== undefined) countPieces.push(`Users: ${data.userCount}`);
      }
      const pieces = [] as string[];
      if (code) pieces.push(`Code: ${code}`);
      if (countPieces.length) pieces.push(countPieces.join(" | "));
      setClinicMeta(pieces.length ? pieces.join(" | ") : "Clinic info loaded.");
    } catch (err) {
      setClinicMeta(err instanceof Error ? err.message : "Failed to load clinic.");
    }
  };

  const loadUsers = async () => {
    setUsersStatus("Loading users...");
    try {
      const data = await apiRequest("/admin/users", {}, token);
      const list = Array.isArray(data) ? data : (data.users || []);
      setUsers(list);
      setUsersStatus(list.length ? "" : "No users found.");
    } catch (err) {
      setUsersStatus(err instanceof Error ? err.message : "Failed to load users.");
    }
  };

  const createUser = async () => {
    if (!formName || !formEmail || !formPassword) {
      setCreateStatus("All fields are required.");
      return;
    }
    setCreateStatus("Creating user...");
    try {
      await apiRequest(
        "/admin/users",
        {
          method: "POST",
          body: JSON.stringify({
            name: formName,
            email: formEmail,
            password: formPassword,
            role: formRole,
          }),
        },
        token
      );
      setCreateStatus("User created successfully.");
      setFormName("");
      setFormEmail("");
      setFormPassword("");
      await loadUsers();
    } catch (err) {
      setCreateStatus(err instanceof Error ? err.message : "Failed to create user.");
    }
  };

  if (!ready) {
    return null;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <h2>Admin</h2>
          <div className="side-meta">
            <span className="pill">Clinic</span>
          </div>
        </div>
        <nav className="side-nav">
          <a href="/admin">Dashboard</a>
          <a href="/patient">Patient View</a>
          <a href="/receptionist">Reception</a>
          <a href="/doctor">Doctor</a>
        </nav>
      </aside>
      <div className="content">
        <header>
          <div className="header-bar">
            <div>
              <h1>Admin Dashboard</h1>
              <p>Clinic overview and user management.</p>
            </div>
            <div className="header-center">
              <span className="pill">{clinicName}</span>
            </div>
            <div className="header-actions">
              <button type="button" className="secondary" onClick={logout}>Logout</button>
            </div>
          </div>
        </header>
        <main>
          <section className="card" style={{ marginTop: 16 }}>
          <span className="badge">Clinic Snapshot</span>
          <h2>{clinicName}</h2>
          <p className="clinic-meta">{clinicMeta}</p>
          </section>

          <section className="card" style={{ marginTop: 16 }}>
            <h2>Users</h2>
            <div className="action-bar" style={{ margin: "10px 0 12px" }}>
              <button type="button" onClick={loadUsers}>Load Users</button>
            </div>
            <p className="empty">{usersStatus}</p>
            <div className="list two-col">
              {users.map((user) => (
                <div key={user.id} className="list-item">
                  <h4>{user.name}</h4>
                  <div className="meta">{user.email}</div>
                  <div className="row" style={{ marginTop: 6 }}>
                    <span className="pill">{user.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card" style={{ marginTop: 16 }}>
            <h2>Create User</h2>
            <div className="grid grid-2">
              <div>
                <label htmlFor="admin-name">Name</label>
                <input
                  id="admin-name"
                  type="text"
                  value={formName}
                  onChange={(event) => setFormName(event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="admin-email">Email</label>
                <input
                  id="admin-email"
                  type="email"
                  value={formEmail}
                  onChange={(event) => setFormEmail(event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="admin-password">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  value={formPassword}
                  onChange={(event) => setFormPassword(event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="admin-role">Role</label>
                <select
                  id="admin-role"
                  value={formRole}
                  onChange={(event) => setFormRole(event.target.value)}
                >
                  <option value="doctor">Doctor</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="patient">Patient</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button type="button" onClick={createUser}>Create User</button>
            </div>
            <p className="empty" style={{ marginTop: 10 }}>{createStatus}</p>
          </section>
        </main>
        <footer>Admin workspace</footer>
      </div>
    </div>
  );
}

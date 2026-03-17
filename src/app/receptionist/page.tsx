"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

export default function ReceptionistPage() {
  const { token, ready, logout } = useAuth("receptionist");
  const [date, setDate] = useState("");
  const [statusText, setStatusText] = useState("No queue loaded yet.");
  const [queue, setQueue] = useState<any[]>([]);

  if (!ready) {
    return null;
  }

  const loadQueue = async () => {
    if (!date) {
      setStatusText("Select a date.");
      return;
    }
    setStatusText("Loading queue...");
    try {
      const data = await apiRequest(`/queue?date=${encodeURIComponent(date)}`, {}, token);
      const list = Array.isArray(data) ? data : (data.queue || []);
      setQueue(list);
      setStatusText(list.length ? "" : "No queue entries found.");
    } catch (err) {
      setStatusText(err instanceof Error ? err.message : "Failed to load queue.");
    }
  };

  const updateStatus = async (queueId: number, nextStatus: string) => {
    setStatusText("Updating status...");
    try {
      await apiRequest(
        `/queue/${queueId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatus }),
        },
        token
      );
      await loadQueue();
      setStatusText("Queue updated.");
    } catch (err) {
      setStatusText(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <h2>Reception</h2>
          <div className="side-meta">
            <span className="pill">Queue</span>
          </div>
        </div>
        <nav className="side-nav">
          <a href="/receptionist">Queue</a>
        </nav>
      </aside>
      <div className="content">
        <header>
          <div className="header-bar">
            <div>
              <h1>Reception Desk</h1>
              <p>Manage the daily queue and patient flow.</p>
            </div>
            <div className="header-center">
              <span className="pill">Clinic</span>
            </div>
            <div className="header-actions">
              <button type="button" className="secondary" onClick={logout}>Logout</button>
            </div>
          </div>
        </header>
        <main>
          <section className="card" style={{ marginTop: 16 }}>
          <h2>Queue by Date</h2>
          <div className="form-row">
            <div>
              <label htmlFor="queue-date">Select Date</label>
              <input id="queue-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <div>
              <label>&nbsp;</label>
              <button type="button" onClick={loadQueue}>Submit</button>
            </div>
          </div>
          <p className="empty" style={{ marginTop: 12 }}>{statusText}</p>
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Phone</th>
                  <th>Time Slot</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item) => {
                  const patient = item.appointment?.patient || {};
                  const status = item.status || "waiting";
                  const actions: { label: string; value: string; style?: string }[] = [];
                  if (status === "waiting") {
                    actions.push({ label: "In progress", value: "in-progress" });
                    actions.push({ label: "Skip", value: "skipped", style: "secondary" });
                  } else if (status === "in_progress") {
                    actions.push({ label: "Done", value: "done" });
                  }
                  return (
                    <tr key={item.id || item._id}>
                      <td>{item.tokenNumber || item.token || "-"}</td>
                      <td>{item.patientName || patient.name || "Patient"}</td>
                      <td>{patient.phone || "-"}</td>
                      <td>{item.appointment?.timeSlot || "-"}</td>
                      <td><span className="pill">{status}</span></td>
                      <td className="row">
                        {actions.length ? actions.map((action) => (
                          <button
                            key={action.value}
                            type="button"
                            className={action.style}
                            onClick={() => updateStatus(item.id || item._id, action.value)}
                          >
                            {action.label}
                          </button>
                        )) : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </section>

          <section className="card" style={{ marginTop: 16 }}>
            <h2>Role Summary</h2>
            <p className="empty">Belongs to one clinic.</p>
            <ul>
              <li>Get daily queue for a date</li>
              <li>Update queue entry status</li>
            </ul>
          </section>
        </main>
        <footer>Reception workspace</footer>
      </div>
    </div>
  );
}

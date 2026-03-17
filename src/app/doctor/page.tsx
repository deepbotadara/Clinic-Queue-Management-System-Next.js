"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

export default function DoctorPage() {
  const { token, ready, logout } = useAuth("doctor");
  const [queue, setQueue] = useState<any[]>([]);
  const [queueStatus, setQueueStatus] = useState("No queue loaded yet.");
  const [appointmentId, setAppointmentId] = useState("");
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [medDuration, setMedDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [tests, setTests] = useState("");
  const [remarks, setRemarks] = useState("");
  const [prescriptionStatus, setPrescriptionStatus] = useState("");
  const [reportStatus, setReportStatus] = useState("");

  if (!ready) {
    return null;
  }

  const loadQueue = async () => {
    setQueueStatus("Loading queue...");
    try {
      const data = await apiRequest("/doctor/queue", {}, token);
      const list = (Array.isArray(data) ? data : (data.queue || [])) as any[];
      const filtered = list.filter((item: any) => item.status !== "waiting");
      setQueue(filtered);
      setQueueStatus(filtered.length ? "" : "No queue entries found.");
      if (filtered.length) {
        setAppointmentId(String(filtered[0].appointmentId || ""));
      }
    } catch (err) {
      setQueueStatus(err instanceof Error ? err.message : "Failed to load queue.");
    }
  };

  const savePrescription = async () => {
    if (!appointmentId) {
      setPrescriptionStatus("Select an appointment.");
      return;
    }
    if (!medName || !medDosage || !medDuration) {
      setPrescriptionStatus("Enter medicine name, dosage, and duration.");
      return;
    }
    setPrescriptionStatus("Saving prescription...");
    try {
      await apiRequest(
        `/prescriptions/${appointmentId}`,
        {
          method: "POST",
          body: JSON.stringify({
            medicines: [
              {
                name: medName,
                dosage: medDosage,
                duration: medDuration,
              },
            ],
            notes,
          }),
        },
        token
      );
      setPrescriptionStatus("Prescription saved.");
      setMedName("");
      setMedDosage("");
      setMedDuration("");
      setNotes("");
    } catch (err) {
      setPrescriptionStatus(err instanceof Error ? err.message : "Failed to save prescription.");
    }
  };

  const saveReport = async () => {
    if (!appointmentId) {
      setReportStatus("Select an appointment.");
      return;
    }
    if (!diagnosis) {
      setReportStatus("Diagnosis is required.");
      return;
    }
    setReportStatus("Saving report...");
    try {
      await apiRequest(
        `/reports/${appointmentId}`,
        {
          method: "POST",
          body: JSON.stringify({
            diagnosis,
            testRecommended: tests,
            remarks,
          }),
        },
        token
      );
      setReportStatus("Report saved.");
      setDiagnosis("");
      setTests("");
      setRemarks("");
    } catch (err) {
      setReportStatus(err instanceof Error ? err.message : "Failed to save report.");
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <h2>Doctor</h2>
          <div className="side-meta">
            <span className="pill">Queue</span>
          </div>
        </div>
        <nav className="side-nav">
          <a href="/doctor">Today's Queue</a>
        </nav>
      </aside>
      <div className="content">
        <header>
          <div className="header-bar">
            <div>
              <h1>Doctor Console</h1>
              <p>Review today's queue and add clinical notes.</p>
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
          <h2>Today's Queue</h2>
          <div className="action-bar" style={{ margin: "10px 0 12px" }}>
            <button type="button" onClick={loadQueue}>Submit</button>
            <select value={appointmentId} onChange={(event) => setAppointmentId(event.target.value)}>
              <option value="">Select appointment</option>
              {queue.map((item) => (
                <option key={item.appointmentId} value={item.appointmentId}>
                  {item.appointmentId} - {item.patientName || "Patient"}
                </option>
              ))}
            </select>
          </div>
          <p className="empty">{queueStatus}</p>
          <div className="list">
            {queue.map((item) => (
              <div key={item.appointmentId} className="list-item">
                <h4>Token {item.tokenNumber || item.token || ""}</h4>
                <div className="meta">{item.patientName || "Patient"}</div>
                <div className="row" style={{ marginTop: 6 }}>
                  <span className="pill">Appointment {item.appointmentId}</span>
                </div>
              </div>
            ))}
          </div>
          </section>

          <section className="card" style={{ marginTop: 16 }}>
            <h2>Prescription</h2>
            <div className="form-row">
              <div>
                <label htmlFor="med-name">Medicine Name</label>
                <input id="med-name" type="text" value={medName} onChange={(event) => setMedName(event.target.value)} />
              </div>
              <div>
                <label htmlFor="med-dosage">Dosage</label>
                <input id="med-dosage" type="text" value={medDosage} onChange={(event) => setMedDosage(event.target.value)} />
              </div>
              <div>
                <label htmlFor="med-duration">Duration</label>
                <input id="med-duration" type="text" value={medDuration} onChange={(event) => setMedDuration(event.target.value)} />
              </div>
            </div>
            <label htmlFor="notes" style={{ marginTop: 10 }}>Notes</label>
            <input id="notes" type="text" value={notes} onChange={(event) => setNotes(event.target.value)} />
            <div style={{ marginTop: 12 }}>
              <button type="button" onClick={savePrescription}>Save Prescription</button>
            </div>
            <p className="empty" style={{ marginTop: 10 }}>{prescriptionStatus}</p>
          </section>

          <section className="card" style={{ marginTop: 16 }}>
            <h2>Report</h2>
            <label htmlFor="diagnosis">Diagnosis</label>
            <input id="diagnosis" type="text" value={diagnosis} onChange={(event) => setDiagnosis(event.target.value)} />
            <label htmlFor="tests" style={{ marginTop: 10 }}>Tests</label>
            <input id="tests" type="text" value={tests} onChange={(event) => setTests(event.target.value)} />
            <label htmlFor="remarks" style={{ marginTop: 10 }}>Remarks</label>
            <input id="remarks" type="text" value={remarks} onChange={(event) => setRemarks(event.target.value)} />
            <div style={{ marginTop: 12 }}>
              <button type="button" onClick={saveReport}>Save Report</button>
            </div>
            <p className="empty" style={{ marginTop: 10 }}>{reportStatus}</p>
          </section>
        </main>
        <footer>Doctor workspace</footer>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

const slotOptions = [
  "09:00-09:15",
  "09:15-09:30",
  "09:30-09:45",
  "09:45-10:00",
  "10:00-10:15",
  "10:15-10:30",
  "10:30-10:45",
  "10:45-11:00",
  "11:00-11:15",
  "11:15-11:30",
  "11:30-11:45",
  "11:45-12:00",
  "14:00-14:15",
  "14:15-14:30",
  "14:30-14:45",
  "14:45-15:00",
  "15:00-15:15",
  "15:15-15:30",
  "15:30-15:45",
  "15:45-16:00",
];

function formatDate(value?: string) {
  if (!value) return "-";
  return value.includes("T") ? value.split("T")[0] : value;
}

export default function PatientPage() {
  const { user, token, ready, logout } = useAuth("patient");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [bookStatus, setBookStatus] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsStatus, setAppointmentsStatus] = useState("No appointments loaded yet.");
  const [detail, setDetail] = useState<any | null>(null);
  const [detailStatus, setDetailStatus] = useState("Select an appointment to see details.");
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [prescriptionsStatus, setPrescriptionsStatus] = useState("No data loaded yet.");
  const [reports, setReports] = useState<any[]>([]);
  const [reportsStatus, setReportsStatus] = useState("No data loaded yet.");

  const bookAppointment = async () => {
    if (!date || !slot) {
      setBookStatus("Select date and time.");
      return;
    }
    setBookStatus("Booking appointment...");
    try {
      await apiRequest(
        "/appointments",
        {
          method: "POST",
          body: JSON.stringify({ appointmentDate: date, timeSlot: slot }),
        },
        token
      );
      setBookStatus("Appointment booked.");
      await loadAppointments();
    } catch (err) {
      setBookStatus(err instanceof Error ? err.message : "Booking failed.");
    }
  };

  const loadAppointments = async () => {
    setAppointmentsStatus("Loading appointments...");
    try {
      const data = await apiRequest("/appointments/my", {}, token);
      const list = Array.isArray(data) ? data : (data.appointments || []);
      setAppointments(list);
      setAppointmentsStatus(list.length ? "" : "No appointments found.");
    } catch (err) {
      setAppointmentsStatus(err instanceof Error ? err.message : "Failed to load appointments.");
    }
  };

  const loadDetails = async (appointmentId: number) => {
    setDetailStatus("Loading details...");
    try {
      const data = await apiRequest(`/appointments/${appointmentId}`, {}, token);
      setDetail(data);
      setDetailStatus("");
    } catch (err) {
      setDetailStatus(err instanceof Error ? err.message : "Failed to load details.");
    }
  };

  const loadPrescriptions = async () => {
    setPrescriptionsStatus("Loading prescriptions...");
    try {
      const data = await apiRequest("/prescriptions/my", {}, token);
      const list = Array.isArray(data) ? data : (data.prescriptions || []);
      setPrescriptions(list);
      setPrescriptionsStatus(list.length ? "" : "No prescriptions found.");
    } catch (err) {
      setPrescriptionsStatus(err instanceof Error ? err.message : "Failed to load prescriptions.");
    }
  };

  const loadReports = async () => {
    setReportsStatus("Loading reports...");
    try {
      const data = await apiRequest("/reports/my", {}, token);
      const list = Array.isArray(data) ? data : (data.reports || []);
      setReports(list);
      setReportsStatus(list.length ? "" : "No reports found.");
    } catch (err) {
      setReportsStatus(err instanceof Error ? err.message : "Failed to load reports.");
    }
  };

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (activeSection === "appointments") {
      loadAppointments();
    }
    if (activeSection === "prescriptions") {
      loadPrescriptions();
    }
    if (activeSection === "reports") {
      loadReports();
    }
  }, [activeSection, ready]);

  if (!ready) {
    return null;
  }

  const detailPrescription = detail?.prescription || {};
  const detailReport = detail?.report || {};
  const detailMedicines = Array.isArray(detailPrescription.medicines) ? detailPrescription.medicines : [];
  const detailMedicineText = detailMedicines.length
    ? detailMedicines.map((med: any) => `${med.name || ""} ${med.dosage || ""} (${med.duration || ""})`).join(", ")
    : "-";
  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter((item) => {
    const status = item.queueEntry?.status || item.status || "";
    return ["waiting", "in_progress", "queued", "scheduled"].includes(status);
  }).length;
  const completedAppointments = appointments.filter((item) => {
    const status = item.queueEntry?.status || item.status || "";
    return ["done", "completed"].includes(status);
  }).length;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <h2>Patient</h2>
          <div className="side-meta">
            <span className="pill">{user?.role || "patient"}</span>
          </div>
        </div>
        <nav className="side-nav">
          <button
            type="button"
            className={activeSection === "dashboard" ? "active" : ""}
            onClick={() => setActiveSection("dashboard")}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={activeSection === "booking" ? "active" : ""}
            onClick={() => setActiveSection("booking")}
          >
            Book Appointment
          </button>
          <button
            type="button"
            className={activeSection === "appointments" ? "active" : ""}
            onClick={() => setActiveSection("appointments")}
          >
            My Appointments
          </button>
          <button
            type="button"
            className={activeSection === "prescriptions" ? "active" : ""}
            onClick={() => setActiveSection("prescriptions")}
          >
            My Prescriptions
          </button>
          <button
            type="button"
            className={activeSection === "reports" ? "active" : ""}
            onClick={() => setActiveSection("reports")}
          >
            My Reports
          </button>
        </nav>
      </aside>
      <div className="content">
        <header>
          <div className="header-bar">
            <div>
              <h1>Clinic Queue</h1>
              <p>Patient workspace</p>
            </div>
            <div className="header-center">
              <span className="pill">{user?.clinicName || "Clinic"}</span>
            </div>
            <div className="header-actions">
              <span className="pill">{user?.role || "patient"}</span>
              <button type="button" className="secondary" onClick={logout}>Logout</button>
            </div>
          </div>
        </header>
        <main>
          {activeSection === "dashboard" && (
            <section className="card" id="patient-dashboard" style={{ marginTop: 16 }}>
              <h2>Patient Dashboard</h2>
              <p className="empty">Welcome, {user?.name || "Patient"}. Use the menu to manage appointments and view care history.</p>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Total Appointments</div>
                  <div className="stat-value">{totalAppointments}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Upcoming / Pending</div>
                  <div className="stat-value">{pendingAppointments}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Completed</div>
                  <div className="stat-value">{completedAppointments}</div>
                </div>
              </div>
              <div className="nav-grid">
                <button type="button" className="nav-card" onClick={() => setActiveSection("booking")}>
                  Book Appointment
                  <span>Select a slot and date</span>
                </button>
                <button type="button" className="nav-card" onClick={() => setActiveSection("appointments")}>
                  My Appointments
                  <span>Token, status, details</span>
                </button>
                <button type="button" className="nav-card" onClick={() => setActiveSection("prescriptions")}>
                  My Prescriptions
                  <span>Medicines and notes</span>
                </button>
                <button type="button" className="nav-card" onClick={() => setActiveSection("reports")}>
                  My Reports
                  <span>Diagnosis and tests</span>
                </button>
              </div>
            </section>
          )}

          {activeSection === "booking" && (
            <section className="card" id="patient-booking" style={{ marginTop: 16 }}>
          <h2>Book Appointment</h2>
            <div className="form-row">
            <div>
              <label htmlFor="appt-date">Date</label>
              <input id="appt-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <div>
              <label htmlFor="appt-slot">Time Slot</label>
              <select id="appt-slot" value={slot} onChange={(event) => setSlot(event.target.value)}>
                <option value="">Select slot</option>
                {slotOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="button" onClick={bookAppointment}>Book Now</button>
          </div>
          <p className="empty" style={{ marginTop: 10 }}>{bookStatus}</p>
          </section>
          )}

          {activeSection === "appointments" && (
            <section className="card" id="patient-appointments-section" style={{ marginTop: 16 }}>
          <h2>My Appointments</h2>
          <p className="empty">{appointmentsStatus}</p>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Token</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((item) => {
                  const when = formatDate(item.appointmentDate || item.date);
                  const slotValue = item.timeSlot || item.slot || item.time || "-";
                  const tokenValue = item.queueEntry?.tokenNumber || item.queueToken || item.token || "-";
                  const statusValue = item.queueEntry?.status || item.status || "queued";
                  const id = item.id || item._id;
                  return (
                    <tr key={id}>
                      <td>{when}</td>
                      <td>{slotValue}</td>
                      <td>{tokenValue}</td>
                      <td><span className="pill">{statusValue}</span></td>
                      <td>
                        {id ? (
                          <button type="button" onClick={() => loadDetails(id)}>View</button>
                        ) : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </section>
          )}

          {activeSection === "appointments" && (
            <section className="card" id="patient-detail-section" style={{ marginTop: 16 }}>
          <h2>Appointment Details</h2>
          <p className="empty">{detailStatus}</p>
          {detail && (
            <div className="list">
              <div className="list-item">
                <h4>Appointment {detail.id || detail.appointmentId}</h4>
                <div className="meta">{formatDate(detail.appointmentDate || detail.date)} {detail.timeSlot || detail.slot || detail.time || ""}</div>
                <div className="row" style={{ marginTop: 8 }}>
                  <span className="pill">{detail.status || "queued"}</span>
                </div>
                <div style={{ marginTop: 10 }}>
                  <strong>Prescription</strong>
                  <div className="meta">Medicines: {detailMedicineText}</div>
                  <div className="meta">Notes: {detailPrescription.notes || "-"}</div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <strong>Report</strong>
                  <div className="meta">Diagnosis: {detailReport.diagnosis || "-"}</div>
                  <div className="meta">Tests: {detailReport.testRecommended || detailReport.tests || "-"}</div>
                  <div className="meta">Remarks: {detailReport.remarks || "-"}</div>
                </div>
              </div>
            </div>
          )}
          </section>
          )}

          {activeSection === "prescriptions" && (
            <section className="card" id="patient-prescriptions-section" style={{ marginTop: 16 }}>
          <h2>My Prescriptions</h2>
          <p className="empty">{prescriptionsStatus}</p>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Doctor</th>
                  <th>Medicine</th>
                  <th>Course Days</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.flatMap((item) => {
                  const appointmentDate = formatDate(item.appointment?.appointmentDate || item.appointmentDate || item.date);
                  const doctorName = item.doctor?.name || item.doctorName || "-";
                  const notes = item.notes || "-";
                  const meds = Array.isArray(item.medicines) ? item.medicines : [];
                  if (!meds.length) {
                    return (
                      <tr key={item.id || item.appointmentId}>
                        <td>{appointmentDate}</td>
                        <td>{doctorName}</td>
                        <td>-</td>
                        <td>-</td>
                        <td>{notes}</td>
                      </tr>
                    );
                  }
                  return meds.map((med: any, index: number) => (
                    <tr key={`${item.id || item.appointmentId}-${index}`}>
                      <td>{appointmentDate}</td>
                      <td>{doctorName}</td>
                      <td>{med.name || "-"}</td>
                      <td>{med.duration || "-"}</td>
                      <td>{notes}</td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
          </section>
          )}

          {activeSection === "reports" && (
            <section className="card" id="patient-reports-section" style={{ marginTop: 16 }}>
          <h2>My Reports</h2>
          <p className="empty">{reportsStatus}</p>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Doctor</th>
                  <th>Diagnosis</th>
                  <th>Tests</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((item) => (
                  <tr key={item.id || item.appointmentId}>
                    <td>{formatDate(item.appointment?.appointmentDate || item.appointmentDate || item.date)}</td>
                    <td>{item.doctor?.name || item.doctorName || "-"}</td>
                    <td>{item.diagnosis || "-"}</td>
                    <td>{item.testRecommended || item.tests || "-"}</td>
                    <td>{item.remarks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </section>
          )}
        </main>
        <footer>Patient workspace</footer>
      </div>
    </div>
  );
}

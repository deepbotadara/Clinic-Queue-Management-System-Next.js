# Clinic Queue Management System

This is my frontend project made with Next.js + TypeScript for the Clinic Queue Management System.

## How to Run

From the `next` folder:

```bash
npm run dev
```

Open `http://localhost:3000` in the browser.

## Build

```bash
npm run build
```

## Pages

- `/` Login
- `/admin`
- `/patient`
- `/receptionist`
- `/doctor`

## API Base URL

`https://cmsback.sampaarsh.cloud`

## Roles and Access

admin: view clinic info and counts, list users, create doctors/receptionists/patients.
patient: book appointment, view my appointments with token/status, view appointment details, view my prescriptions and reports.
receptionist: view daily queue by date, update queue status (waiting -> in-progress/skip, in-progress -> done).
doctor: view today’s queue, add prescription and report for an appointment.

## Demo Login (Optional)

If these users exist in the backend, you can login directly with them:

- Admin: `24010101614@darshan.ac.in` / `password123`
- Patient: `deep@pat.com` / `deepPat123`
- Receptionist: `deep@rec.com` / `deepRec123`
- Doctor: `deep@dr.com` / `deepDr123`

If any of these are not present in the backend, the login will fail and you should use the correct credentials provided by the admin.

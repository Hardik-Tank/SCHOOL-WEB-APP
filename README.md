# School ERP

A multi-tenant School ERP built on the MERN stack — JWT auth, role-based access control, school onboarding/approval, and student/teacher/attendance management.

## Roles

| Role | Capabilities |
|---|---|
| **Super Admin** | Approves/rejects school registration requests, views platform-wide stats |
| **School Admin** | Manages classes, teachers, and students within their own school |
| **Teacher** | Marks/views attendance for their school's classes |
| **Student** | Views their own attendance history and stats |

## Onboarding flow

1. A school registers via `/register-school` — this creates the School (`status: pending`) and its School Admin user (`status: pending`). No login is possible yet.
2. A Super Admin reviews pending schools and approves or rejects them.
3. On approval, the School Admin account is activated and can log in, then add teachers/students/classes.

## Project structure

```
School-erp/
  server/   Express + MongoDB REST API
  client/   React (Vite) + TailwindCSS frontend
```

See `server/` and `client/src` for the full breakdown — both follow a conventional resource-based layout (models/controllers/routes on the backend; pages/components/api on the frontend).

## Prerequisites

- Node.js 18+
- A running MongoDB instance (local `mongodb://127.0.0.1:27017` by default, or update `MONGO_URI`)

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # edit values as needed, especially JWT_SECRET
npm run seed:admin      # creates the initial Super Admin (see .env.example for credentials)
npm run dev             # or: npm start
```

The API runs on `http://localhost:5000/api` by default. Default seeded Super Admin login (override via env vars before seeding):

- Email: `admin@schoolerp.com`
- Password: `Admin@123`

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env   # VITE_API_URL defaults to http://localhost:5000/api
npm run dev
```

The app runs on `http://localhost:5173`.

## Environment variables

**server/.env**
| Var | Purpose |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs — set a real value outside of local dev |
| `CLIENT_URL` | Allowed CORS origin for the frontend |
| `SUPER_ADMIN_NAME/EMAIL/PASSWORD` | Used only by `npm run seed:admin` |

**client/.env**
| Var | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |

## Typical end-to-end walkthrough

1. Log in as Super Admin, or register a new school at `/register-school`.
2. As Super Admin, approve the new school under **Schools**.
3. Log in as the School Admin (credentials used at registration) and create a Class, a Teacher, and a Student.
4. Log in as the Teacher, open **Mark Attendance**, pick the class/date, and save.
5. Log in as the Student to see attendance history and stats; check the School Admin and Super Admin dashboards for aggregate stats.

## Notes

- The `/api/auth/*` routes are rate-limited (20 requests/15min per IP) — restart the backend process to reset the counter during heavy local testing, or raise the limit in `middleware`/`app.js` for a dev-friendly threshold.
- Both apps were built and verified independently, then validated together end-to-end (school registration → approval → teacher/student creation → attendance marking → all four role dashboards) against a live MongoDB instance.
- The frontend build produces a single JS bundle; for production, consider route-based code-splitting if bundle size becomes a concern.

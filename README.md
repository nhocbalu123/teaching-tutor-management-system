# Teaching Tutor Management System

GitHub repository: https://github.com/rmit-fsd-2025-s1/s3959931-s3978302-a2

Full-stack monorepo for managing teaching tutor and lab assistant applications. The system has a candidate/lecturer app, an admin dashboard, a REST backend, and an admin GraphQL backend that share one MySQL database.

## Services

| Service | Folder | Stack | Default URL |
| --- | --- | --- | --- |
| User frontend | `frontend` | Next.js 15, React 19 | `http://localhost:3000` |
| User REST API | `backend` | Express, TypeORM, MySQL | `http://localhost:5000` |
| Admin frontend | `admin-frontend` | Next.js 15, React 19, Apollo Client | `http://localhost:3001` |
| Admin API | `admin-backend` | Express, Apollo Server, TypeGraphQL, WebSocket | `http://localhost:4002/graphql` |

## Core Features

- Candidate and lecturer signup/signin with email-domain role assignment.
- Candidate dashboard for browsing courses, filtering opportunities, and applying for tutor or lab assistant roles.
- Lecturer dashboard for viewing assigned-course applications, filtering candidates, saving comments, selecting candidates, and ranking selected applicants.
- Admin dashboard for user blocking/unblocking/deletion, course CRUD, lecturer-course assignments, and selection reports.
- Real-time GraphQL subscription updates for candidate blocking/unblocking, user account status, and course changes.
- Shared MySQL schema for users, courses, roles, applications, selected candidates, and lecturer-course assignments.

## Prerequisites

- Node.js 18 or newer.
- npm.
- MySQL. The current demo deployment path uses Aiven MySQL with TLS.

## Setup

Install dependencies for all four packages:

```bash
npm run install
```

Create a root environment file:

```powershell
Copy-Item .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Fill in database and secret values in `.env`. The backends load this root file. The Next.js frontends read `NEXT_PUBLIC_*` values from their own project environment; local overrides can go in `frontend/.env.local` and `admin-frontend/.env.local`.

See [Environment and Secret Handling](docs/ENVIRONMENT.md) for the full variable list.

## Local Development

On a fresh database, start the normal backend first so TypeORM can create the tables:

```bash
npm run dev:backend
```

Then start the admin backend and both frontends in separate terminals:

```bash
npm run dev:admin-backend
npm run dev:frontend
npm run dev:admin-frontend
```

Convenience scripts are also available:

```bash
# Windows: starts user frontend + backend
npm run dev:windows

# Windows: starts admin frontend + admin backend
npm run dev:admin:windows

# macOS/Linux equivalents
npm run dev:unix
npm run dev:admin:unix
```

Useful health checks:

- `http://localhost:5000/health`
- `http://localhost:5000/db-test`
- `http://localhost:5000/api/database/status`
- `http://localhost:4002/health`

Seed demo roles, courses, lecturers, and assignments:

```powershell
Invoke-RestMethod -Method Post http://localhost:5000/api/database/seed
```

Demo lecturer accounts seeded by that endpoint use password `lecturer123`.

## Build and Test

Build all packages:

```bash
npm run build
```

The maintained automated test suite is currently the user frontend Jest suite:

```bash
npm run test:frontend
```

Root `npm run test` also calls `backend/package.json`, whose `test` script is still the default failing placeholder. Treat backend and admin backend tests as not yet implemented.

## Routes and APIs

Main user routes:

- `/`
- `/signin`
- `/signup`
- `/tutor`
- `/lecturer`
- `/profile`

Admin routes:

- `/`
- `/dashboard`
- `/dashboard/users`
- `/dashboard/courses`
- `/dashboard/reports`

Core REST endpoints:

- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/auth/logout`
- `GET /api/auth/profile`
- `GET /api/applications/courses-and-roles`
- `POST /api/applications`
- `GET /api/applications/my-applications`
- `GET /api/applications/lecturer`
- `GET /api/applications/statistics`
- `PUT /api/applications/:id/status`
- `PUT /api/applications/:id/comment`
- `POST /api/applications/:id/ranking`
- `GET /api/applications/lecturer-assigned-courses`
- `GET /api/database/status`
- `POST /api/database/seed`
- `POST /api/database/reset`

Admin GraphQL operations cover:

- Auth: `adminLogin`, `adminLogout`
- Users: `getAllUsers`, `getUsersByType`, `getUserStats`, `blockUser`, `unblockUser`, `deleteUser`
- Courses: `getAllCourses`, `createCourse`, `updateCourse`, `deleteCourse`, `assignLecturerToCourse`, `removeLecturerFromCourse`
- Reports: selected candidates per course, candidates with more than three selections, and unselected candidates
- Subscriptions: candidate blocking, account status, and course updates

## Project Structure

```text
.
├── frontend/          # Candidate and lecturer Next.js app
├── backend/           # REST API and TypeORM schema creation
├── admin-frontend/    # Admin Next.js app
├── admin-backend/     # Admin GraphQL API and subscriptions
├── docs/              # Environment and deployment docs
├── .env.example       # Root env template used by both backends
└── package.json       # Root scripts for installing, building, and running services
```

## Deployment

Use [Free Demo Deployment Guide](docs/DEPLOYMENT.md) for the current demo deployment path:

- Aiven MySQL for the shared database.
- Render Web Services for `backend` and `admin-backend`.
- Vercel projects for `frontend` and `admin-frontend`.

Important notes:

- Start/deploy `backend` before `admin-backend` on a fresh database.
- Do not commit `.env`, `.env.local`, passwords, JWT secrets, or `.pem` certificate files.
- Do not set `PORT` manually on Render; Render supplies it.
- For Vercel Next.js projects, set Root Directory to `frontend` or `admin-frontend` and leave Output Directory empty/default.

## License

ISC

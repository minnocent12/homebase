# HomeBase — Frontend

React + TypeScript SPA for the HomeBase Store Support Center Portal.

---

## Live Deployment

| Environment | URL |
|---|---|
| Production (AWS) | http://homebase-alb-2128858486.us-east-2.elb.amazonaws.com |
| Local (Docker) | http://localhost |
| Local (Dev) | http://localhost:5173 |

---

## Overview

The frontend is a single-page application built with React 19, TypeScript, Vite, and Tailwind CSS. It communicates with the Spring Boot backend via relative `/api/` paths — proxied to the backend by nginx (Docker/AWS) or Vite's dev proxy (local). Auth state is managed globally with React Context + localStorage.

---

## Screenshots

| Login | Dashboard |
|---|---|
| ![Login](../docs/screenshots/login.png) | ![Dashboard](../docs/screenshots/dashboard.png) |

| Request List | New Request |
|---|---|
| ![Requests](../docs/screenshots/requests.png) | ![Create Request](../docs/screenshots/create-request.png) |

| Request Detail & Activity Log | Analytics Dashboard |
|---|---|
| ![Request Detail](../docs/screenshots/request-detail.png) | ![Analytics](../docs/screenshots/analytics.png) |

---

## Tech Stack

| Tool | Purpose | Version |
|---|---|---|
| React | UI framework | 19.2 |
| TypeScript | Type safety | ~6.0 |
| Vite | Build tool and dev server | 8.x |
| Tailwind CSS | Utility-first styling | 4.x |
| Recharts | Charts (bar, pie, line) | 3.x |
| Axios | HTTP client | 1.7 |
| React Router | Client-side routing | v7 |

---

## Pages

| Route | Page | Description | Access |
|---|---|---|---|
| `/login` | `LoginPage` | Email + password sign-in form with HomeBase branding | Public |
| `/dashboard` | `DashboardPage` | Summary cards (Open / In Progress / Resolved / Total) + recent requests | All roles |
| `/requests` | `RequestListPage` | Paginated table with keyword search, status/priority/category filters, inline status updates | All roles (Associates see own requests only) |
| `/requests/:id` | `RequestDetailPage` | Full request view — metadata, status/priority badges, threaded activity log, add comment | All roles |
| `/requests/new` | `CreateRequestPage` | Form to submit a new request — title, description, priority, category | All roles |
| `/analytics` | `AnalyticsPage` | Bar/pie/line charts — category, status, priority, 7-day trend, avg resolution time | MANAGER / ADMIN only |

---

## Components

| Component | Description |
|---|---|
| `Navbar` | Top nav — links to Dashboard, Requests, New Request, Analytics (MANAGER/ADMIN only); shows user name with color-coded role badge (red=ADMIN, purple=MANAGER, blue=ASSOCIATE); Logout button |
| `SummaryCard` | Dashboard stat card — label + count with color-coded border |
| `PriorityBadge` | Colored pill badge for CRITICAL / HIGH / MEDIUM / LOW |
| `RequestRow` | Table row for a single request — title is a clickable link to the detail page; status dropdown is disabled for ASSOCIATE (shows "View only") |

---

## Project Structure

```
src/
├── api/
│   ├── axios.ts          # Axios instance — empty baseURL (relative paths) + Authorization header injection
│   ├── requests.ts       # Typed API functions: createRequest, getRequests, updateRequest, deleteRequest, getSummary
│   ├── comments.ts       # getComments(requestId), addComment(requestId, body)
│   └── analytics.ts      # getAnalyticsSummary() — ChartEntry and AnalyticsSummary types
├── components/
│   ├── Navbar.tsx         # Role-aware nav with colored role badge + Analytics link
│   ├── PriorityBadge.tsx
│   ├── SummaryCard.tsx
│   └── RequestRow.tsx     # Clickable title link; RBAC-conditional status dropdown
├── context/
│   └── AuthContext.tsx    # Global auth state — user, token, login(), logout()
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── RequestListPage.tsx
│   ├── RequestDetailPage.tsx  # Request metadata + activity log + add comment
│   ├── CreateRequestPage.tsx
│   └── AnalyticsPage.tsx      # Recharts bar/pie/line; MANAGER/ADMIN only
├── types/
│   └── index.ts           # TypeScript interfaces: User, Request, Comment, RequestSummary, AnalyticsSummary, etc.
├── App.tsx                # Route definitions with protected route guard
└── main.tsx               # App entry point
```

---

## Auth Flow

1. User submits email + password on `/login`
2. `AuthContext.login()` calls `POST /api/auth/login`
3. On success, `accessToken` and user info are stored in `localStorage`
4. Axios interceptor reads the token from `localStorage` and injects `Authorization: Bearer <token>` on every request
5. `App.tsx` wraps protected routes in a guard that redirects unauthenticated users to `/login`
6. `AnalyticsPage` additionally checks `user.role` and redirects non-MANAGER/ADMIN users to `/dashboard`
7. `AuthContext.logout()` clears `localStorage` and redirects to `/login`

---

## RBAC in the UI

| UI Element | ASSOCIATE | MANAGER | ADMIN |
|---|---|---|---|
| Analytics nav link | Hidden | Visible | Visible |
| Request list | Own requests only | All requests | All requests |
| Status update dropdown | Disabled ("View only") | Enabled | Enabled |
| Analytics page | Redirected to dashboard | Full access | Full access |
| Role badge color | Blue | Purple | Red |

---

## Setup

### Option 1 — Docker (recommended)

From the repo root — runs PostgreSQL, backend, and frontend together:

```bash
docker-compose up --build
```

App available at `http://localhost`. The frontend image uses a multi-stage Dockerfile: Node builds the Vite bundle in a `node:20-alpine` stage, then the static files are served by `nginx:alpine`. The included `nginx.conf` handles SPA routing (`try_files`) and proxies all `/api/` traffic to the backend.

### Option 2 — Local development

#### Prerequisites
- Node.js 18+
- Backend API running at `http://localhost:8080`

#### Install and run

```powershell
# Windows — from the repo root (installs on first run only)
.\run-frontend.ps1
```

```bash
# macOS / Linux
npm install  # first time only
npm run dev
```

App runs at `http://localhost:5173`.

### Other scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## Environment

The Axios instance in [src/api/axios.ts](src/api/axios.ts) uses an empty string `''` as `baseURL`, so all API calls use relative paths (e.g. `/api/auth/login`).

- **Local dev** — Vite's dev server proxies `/api/` to `http://localhost:8080` (configured in `vite.config.ts`)
- **Docker / AWS** — nginx proxies `/api/` to the backend container (Docker Compose: `backend:8080`; AWS: ALB DNS name via VPC resolver)

---

## Author

**Mirenge Innocent**
M.S. Computer Science — Georgia State University
[LinkedIn](https://www.linkedin.com/in/mirenge-innocent-799bb6300/) | [GitHub](https://github.com/minnocent12)

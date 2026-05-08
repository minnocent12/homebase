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

The frontend is a single-page application built with React 19, TypeScript, Vite, and Tailwind CSS. It communicates with the Spring Boot backend via relative `/api/` paths — proxied to the backend by nginx (Docker/AWS) or Vite's dev proxy (local). Auth state (including the user's role, teamId, and teamName) is managed globally with React Context + localStorage.

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
| Recharts | Charts (bar, pie, line, area) | 3.x |
| Axios | HTTP client | 1.7 |
| React Router | Client-side routing | v7 |

---

## Pages

| Route | Page | Description | Access |
|---|---|---|---|
| `/login` | `LoginPage` | Email + password sign-in | Public |
| `/dashboard` | `DashboardPage` | Summary cards (Open / In Progress / Resolved / Total) + recent requests | All roles |
| `/requests` | `RequestListPage` | Paginated request table with keyword, status, priority, date-range, and assignee filters; TECHNICIAN gets a three-tab work queue | All roles |
| `/requests/:id` | `RequestDetailPage` | Full request view — metadata, badges, merged activity timeline (status changes + comments) | All roles |
| `/requests/new` | `CreateRequestPage` | Form to submit a new request | All roles |
| `/analytics` | `AnalyticsPage` | Bar/pie/line charts — category, status, priority, 7-day trend, avg resolution time; scoped to MANAGER's team | MANAGER / ADMIN |
| `/users` | `UserManagementPage` | User table with search, role, and team filters; create user modal; enable/disable and delete actions; user names link to profile pages | MANAGER / ADMIN |
| `/users/:id` | `UserProfilePage` | Full user profile — identity card, 4 stat cards, grouped activity bar chart, 7-day dual-line trend, three-tab activity (Submissions / Assigned Work / Comments); edit, disable, delete actions for ADMIN | MANAGER / ADMIN |
| `/admin/teams` | `TeamManagementPage` | Team cards showing members; add/remove controls; unassigned users panel; team names link to filtered Users page | ADMIN only |

---

## Components

| Component | Description |
|---|---|
| `Navbar` | Role-aware nav — Dashboard, Requests, New Request always visible; Analytics + Users for MANAGER/ADMIN; Teams for ADMIN; color-coded role badge; Logout |
| `SummaryCard` | Dashboard stat card — label + count with color-coded border |
| `PriorityBadge` | Colored pill badge for CRITICAL / HIGH / MEDIUM / LOW |
| `RequestRow` | Table row — MANAGER/ADMIN: status + assignee dropdowns; TECHNICIAN: "Pick up" button or status dropdown; ASSOCIATE: read-only |
| `SessionWarningBanner` | Inactivity warning — appears 30 seconds before automatic logout; "Stay logged in" triggers a silent token refresh |

---

## Technician Work Queue

When a TECHNICIAN visits `/requests`, the standard filter bar is replaced by a three-tab interface:

| Tab | What it shows |
|---|---|
| **Team Queue** | Unassigned requests in the technician's team that they did not create |
| **My Work** | Requests currently assigned to the technician |
| **My Submissions** | Requests the technician created themselves |

- Each tab shows a live count badge
- Category filter hidden (team already scopes the category)
- Switching tabs resets all active filters
- "Pick up" self-assigns a Team Queue request and moves it to My Work

---

## User Profile Page

`/users/:id` shows a complete picture of any user's activity in the system.

**Profile header** — avatar, name, role + active/inactive badge, team, email, join date. Edit / Disable / Enable / Delete actions for ADMIN.

**Stat cards:**
| Card | Description |
|---|---|
| Requests Submitted | Total requests created by this user |
| Requests Assigned | Total requests assigned to this user (hidden for ASSOCIATE) |
| Comments Posted | Total comments posted |
| Resolved Rate | % of submitted requests that are resolved |

**Charts:**
| Chart | Description |
|---|---|
| Activity Breakdown | Grouped BarChart — Submitted vs Assigned, broken down by Open / In Progress / Resolved |
| Activity Last 7 Days | Dual-line LineChart — Submitted and Assigned requests per day |

Both the "Assigned" bar and "Assigned" line are hidden for ASSOCIATE profiles since associates cannot be assigned requests.

**Activity tabs:**
| Tab | Description |
|---|---|
| Submissions | 5 most recent requests this user submitted |
| Assigned Work | 5 most recent requests assigned to this user (hidden for ASSOCIATE) |
| Comments | 5 most recent comments this user posted |

---

## Project Structure

```
src/
├── api/
│   ├── axios.ts          # Axios instance — relative baseURL + Authorization header injection
│   ├── requests.ts       # createRequest, getRequests, getRequestById, updateRequest,
│   │                     #   deleteRequest, getSummary, getStatusHistory
│   ├── comments.ts       # getComments(requestId), addComment(requestId, body)
│   ├── analytics.ts      # getAnalyticsSummary()
│   ├── users.ts          # getUsers, getUserProfile, createUser, updateUser,
│   │                     #   toggleUserActive, deleteUser, assignUserToTeam
│   └── teams.ts          # getTeams()
├── components/
│   ├── Navbar.tsx
│   ├── PriorityBadge.tsx
│   ├── SummaryCard.tsx
│   ├── RequestRow.tsx
│   └── SessionWarningBanner.tsx
├── context/
│   └── AuthContext.tsx    # user (id, fullName, email, role, teamId, teamName),
│                          #   login(), logout(), refreshSession(), isAuthenticated
├── hooks/
│   └── useInactivityTimer.ts  # 15-min inactivity timer; fires callback on timeout
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── RequestListPage.tsx        # Three-tab TECHNICIAN view; server-side filters for others
│   ├── RequestDetailPage.tsx      # Metadata + merged activity timeline + add comment
│   ├── CreateRequestPage.tsx
│   ├── AnalyticsPage.tsx          # Recharts; MANAGER/ADMIN; scoped to manager's team
│   ├── UserManagementPage.tsx     # User table + CreateUserModal; enable/disable; delete
│   ├── UserProfilePage.tsx        # Full profile + charts + activity tabs; EditUserModal
│   └── TeamManagementPage.tsx     # Team cards + member management; ADMIN only
└── types/
    └── index.ts           # AuthResponse, Request, UserSummary, UserProfile, Team,
                           #   Comment, StatusHistoryEntry, DashboardSummary, Page<T>,
                           #   ChartEntry, RecentComment, RecentRequest,
                           #   CreateUserPayload, UpdateUserPayload, etc.
```

---

## Auth Flow

1. User submits email + password on `/login`
2. `AuthContext.login()` calls `POST /api/auth/login`
3. On success, `accessToken`, `refreshToken`, and full user info (`role`, `teamId`, `teamName`) are stored in `localStorage`
4. Axios interceptor reads the token and injects `Authorization: Bearer <token>` on every request
5. Protected routes redirect unauthenticated users to `/login`
6. An inactivity timer fires after 15 minutes of no input; a 30-second warning banner gives the user a chance to stay logged in via a silent token refresh
7. `AuthContext.logout()` clears `localStorage` and redirects to `/login`

---

## RBAC in the UI

| UI Element | ASSOCIATE | TECHNICIAN | MANAGER | ADMIN |
|---|---|---|---|---|
| Analytics nav link | Hidden | Hidden | Visible | Visible |
| Users nav link | Hidden | Hidden | Visible | Visible |
| Teams nav link | Hidden | Hidden | Hidden | Visible |
| Request list view | Own requests | Three-tab work queue | All (team-scoped) | All |
| Category filter | Visible | Hidden | Visible | Visible |
| Assignee filter | Hidden | Hidden | Visible | Visible |
| Date range filter | Visible | Visible | Visible | Visible |
| Status update | Read-only | Own assigned | Full dropdown | Full dropdown |
| Pick up button | No | Yes (unassigned team) | No | No |
| Assign dropdown | No | No | Yes | Yes |
| User management page | Blocked | Blocked | Own team Associates | All users |
| User profile page | Blocked | Blocked | Own team members | All users |
| Edit / disable / delete user | No | No | No | Yes |
| Team management page | Blocked | Blocked | Blocked | Full access |
| Profile — Assigned stat card | Hidden | Visible | Visible | Visible |
| Profile — Assigned Work tab | Hidden | Visible | Visible | Visible |

---

## Setup

### Option 1 — Docker

From the repo root:

```bash
docker-compose up --build
```

App available at `http://localhost`. nginx handles SPA routing (`try_files`) and proxies `/api/` to the backend.

### Option 2 — Local development

Requires the backend running at `http://localhost:8080`.

```powershell
# Windows
.\run-frontend.ps1
```

```bash
# macOS / Linux
npm install
npm run dev
```

App runs at `http://localhost:5173`.

### Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## Environment

The Axios instance uses `''` as `baseURL` so all calls use relative paths (`/api/...`).

- **Local dev** — Vite proxies `/api/` to `http://localhost:8080` via `vite.config.ts`
- **Docker / AWS** — nginx proxies `/api/` to the backend container

---

## Author

**Mirenge Innocent**
M.S. Computer Science — Georgia State University
[LinkedIn](https://www.linkedin.com/in/mirenge-innocent-799bb6300/) | [GitHub](https://github.com/minnocent12)

# HomeBase — Frontend

React + TypeScript SPA for the HomeBase Store Support Center Portal.

---

## Overview

The frontend is a single-page application built with React 19, TypeScript, Vite, and Tailwind CSS. It communicates with the Spring Boot backend at `http://localhost:8080` via Axios, and manages authentication state globally with React Context + localStorage.

---

## Screenshots

| Login | Dashboard |
|---|---|
| ![Login](../docs/screenshots/login.png) | ![Dashboard](../docs/screenshots/dashboard.png) |

| Request List | New Request |
|---|---|
| ![Requests](../docs/screenshots/requests.png) | ![Create Request](../docs/screenshots/create-request.png) |

---

## Tech Stack

| Tool | Purpose | Version |
|---|---|---|
| React | UI framework | 19.2 |
| TypeScript | Type safety | ~6.0 |
| Vite | Build tool and dev server | 8.x |
| Tailwind CSS | Utility-first styling | 4.x |
| Axios | HTTP client | 1.7 |
| React Router | Client-side routing | v7 |

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/login` | `LoginPage` | Email + password sign-in form with HomeBase branding |
| `/dashboard` | `DashboardPage` | Summary cards (Open / In Progress / Resolved / Total) + recent requests |
| `/requests` | `RequestListPage` | Full paginated table with keyword search, status/priority/category filters, inline status updates |
| `/requests/new` | `CreateRequestPage` | Form to submit a new request — title, description, priority, category |

---

## Components

| Component | Description |
|---|---|
| `Navbar` | Top nav with links to Dashboard, Requests, New Request; shows current user name + role; Logout button |
| `SummaryCard` | Dashboard stat card — label + count with color-coded border |
| `PriorityBadge` | Colored pill badge for CRITICAL / HIGH / MEDIUM / LOW |
| `RequestRow` | Table row for a single request in the list view with inline status dropdown |

---

## Project Structure

```
src/
├── api/
│   ├── axios.ts          # Axios instance — base URL + Authorization header injection
│   └── requests.ts       # Typed API functions: createRequest, getRequests, updateRequest, getSummary
├── components/
│   ├── Navbar.tsx
│   ├── PriorityBadge.tsx
│   ├── SummaryCard.tsx
│   └── RequestRow.tsx
├── context/
│   └── AuthContext.tsx    # Global auth state — user, token, login(), logout()
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── RequestListPage.tsx
│   └── CreateRequestPage.tsx
├── types/
│   └── index.ts           # TypeScript interfaces: User, Request, RequestSummary, etc.
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
6. `AuthContext.logout()` clears `localStorage` and redirects to `/login`

---

## Setup

### Prerequisites
- Node.js 18+
- Backend API running at `http://localhost:8080`

### Install and run

```bash
npm install
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

The backend URL is hardcoded in `src/api/axios.ts` as `http://localhost:8080`. To point at a different API, update that base URL before building.

---

## Author

**Mirenge Innocent**
M.S. Computer Science — Georgia State University
[LinkedIn](https://www.linkedin.com/in/mirenge-innocent-799bb6300/) | [GitHub](https://github.com/minnocent12)

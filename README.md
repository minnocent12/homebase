# HomeBase — Store Support Center Portal

> A full-stack internal web application that streamlines operational request management between store associates and the SSC team.

---

## Overview

HomeBase lets store associates submit operational requests (IT issues, HR concerns, facilities problems, supply needs), and gives managers and admins a unified place to triage, assign, and resolve them.

Built as a showcase project for the **Home Depot Software Engineering Internship**.

---

## Screenshots

| Login | Dashboard |
|---|---|
| ![Login](docs/screenshots/login.png) | ![Dashboard](docs/screenshots/dashboard.png) |

| Request List | New Request |
|---|---|
| ![Requests](docs/screenshots/requests.png) | ![Create Request](docs/screenshots/create-request.png) |

| Request Detail & Activity Log | Analytics Dashboard |
|---|---|
| ![Request Detail](docs/screenshots/request-detail.png) | ![Analytics](docs/screenshots/analytics.png) |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Backend | Java, Spring Boot, Spring Security | Java 17, Spring Boot 3.3 |
| Auth | JWT (access + refresh tokens) | jjwt 0.12.5 |
| Database | PostgreSQL + Flyway migrations | PostgreSQL 17 |
| ORM | Hibernate / Spring Data JPA | via Spring Boot 3.3 |
| Frontend | React, TypeScript, Vite | React 19, TypeScript 6 |
| Styling | Tailwind CSS | 4.x |
| Charts | Recharts | 3.x |
| HTTP Client | Axios | 1.7 |
| Routing | React Router | v7 |
| Build (backend) | Maven | 3.9+ |
| DevOps | Docker Compose, GitHub Actions CI/CD | |
| Cloud | AWS ECS + RDS | |

---

## Features

### Complete
- JWT authentication — register, login, access + refresh token flow
- Role-based users — ASSOCIATE, MANAGER, ADMIN
- Create operational requests with title, description, priority, and category
- List requests with pagination, search, status/priority/category filters
- Color-coded priority badges — CRITICAL, HIGH, MEDIUM, LOW
- Dashboard with live summary cards (Open, In Progress, Resolved, Total)
- Protected routes — unauthenticated users redirected to login
- Persistent sessions — JWT stored in localStorage survives page refresh
- CORS configured for local development
- **RBAC** — Associates see and manage only their own requests; Managers can view and update all; Admins have full access including delete
- **Comments & activity log** — threaded comments per request with user name, role badge, and timestamp
- **Request detail page** — full view of a single request with metadata, status/priority badges, and activity log
- **Analytics dashboard** — bar, pie, and line charts for category, status, priority breakdowns and 7-day trend; MANAGER/ADMIN only

- **Docker Compose** — full-stack local setup (`docker-compose up --build`)
- **GitHub Actions CI/CD** — backend test + frontend build + deploy to AWS ECS on push to `main`

### Coming Soon
- Email notification simulation
- AWS ECS + RDS deployment

---

## Project Structure

```
homebase/
├── homebase-backend/               # Spring Boot REST API
│   ├── src/main/java/com/homebase/
│   │   ├── auth/                   # JWT auth — register, login
│   │   │   ├── dto/
│   │   │   └── jwt/                # JwtUtil, JwtAuthFilter
│   │   ├── config/                 # SecurityConfig, CorsConfig
│   │   ├── request/                # Request entity, service, controller (RBAC-enforced)
│   │   │   └── dto/
│   │   ├── comment/                # Comment entity, service, controller
│   │   │   └── dto/
│   │   ├── analytics/              # AnalyticsController, AnalyticsService
│   │   └── user/                   # User entity, repository
│   └── src/main/resources/
│       ├── application.yaml        # Multi-profile config (dev/prod)
│       └── db/migration/           # Flyway SQL migrations (V1–V6)
│
├── homebase-frontend/              # React + TypeScript SPA
│   └── src/
│       ├── api/                    # Axios instance + typed API modules
│       ├── components/             # Navbar, PriorityBadge, SummaryCard, RequestRow
│       ├── context/                # AuthContext — global auth state
│       ├── pages/                  # Login, Dashboard, RequestList, RequestDetail,
│       │                           #   CreateRequest, Analytics
│       └── types/                  # TypeScript interfaces
│
└── docs/
    └── screenshots/                # App screenshots
```

---

## Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Java | 17+ |
| Maven | 3.9+ |
| PostgreSQL | 17+ |
| Node.js | 18+ |

### 1. Clone the repository

```bash
git clone https://github.com/minnocent12/homebase.git
cd homebase
```

### 2. Set up the database

```bash
psql -U postgres -c "CREATE DATABASE homebase_dev;"
```

### 3. Start the backend

```powershell
# Windows — from the repo root
.\run-backend.ps1
```

```bash
# macOS / Linux
cd homebase-backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

API available at `http://localhost:8080`

### 4. Start the frontend

```powershell
# Windows — from the repo root
.\run-frontend.ps1
```

```bash
# macOS / Linux
cd homebase-frontend && npm install && npm run dev
```

App available at `http://localhost:5173`

### Run everything at once (Windows)

```powershell
.\run-all.ps1
```

Opens the backend and frontend each in their own terminal window.

---

## API Reference

### Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and receive tokens | Public |

### Requests

| Method | Endpoint | Description | RBAC |
|---|---|---|---|
| POST | `/api/requests` | Create a new request | Any role |
| GET | `/api/requests` | List requests (paginated, filtered) | Associates see own only |
| GET | `/api/requests/{id}` | Get a single request | Associates see own only |
| PUT | `/api/requests/{id}` | Update a request | MANAGER / ADMIN |
| DELETE | `/api/requests/{id}` | Delete a request | ADMIN only |
| GET | `/api/requests/summary` | Dashboard summary counts | Associates see own counts |

### Comments

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/requests/{id}/comments` | Add a comment to a request | Required |
| GET | `/api/requests/{id}/comments` | Get all comments for a request | Required |

### Analytics

| Method | Endpoint | Description | RBAC |
|---|---|---|---|
| GET | `/api/analytics/summary` | Category, status, priority, trend data | MANAGER / ADMIN |

### Query Parameters — `GET /api/requests`

| Parameter | Description | Values |
|---|---|---|
| `status` | Filter by status | `OPEN`, `IN_PROGRESS`, `RESOLVED` |
| `priority` | Filter by priority | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `category` | Filter by category | `IT`, `HR`, `FACILITIES`, `SUPPLY`, `OTHER` |
| `keyword` | Search in title/description | any string |
| `page` | Page number (0-based) | `0`, `1`, `2`… |
| `size` | Items per page | default `10` |
| `sortBy` | Sort field | `createdAt`, `priority`, `status` |
| `sortDir` | Sort direction | `asc`, `desc` |

---

## Role Permissions

| Action | ASSOCIATE | MANAGER | ADMIN |
|---|---|---|---|
| Register / Login | Yes | Yes | Yes |
| Create request | Yes | Yes | Yes |
| View requests | Own only | All | All |
| Update request | No | Yes | Yes |
| Delete request | No | No | Yes |
| Add / view comments | Yes | Yes | Yes |
| View analytics | No | Yes | Yes |

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `JWT_SECRET` | Signing key for JWT tokens — minimum 32 characters | Production only (dev has a built-in default) |
| `DATABASE_URL` | PostgreSQL JDBC URL | Production only |
| `DATABASE_USER` | Database username | Production only |
| `DATABASE_PASSWORD` | Database password | Production only |

---

## Database Migrations

Flyway applies all schema changes automatically at startup.

| Migration | Description |
|---|---|
| V1 | Initial schema — `users`, `requests`, `status_history` tables |
| V2 | Add `comments` table |
| V3 | Add `notifications` table |
| V4 | Convert `role` column to VARCHAR |
| V5 | Placeholder |
| V6 | Restore request enum columns as VARCHAR |

---

## Author

**Mirenge Innocent**
M.S. Computer Science — Georgia State University
[LinkedIn](https://www.linkedin.com/in/mirenge-innocent-799bb6300/) | [GitHub](https://github.com/minnocent12)

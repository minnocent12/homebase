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
| HTTP Client | Axios | 1.7 |
| Routing | React Router | v7 |
| Build (backend) | Maven | 3.9+ |
| DevOps | Docker Compose, GitHub Actions CI/CD | planned |
| Cloud | AWS ECS + RDS | planned |

---

## Features

### Complete
- JWT authentication — register, login, access + refresh token flow
- Role-based users — ASSOCIATE, MANAGER, ADMIN
- Create operational requests with title, description, priority, and category
- List requests with pagination, search, status/priority/category filters
- Inline status updates — OPEN → IN_PROGRESS → RESOLVED
- Dashboard with live summary cards (Open, In Progress, Resolved, Total)
- Color-coded priority badges — CRITICAL, HIGH, MEDIUM, LOW
- Protected routes — unauthenticated users redirected to login
- Persistent sessions — JWT stored in localStorage survives page refresh
- CORS configured for local development

### Coming Soon
- Role-based access control (RBAC) — restrict actions by role
- Comments and activity log per request
- Analytics — resolution time, trends, category breakdown charts
- Email notification simulation
- Docker Compose full-stack setup
- GitHub Actions CI/CD pipeline
- AWS ECS + RDS deployment

---

## Project Structure

```
homebase/
├── homebase-backend/               # Spring Boot REST API
│   ├── src/main/java/com/homebase/
│   │   ├── auth/                   # JWT auth — register, login
│   │   │   ├── dto/                # Request/response DTOs
│   │   │   └── jwt/                # JwtUtil, JwtAuthFilter
│   │   ├── config/                 # SecurityConfig, CorsConfig
│   │   ├── request/                # Request entity, service, controller
│   │   │   └── dto/
│   │   └── user/                   # User entity, repository
│   └── src/main/resources/
│       ├── application.yaml        # Multi-profile config (dev/prod)
│       └── db/migration/           # Flyway SQL migrations (V1–V6)
│
├── homebase-frontend/              # React + TypeScript SPA
│   └── src/
│       ├── api/                    # Axios instance + typed API functions
│       ├── components/             # Navbar, PriorityBadge, SummaryCard, RequestRow
│       ├── context/                # AuthContext — global auth state
│       ├── pages/                  # Login, Dashboard, RequestList, CreateRequest
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

### 3. Configure environment variables

```bash
# Windows (PowerShell)
$env:JWT_SECRET = "your-secret-key-at-least-32-characters-long"

# macOS / Linux
export JWT_SECRET="your-secret-key-at-least-32-characters-long"
```

### 4. Start the backend

```bash
cd homebase-backend
./mvnw spring-boot:run
```

API available at `http://localhost:8080`

### 5. Start the frontend

```bash
cd homebase-frontend
npm install
npm run dev
```

App available at `http://localhost:5173`

---

## API Reference

### Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and receive tokens | Public |

### Requests

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/requests` | Create a new request | Required |
| GET | `/api/requests` | List requests (paginated, filtered) | Required |
| GET | `/api/requests/{id}` | Get a single request | Required |
| PUT | `/api/requests/{id}` | Update a request | Required |
| GET | `/api/requests/summary` | Dashboard summary counts | Required |

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

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `JWT_SECRET` | Signing key for JWT tokens — minimum 32 characters | Always |
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

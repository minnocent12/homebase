# HomeBase — Internal Request & Ops System

> A full-stack Store Support Center portal that streamlines operational request management between store associates and the SSC team.

![HomeBase Dashboard](https://i.imgur.com/placeholder.png)

---

## Overview

HomeBase is an internal web application that allows store associates to submit operational requests (IT issues, HR concerns, facilities problems, supply needs), and enables managers and admins to triage, assign, and resolve them — all in one place.

Built as a showcase project for the **Home Depot Software Engineering Internship**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.3, Spring Security |
| Auth | JWT (access + refresh tokens) |
| Database | PostgreSQL 17, Flyway migrations |
| ORM | Hibernate / Spring Data JPA |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| HTTP Client | Axios |
| Routing | React Router v6 |
| DevOps | Docker, GitHub Actions CI/CD (planned) |
| Cloud | AWS ECS + RDS (planned) |

---

## Features

### ✅ Complete
- JWT authentication — register, login, token-based security
- Role-based users — ASSOCIATE, MANAGER, ADMIN
- Create operational requests with title, description, priority, category
- List requests with pagination, sorting, search and filter
- Update request status inline (OPEN → IN_PROGRESS → RESOLVED)
- Dashboard with live summary cards (Open, In Progress, Resolved, Total)
- Priority badges — CRITICAL, HIGH, MEDIUM, LOW with color coding
- Protected routes — unauthenticated users redirected to login
- Persistent auth — session survives page refresh via localStorage
- CORS configured for local development

### 🔜 Coming Soon
- Role-based access control (RBAC)
- Comments and activity log per request
- Analytics charts — resolution time, trends, category breakdown
- Email notification simulation
- Docker Compose full-stack setup
- GitHub Actions CI/CD pipeline
- AWS ECS + RDS deployment

---

## Screenshots

| Login | Dashboard |
|---|---|
| Clean login screen with HomeBase branding | Summary cards + recent requests |

| Request List | Create Request |
|---|---|
| Paginated table with search, filter, inline status update | Form with priority and category selectors |

---

## Project Structure

```
homebase/
├── homebase-backend/               # Spring Boot API
│   ├── src/main/java/com/homebase/
│   │   ├── auth/                   # JWT auth, register, login
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
└── homebase-frontend/              # React + TypeScript app
    └── src/
        ├── api/                    # Axios instance + API functions
        ├── components/             # Navbar, PriorityBadge, SummaryCard, RequestRow
        ├── context/                # AuthContext (global auth state)
        ├── pages/                  # Login, Dashboard, RequestList, CreateRequest
        └── types/                  # TypeScript interfaces and types
```

---

## Getting Started

### Prerequisites
- Java 17+
- Maven 3.9+
- PostgreSQL 17+
- Node.js 18+

### Backend Setup

**1. Clone the repository**
```bash
git clone https://github.com/minnocent12/homebase.git
cd homebase/homebase-backend
```

**2. Create the database**
```bash
psql -U postgres -c "CREATE DATABASE homebase_dev;"
```

**3. Set environment variable**
```bash
# Windows
$env:JWT_SECRET = "your-secret-key-min-32-characters-long"

# Mac/Linux
export JWT_SECRET="your-secret-key-min-32-characters-long"
```

**4. Run the backend**
```bash
./mvnw spring-boot:run
```
API available at `http://localhost:8080`

### Frontend Setup

```bash
cd homebase/homebase-frontend
npm install
npm run dev
```
App available at `http://localhost:5173`

---

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login and get tokens | Public |

### Requests
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/requests` | Create a request | Required |
| GET | `/api/requests` | List all requests (paginated) | Required |
| GET | `/api/requests/{id}` | Get single request | Required |
| PUT | `/api/requests/{id}` | Update request | Required |
| GET | `/api/requests/summary` | Dashboard counts | Required |

### Query Parameters (GET /api/requests)
| Param | Description | Example |
|---|---|---|
| `status` | Filter by status | `OPEN`, `IN_PROGRESS`, `RESOLVED` |
| `priority` | Filter by priority | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `category` | Filter by category | `IT`, `HR`, `FACILITIES`, `SUPPLY`, `OTHER` |
| `keyword` | Search title/description | `printer` |
| `page` | Page number (0-based) | `0` |
| `size` | Page size | `10` |
| `sortBy` | Sort field | `createdAt` |
| `sortDir` | Sort direction | `asc`, `desc` |

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `JWT_SECRET` | Secret key for signing JWT tokens (min 32 chars) | Yes |
| `DATABASE_URL` | PostgreSQL connection URL (prod only) | Prod only |
| `DATABASE_USER` | Database username (prod only) | Prod only |
| `DATABASE_PASSWORD` | Database password (prod only) | Prod only |

---

## Database Migrations

Flyway handles all schema changes automatically on startup.

| Version | Description |
|---|---|
| V1 | Initial schema — users, requests, status_history |
| V2 | Add comments table |
| V3 | Add notifications table |
| V4 | Convert role column to VARCHAR |
| V5 | No-op placeholder |
| V6 | Restore request enum columns as VARCHAR |

---

## Author

**Mirenge Innocent**
M.S. Computer Science — Georgia State University
[LinkedIn](https://www.linkedin.com/in/mirenge-innocent-799bb6300/) | [GitHub](https://github.com/minnocent12)
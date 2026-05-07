# HomeBase — Backend API

Spring Boot REST API for the HomeBase Store Support Center Portal.

---

## Overview

This is the backend service for HomeBase. It provides a secure JWT-authenticated REST API with four-tier role-based access control (ASSOCIATE, TECHNICIAN, MANAGER, ADMIN) covering users, teams, operational requests, comments, status history, and analytics. Built with Spring Boot 3.3, Spring Security, Hibernate/JPA, and PostgreSQL, with Flyway handling all schema migrations.

---

## Live Deployment

| Environment | URL |
|---|---|
| Production (AWS) | http://homebase-alb-2128858486.us-east-2.elb.amazonaws.com/api |
| Local (Docker) | http://localhost/api |
| Local (Dev) | http://localhost:8080/api |

---

## Tech Stack

| Component | Technology | Version |
|---|---|---|
| Language | Java | 17 |
| Framework | Spring Boot | 3.3.0 |
| Security | Spring Security + JWT | jjwt 0.12.5 |
| ORM | Hibernate / Spring Data JPA | via Spring Boot |
| Database | PostgreSQL | 17+ |
| Schema migrations | Flyway | via Spring Boot |
| Build | Maven | 3.9+ |
| Containerization | Docker (multi-stage build) | |
| Cloud | AWS ECS Fargate + RDS PostgreSQL | us-east-2 |

---

## Project Structure

```
src/main/java/com/homebase/
├── auth/
│   ├── AuthController.java         # POST /api/auth/register, /login, /refresh
│   ├── AuthService.java            # Registration, login, refresh token logic
│   ├── dto/
│   │   ├── RegisterRequest.java
│   │   ├── LoginRequest.java
│   │   ├── RefreshRequest.java
│   │   └── AuthResponse.java       # accessToken, refreshToken, userId, fullName,
│   │                               #   email, role, teamId, teamName
│   └── jwt/
│       ├── JwtUtil.java            # Token generation and validation
│       └── JwtAuthFilter.java      # Servlet filter — validates Bearer tokens
├── config/
│   ├── SecurityConfig.java         # Spring Security filter chain, public routes
│   └── CorsConfig.java             # CORS — allows localhost:5173 in dev
├── request/
│   ├── Request.java                # JPA entity — includes requestNumber (SERIAL),
│   │                               #   team FK, assignedTo FK
│   ├── RequestRepository.java      # JPA Specification queries
│   ├── RequestService.java         # Business logic; RBAC enforced per role;
│   │                               #   auto-routes by category to team on create
│   ├── RequestController.java      # POST/GET/PUT/DELETE /api/requests
│   ├── StatusHistoryRepository.java
│   └── dto/
│       ├── CreateRequestDto.java
│       ├── UpdateRequestDto.java
│       ├── RequestResponseDto.java # Includes requestNumber, teamId, teamName,
│       │                           #   assignedToId, assignedToName
│       └── RequestSummaryDto.java
├── comment/
│   ├── Comment.java
│   ├── CommentRepository.java
│   ├── CommentService.java
│   ├── CommentController.java      # POST/GET /api/requests/{id}/comments
│   └── dto/
│       ├── CreateCommentDto.java   # body (max 1000 chars)
│       └── CommentResponseDto.java # id, requestId, userId, userName, userRole, body, createdAt
├── analytics/
│   ├── AnalyticsController.java    # GET /api/analytics/summary (MANAGER/ADMIN only)
│   └── AnalyticsService.java       # byCategory, byStatus, byPriority, last7DaysTrend, avgResolutionHours
├── team/
│   ├── Team.java                   # JPA entity — id, name, description, category (nullable), members
│   ├── TeamRepository.java         # findByCategory(category) used for auto-routing
│   ├── TeamService.java            # getAll, addMember, removeMember
│   ├── TeamController.java         # GET/POST/DELETE /api/teams
│   └── dto/
│       └── TeamResponseDto.java    # id, name, description, category, members list
└── user/
    ├── User.java                   # JPA entity — id, fullName, email, passwordHash,
    │                               #   role, team (FK), createdAt
    ├── UserRepository.java
    ├── UserRole.java               # ASSOCIATE, TECHNICIAN, MANAGER, ADMIN
    ├── UserService.java            # getAll (scoped by role), create (RBAC enforced)
    ├── UserController.java         # GET/POST /api/users
    └── dto/
        ├── CreateUserDto.java      # fullName, email, password, role, teamId
        └── UserResponseDto.java    # id, fullName, email, role, teamId, teamName,
                                    #   teamCategory, createdAt

src/main/resources/
├── application.yaml                # Base config + dev/prod profiles
└── db/migration/
    ├── V1__init_schema.sql
    ├── V2__add_comments.sql
    ├── V3__add_notifications.sql
    ├── V4__convert_role_to_varchar.sql
    ├── V5__placeholder.sql
    ├── V6__restore_request_enums_as_varchar.sql
    ├── V7__add_refresh_tokens.sql
    ├── V8__add_request_number.sql
    ├── V9__create_teams.sql
    ├── V10__add_team_id_to_users.sql
    ├── V11__add_team_id_to_requests.sql
    ├── V12__nullable_team_category.sql
    └── V13__add_admin_team.sql
```

---

## API Endpoints

### Auth — Public

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/api/auth/register` | `fullName`, `email`, `password`, `role` | `accessToken`, `refreshToken`, user info |
| POST | `/api/auth/login` | `email`, `password` | `accessToken`, `refreshToken`, user info |
| POST | `/api/auth/refresh` | `refreshToken` | new `accessToken`, `refreshToken`, user info |

### Requests — Requires `Authorization: Bearer <token>`

| Method | Endpoint | Description | RBAC |
|---|---|---|---|
| POST | `/api/requests` | Create a new request (auto-routes to team by category) | Any role |
| GET | `/api/requests` | List requests (paginated, filtered) | Scoped by role |
| GET | `/api/requests/{id}` | Get a single request | Scoped by role |
| PUT | `/api/requests/{id}` | Update status, assignment, priority | MANAGER / ADMIN / TECHNICIAN (limited) |
| DELETE | `/api/requests/{id}` | Permanently delete a request | ADMIN only |
| GET | `/api/requests/summary` | Returns `{ open, inProgress, resolved, total }` | Scoped by role |
| GET | `/api/requests/{id}/status-history` | Status change log | Any role |

**TECHNICIAN update rules (enforced in `RequestService`):**
- Can set `assignedToId` only to their own UUID (self-assign)
- Can update `status` only when the request is assigned to them

### Comments — Requires `Authorization: Bearer <token>`

| Method | Endpoint | Description | RBAC |
|---|---|---|---|
| POST | `/api/requests/{id}/comments` | Add a comment to a request | Any role |
| GET | `/api/requests/{id}/comments` | Fetch comments in chronological order | Any role |

### Analytics — Requires `Authorization: Bearer <token>`

| Method | Endpoint | Description | RBAC |
|---|---|---|---|
| GET | `/api/analytics/summary` | Category, status, priority breakdowns + 7-day trend + avg resolution hours | MANAGER / ADMIN |

**Analytics response shape:**
```json
{
  "totalRequests": 19,
  "byCategory": [{ "label": "IT", "count": 7 }, ...],
  "byStatus":   [{ "label": "OPEN", "count": 16 }, ...],
  "byPriority": [{ "label": "CRITICAL", "count": 5 }, ...],
  "last7DaysTrend": [{ "label": "Apr 25", "count": 0 }, ...],
  "avgResolutionHours": 2.4
}
```

### Users — Requires `Authorization: Bearer <token>`

| Method | Endpoint | Description | RBAC |
|---|---|---|---|
| GET | `/api/users` | List users — Admins see all; Managers see own team members only | MANAGER / ADMIN |
| POST | `/api/users` | Create a user — Admins choose any role + team; Managers create Associates in their team | MANAGER / ADMIN |

### Teams — Requires `Authorization: Bearer <token>`

| Method | Endpoint | Description | RBAC |
|---|---|---|---|
| GET | `/api/teams` | List all teams with member lists | ADMIN |
| POST | `/api/teams/{teamId}/members/{userId}` | Add a user to a team | ADMIN |
| DELETE | `/api/teams/{teamId}/members/{userId}` | Remove a user from a team | ADMIN |

### Query Parameters — `GET /api/requests`

| Parameter | Type | Description |
|---|---|---|
| `status` | enum | `OPEN` \| `IN_PROGRESS` \| `RESOLVED` |
| `priority` | enum | `LOW` \| `MEDIUM` \| `HIGH` \| `CRITICAL` |
| `category` | enum | `IT` \| `HR` \| `FACILITIES` \| `SUPPLY` \| `OTHER` |
| `keyword` | string | Full-text search in title and description |
| `page` | int | Page number, 0-based (default: `0`) |
| `size` | int | Page size (default: `10`) |
| `sortBy` | string | Sort field — `createdAt`, `priority`, `status` |
| `sortDir` | string | `asc` \| `desc` |

---

## Role Permissions

| Action | ASSOCIATE | TECHNICIAN | MANAGER | ADMIN |
|---|---|---|---|---|
| Create request | Yes | Yes | Yes | Yes |
| View requests | Own only | Team + assigned + own | All | All |
| Update request status | No | Own assigned only | Yes | Yes |
| Self-assign a request | No | Yes (unassigned team requests) | No | No |
| Assign to another user | No | No | Yes | Yes |
| Delete request | No | No | No | Yes |
| Add / view comments | Yes | Yes | Yes | Yes |
| View analytics | No | No | Yes | Yes |
| Manage users | No | No | Own team Associates | All roles |
| Manage teams | No | No | No | Yes |

---

## Database Schema

PostgreSQL 17+ — Flyway manages all migrations.

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `full_name` | VARCHAR | |
| `email` | VARCHAR | Unique, indexed |
| `password_hash` | VARCHAR | bcrypt |
| `role` | VARCHAR | `ASSOCIATE`, `TECHNICIAN`, `MANAGER`, `ADMIN` |
| `team_id` | UUID | FK → `teams.id`, nullable; `SET NULL` on team delete |
| `created_at` | TIMESTAMP | |

### `teams`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | VARCHAR | Unique |
| `description` | VARCHAR | |
| `category` | VARCHAR | `IT`, `HR`, `FACILITIES`, `SUPPLY`, `OTHER`; nullable for org-only teams |

### `requests`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `request_number` | SERIAL | Auto-incrementing human-readable ID (REQ-1, REQ-2…) |
| `title` | VARCHAR | |
| `description` | TEXT | |
| `status` | VARCHAR | `OPEN`, `IN_PROGRESS`, `RESOLVED` |
| `priority` | VARCHAR | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `category` | VARCHAR | `IT`, `HR`, `FACILITIES`, `SUPPLY`, `OTHER` |
| `created_by` | UUID | FK → `users.id` |
| `assigned_to` | UUID | FK → `users.id`, nullable |
| `team_id` | UUID | FK → `teams.id`, nullable; set on create by auto-routing |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | Auto-updated by DB trigger |

### `comments`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `request_id` | UUID | FK → `requests.id` |
| `user_id` | UUID | FK → `users.id` |
| `body` | TEXT | Max 1000 chars |
| `created_at` | TIMESTAMP | Immutable — set on insert |

### `status_history`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `request_id` | UUID | FK → `requests.id` |
| `changed_by` | UUID | FK → `users.id` |
| `old_status` | VARCHAR | Null on initial creation |
| `new_status` | VARCHAR | |
| `changed_at` | TIMESTAMP | |

### Migrations

| Version | Description |
|---|---|
| V1 | Initial schema — `users`, `requests`, `status_history` |
| V2 | Add `comments` table |
| V3 | Add `notifications` table |
| V4 | Convert `role` column to VARCHAR |
| V5 | Placeholder |
| V6 | Restore request enum columns as VARCHAR |
| V7 | Add `refresh_tokens` table |
| V8 | Add `request_number` SERIAL to `requests` |
| V9 | Create `teams` table + seed IT, Facilities, HR, Supply, General Ops |
| V10 | Add `team_id` FK to `users` |
| V11 | Add `team_id` FK to `requests`; back-fill from category |
| V12 | Make `teams.category` nullable; add Store Associates team |
| V13 | Add Admin team |

---

## Security Design

- **JWT access tokens** — 15-minute expiry, validated on every request via `JwtAuthFilter`
- **JWT refresh tokens** — 7-day expiry, exchanged via `POST /api/auth/refresh`
- **Passwords** — hashed with bcrypt via Spring Security's `PasswordEncoder`
- **Public routes** — `/api/auth/register`, `/api/auth/login`, and `/api/auth/refresh` are unauthenticated; all others require a valid Bearer token
- **RBAC** — `RequestService` enforces role checks at the service layer; `@PreAuthorize` annotations guard update (MANAGER/ADMIN/TECHNICIAN), delete (ADMIN), and user-create (MANAGER/ADMIN) endpoints
- **TECHNICIAN isolation** — view scope limited to: requests created by them, assigned to them, or in their team; assignment update restricted to self-assign only
- **CORS** — `localhost:5173` allowed in dev profile; in Docker and AWS the frontend nginx proxy forwards `/api/` requests to the backend, so browser requests always originate from the same origin

---

## Setup

### Option 1 — Docker (recommended)

Runs the full stack (PostgreSQL + backend + frontend) with one command from the repo root. Requires Docker Desktop.

```bash
docker-compose up --build
```

API available at `http://localhost/api`

The backend image uses a multi-stage Dockerfile: Maven builds the fat JAR in a `maven:3.9-eclipse-temurin-17` stage, then the JAR is copied into a minimal `eclipse-temurin:17-jre-alpine` runtime image.

### Option 2 — Local development

#### Prerequisites
- Java 17+
- Maven 3.9+
- PostgreSQL 17+ running locally

#### 1. Create the database

```bash
psql -U postgres -c "CREATE DATABASE homebase_dev;"
```

#### 2. Run the application

```powershell
# Windows — from the repo root
.\run-backend.ps1
```

```bash
# macOS / Linux
cd homebase-backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

API is available at `http://localhost:8080`. Flyway runs migrations automatically on startup.

### Running tests

```bash
./mvnw test
```

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `JWT_SECRET` | Signing key for JWT tokens — minimum 32 characters | Production only (dev has a built-in default) |
| `DATABASE_URL` | PostgreSQL JDBC URL (e.g. `jdbc:postgresql://host:5432/db`) | Production |
| `DATABASE_USER` | Database username | Production |
| `DATABASE_PASSWORD` | Database password | Production |

> Dev profile uses `localhost:5432/homebase_dev` with hardcoded credentials and a built-in JWT secret — no env vars needed locally. Production reads all values from environment variables only.

---

## Configuration Profiles

| Profile | When used | DB config |
|---|---|---|
| `dev` (default) | Local development | `localhost:5432/homebase_dev` |
| `prod` | Docker Compose + AWS ECS | Reads `DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASSWORD` from env |
| `test` | CI test runs | Isolated test database (injected by GitHub Actions) |

---

## Author

**Mirenge Innocent**
M.S. Computer Science — Georgia State University
[LinkedIn](https://www.linkedin.com/in/mirenge-innocent-799bb6300/) | [GitHub](https://github.com/minnocent12)

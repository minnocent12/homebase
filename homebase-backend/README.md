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
│   ├── Request.java                # JPA entity — requestNumber (SERIAL), team FK, assignedTo FK
│   ├── RequestRepository.java      # JPA Specification + derived queries (countByCreatedBy, countByAssignedTo, findByCreatedBy)
│   ├── RequestService.java         # Business logic; RBAC enforced per role;
│   │                               #   auto-routes by category; date + assignee filters
│   ├── RequestController.java      # POST/GET/PUT/DELETE /api/requests
│   ├── StatusHistoryRepository.java
│   └── dto/
│       ├── CreateRequestDto.java
│       ├── UpdateRequestDto.java
│       ├── RequestResponseDto.java # requestNumber, teamId, teamName, assignedToId, assignedToName
│       └── StatusHistoryResponseDto.java
├── comment/
│   ├── Comment.java
│   ├── CommentRepository.java      # findByRequestId, countByRequestId,
│   │                               #   findTop5ByUser (@EntityGraph eagerly fetches request),
│   │                               #   countByUser
│   ├── CommentService.java
│   ├── CommentController.java      # POST/GET /api/requests/{id}/comments
│   └── dto/
│       ├── CreateCommentDto.java
│       └── CommentResponseDto.java
├── analytics/
│   ├── AnalyticsController.java    # GET /api/analytics/summary (MANAGER/ADMIN)
│   └── AnalyticsService.java       # byCategory, byStatus, byPriority, last7DaysTrend,
│                                   #   avgResolutionHours; scoped to MANAGER's team
├── team/
│   ├── Team.java                   # JPA entity — id, name, description, category (nullable)
│   ├── TeamRepository.java         # findByCategory() used for auto-routing
│   ├── TeamController.java         # GET /api/teams, PATCH /api/users/{id}/team
│   └── dto/
│       └── TeamResponseDto.java
└── user/
    ├── User.java                   # JPA entity — id, fullName, email, passwordHash,
    │                               #   role, team (FK), active (boolean, default true), createdAt
    ├── UserRepository.java         # findByEmail, existsByEmail, findByTeam
    ├── UserRole.java               # ASSOCIATE, TECHNICIAN, MANAGER, ADMIN
    ├── UserController.java         # Full CRUD + profile endpoint
    └── dto/
        ├── CreateUserDto.java      # fullName, email, password, role, teamId
        ├── UpdateUserDto.java      # fullName, email, role, teamId (null=no change, ""=clear)
        ├── UserResponseDto.java    # id, fullName, email, role, teamId, teamName,
        │                           #   teamCategory, createdAt, active
        └── UserProfileDto.java     # All UserResponseDto fields + stats + chart data +
                                    #   recentSubmittedRequests + recentAssignedRequests +
                                    #   recentComments

src/main/resources/
├── application.yaml                # Base config + dev/prod profiles; open-in-view: false
└── db/migration/
    ├── V1__init_schema.sql
    ├── V2__add_comments.sql
    ├── V3__add_notifications.sql
    ├── V4__fix_role_column.sql
    ├── V5__fix_request_columns.sql
    ├── V6__restore_request_columns.sql
    ├── V7__add_status_history_columns.sql
    ├── V8__add_request_number.sql
    ├── V9__create_teams.sql
    ├── V10__add_team_to_users.sql
    ├── V11__add_team_to_requests.sql
    ├── V12__add_store_associates_team.sql
    ├── V13__add_admin_team.sql
    └── V14__add_active_column.sql
```

---

## API Endpoints

### Auth — Public

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/api/auth/register` | `fullName`, `email`, `password`, `role` | tokens + user info |
| POST | `/api/auth/login` | `email`, `password` | tokens + user info |
| POST | `/api/auth/refresh` | `refreshToken` | new tokens + user info |

### Requests

| Method | Endpoint | Description | RBAC |
|---|---|---|---|
| POST | `/api/requests` | Create (auto-routes to team by category) | Any role |
| GET | `/api/requests` | List (paginated, filtered, role-scoped) | Any role |
| GET | `/api/requests/{id}` | Get single request | Scoped by role |
| PUT | `/api/requests/{id}` | Update status / assignment / priority | MANAGER / ADMIN / TECHNICIAN (limited) |
| DELETE | `/api/requests/{id}` | Delete | ADMIN only |
| GET | `/api/requests/summary` | `{ open, inProgress, resolved, total }` | Any role (scoped) |
| GET | `/api/requests/{id}/history` | Status change log | Required |

**Query parameters for `GET /api/requests`:**

| Parameter | Description |
|---|---|
| `status` | `OPEN` \| `IN_PROGRESS` \| `RESOLVED` |
| `priority` | `LOW` \| `MEDIUM` \| `HIGH` \| `CRITICAL` |
| `category` | `IT` \| `HR` \| `FACILITIES` \| `SUPPLY` \| `OTHER` |
| `keyword` | Search in title and description |
| `assignedToId` | Filter by assignee UUID; `__unassigned__` for unassigned |
| `dateFrom` | ISO date (inclusive lower bound on `createdAt`) |
| `dateTo` | ISO date (inclusive upper bound on `createdAt`) |
| `page` | 0-based page number |
| `size` | Page size (default 10) |
| `sortBy` / `sortDir` | Sort field and direction |

**Technician update rules:**
- Can set `assignedToId` only to their own UUID (self-assign / pick up)
- Can update `status` only when already assigned to them (or picking up in the same call)
- Cannot edit `title`, `description`, `priority`, or `category`

### Comments

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/requests/{id}/comments` | Add a comment |
| GET | `/api/requests/{id}/comments` | Fetch comments in chronological order |

### Analytics

| Method | Endpoint | Description | RBAC |
|---|---|---|---|
| GET | `/api/analytics/summary` | Category, status, priority breakdowns + 7-day trend + avg resolution hours; scoped to MANAGER's team | MANAGER / ADMIN |

### Users

| Method | Endpoint | Description | RBAC |
|---|---|---|---|
| GET | `/api/users` | List — Admins see all; Managers see own team | MANAGER / ADMIN |
| POST | `/api/users` | Create — Admins choose any role + team; Managers create Associates in their team | MANAGER / ADMIN |
| GET | `/api/users/{id}` | Full profile: identity + stats + chart data + recent requests + recent comments | MANAGER / ADMIN |
| PUT | `/api/users/{id}` | Update name, email, role, team | ADMIN only |
| PATCH | `/api/users/{id}/active` | `{ "active": true/false }` — enable or disable account | ADMIN only |
| PATCH | `/api/users/{id}/team` | Assign or clear team | ADMIN only |
| DELETE | `/api/users/{id}` | Delete user; returns 409 if user has associated records | ADMIN only |

**User profile response (`GET /api/users/{id}`):**
```json
{
  "id": "...",
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "role": "TECHNICIAN",
  "teamId": "...",
  "teamName": "IT Support Team",
  "teamCategory": "IT",
  "createdAt": "2026-05-06T00:00:00Z",
  "active": true,
  "requestsCreated": 3,
  "requestsAssigned": 7,
  "commentsPosted": 12,
  "openCount": 1,
  "inProgressCount": 1,
  "resolvedCount": 1,
  "assignedOpenCount": 2,
  "assignedInProgressCount": 3,
  "assignedResolvedCount": 2,
  "last7DaysTrend": [{ "name": "May 1", "value": 0 }, ...],
  "last7DaysAssignedTrend": [{ "name": "May 1", "value": 1 }, ...],
  "recentSubmittedRequests": [...],
  "recentAssignedRequests": [...],
  "recentComments": [...]
}
```

### Teams

| Method | Endpoint | Description | RBAC |
|---|---|---|---|
| GET | `/api/teams` | List all teams with member lists | ADMIN |

---

## Role Permissions

| Action | ASSOCIATE | TECHNICIAN | MANAGER | ADMIN |
|---|---|---|---|---|
| Create request | Yes | Yes | Yes | Yes |
| View requests | Own only | Team + assigned + own | Own team | All |
| Update request status | No | Own assigned only | Yes | Yes |
| Self-assign a request | No | Yes (unassigned team) | No | No |
| Assign to another user | No | No | Yes | Yes |
| Delete request | No | No | No | Yes |
| Add / view comments | Yes | Yes | Yes | Yes |
| View analytics | No | No | Own team | All |
| View user profiles | No | No | Own team | All |
| Create users | No | No | Associates (own team) | All roles |
| Update / disable users | No | No | No | Yes |
| Delete users | No | No | No | Yes (no records only) |
| Manage teams | No | No | No | Yes |

---

## Database Schema

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `full_name` | VARCHAR | |
| `email` | VARCHAR | Unique |
| `password_hash` | VARCHAR | bcrypt |
| `role` | VARCHAR | `ASSOCIATE`, `TECHNICIAN`, `MANAGER`, `ADMIN` |
| `team_id` | UUID | FK → `teams.id`, nullable |
| `active` | BOOLEAN | Default `true`; `false` prevents login |
| `created_at` | TIMESTAMPTZ | Set on insert |

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
| `request_number` | SERIAL | Human-readable ID (REQ-1, REQ-2…) |
| `title` | VARCHAR | |
| `description` | TEXT | |
| `status` | VARCHAR | `OPEN`, `IN_PROGRESS`, `RESOLVED` |
| `priority` | VARCHAR | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `category` | VARCHAR | `IT`, `HR`, `FACILITIES`, `SUPPLY`, `OTHER` |
| `created_by` | UUID | FK → `users.id` |
| `assigned_to` | UUID | FK → `users.id`, nullable |
| `team_id` | UUID | FK → `teams.id`, nullable |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Auto-updated |

### `comments`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `request_id` | UUID | FK → `requests.id` |
| `user_id` | UUID | FK → `users.id` |
| `body` | TEXT | |
| `created_at` | TIMESTAMPTZ | Immutable |

### `status_history`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `request_id` | UUID | FK → `requests.id` |
| `changed_by` | UUID | FK → `users.id` |
| `old_status` | VARCHAR | Null on initial creation |
| `new_status` | VARCHAR | |
| `changed_at` | TIMESTAMPTZ | |

### Migrations

| Version | Description |
|---|---|
| V1 | Initial schema — `users`, `requests`, `status_history` |
| V2 | Add `comments` table |
| V3 | Add `notifications` table |
| V4–V6 | Column type fixes |
| V7 | Add `refresh_tokens` table |
| V8 | Add `request_number` SERIAL to `requests` |
| V9 | Create `teams` table + seed IT, Facilities, HR, Supply, General Ops |
| V10 | Add `team_id` FK to `users` |
| V11 | Add `team_id` FK to `requests`; back-fill from category |
| V12 | Make `teams.category` nullable; add Store Associates team |
| V13 | Add Admin team |
| V14 | Add `active` BOOLEAN to `users` (default `true`) |

---

## Security Design

- **JWT access tokens** — 15-minute expiry, validated on every request via `JwtAuthFilter`
- **JWT refresh tokens** — 7-day expiry, exchanged via `POST /api/auth/refresh`
- **Passwords** — hashed with bcrypt
- **Public routes** — `/api/auth/**` only; all others require a valid Bearer token
- **RBAC** — role checks enforced at the service layer; `@PreAuthorize` guards admin/manager-only endpoints
- **Disabled accounts** — `User.isEnabled()` returns the `active` field; Spring Security blocks login for disabled users
- **TECHNICIAN isolation** — view scope: created by / assigned to / in their team; update restricted to self-assign only
- **MANAGER scoping** — requests, dashboard summary, and analytics are all filtered to the manager's team
- **open-in-view: false** — JPA session is closed after repository calls; `@EntityGraph` used where lazy associations are needed in the controller layer

---

## Setup

### Option 1 — Docker

```bash
docker-compose up --build
```

API available at `http://localhost/api`

### Option 2 — Local development

```bash
psql -U postgres -c "CREATE DATABASE homebase_dev;"
cd homebase-backend && ./mvnw spring-boot:run
```

Flyway runs migrations automatically on startup. API available at `http://localhost:8080`.

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `JWT_SECRET` | Signing key — minimum 32 characters | Production only |
| `DATABASE_URL` | PostgreSQL JDBC URL | Production only |
| `DATABASE_USER` | Database username | Production only |
| `DATABASE_PASSWORD` | Database password | Production only |

---

## Author

**Mirenge Innocent**
M.S. Computer Science — Georgia State University
[LinkedIn](https://www.linkedin.com/in/mirenge-innocent-799bb6300/) | [GitHub](https://github.com/minnocent12)

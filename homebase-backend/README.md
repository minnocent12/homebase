# HomeBase — Backend API

Spring Boot REST API for the HomeBase Store Support Center Portal.

---

## Overview

This is the backend service for HomeBase. It provides a secure JWT-authenticated REST API with role-based access control (RBAC) that manages users, operational requests, comments, and analytics. Built with Spring Boot 3.3, Spring Security, Hibernate/JPA, and PostgreSQL, with Flyway handling all schema migrations.

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

---

## Project Structure

```
src/main/java/com/homebase/
├── auth/
│   ├── AuthController.java         # POST /api/auth/register, /api/auth/login
│   ├── AuthService.java            # Registration, login, token logic
│   ├── dto/
│   │   ├── RegisterRequest.java
│   │   ├── LoginRequest.java
│   │   └── AuthResponse.java       # Returns accessToken, refreshToken, user info
│   └── jwt/
│       ├── JwtUtil.java            # Token generation and validation
│       └── JwtAuthFilter.java      # Servlet filter — validates Bearer tokens
├── config/
│   ├── SecurityConfig.java         # Spring Security filter chain, public routes
│   └── CorsConfig.java             # CORS — allows localhost:5173 in dev
├── request/
│   ├── Request.java                # JPA entity
│   ├── RequestRepository.java      # JPA repository with Specification queries
│   ├── RequestService.java         # Business logic — create, list, update, delete; RBAC enforced
│   ├── RequestController.java      # POST/GET/PUT/DELETE /api/requests
│   └── dto/
│       ├── CreateRequestDto.java
│       ├── UpdateRequestDto.java
│       ├── RequestResponseDto.java
│       └── RequestSummaryDto.java
├── comment/
│   ├── Comment.java                # JPA entity — id, requestId, userId, body, createdAt
│   ├── CommentRepository.java      # findByRequestIdOrderByCreatedAtAsc, countByRequestId
│   ├── CommentService.java         # addComment, getComments
│   ├── CommentController.java      # POST/GET /api/requests/{id}/comments
│   └── dto/
│       ├── CreateCommentDto.java   # body (max 1000 chars)
│       └── CommentResponseDto.java # id, requestId, userId, userName, userRole, body, createdAt
├── analytics/
│   ├── AnalyticsController.java    # GET /api/analytics/summary (MANAGER/ADMIN only)
│   └── AnalyticsService.java       # byCategory, byStatus, byPriority, last7DaysTrend, avgResolutionHours
└── user/
    ├── User.java                   # JPA entity — id, fullName, email, passwordHash, role
    └── UserRepository.java

src/main/resources/
├── application.yaml                # Base config + dev/prod profiles
└── db/migration/
    ├── V1__init_schema.sql
    ├── V2__add_comments.sql
    ├── V3__add_notifications.sql
    ├── V4__convert_role_to_varchar.sql
    ├── V5__placeholder.sql
    └── V6__restore_request_enums_as_varchar.sql
```

---

## API Endpoints

### Auth — Public

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/api/auth/register` | `fullName`, `email`, `password`, `role` | `accessToken`, `refreshToken`, user info |
| POST | `/api/auth/login` | `email`, `password` | `accessToken`, `refreshToken`, user info |

### Requests — Requires `Authorization: Bearer <token>`

| Method | Endpoint | Description | RBAC |
|---|---|---|---|
| POST | `/api/requests` | Create a new request | Any role |
| GET | `/api/requests` | List requests (paginated, filtered) | Associates: own requests only |
| GET | `/api/requests/{id}` | Get a single request | Associates: own requests only |
| PUT | `/api/requests/{id}` | Update title, description, status, priority, category | MANAGER / ADMIN |
| DELETE | `/api/requests/{id}` | Permanently delete a request | ADMIN only |
| GET | `/api/requests/summary` | Returns `{ open, inProgress, resolved, total }` | Associates: own counts only |

### Comments — Requires `Authorization: Bearer <token>`

| Method | Endpoint | Description | RBAC |
|---|---|---|---|
| POST | `/api/requests/{id}/comments` | Add a comment to a request | Any role |
| GET | `/api/requests/{id}/comments` | Fetch comments in chronological order | Any role |

### Analytics — Requires `Authorization: Bearer <token>`

| Method | Endpoint | Description | RBAC |
|---|---|---|---|
| GET | `/api/analytics/summary` | Returns category, status, priority breakdowns + 7-day trend + avg resolution hours | MANAGER / ADMIN |

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

| Action | ASSOCIATE | MANAGER | ADMIN |
|---|---|---|---|
| Create request | Yes | Yes | Yes |
| View requests / summary | Own only | All | All |
| Update request | No | Yes | Yes |
| Delete request | No | No | Yes |
| Add / view comments | Yes | Yes | Yes |
| View analytics | No | Yes | Yes |

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
| `role` | VARCHAR | `ASSOCIATE`, `MANAGER`, `ADMIN` |
| `created_at` | TIMESTAMP | |

### `requests`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `title` | VARCHAR | |
| `description` | TEXT | |
| `status` | VARCHAR | `OPEN`, `IN_PROGRESS`, `RESOLVED` |
| `priority` | VARCHAR | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `category` | VARCHAR | `IT`, `HR`, `FACILITIES`, `SUPPLY`, `OTHER` |
| `created_by` | UUID | FK → `users.id` |
| `assigned_to` | UUID | FK → `users.id`, nullable |
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
| `old_status` | VARCHAR | |
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

---

## Security Design

- **JWT access tokens** — 15-minute expiry, validated on every request via `JwtAuthFilter`
- **JWT refresh tokens** — 7-day expiry, returned in `AuthResponse` for client-side storage
- **Passwords** — hashed with bcrypt via Spring Security's `PasswordEncoder`
- **Public routes** — `/api/auth/register` and `/api/auth/login` are unauthenticated; all others require a valid Bearer token
- **RBAC** — `RequestService` enforces role checks at the service layer; `@PreAuthorize` annotations guard update (MANAGER/ADMIN) and delete (ADMIN) endpoints; `AnalyticsController` restricts analytics to MANAGER/ADMIN
- **CORS** — `localhost:5173` allowed in dev profile; tightened in prod

---

## Setup

### Prerequisites
- Java 17+
- Maven 3.9+
- PostgreSQL 17+ running locally

### 1. Create the database

```bash
psql -U postgres -c "CREATE DATABASE homebase_dev;"
```

### 2. Set the JWT secret

```bash
# Windows (PowerShell)
$env:JWT_SECRET = "your-secret-key-at-least-32-characters-long"

# macOS / Linux
export JWT_SECRET="your-secret-key-at-least-32-characters-long"
```

### 3. Run the application

```bash
./mvnw spring-boot:run
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
| `JWT_SECRET` | Signing key for JWT tokens — minimum 32 characters | Always |
| `DATABASE_URL` | PostgreSQL JDBC URL (e.g. `jdbc:postgresql://host:5432/db`) | Production |
| `DATABASE_USER` | Database username | Production |
| `DATABASE_PASSWORD` | Database password | Production |

> Dev profile uses `localhost:5432/homebase_dev` with credentials from `application-dev.yml`. Production reads from environment variables only.

---

## Configuration Profiles

| Profile | When used | DB config |
|---|---|---|
| `dev` (default) | Local development | `localhost:5432/homebase_dev` |
| `prod` | Deployed environment | Reads `DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASSWORD` from env |
| `test` | Test runs | Isolated test database |

---

## Author

**Mirenge Innocent**
M.S. Computer Science — Georgia State University
[LinkedIn](https://www.linkedin.com/in/mirenge-innocent-799bb6300/) | [GitHub](https://github.com/minnocent12)

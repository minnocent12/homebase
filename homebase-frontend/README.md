# HomeBase — Frontend

React + TypeScript frontend for the HomeBase Store Support Center Portal.

## Tech Stack
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router v6

## Setup

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`. Requires the backend running at `http://localhost:8080`.

## Structure

```
src/
├── api/          # Axios instance + API call functions
├── components/   # Navbar, PriorityBadge, SummaryCard, RequestRow
├── context/      # AuthContext — global auth state
├── pages/        # LoginPage, DashboardPage, RequestListPage, CreateRequestPage
└── types/        # TypeScript interfaces
```

## Pages
- `/login` — Sign in screen
- `/dashboard` — Summary cards + recent requests
- `/requests` — Full request list with search, filter, pagination
- `/requests/new` — Create request form
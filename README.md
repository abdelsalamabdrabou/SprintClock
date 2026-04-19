# SprintClock

**SprintClock** is a sprint delivery estimation tool that calculates per-story delivery dates and team workloads based on your sprint configuration and assigned hours. It also persists every sprint so you can browse history and track each team member's cumulative contribution over time.

---

## Features

- Configure sprint start time, working hours, and max daily hours per person
- Assign Frontend, Backend, and Test engineers to each user story with hour estimates
- Calculate per-story delivery dates for each discipline
- Identify the **critical path team** per story
- View overall **feature delivery date**
- Summarize **team member workloads** (total hours & story count)
- **Sprint History** — every completed estimation is saved automatically; browse all past sprints and re-open any of them
- **User Statistics** — click any team member's name to see their total hours, story count, and a per-sprint breakdown across all saved sprints
- **12-hour time picker** with dark-theme calendar UI

---

## Architecture

The project follows **Clean Architecture** principles and is split into two parts:

```
SprintClock/
├── backend/                        # .NET 10 Web API
│   ├── SprintClock.API             # Minimal API entry point + endpoints
│   ├── SprintClock.Application     # Use cases, DTOs, interfaces
│   ├── SprintClock.Domain          # Entities, enums (pure business logic)
│   └── SprintClock.Infrastructure  # EF Core + SQLite, DeliveryCalculator
└── frontend/                       # React 19 + TypeScript + Vite
    └── src/
        ├── pages/                  # SprintSetupPage, EstimationPage, StatisticsPage, HistoryPage
        ├── components/             # UserStatsPanel (modal)
        ├── services/               # API client (estimationApi.ts)
        └── types/                  # Shared TypeScript interfaces
```

### Persistence

Sprint snapshots are stored in a local **SQLite** database (`sprintclock.db`) via **EF Core 10**. The database is created automatically on first run — no migration step required.

---

## Tech Stack

| Layer      | Technology                                   |
|------------|----------------------------------------------|
| Backend    | .NET 10, C#, Minimal API                     |
| ORM        | Entity Framework Core 10 + SQLite            |
| Frontend   | React 19, TypeScript, Vite                   |
| UI / UX    | react-datepicker (12h, dark theme), CSS vars |
| API Style  | REST (JSON)                                  |

---

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)

### Backend

```bash
cd backend/SprintClock.API
dotnet run
```

The API will be available at `http://localhost:5048`.  
Swagger UI: `http://localhost:5048/swagger`

The SQLite file `sprintclock.db` is created automatically in the `SprintClock.API` directory.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173` (Vite may choose the next free port).

---

## API Reference

### `POST /api/calculate`

Calculates delivery dates for all user stories and **automatically saves** the sprint to the database.

**Request Body**

```json
{
  "config": {
    "startDateTime": "2026-04-19T09:00:00",
    "maxDailyHours": 6,
    "workFrom": "09:00",
    "workUntil": "17:00"
  },
  "stories": [
    {
      "title": "User Login",
      "frontendAssignee": "Alice",
      "backendAssignee": "Bob",
      "testAssignee": "Carol",
      "frontendHours": 8,
      "backendHours": 6,
      "testHours": 4
    }
  ]
}
```

**Response** — same as before plus `sprintId`:

```json
{
  "sprintId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "results": [
    {
      "storyTitle": "User Login",
      "frontendDelivery": "2026-04-20T13:00:00",
      "backendDelivery": "2026-04-20T11:00:00",
      "testDelivery": "2026-04-19T15:00:00",
      "finalDelivery": "2026-04-20T13:00:00",
      "criticalPathTeam": "Frontend"
    }
  ],
  "workloads": [
    { "name": "Alice", "team": "Frontend", "totalHours": 8, "storyCount": 1 }
  ],
  "featureDelivery": "2026-04-20T13:00:00",
  "totalStories": 1,
  "totalFrontendHours": 8,
  "totalBackendHours": 6,
  "totalTestHours": 4
}
```

---

### `GET /api/sprints`

Returns a list of all saved sprints, newest first.

**Response**

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "createdAt": "2026-04-19T10:30:00",
    "featureDelivery": "2026-04-20T13:00:00",
    "totalStories": 3
  }
]
```

---

### `GET /api/sprints/{id}`

Returns the full result payload for a specific sprint (same shape as `POST /api/calculate` response).

---

### `GET /api/users/{name}/stats`

Returns aggregated statistics for a team member across all saved sprints.

**Response**

```json
[
  {
    "name": "Alice",
    "team": "Frontend",
    "totalHours": 42,
    "storyCount": 7,
    "stories": [
      {
        "sprintId": "3fa85f64-...",
        "sprintCreatedAt": "2026-04-19T10:30:00",
        "storyTitle": "User Login",
        "hours": 8
      }
    ]
  }
]
```

---

### `GET /api/health`

Returns `{ "status": "healthy" }`.

---

## License

MIT

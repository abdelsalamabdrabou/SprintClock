# SprintClock

**SprintClock** is a sprint delivery estimation tool that calculates per-story delivery dates and team workloads based on your sprint configuration and assigned hours.

---

## Features

- Configure sprint start time, working hours, and max daily hours per person
- Assign Frontend, Backend, and Test engineers to each user story with hour estimates
- Calculate per-story delivery dates for each discipline
- Identify the **critical path team** per story
- View overall **feature delivery date**
- Summarize **team member workloads** (total hours & story count)

---

## Architecture

The project follows **Clean Architecture** principles and is split into two parts:

```
SprintClock/
├── backend/                        # .NET 10 Web API
│   ├── SprintClock.API             # Minimal API entry point + endpoints
│   ├── SprintClock.Application     # Use cases, DTOs, interfaces
│   ├── SprintClock.Domain          # Entities, enums (pure business logic)
│   └── SprintClock.Infrastructure  # Services (DeliveryCalculator)
└── frontend/                       # React 19 + TypeScript + Vite
    └── src/
        ├── pages/                  # SprintSetupPage, EstimationPage, StatisticsPage
        ├── services/               # API client (estimationApi.ts)
        └── types/                  # Shared TypeScript interfaces
```

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Backend    | .NET 10, C#, Minimal API          |
| Frontend   | React 19, TypeScript, Vite        |
| API Style  | REST (JSON)                       |

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

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Reference

### `POST /api/calculate`

Calculates delivery dates for all user stories.

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

**Response**

```json
{
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

### `GET /api/health`

Returns `{ "status": "healthy" }`.

---

## License

MIT

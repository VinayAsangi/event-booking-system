# 🎟️ SeatBook — Event Seat Booking System

Full-stack seat reservation platform built with **React** (frontend) and **Java / Spring Boot** (backend).

---

## Prerequisites

| Tool | Version                         |
|---|---------------------------------|
| Java (JDK) | 21+                             |
| Maven | use the included `mvnw` wrapper |
| Node.js | 18+                             |
---

## Quick Start

### Backend (Terminal 1)
```bash
cd backend
./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
# → API at http://localhost:4000
```

> The backend is configured to run on port **4000** (`server.port=4000` in `src/main/resources/application.properties`) so the frontend works without any changes.

### Frontend (Terminal 2)
```bash
cd frontend
npm install
npm start
# → App at http://localhost:3000
```

### Running backend tests
```bash
cd backend
./mvnw test
```

---

## Project Structure

```
event-seat-booking-system/
├── backend/      # Java Spring Boot REST API
├── frontend/     # React app
├── .gitignore
└── README.md
```

---

## Architecture

### Backend (`/backend`)

Package root: `com.seatbook`

| File | Responsibility |
|---|---|
| `SeatBookingApplication.java` | Spring Boot entry point |
| `config/CorsConfig.java` | CORS configuration (allows the React dev server on `:3000`) |
| `controller/SeatController.java` | REST endpoints (thin controller) |
| `service/SeatService.java` | Business logic — reserve, confirm, release, expiry |
| `store/SeatStore.java` | In-memory data store (seats map + reservations map) |
| `model/Seat.java`, `model/SeatStatus.java` | Seat entity and status enum (`AVAILABLE`, `RESERVED`, `BOOKED`) |
| `dto/SeatRequest.java`, `dto/ApiResponse.java` | Request body and standard response wrapper |
| `exception/GlobalExceptionHandler.java` | `@RestControllerAdvice` — global error handler |

**Seat data structure:**
```json
{ "id": "A1", "row": "A", "col": 1, "price": 1200, "status": "AVAILABLE" }
```

**Reservation expiry** is handled with a `ScheduledExecutorService`. Each reservation stores `{ ScheduledFuture, expiresAt }`. On expiry, the task checks the seat is still `RESERVED` before resetting it — safe against late timers after a manual confirm/release.

**Concurrency:** seat state lives in `ConcurrentHashMap`s, and reserve / confirm / release are synchronized so two users can't reserve the same seat at the same time.

### Frontend (`/frontend/src`)

| File | Responsibility |
|---|---|
| `App.js` | Root component, page routing (selection ↔ payment) |
| `components/SeatGrid.js` | Seat layout grid with status colors |
| `components/BookingSummary.js` | Selection panel + reserve button |
| `pages/PaymentScreen.js` | Payment simulation + countdown |
| `hooks/useSeats.js` | Data fetching + 5s polling |
| `hooks/useCountdown.js` | Countdown timer with expire callback |
| `services/api.js` | Fetch wrappers for all API calls |

---

## API Reference

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/api/seats` | — | List all seats with status |
| POST | `/api/seats/reserve` | `{ "seatIds": [...] }` | Reserve 1–5 available seats (2 min TTL) |
| POST | `/api/seats/confirm` | `{ "seatIds": [...] }` | Confirm reserved seats → `BOOKED` |
| POST | `/api/seats/release` | `{ "seatIds": [...] }` | Release reserved seats → `AVAILABLE` |

All responses: `{ "success": boolean, "data": any, "message": string }`

---
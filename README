# 🎟️ SeatBook — Event Seat Booking System

Full-stack seat reservation platform built with **React** (frontend) and **Java / Spring Boot** (backend).

---

## Prerequisites

| Tool | Version |
|---|---|
| Java (JDK) | 17+ |
| Maven | 3.8+ (or use the included `mvnw` wrapper) |
| Node.js | 18+ |
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

## Assumptions & Design Decisions

1. **No routing library** — page state (seat selection vs. payment) is managed via a single `reservationData` state flag in `App.js`. React Router was omitted to keep the dependency footprint small.

2. **Optimistic-style seat locking on reserve** — the UI transitions immediately to the payment screen after a successful reserve API response. No need for optimistic UI on the grid itself because the user is navigated away.

3. **Polling at 5s** — real-time seat updates (SSE/WebSocket) are replaced with a 5s polling interval on `GET /api/seats`. This keeps the seat grid current in multi-user scenarios and was simpler to implement within the time box. The interval is paused when the user is on the payment screen.

4. **Row pricing** — prices vary by row (A: ₹1200 → E: ₹500) to make the summary more realistic.

5. **Timer safety** — `useCountdown` stores the `onExpire` callback in a ref, so stale closures can't cause double-release bugs.

6. **Backend expiry robustness** — even if the frontend timer fires slightly late, the backend scheduled task independently releases the seat. Both paths call `releaseSeats`, but the service checks `status == RESERVED` before acting, making double-release a no-op.

7. **In-memory storage** — seats and reservations are held in memory (no database currently), so data resets whenever the backend restarts. `SeatStore` is isolated behind its own class so it can later be swapped for a JPA repository.

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
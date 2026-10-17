package com.seatbook.service;

import com.seatbook.dto.ReserveResult;
import com.seatbook.exception.BookingException;
import com.seatbook.model.Seat;
import com.seatbook.model.SeatStatus;
import com.seatbook.store.SeatStore;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

@Service
public class SeatService {

    private static final long RESERVATION_TTL_MINUTES = 2;

    private final SeatStore store;

    // Single-threaded scheduler is sufficient; all it does is set status fields.
    private final ScheduledExecutorService scheduler =
            Executors.newScheduledThreadPool(2);

    public SeatService(SeatStore store) {
        this.store = store;
    }

    // ── Queries ─────────────────────────────────────────────────────────────

    public Collection<Seat> getAllSeats() {
        return store.getAllSeats();
    }

    // ── Commands ─────────────────────────────────────────────────────────────

    /**
     * Reserve a list of seats.
     * Rules:
     *   - All seats must exist and be AVAILABLE.
     *   - Max 5 seats (enforced by @Size on DTO, but double-checked here).
     *   - Reservation auto-expires after 2 minutes.
     */
    public ReserveResult reserve(List<String> seatIds) {
        // Validate all seats before mutating any of them
        List<Seat> seats = resolveAndValidate(seatIds, SeatStatus.AVAILABLE,
                "not available (current status: %s)");

        long expiresAt = System.currentTimeMillis() + RESERVATION_TTL_MINUTES * 60 * 1000;

        for (Seat seat : seats) {
            seat.setStatus(SeatStatus.RESERVED);
            seat.setExpiresAt(expiresAt);

            // Schedule auto-release
            ScheduledFuture<?> future = scheduler.schedule(
                    () -> expireSeat(seat),
                    RESERVATION_TTL_MINUTES,
                    TimeUnit.MINUTES
            );
            store.saveTimer(seat.getId(), future);
        }

        return new ReserveResult(
                seatIds,
                expiresAt,
                seatIds.size() + " seat(s) reserved. You have 2 minutes to complete payment."
        );
    }

    /**
     * Confirm booking — moves RESERVED → BOOKED.
     */
    public List<String> confirm(List<String> seatIds) {
        List<Seat> seats = resolveAndValidate(seatIds, SeatStatus.RESERVED,
                "not in RESERVED state (current: %s). It may have expired.");

        for (Seat seat : seats) {
            seat.setStatus(SeatStatus.BOOKED);
            seat.setExpiresAt(null);
            store.cancelTimer(seat.getId()); // cancel the expiry timer
        }

        return seatIds;
    }

    /**
     * Release seats — moves RESERVED → AVAILABLE.
     */
    public List<String> release(List<String> seatIds) {
        List<Seat> seats = resolveAndValidate(seatIds, SeatStatus.RESERVED,
                "not in RESERVED state (current: %s).");

        for (Seat seat : seats) {
            seat.setStatus(SeatStatus.AVAILABLE);
            seat.setExpiresAt(null);
            store.cancelTimer(seat.getId());
        }

        return seatIds;
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    /**
     * Resolve seat IDs to Seat objects and validate each has the expected status.
     * Fails fast on the first violation so no seats are partially mutated.
     */
    private List<Seat> resolveAndValidate(List<String> seatIds,
                                          SeatStatus expectedStatus,
                                          String statusErrorTemplate) {
        return seatIds.stream().map(id -> {
            Seat seat = store.findById(id)
                    .orElseThrow(() -> new BookingException(
                            HttpStatus.NOT_FOUND,
                            "Seat " + id + " does not exist."));

            if (seat.getStatus() != expectedStatus) {
                throw new BookingException(
                        HttpStatus.CONFLICT,
                        "Seat " + id + " is " +
                        String.format(statusErrorTemplate, seat.getStatus()));
            }

            return seat;
        }).toList();
    }

    /**
     * Called by the scheduler when a reservation TTL expires.
     * Guard: only release if still RESERVED (prevents race with a late timer
     * firing after the user already confirmed / manually released).
     */
    private void expireSeat(Seat seat) {
        synchronized (seat) {
            if (seat.getStatus() == SeatStatus.RESERVED) {
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setExpiresAt(null);
                store.cancelTimer(seat.getId());
            }
        }
    }
}

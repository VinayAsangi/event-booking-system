package com.seatbook.store;

import com.seatbook.model.Seat;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

/**
 * Single source of truth for seat state.
 * Uses ConcurrentHashMap for thread-safe reads; individual Seat setters
 * are synchronized for atomic status transitions.
 */
@Component
public class SeatStore {

    // seat id → Seat
    private final Map<String, Seat> seats = new ConcurrentHashMap<>();

    // seat id → expiry timer handle (so we can cancel on confirm/release)
    private final Map<String, ScheduledFuture<?>> reservationTimers = new ConcurrentHashMap<>();

    public SeatStore() {
        initSeats();
    }

    // ── Init ────────────────────────────────────────────────────────────────

    private void initSeats() {
        char[] rows   = {'A', 'B', 'C', 'D', 'E'};
        int[]  prices = {1200, 1000, 800, 600, 500};
        int    cols   = 6;

        for (int r = 0; r < rows.length; r++) {
            for (int c = 1; c <= cols; c++) {
                String id   = "" + rows[r] + c;
                String row  = String.valueOf(rows[r]);
                Seat   seat = new Seat(id, row, c, prices[r]);
                seats.put(id, seat);
            }
        }
    }

    // ── Read ────────────────────────────────────────────────────────────────

    public Collection<Seat> getAllSeats() {
        return seats.values();
    }

    public Optional<Seat> findById(String id) {
        return Optional.ofNullable(seats.get(id));
    }

    // ── Timer management ────────────────────────────────────────────────────

    public void saveTimer(String seatId, ScheduledFuture<?> future) {
        reservationTimers.put(seatId, future);
    }

    public void cancelTimer(String seatId) {
        ScheduledFuture<?> future = reservationTimers.remove(seatId);
        if (future != null) {
            future.cancel(false); // don't interrupt if already running
        }
    }
}

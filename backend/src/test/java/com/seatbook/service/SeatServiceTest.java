package com.seatbook.service;

import com.seatbook.dto.ReserveResult;
import com.seatbook.exception.BookingException;
import com.seatbook.model.SeatStatus;
import com.seatbook.store.SeatStore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SeatServiceTest {

    private SeatService service;

    @BeforeEach
    void setUp() {
        service = new SeatService(new SeatStore());
    }

    @Test
    @DisplayName("getAllSeats returns 30 seats on startup")
    void getAllSeats_returns30Seats() {
        assertEquals(30, service.getAllSeats().size());
    }

    @Test
    @DisplayName("All seats start as AVAILABLE")
    void allSeats_initiallyAvailable() {
        service.getAllSeats().forEach(s ->
                assertEquals(SeatStatus.AVAILABLE, s.getStatus()));
    }

    @Test
    @DisplayName("reserve() transitions seats AVAILABLE → RESERVED")
    void reserve_setsStatusToReserved() {
        ReserveResult result = service.reserve(List.of("A1", "A2"));

        assertEquals(List.of("A1", "A2"), result.getReservedSeats());
        assertTrue(result.getExpiresAt() > System.currentTimeMillis());

        service.getAllSeats().stream()
                .filter(s -> s.getId().equals("A1") || s.getId().equals("A2"))
                .forEach(s -> assertEquals(SeatStatus.RESERVED, s.getStatus()));
    }

    @Test
    @DisplayName("reserve() rejects seats that are already RESERVED")
    void reserve_rejectsAlreadyReservedSeat() {
        service.reserve(List.of("B1"));

        BookingException ex = assertThrows(BookingException.class,
                () -> service.reserve(List.of("B1")));

        assertEquals(HttpStatus.CONFLICT, ex.getHttpStatus());
        assertTrue(ex.getMessage().contains("B1"));
    }

    @Test
    @DisplayName("reserve() rejects non-existent seat IDs")
    void reserve_rejectsUnknownSeatId() {
        BookingException ex = assertThrows(BookingException.class,
                () -> service.reserve(List.of("Z9")));

        assertEquals(HttpStatus.NOT_FOUND, ex.getHttpStatus());
    }

    @Test
    @DisplayName("confirm() transitions RESERVED → BOOKED")
    void confirm_setsStatusToBooked() {
        service.reserve(List.of("C1", "C2"));
        service.confirm(List.of("C1", "C2"));

        service.getAllSeats().stream()
                .filter(s -> s.getId().equals("C1") || s.getId().equals("C2"))
                .forEach(s -> assertEquals(SeatStatus.BOOKED, s.getStatus()));
    }

    @Test
    @DisplayName("confirm() rejects seats that are not RESERVED")
    void confirm_rejectsAvailableSeat() {
        BookingException ex = assertThrows(BookingException.class,
                () -> service.confirm(List.of("D1")));

        assertEquals(HttpStatus.CONFLICT, ex.getHttpStatus());
    }

    @Test
    @DisplayName("release() transitions RESERVED → AVAILABLE")
    void release_setsStatusToAvailable() {
        service.reserve(List.of("E1", "E2"));
        service.release(List.of("E1", "E2"));

        service.getAllSeats().stream()
                .filter(s -> s.getId().equals("E1") || s.getId().equals("E2"))
                .forEach(s -> assertEquals(SeatStatus.AVAILABLE, s.getStatus()));
    }

    @Test
    @DisplayName("release() rejects seats that are not RESERVED")
    void release_rejectsAvailableSeat() {
        BookingException ex = assertThrows(BookingException.class,
                () -> service.release(List.of("A3")));

        assertEquals(HttpStatus.CONFLICT, ex.getHttpStatus());
    }

    @Test
    @DisplayName("Cannot reserve BOOKED seats")
    void reserve_rejectsBookedSeat() {
        service.reserve(List.of("A4"));
        service.confirm(List.of("A4"));

        BookingException ex = assertThrows(BookingException.class,
                () -> service.reserve(List.of("A4")));

        assertEquals(HttpStatus.CONFLICT, ex.getHttpStatus());
    }

    @Test
    @DisplayName("Partial failure: if any seat is unavailable, no seats are mutated")
    void reserve_atomicFailure_noPartialMutation() {
        service.reserve(List.of("B2")); // B2 is now RESERVED

        // Try to reserve A5 (available) and B2 (already reserved) together
        assertThrows(BookingException.class,
                () -> service.reserve(List.of("A5", "B2")));

        // A5 must still be AVAILABLE — no partial mutation
        service.getAllSeats().stream()
                .filter(s -> s.getId().equals("A5"))
                .forEach(s -> assertEquals(SeatStatus.AVAILABLE, s.getStatus()));
    }
}

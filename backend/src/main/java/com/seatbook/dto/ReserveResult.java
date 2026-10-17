package com.seatbook.dto;

import java.util.List;

public class ReserveResult {
    private final List<String> reservedSeats;
    private final long expiresAt;
    private final String message;

    public ReserveResult(List<String> reservedSeats, long expiresAt, String message) {
        this.reservedSeats = reservedSeats;
        this.expiresAt     = expiresAt;
        this.message       = message;
    }

    public List<String> getReservedSeats() { return reservedSeats; }
    public long         getExpiresAt()     { return expiresAt; }
    public String       getMessage()       { return message; }
}

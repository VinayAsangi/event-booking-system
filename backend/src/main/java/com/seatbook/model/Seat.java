package com.seatbook.model;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Seat {

    private final String id;
    private final String row;
    private final int col;
    private final int price;
    private volatile SeatStatus status;
    private Long expiresAt; // null unless RESERVED

    public Seat(String id, String row, int col, int price) {
        this.id      = id;
        this.row     = row;
        this.col     = col;
        this.price   = price;
        this.status  = SeatStatus.AVAILABLE;
    }

    // --- Getters ---
    public String     getId()       { return id; }
    public String     getRow()      { return row; }
    public int        getCol()      { return col; }
    public int        getPrice()    { return price; }
    public SeatStatus getStatus()   { return status; }
    public Long       getExpiresAt(){ return expiresAt; }

    // --- Setters ---
    public synchronized void setStatus(SeatStatus status) { this.status = status; }
    public synchronized void setExpiresAt(Long expiresAt) { this.expiresAt = expiresAt; }
}

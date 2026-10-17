package com.seatbook.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public class SeatIdsRequest {

    @NotEmpty(message = "seatIds must not be empty")
    @Size(max = 5, message = "Cannot reserve more than 5 seats at a time")
    private List<String> seatIds;

    public List<String> getSeatIds() { return seatIds; }
    public void setSeatIds(List<String> seatIds) { this.seatIds = seatIds; }
}

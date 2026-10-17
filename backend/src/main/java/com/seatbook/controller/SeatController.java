package com.seatbook.controller;

import com.seatbook.dto.ApiResponse;
import com.seatbook.dto.ReserveResult;
import com.seatbook.dto.SeatIdsRequest;
import com.seatbook.model.Seat;
import com.seatbook.service.SeatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seats")
@CrossOrigin(origins = "*") // Allow React dev server on port 3000
public class SeatController {

    private final SeatService seatService;

    public SeatController(SeatService seatService) {
        this.seatService = seatService;
    }

    /**
     * GET /api/seats
     * Returns all seats with their current status.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Collection<Seat>>> getAllSeats() {
        return ResponseEntity.ok(ApiResponse.ok(seatService.getAllSeats()));
    }

    /**
     * POST /api/seats/reserve
     * Body: { "seatIds": ["A1", "A2"] }
     * Reserves 1–5 available seats for 2 minutes.
     */
    @PostMapping("/reserve")
    public ResponseEntity<ApiResponse<ReserveResult>> reserve(
            @Valid @RequestBody SeatIdsRequest request) {

        ReserveResult result = seatService.reserve(request.getSeatIds());
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /**
     * POST /api/seats/confirm
     * Body: { "seatIds": ["A1", "A2"] }
     * Confirms payment — moves RESERVED → BOOKED.
     */
    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<Map<String, Object>>> confirm(
            @Valid @RequestBody SeatIdsRequest request) {

        List<String> booked = seatService.confirm(request.getSeatIds());
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "bookedSeats", booked,
                "message", "Booking confirmed for " + booked.size() + " seat(s)."
        )));
    }

    /**
     * POST /api/seats/release
     * Body: { "seatIds": ["A1", "A2"] }
     * Releases reserved seats back to AVAILABLE.
     */
    @PostMapping("/release")
    public ResponseEntity<ApiResponse<Map<String, Object>>> release(
            @Valid @RequestBody SeatIdsRequest request) {

        List<String> released = seatService.release(request.getSeatIds());
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "releasedSeats", released,
                "message", released.size() + " seat(s) released and now available."
        )));
    }
}

package com.seatbook.exception;

import org.springframework.http.HttpStatus;

public class BookingException extends RuntimeException {

    private final HttpStatus httpStatus;

    public BookingException(HttpStatus httpStatus, String message) {
        super(message);
        this.httpStatus = httpStatus;
    }

    public HttpStatus getHttpStatus() { return httpStatus; }
}

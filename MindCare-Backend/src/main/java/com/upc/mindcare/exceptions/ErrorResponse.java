package com.upc.mindcare.exceptions;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ErrorResponse {
    private int statusCode;
    private String message;
    private List<String> errors;
    private LocalDateTime timestamp;

    // Constructor simple (cuando no hay lista de errores)
    public ErrorResponse(int statusCode, String message) {
        this.statusCode = statusCode;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
    // Constructor completo
    public ErrorResponse(int statusCode, String message, List<String> errors) {
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
        this.timestamp = LocalDateTime.now();
    }
}


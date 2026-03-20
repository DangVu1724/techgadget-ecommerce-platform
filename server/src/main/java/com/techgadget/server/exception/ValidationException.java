package com.techgadget.server.exception;

public class ValidationException extends BadRequestException {
    public ValidationException(String message) {
        super(message);
    }
}

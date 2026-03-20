package com.techgadget.server.exception;

public class DuplicateResourceException extends ConflictException {
    public DuplicateResourceException(String message) {
        super(message);
    }

    public DuplicateResourceException(String resourceName, String fieldName, Object value) {
        super(String.format("%s already exists with %s: %s", resourceName, fieldName, value));
    }
}

package com.techgadget.server.exception;

public class ResourceNotFoundException extends NotFoundException {
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, Object resourceId) {
        super(String.format("%s not found with id: %s", resourceName, resourceId));
    }
}

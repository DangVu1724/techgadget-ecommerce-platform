package com.techgadget.server.exception;

public class DuplicateResourceException extends ApiException{
    public DuplicateResourceException(ErrorCode errorCode, String... params) {
        super(errorCode, params);
    }

    public DuplicateResourceException(String resourceName, String fieldName, Object value) {
        super(ErrorCode.DUPLICATE_RESOURCE, resourceName, fieldName, String.valueOf(value));
    }
}

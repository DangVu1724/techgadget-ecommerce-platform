package com.techgadget.server.exception;

public class ResourceNotFoundException extends ApiException{
    public ResourceNotFoundException(ErrorCode errorCode, String... params) {
        super(errorCode, params);
    }

    public ResourceNotFoundException(String resourceName, Object resourceId) {
        super(ErrorCode.NOT_FOUND, resourceName, String.valueOf(resourceId));
    }
}

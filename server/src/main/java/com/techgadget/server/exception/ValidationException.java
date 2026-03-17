package com.techgadget.server.exception;

public class ValidationException extends ApiException{
    public ValidationException(ErrorCode errorCode, String... params) {
        super(errorCode, params);
    }

    public ValidationException(String message) {
        super(ErrorCode.VALIDATION_ERROR, message);
    }
}

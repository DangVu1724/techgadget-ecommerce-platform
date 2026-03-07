package com.techgadget.server.exception;

public class UnauthorizedException extends ApiException{
    public UnauthorizedException(ErrorCode errorCode, String... params) {
        super(errorCode, params);
    }

    public UnauthorizedException(String message) {
        super(ErrorCode.UNAUTHORIZED, message);
    }
}

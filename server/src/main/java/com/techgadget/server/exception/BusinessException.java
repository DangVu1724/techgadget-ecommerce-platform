package com.techgadget.server.exception;

public class BusinessException extends ApiException{
    public BusinessException(ErrorCode errorCode, String... params) {
        super(errorCode, params);
    }
}

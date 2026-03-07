package com.techgadget.server.exception;

import lombok.Getter;

@Getter
public abstract class ApiException extends RuntimeException {

    private final ErrorCode errorCode;
    private final String[] params;

    public ApiException(ErrorCode errorCode, String... params) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.params = params;
    }

    public ApiException(ErrorCode errorCode, Throwable cause, String... params) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
        this.params = params;
    }

    public int getStatus() {
        return errorCode.getStatus();
    }

    public String getCode() {
        return errorCode.getCode();
    }
}
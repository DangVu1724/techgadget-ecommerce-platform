package com.techgadget.server.exception;

import com.techgadget.server.model.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleApiException(
            ApiException ex, HttpServletRequest request) {
        log.warn("Handled API exception: {}", ex.getMessage());
        return buildErrorResponse(ex.getStatus(), ex.getMessage(), request, null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleValidationExceptions(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        log.warn("Validation exception: {}", ex.getMessage());

        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            fieldErrors.put(fieldName, error.getDefaultMessage());
        });

        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Request validation failed.",
                request,
                fieldErrors
        );
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleConstraintViolationException(
            ConstraintViolationException ex, HttpServletRequest request) {
        log.warn("Constraint violation: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request, null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, HttpServletRequest request) {
        log.error("Database error", ex);

        String message = ex.getMostSpecificCause() != null
                ? ex.getMostSpecificCause().getMessage()
                : "Database constraint violation.";

        return buildErrorResponse(HttpStatus.BAD_REQUEST, message, request, null);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, HttpServletRequest request) {
        log.warn("Invalid JSON payload: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Malformed JSON request body.", request, null);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleMethodArgumentTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        String message = String.format(
                "Invalid value '%s' for parameter '%s'.",
                ex.getValue(),
                ex.getName()
        );
        return buildErrorResponse(HttpStatus.BAD_REQUEST, message, request, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleAllExceptions(
            Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception", ex);
        return buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred.",
                request,
                null
        );
    }

    private ResponseEntity<ApiResponse<Map<String, Object>>> buildErrorResponse(
            HttpStatus status,
            String message,
            HttpServletRequest request,
            Object details
    ) {
        Map<String, Object> errorData = new LinkedHashMap<>();
        errorData.put("status", status.value());
        errorData.put("path", request.getRequestURI());
        if (details != null) {
            errorData.put("details", details);
        }

        return ResponseEntity.status(status).body(ApiResponse.error(message, errorData));
    }
}

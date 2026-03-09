package com.techgadget.server.exception;

import lombok.Getter;

@Getter
public enum ErrorCode {

    // 4xx - Client errors
    BAD_REQUEST(400, "ERR_BAD_REQUEST", "Yêu cầu không hợp lệ"),
    UNAUTHORIZED(401, "ERR_UNAUTHORIZED", "Không có quyền truy cập"),
    FORBIDDEN(403, "ERR_FORBIDDEN", "Không được phép truy cập"),
    NOT_FOUND(404, "ERR_NOT_FOUND", "Không tìm thấy tài nguyên"),
    DUPLICATE_RESOURCE(409, "ERR_DUPLICATE", "Dữ liệu đã tồn tại"),
    VALIDATION_ERROR(422, "ERR_VALIDATION", "Dữ liệu không hợp lệ"),

    // 5xx - Server errors
    INTERNAL_ERROR(500, "ERR_INTERNAL", "Lỗi hệ thống"),
    DATABASE_ERROR(503, "ERR_DATABASE", "Lỗi cơ sở dữ liệu"),

    // Business errors (có thể dùng 400 hoặc 409)
    PRODUCT_NOT_FOUND(404, "ERR_PRODUCT_NOT_FOUND", "Không tìm thấy sản phẩm"),
    PRODUCT_NAME_EXISTS(409, "ERR_PRODUCT_NAME_EXISTS", "Tên sản phẩm đã tồn tại"),
    CATEGORY_NOT_FOUND(404, "ERR_CATEGORY_NOT_FOUND", "Không tìm thấy danh mục"),
    BRAND_NOT_FOUND(404, "ERR_BRAND_NOT_FOUND", "Không tìm thấy thương hiệu"),
    ATTRIBUTE_NOT_FOUND(404, "ERR_ATTRIBUTE_NOT_FOUND", "Không tìm thấy thuộc tính"),
    VARIANT_NOT_FOUND(404, "ERR_VARIANT_NOT_FOUND", "Không tìm thấy biến thể"),
    INSUFFICIENT_STOCK(400, "ERR_INSUFFICIENT_STOCK", "Số lượng tồn kho không đủ"),
    INVALID_PRICE(400, "ERR_INVALID_PRICE", "Giá không hợp lệ");

    private final int status;
    private final String code;
    private final String message;

    ErrorCode(int status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}
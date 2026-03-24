package com.techgadget.server.model.enums;

public enum OrderStatus {
    PENDING,        // chờ xác nhận
    CONFIRMED,      // đã xác nhận
    PROCESSING,     // đang chuẩn bị hàng
    SHIPPING,       // đang giao
    DELIVERED,      // đã giao
    CANCELLED,      // đã hủy
    FAILED          // giao thất bại
}

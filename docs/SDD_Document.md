# Software Design Document (SDD)

## Project: TechGadget – E-Commerce System

**Version:** 1.0

**Author:** Đặng Vũ

**Team:** Nhóm 4 - HN25_CPL_OU_05

**Date:** 25/02/2026

---

# Revision History

| Name            | Date       | Reason for Changes                                | Version |
| --------------- | ---------- | ------------------------------------------------- | ------- |
| Đặng Vũ         | 27/02/2026 | Xây dựng cấu trúc tài liệu ban đầu                | 0.1     |
| Đặng Vũ         | 28/02/2026 | Thiết kế kiến trúc tổng thể, lớp và cơ sở dữ liệu | 0.2     |
| Đặng Trung Kiên | 01/03/2026 | Thiết kế và hoàn thiện các sơ đồ tuần tự          | 0.5     |
| Đặng Vũ         | 01/03/2026 | Rà soát tổng thể và hoàn thiện tài liệu           | 0.9     |
| Đặng Trung Kiên | 10/04/2026 | Cập nhật CSDL, module Review và Promotion Popup   | 1.0     |

---

# 1. Giới thiệu

## 1.1 Mục đích

Tài liệu này mô tả chi tiết thiết kế hệ thống TechGadget E-commerce Platform.

Mục tiêu:

* Mô tả kiến trúc tổng thể hệ thống
* Trình bày thiết kế module và lớp
* Xác định cách các thành phần tương tác
* Làm cơ sở cho triển khai và kiểm thử

## 1.2 Phạm vi

Hệ thống cho phép:

* Đăng ký, đăng nhập
* Xem và tìm kiếm sản phẩm
* Quản lý giỏ hàng
* Đặt và theo dõi đơn hàng
* Đánh giá sản phẩm (Review & Rating)
* Hiển thị popup khuyến mãi
* Quản trị hệ thống

Không bao gồm:

* Hướng dẫn triển khai production
* Tài liệu hướng dẫn người dùng cuối

## 1.3 Định nghĩa và từ viết tắt

| Viết tắt | Nghĩa                             |
| -------- | --------------------------------- |
| SDD      | Software Design Document          |
| UI       | User Interface                    |
| UX       | User Experience                   |
| API      | Application Programming Interface |
| MVC      | Model – View – Controller         |
| CRUD     | Create – Read – Update – Delete   |
| JWT      | JSON Web Token                    |
| DTO      | Data Transfer Object              |
| ERD      | Entity Relationship Diagram       |

## 1.4 Tài liệu tham khảo

[1] SRS Template – GitHub Repository (2018)

---

# 2. Thiết kế tổng thể hệ thống

## 2.1 Kiến trúc hệ thống

Hệ thống sử dụng:

* Layered Architecture
* MVC Pattern

![architecture](images/architecture_simple.png)


Luồng tổng thể:

```
Client → Controller → Service → Repository → Database
```

![architecture](images/architecture.png)


Lợi ích:

* Phân tách trách nhiệm rõ ràng
* Dễ bảo trì
* Dễ mở rộng

## 2.2 Chi tiết từng tầng

### Client

* HTML, CSS, JavaScript

### Controller

* Nhận request
* Validate input
* Trả JSON response

### Service

* Xử lý business logic
* Kiểm tra tồn kho
* Tính tổng tiền

### Repository

* Thực hiện CRUD
* Query database

### Database

* PostgreSQL
* Lưu trữ dữ liệu

---

# 3. Thiết kế cơ sở dữ liệu

Hệ thống gồm các bảng chính:

* USERS
* CATEGORIES
* BRANDS
* PRODUCTS
* PRODUCT_VARIANTS
* PRODUCT_ATTRIBUTES
* CART
* CART_ITEM
* ORDERS
* ORDER_DETAILS
* COUPONS
* REVIEWS
* PROMOTION_POPUPS

![ERD](images/erd.png)

## 3.1 Bảng REVIEWS

| Cột          | Kiểu dữ liệu  | Ràng buộc              | Mô tả                        |
| ------------ | ------------- | ---------------------- | ---------------------------- |
| id           | BIGINT        | PK, AUTO_INCREMENT     | Khóa chính                   |
| product_id   | BIGINT        | NOT NULL, INDEX        | ID sản phẩm được đánh giá    |
| user_id      | BIGINT        | NOT NULL, INDEX        | ID người dùng viết đánh giá  |
| rating       | INT           | NOT NULL, INDEX, 1–5   | Số sao đánh giá              |
| comment      | TEXT          | NOT NULL               | Nội dung đánh giá            |
| created_at   | DATETIME      | NOT NULL               | Thời điểm tạo                |

## 3.2 Bảng PROMOTION_POPUPS

| Cột          | Kiểu dữ liệu  | Ràng buộc          | Mô tả                              |
| ------------ | ------------- | ------------------ | ---------------------------------- |
| id           | BIGINT        | PK, AUTO_INCREMENT | Khóa chính                         |
| title        | VARCHAR       | NOT NULL           | Tiêu đề popup                      |
| image_url    | VARCHAR       |                    | URL ảnh banner                     |
| coupon_id    | BIGINT        | FK → COUPONS       | Mã coupon liên kết (nếu có)        |
| product_id   | BIGINT        |                    | ID sản phẩm redirect (nếu có)      |
| description  | TEXT          |                    | Mô tả nội dung popup               |
| is_active    | BOOLEAN       |                    | Trạng thái hiển thị                |
| start_date   | DATETIME      |                    | Thời điểm bắt đầu hiển thị         |
| end_date     | DATETIME      |                    | Thời điểm kết thúc hiển thị        |

---

# 4. Thiết kế lớp

Các nhóm lớp:

* Quản lý người dùng
* Quản lý sản phẩm
* Giỏ hàng
* Đơn hàng
* Đánh giá sản phẩm
* Promotion Popup

Thiết kế đảm bảo:

* Phân tách trách nhiệm
* Giảm phụ thuộc
* Dễ mở rộng

![Class](images/class.png)

---

# 5. Thiết kế chi tiết

## 5.1 Module Quản lý người dùng

### 5.1.1 Tổng quan

Chức năng:

* Đăng ký
* Đăng nhập (trả về JWT token)
* Cập nhật thông tin
* Phân quyền (CUSTOMER / ADMIN)

### 5.1.2 Sequence – Đăng ký

![Sequence Register](images/register.png)

### 5.1.3 Sequence – Đăng nhập

![Sequence Login](images/login.png)

---

## 5.2 Module Xem và tìm kiếm sản phẩm

### 5.2.1 Tổng quan

Chức năng:

* Hiển thị danh sách
* Xem chi tiết
* Tìm kiếm
* Lọc sản phẩm

### 5.2.2 Sequence – Xem danh sách sản phẩm

![Sequence View List](images/view-list.png)

### 5.2.3 Sequence – Lọc sản phẩm

![Sequence Filter](images/filter.png)

### 5.2.4 Sequence – Tìm kiếm sản phẩm

![Sequence Search](images/search.png)

### 5.2.5 Sequence – Xem chi tiết sản phẩm

![Sequence Detail](images/detail.png)

---

## 5.3 Module Quản lý đơn hàng

### 5.3.1 Tổng quan

Chức năng:

* Tạo đơn hàng
* Cập nhật trạng thái
* Xem lịch sử

### 5.3.2 Sequence – Tạo đơn hàng

![Sequence Create Order](images/sequence-create-order.png)

### 5.3.3 Sequence – Xem lịch sử đơn hàng

![Sequence Order History](images/sequence-order-history.png)

### 5.3.4 Sequence – Theo dõi trạng thái đơn hàng

![Sequence Track Order](images/sequence-track-order.png)

---

## 5.4 Module Quản lý giỏ hàng

### 5.4.1 Tổng quan

Chức năng:

* Thêm sản phẩm
* Cập nhật số lượng
* Xóa sản phẩm

### 5.4.2 Sequence – Thêm vào giỏ hàng

![Sequence Add Cart](images/add_cart.png)

### 5.4.3 Sequence – Cập nhật số lượng

![Sequence Update Cart](images/update_cart.png)

### 5.4.4 Sequence – Xóa sản phẩm khỏi giỏ hàng

![Sequence Remove Cart](images/delete_cart.png)

---

## 5.5 Module Quản lý hệ thống (Admin)

### 5.5.1 Tổng quan

Chức năng:

* Thêm sản phẩm
* Cập nhật sản phẩm
* Quản lý biến thể
* Quản lý người dùng
* Quản lý Promotion Popup

### 5.5.2 Sequence – Thêm sản phẩm

![Sequence Add Product](images/sequence-add-product.png)

### 5.5.3 Sequence – Cập nhật thông tin sản phẩm

![Sequence Update Product](images/sequence-update-product.png)

---

## 5.6 Module Đánh giá sản phẩm (Review)

### 5.6.1 Tổng quan

Chức năng:

* Xem danh sách đánh giá theo sản phẩm (công khai)
* Lọc đánh giá theo số sao (1–5)
* Viết đánh giá mới (yêu cầu đăng nhập)
* Sửa đánh giá của chính mình
* Xóa đánh giá của chính mình
* Admin xóa bất kỳ đánh giá nào

### 5.6.2 Phân quyền

| Hành động         | Guest | Customer | Admin |
| ----------------- | ----- | -------- | ----- |
| Xem đánh giá      | ✓     | ✓        | ✓     |
| Lọc theo sao      | ✓     | ✓        | ✓     |
| Viết đánh giá     | ✗     | ✓        | ✗     |
| Sửa đánh giá      | ✗     | Của mình | ✓     |
| Xóa đánh giá      | ✗     | Của mình | ✓     |

### 5.6.3 API Endpoints

| Method | Endpoint                        | Quyền truy cập       | Mô tả                        |
| ------ | ------------------------------- | -------------------- | ---------------------------- |
| GET    | /api/reviews/{productId}        | Public               | Lấy danh sách đánh giá       |
| GET    | /api/reviews/{productId}?rating | Public               | Lọc đánh giá theo số sao     |
| POST   | /api/reviews                    | Authenticated        | Tạo đánh giá mới             |
| PUT    | /api/reviews/{id}               | Authenticated (owner)| Sửa đánh giá                 |
| DELETE | /api/reviews/{id}               | Authenticated        | Xóa đánh giá (owner/admin)   |

### 5.6.4 Cấu trúc lớp

```
ReviewController
    └── ReviewService (interface)
        └── ReviewServiceImpl
            ├── ReviewRepository
            └── UserRepository

DTO:
    ReviewCreateRequest  { productId, rating, comment }
    ReviewUpdateRequest  { rating, comment }
    ReviewResponse       { id, productId, userId, userName, rating, comment, createdAt }
```

---

## 5.7 Module Promotion Popup

### 5.7.1 Tổng quan

Chức năng:

* Hiển thị popup khuyến mãi lần đầu tiên mỗi tab truy cập trang chủ
* Admin quản lý popup (thêm, sửa, xóa, bật/tắt)
* Popup có thể liên kết đến sản phẩm hoặc trang shop
* Hỗ trợ gắn mã coupon vào popup

### 5.7.2 Logic hiển thị

* Sử dụng `sessionStorage` để kiểm soát: mỗi tab chỉ hiển thị popup một lần
* Hệ thống lấy popup đang active từ API `/api/public/popups/active`
* Popup active là popup có `is_active = true` và trong khoảng `start_date` – `end_date`

### 5.7.3 API Endpoints

| Method | Endpoint                    | Quyền truy cập | Mô tả                          |
| ------ | --------------------------- | -------------- | ------------------------------ |
| GET    | /api/public/popups/active   | Public         | Lấy popup đang active          |
| GET    | /api/popups                 | Admin          | Lấy toàn bộ danh sách popup    |
| POST   | /api/popups                 | Admin          | Tạo popup mới                  |
| PUT    | /api/popups/{id}            | Admin          | Cập nhật popup                 |
| DELETE | /api/popups/{id}            | Admin          | Xóa popup                      |

---

**Ghi chú:** Sau khi hoàn thiện sơ đồ tuần tự, thay thế các file ảnh trong thư mục `images/` tương ứng.

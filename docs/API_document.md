# TechGadget API Documentation

> **Base URL:** `https://techgadget-ecommerce-platform.onrender.com`
> **Phiên bản:** Spring Boot 4.0.3  
> **Xác thực:** JWT Bearer Token  
> **Content-Type:** `application/json` (trừ upload file)

---

## Định dạng Response chung

Tất cả API đều trả về cấu trúc `ApiResponse<T>`:

```json
{
  "success": true,
  "message": "Mô tả kết quả",
  "data": {}
}
```

| Trường  | Kiểu    | Mô tả                                  |
| ------- | ------- | -------------------------------------- |
| success | Boolean | `true` nếu thành công, `false` nếu lỗi |
| message | String  | Thông báo mô tả kết quả                |
| data    | T       | Dữ liệu trả về (null nếu lỗi)          |

---

## Xác thực (Authentication)

Các endpoint yêu cầu xác thực cần gửi JWT token trong header:

```
Authorization: Bearer <token>
```

Token có hiệu lực **24 giờ** kể từ khi đăng nhập.

---

## Mã lỗi HTTP phổ biến

| Mã  | Ý nghĩa                              |
| --- | ------------------------------------ |
| 200 | Thành công                           |
| 201 | Tạo mới thành công                   |
| 400 | Dữ liệu đầu vào không hợp lệ         |
| 401 | Chưa xác thực (thiếu hoặc sai token) |
| 403 | Không có quyền truy cập              |
| 404 | Không tìm thấy tài nguyên            |
| 500 | Lỗi server nội bộ                    |

---

# 1. Xác thực (Authentication)

**Base Path:** `/api/auth`  
**Yêu cầu token:** Không

---

### 1.1 Đăng ký tài khoản

**Endpoint:** `POST /api/auth/register`

**Request Body:**

| Trường   | Kiểu   | Bắt buộc | Mô tả                                           |
| -------- | ------ | -------- | ----------------------------------------------- |
| fullName | String | Không    | Họ và tên người dùng                            |
| email    | String | Có       | Địa chỉ email                                   |
| password | String | Có       | Mật khẩu                                        |
| role     | String | Không    | Vai trò: `USER` hoặc `ADMIN` (mặc định: `USER`) |

**Request Body mẫu:**

```json
{
  "fullName": "Nguyen Van A",
  "email": "user@example.com",
  "password": "password123",
  "role": "USER"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "id": 1,
    "fullName": "Nguyen Van A",
    "email": "user@example.com",
    "role": "USER"
  }
}
```

**Error Responses:**
| Mã | Trường hợp |
|----|-----------|
| 400 | Email đã tồn tại hoặc dữ liệu không hợp lệ |
| 500 | Lỗi server |

---

### 1.2 Đăng nhập

**Endpoint:** `POST /api/auth/login`

**Request Body:**

| Trường   | Kiểu   | Bắt buộc | Mô tả         |
| -------- | ------ | -------- | ------------- |
| email    | String | Có       | Địa chỉ email |
| password | String | Có       | Mật khẩu      |

**Request Body mẫu:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "id": 1,
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "role": "USER"
  }
}
```

**Error Responses:**
| Mã | Trường hợp |
|----|-----------|
| 400 | Sai email hoặc mật khẩu |
| 500 | Lỗi server |

---

# 2. Quản lý Người dùng (User Management)

**Base Path:** `/api/adminuser`  
**Yêu cầu token:** Không

---

### 2.1 Lấy danh sách tất cả người dùng

**Endpoint:** `GET /api/adminuser/user`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Lấy danh sách người dùng thành công",
  "data": [
    {
      "id": 1,
      "fullName": "Nguyen Van A",
      "email": "user@example.com",
      "role": "USER"
    }
  ]
}
```

---

### 2.2 Tìm kiếm người dùng theo email

**Endpoint:** `GET /api/adminuser/search`

**Query Parameters:**

| Tham số | Kiểu   | Bắt buộc | Mô tả              |
| ------- | ------ | -------- | ------------------ |
| email   | String | Có       | Email cần tìm kiếm |

**Ví dụ:** `GET /api/adminuser/search?email=user@example.com`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Tìm kiếm thành công",
  "data": [
    {
      "id": 1,
      "fullName": "Nguyen Van A",
      "email": "user@example.com",
      "role": "USER"
    }
  ]
}
```

**Error Responses:**
| Mã | Trường hợp |
|----|-----------|
| 400 | Thiếu tham số email |
| 404 | Không tìm thấy người dùng |

---

### 2.3 Reset mật khẩu Admin

**Endpoint:** `GET /api/adminuser/reset-password`

Reset mật khẩu admin về `admin123`.

**Success Response (200):**

```json
{
  "success": true,
  "message": "Reset mật khẩu thành công",
  "data": null
}
```

---

# 3. Sản phẩm (Products)

**Base Path:** `/api/products`  
**Yêu cầu token:** Không (GET) / Có (POST, PUT, DELETE)

---

### 3.1 Lấy danh sách sản phẩm (có lọc & phân trang)

**Endpoint:** `GET /api/products`

**Query Parameters:**

| Tham số          | Kiểu       | Bắt buộc | Mô tả                               |
| ---------------- | ---------- | -------- | ----------------------------------- |
| keyword          | String     | Không    | Từ khóa tìm kiếm theo tên           |
| brandId          | Long       | Không    | Lọc theo thương hiệu                |
| categoryId       | Long       | Không    | Lọc theo danh mục                   |
| minPrice         | BigDecimal | Không    | Giá tối thiểu                       |
| maxPrice         | BigDecimal | Không    | Giá tối đa                          |
| attributeFilters | String     | Không    | Lọc theo thuộc tính                 |
| ram              | String     | Không    | Lọc theo RAM                        |
| storage          | String     | Không    | Lọc theo bộ nhớ                     |
| page             | Integer    | Không    | Số trang (mặc định: 0)              |
| size             | Integer    | Không    | Số phần tử mỗi trang (mặc định: 10) |
| sort             | String     | Không    | Sắp xếp (ví dụ: `minPrice,asc`)     |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Lấy danh sách sản phẩm thành công",
  "data": {
    "content": [
      {
        "id": 1,
        "name": "iPhone 15 Pro",
        "image": "https://example.com/image.jpg",
        "minPrice": 25000000,
        "totalStock": 50,
        "totalSold": 120,
        "categoryName": "Điện thoại",
        "brandName": "Apple",
        "createdAt": "2024-01-15T10:00:00"
      }
    ],
    "totalElements": 100,
    "totalPages": 10,
    "size": 10,
    "number": 0
  }
}
```

---

### 3.2 Lấy chi tiết sản phẩm

**Endpoint:** `GET /api/products/{id}`

**Path Variables:**

| Tham số | Kiểu | Bắt buộc | Mô tả       |
| ------- | ---- | -------- | ----------- |
| id      | Long | Có       | ID sản phẩm |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Lấy sản phẩm thành công",
  "data": {
    "id": 1,
    "name": "iPhone 15 Pro",
    "description": "Điện thoại cao cấp của Apple",
    "image": "https://example.com/image.jpg",
    "createdAt": "2024-01-15T10:00:00",
    "category": {
      "id": 1,
      "name": "Điện thoại",
      "description": "Danh mục điện thoại"
    },
    "brand": {
      "brandId": 1,
      "brandName": "Apple",
      "createdAt": "2024-01-01T00:00:00"
    },
    "variants": [
      {
        "id": 1,
        "name": "128GB - Titan Đen",
        "sku": "IP15P-128-BLACK",
        "price": 27990000,
        "stock": 20,
        "sold": 50,
        "attributes": [
          { "attributeName": "RAM", "value": "8GB" },
          { "attributeName": "Storage", "value": "128GB" }
        ]
      }
    ],
    "minPrice": 27990000,
    "maxPrice": 34990000,
    "totalStock": 50
  }
}
```

**Error Responses:**
| Mã | Trường hợp |
|----|-----------|
| 404 | Không tìm thấy sản phẩm |

---

### 3.3 Tìm kiếm sản phẩm theo tên

**Endpoint:** `GET /api/products/search`

**Query Parameters:**

| Tham số | Kiểu    | Bắt buộc | Mô tả                |
| ------- | ------- | -------- | -------------------- |
| name    | String  | Có       | Tên sản phẩm cần tìm |
| page    | Integer | Không    | Số trang             |
| size    | Integer | Không    | Kích thước trang     |

---

### 3.4 Lấy sản phẩm liên quan

**Endpoint:** `GET /api/products/{id}/related`

**Path Variables:**

| Tham số | Kiểu | Bắt buộc | Mô tả       |
| ------- | ---- | -------- | ----------- |
| id      | Long | Có       | ID sản phẩm |

**Query Parameters:**

| Tham số | Kiểu    | Bắt buộc | Mô tả                                  |
| ------- | ------- | -------- | -------------------------------------- |
| limit   | Integer | Không    | Số lượng sản phẩm trả về (mặc định: 5) |

---

### 3.5 Lấy sản phẩm bán chạy nhất

**Endpoint:** `GET /api/products/top-selling`

**Query Parameters:**

| Tham số | Kiểu    | Bắt buộc | Mô tả                  |
| ------- | ------- | -------- | ---------------------- |
| limit   | Integer | Không    | Số lượng (mặc định: 5) |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Lấy top sản phẩm thành công",
  "data": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "image": "https://example.com/image.jpg",
      "minPrice": 27990000,
      "maxPrice": 34990000,
      "totalSold": 500
    }
  ]
}
```

---

### 3.6 Lấy sản phẩm mới nhất

**Endpoint:** `GET /api/products/newest`

**Query Parameters:**

| Tham số | Kiểu    | Bắt buộc | Mô tả                  |
| ------- | ------- | -------- | ---------------------- |
| limit   | Integer | Không    | Số lượng (mặc định: 5) |

---

### 3.7 Lấy bộ lọc theo danh mục

**Endpoint:** `GET /api/products/filters`

**Query Parameters:**

| Tham số    | Kiểu | Bắt buộc | Mô tả          |
| ---------- | ---- | -------- | -------------- |
| categoryId | Long | Có       | ID danh mục    |
| brandId    | Long | Không    | ID thương hiệu |

---

### 3.8 Tạo sản phẩm mới (Admin)

**Endpoint:** `POST /api/products`  
**Yêu cầu token:** Có

**Request Body:**

| Trường      | Kiểu                 | Bắt buộc | Mô tả              |
| ----------- | -------------------- | -------- | ------------------ |
| name        | String               | Có       | Tên sản phẩm       |
| description | String               | Không    | Mô tả sản phẩm     |
| image       | String               | Không    | URL ảnh sản phẩm   |
| categoryId  | Long                 | Có       | ID danh mục        |
| brandId     | Long                 | Có       | ID thương hiệu     |
| variants    | List<VariantRequest> | Không    | Danh sách biến thể |

**Request Body mẫu:**

```json
{
  "name": "iPhone 15 Pro",
  "description": "Điện thoại cao cấp của Apple",
  "image": "https://example.com/image.jpg",
  "categoryId": 1,
  "brandId": 1,
  "variants": [
    {
      "name": "128GB - Titan Đen",
      "price": 27990000,
      "stock": 20,
      "description": "Phiên bản 128GB màu Titan Đen",
      "attributes": [
        { "attributeId": 1, "value": "8GB" },
        { "attributeId": 2, "value": "128GB" }
      ]
    }
  ]
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Tạo sản phẩm thành công",
  "data": {
    /* ProductResponse */
  }
}
```

**Error Responses:**
| Mã | Trường hợp |
|----|-----------|
| 400 | Dữ liệu không hợp lệ |
| 401 | Chưa xác thực |
| 403 | Không có quyền Admin |
| 404 | Không tìm thấy danh mục hoặc thương hiệu |

---

### 3.9 Cập nhật sản phẩm (Admin)

**Endpoint:** `PUT /api/products/{id}`  
**Yêu cầu token:** Có

**Path Variables:** `id` (Long) - ID sản phẩm

**Request Body:** Tương tự `ProductCreateRequest`

---

### 3.10 Xóa sản phẩm (Admin)

**Endpoint:** `DELETE /api/products/{id}`  
**Yêu cầu token:** Có

**Path Variables:** `id` (Long) - ID sản phẩm

**Success Response (200):**

```json
{
  "success": true,
  "message": "Xóa sản phẩm thành công",
  "data": null
}
```

**Error Responses:**
| Mã | Trường hợp |
|----|-----------|
| 401 | Chưa xác thực |
| 403 | Không có quyền Admin |
| 404 | Không tìm thấy sản phẩm |

---

# 4. Danh mục (Categories)

**Base Path:** `/api/category`  
**Yêu cầu token:** Không (GET) / Có (POST, PUT, DELETE)

---

### 4.1 Lấy tất cả danh mục

**Endpoint:** `GET /api/category`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Lấy danh sách danh mục thành công",
  "data": [
    {
      "id": 1,
      "name": "Điện thoại",
      "description": "Danh mục điện thoại di động",
      "attributeIds": [1, 2, 3],
      "attributes": [
        { "attributeId": 1, "attributeName": "RAM", "dataType": "STRING" },
        { "attributeId": 2, "attributeName": "Storage", "dataType": "STRING" }
      ]
    }
  ]
}
```

---

### 4.2 Tìm kiếm danh mục theo tên

**Endpoint:** `GET /api/category/search`

**Query Parameters:**

| Tham số | Kiểu   | Bắt buộc | Mô tả                |
| ------- | ------ | -------- | -------------------- |
| name    | String | Có       | Tên danh mục cần tìm |

---

### 4.3 Lấy thuộc tính của danh mục

**Endpoint:** `GET /api/category/{id}/attributes`

**Path Variables:** `id` (Long) - ID danh mục

**Success Response (200):**

```json
{
  "success": true,
  "message": "Lấy thuộc tính thành công",
  "data": [{ "attributeId": 1, "attributeName": "RAM", "dataType": "STRING" }]
}
```

---

### 4.4 Lấy danh mục theo thương hiệu

**Endpoint:** `GET /api/category/brand/{brandId}`

**Path Variables:** `brandId` (Long) - ID thương hiệu

---

### 4.5 Tạo danh mục (Admin)

**Endpoint:** `POST /api/category`  
**Yêu cầu token:** Có

**Request Body:**

| Trường       | Kiểu      | Bắt buộc | Mô tả                            |
| ------------ | --------- | -------- | -------------------------------- |
| name         | String    | Có       | Tên danh mục                     |
| description  | String    | Không    | Mô tả danh mục                   |
| attributeIds | Set<Long> | Không    | Danh sách ID thuộc tính liên kết |

**Request Body mẫu:**

```json
{
  "name": "Laptop",
  "description": "Danh mục máy tính xách tay",
  "attributeIds": [1, 2, 3]
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Tạo danh mục thành công",
  "data": {
    "id": 2,
    "name": "Laptop",
    "description": "Danh mục máy tính xách tay",
    "attributeIds": [1, 2, 3],
    "attributes": []
  }
}
```

**Error Responses:**
| Mã | Trường hợp |
|----|-----------|
| 400 | Tên danh mục trống hoặc đã tồn tại |
| 401 | Chưa xác thực |
| 403 | Không có quyền Admin |

---

### 4.6 Cập nhật danh mục (Admin)

**Endpoint:** `PUT /api/category/{id}`  
**Yêu cầu token:** Có

**Path Variables:** `id` (Long) - ID danh mục  
**Request Body:** Tương tự `CategoryRequest`

---

### 4.7 Xóa danh mục (Admin)

**Endpoint:** `DELETE /api/category/{id}`  
**Yêu cầu token:** Có

**Path Variables:** `id` (Long) - ID danh mục

**Error Responses:**
| Mã | Trường hợp |
|----|-----------|
| 401 | Chưa xác thực |
| 403 | Không có quyền Admin |
| 404 | Không tìm thấy danh mục |

---

# 5. Thương hiệu (Brand Management)

**Base Path:** `/api/brands`  
**Yêu cầu token:** Có (POST, PUT, DELETE)

### 5.1 Lấy tất cả thương hiệu

**Endpoint:** `GET /api/brands`

### 5.2 Tìm kiếm thương hiệu theo tên

**Endpoint:** `GET /api/brands/search`

**Query Parameters:**

| Tham số | Kiểu   | Bắt buộc | Mô tả                   |
| ------- | ------ | -------- | ----------------------- |
| name    | String | Có       | Tên thương hiệu cần tìm |

### 5.3 Lấy thương hiệu theo danh mục

**Endpoint:** `GET /api/brands/category/{categoryId}`

**Path Variables:**

| Tham số    | Kiểu | Bắt buộc | Mô tả       |
| ---------- | ---- | -------- | ----------- |
| categoryId | Long | Có       | ID danh mục |

### 5.4 Tạo thương hiệu (Admin)

**Endpoint:** `POST /api/brands`  
**Yêu cầu token:** Có

**Request Body:**

```json
{
  "brandName": "Apple"
}
```

### 5.5 Cập nhật thương hiệu (Admin)

**Endpoint:** `PUT /api/brands/{id}`  
**Yêu cầu token:** Có

**Path Variables:** `id` (Long) - ID thương hiệu

**Request Body:**

```json
{
  "brandName": "Apple"
}
```

### 5.6 Xóa thương hiệu (Admin)

**Endpoint:** `DELETE /api/brands/{id}`  
**Yêu cầu token:** Có

**Path Variables:** `id` (Long) - ID thương hiệu

---

# 6. Thuộc tính (Attribute Management)

**Base Path:** `/api/attributes`  
**Yêu cầu token:** Có (POST, PUT, DELETE)

### 6.1 Lấy tất cả thuộc tính

**Endpoint:** `GET /api/attributes`

### 6.2 Tìm kiếm thuộc tính theo tên

**Endpoint:** `GET /api/attributes/search`

**Query Parameters:**

| Tham số | Kiểu   | Bắt buộc | Mô tả                  |
| ------- | ------ | -------- | ---------------------- |
| name    | String | Có       | Tên thuộc tính cần tìm |

### 6.3 Lấy thuộc tính theo ID

**Endpoint:** `GET /api/attributes/{id}`

### 6.4 Tạo thuộc tính (Admin)

**Endpoint:** `POST /api/attributes`  
**Yêu cầu token:** Có

**Request Body:**

```json
{
  "attributeName": "RAM",
  "dataType": "STRING"
}
```

### 6.5 Cập nhật thuộc tính (Admin)

**Endpoint:** `PUT /api/attributes/{id}`  
**Yêu cầu token:** Có

**Path Variables:** `id` (Long) - ID thuộc tính

**Request Body:**

```json
{
  "attributeName": "RAM",
  "dataType": "STRING"
}
```

### 6.6 Xóa thuộc tính (Admin)

**Endpoint:** `DELETE /api/attributes/{id}`  
**Yêu cầu token:** Có

---

# 7. Biến thể sản phẩm (Variant Management)

**Base Path:** `/api/variants`  
**Yêu cầu token:** Có (POST, PUT, DELETE)

### 7.1 Lấy biến thể theo ID

**Endpoint:** `GET /api/variants/{variantId}`

### 7.2 Tạo biến thể mới (Admin)

**Endpoint:** `POST /api/variants`  
**Yêu cầu token:** Có

**Request Body (ví dụ):**

```json
{
  "name": "iPhone 15 Pro 256GB",
  "price": 32990000,
  "stock": 20,
  "description": "Phiên bản 256GB",
  "productId": 1,
  "attributes": [
    { "attributeId": 1, "value": "256GB" },
    { "attributeId": 2, "value": "Silver" }
  ]
}
```

### 7.3 Cập nhật biến thể (Admin)

**Endpoint:** `PUT /api/variants/{id}`  
**Yêu cầu token:** Có

**Path Variables:** `id` (Long) - ID biến thể

### 7.4 Xóa biến thể (Admin)

**Endpoint:** `DELETE /api/variants/{id}`  
**Yêu cầu token:** Có

---

# 8. Mã giảm giá (Coupon Management)

## 8.1 Public coupon endpoints

**Base Path:** `/api/coupons`  
**Yêu cầu token:** Không (GET) / Có (POST validate)

### 8.1.1 Lấy coupon đang hoạt động

**Endpoint:** `GET /api/coupons/active`

### 8.1.2 Lấy coupon phù hợp khi checkout

**Endpoint:** `GET /api/coupons/checkout`

**Query Parameters:**

| Tham số     | Kiểu       | Bắt buộc | Mô tả         |
| ----------- | ---------- | -------- | ------------- |
| orderAmount | BigDecimal | Không    | Tổng đơn hàng |

### 8.1.3 Kiểm tra coupon

**Endpoint:** `POST /api/coupons/validate`

**Request Body:**

```json
{
  "code": "SALE10",
  "orderAmount": 1000000
}
```

## 8.2 Admin coupon endpoints

**Base Path:** `/api/admin/coupons`  
**Yêu cầu token:** Có

### 8.2.1 Lấy toàn bộ coupon

**Endpoint:** `GET /api/admin/coupons`

### 8.2.2 Tìm coupon theo code

**Endpoint:** `GET /api/admin/coupons/search`

**Query Parameters:**

| Tham số | Kiểu   | Bắt buộc | Mô tả     |
| ------- | ------ | -------- | --------- |
| code    | String | Có       | Mã coupon |

### 8.2.3 Lấy coupon theo ID

**Endpoint:** `GET /api/admin/coupons/{id}`

### 8.2.4 Tạo coupon (Admin)

**Endpoint:** `POST /api/admin/coupons`

**Request Body:**

```json
{
  "code": "SALE10",
  "type": "PERCENT",
  "value": 10,
  "minOrderAmount": 500000,
  "maxDiscountAmount": 100000,
  "startAt": "2026-05-01T00:00:00",
  "endAt": "2026-05-31T23:59:59",
  "usageLimit": 100,
  "usageLimitPerUser": 1,
  "isActive": true
}
```

### 8.2.5 Cập nhật coupon (Admin)

**Endpoint:** `PUT /api/admin/coupons/{id}`

### 8.2.6 Xóa coupon (Admin)

**Endpoint:** `DELETE /api/admin/coupons/{id}`

---

# 9. Giỏ hàng (Cart Management)

**Base Path:** `/api/cart`  
**Yêu cầu token:** Có

### 9.1 Lấy giỏ hàng hiện tại

**Endpoint:** `GET /api/cart`

### 9.2 Thêm sản phẩm vào giỏ

**Endpoint:** `POST /api/cart/items`

**Request Body:**

```json
{
  "variantId": 123,
  "quantity": 2
}
```

### 9.3 Cập nhật số lượng giỏ hàng

**Endpoint:** `PUT /api/cart/items`

**Request Body:**

```json
{
  "variantId": 123,
  "quantity": 3
}
```

### 9.4 Xóa sản phẩm khỏi giỏ

**Endpoint:** `DELETE /api/cart/items/{cartItemId}`

---

# 10. Đơn hàng (Order Management)

**Base Path:** `/api/orders`  
**Yêu cầu token:** Có

### 10.1 Lấy tất cả đơn hàng

**Endpoint:** `GET /api/orders`

### 10.2 Lấy đơn hàng của user hiện tại

**Endpoint:** `GET /api/orders/me`

### 10.3 Lấy đơn theo trạng thái

**Endpoint:** `GET /api/orders/status`

**Query Parameters:**

| Tham số | Kiểu   | Bắt buộc | Mô tả               |
| ------- | ------ | -------- | ------------------- |
| status  | String | Có       | Trạng thái đơn hàng |

### 10.4 Lấy chi tiết đơn hàng

**Endpoint:** `GET /api/orders/{id}`

### 10.5 Hủy đơn hàng

**Endpoint:** `POST /api/orders/{id}/cancel`

### 10.6 Cập nhật trạng thái đơn hàng (Admin)

**Endpoint:** `PUT /api/orders/{id}/status`

**Query Parameters:**

| Tham số | Kiểu   | Bắt buộc | Mô tả          |
| ------- | ------ | -------- | -------------- |
| status  | String | Có       | Trạng thái mới |

### 10.7 Checkout từ giỏ hàng

**Endpoint:** `POST /api/orders/checkout/cart`

### 10.8 Checkout buy-now

**Endpoint:** `POST /api/orders/checkout/buynow`

**Request Body:**

```json
{
  "shippingAddress": "123 Đường ABC, Quận 1, TP.HCM",
  "phoneNumber": "0123456789",
  "orderEmail": "user@example.com",
  "paymentMethod": "COD",
  "items": [{ "variantId": 123, "quantity": 2 }],
  "couponCode": "SALE10"
}
```

---

# 11. Đánh giá (Review Management)

**Base Path:** `/api/reviews`

### 11.1 Lấy danh sách đánh giá theo sản phẩm

**Endpoint:** `GET /api/reviews/{productId}`

**Query Parameters:**

| Tham số | Kiểu    | Bắt buộc | Mô tả           |
| ------- | ------- | -------- | --------------- |
| rating  | Integer | Không    | Lọc theo số sao |

### 11.2 Tạo đánh giá

**Endpoint:** `POST /api/reviews`
**Yêu cầu token:** Có

**Request Body:**

```json
{
  "productId": 1,
  "rating": 5,
  "comment": "Sản phẩm rất tốt"
}
```

### 11.3 Cập nhật đánh giá

**Endpoint:** `PUT /api/reviews/{id}`
**Yêu cầu token:** Có

### 11.4 Xóa đánh giá

**Endpoint:** `DELETE /api/reviews/{id}`
**Yêu cầu token:** Có

---

# 12. Promotion Popup

## 12.1 Public popup

**Endpoint:** `GET /api/public/popups/active`

## 12.2 Admin popup endpoints

**Base Path:** `/api/admin/popups`  
**Yêu cầu token:** Có

### 12.2.1 Lấy tất cả popup

**Endpoint:** `GET /api/admin/popups`

### 12.2.2 Lấy popup theo ID

**Endpoint:** `GET /api/admin/popups/{id}`

### 12.2.3 Tạo popup (Admin)

**Endpoint:** `POST /api/admin/popups`

**Request Body:**

```json
{
  "title": "Khuyến mãi mùa hè",
  "imageUrl": "https://example.com/banner.jpg",
  "couponId": 1,
  "productId": 10,
  "description": "Giảm giá lớn cho sản phẩm hot",
  "isActive": true,
  "startDate": "2026-05-01T00:00:00",
  "endDate": "2026-06-01T00:00:00"
}
```

### 12.2.4 Cập nhật popup (Admin)

**Endpoint:** `PUT /api/admin/popups/{id}`

### 12.2.5 Xóa popup (Admin)

**Endpoint:** `DELETE /api/admin/popups/{id}`

### 12.2.6 Upload ảnh popup

**Endpoint:** `POST /api/admin/popups/upload`
**Content-Type:** `multipart/form-data`

**Form field:** `file`

---

# 13. Thanh toán (Payment)

**Base Path:** `/api/payments`

### 13.1 Webhook thanh toán QR

**Endpoint:** `POST /api/payments/qr/webhook`

**Request Body:**

- Body JSON do PayOS gửi tới webhook

### 13.2 Kiểm tra trạng thái QR

**Endpoint:** `GET /api/payments/qr/{transactionId}`

**Path Variables:**

| Tham số       | Kiểu   | Bắt buộc | Mô tả           |
| ------------- | ------ | -------- | --------------- |
| transactionId | String | Có       | ID giao dịch QR |

---

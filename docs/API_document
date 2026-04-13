# TechGadget API Documentation

> **Base URL:** `http://localhost:8080`  
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
  "data": { }
}
```

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| success | Boolean | `true` nếu thành công, `false` nếu lỗi |
| message | String | Thông báo mô tả kết quả |
| data | T | Dữ liệu trả về (null nếu lỗi) |

---

## Xác thực (Authentication)

Các endpoint yêu cầu xác thực cần gửi JWT token trong header:

```
Authorization: Bearer <token>
```

Token có hiệu lực **24 giờ** kể từ khi đăng nhập.

---

## Mã lỗi HTTP phổ biến

| Mã | Ý nghĩa |
|----|---------|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 400 | Dữ liệu đầu vào không hợp lệ |
| 401 | Chưa xác thực (thiếu hoặc sai token) |
| 403 | Không có quyền truy cập |
| 404 | Không tìm thấy tài nguyên |
| 500 | Lỗi server nội bộ |

---

# 1. Xác thực (Authentication)

**Base Path:** `/api/auth`  
**Yêu cầu token:** Không

---

### 1.1 Đăng ký tài khoản

**Endpoint:** `POST /api/auth/register`

**Request Body:**

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| fullName | String | Không | Họ và tên người dùng |
| email | String | Có | Địa chỉ email |
| password | String | Có | Mật khẩu |
| role | String | Không | Vai trò: `USER` hoặc `ADMIN` (mặc định: `USER`) |

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

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| email | String | Có | Địa chỉ email |
| password | String | Có | Mật khẩu |

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

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| email | String | Có | Email cần tìm kiếm |

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

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| keyword | String | Không | Từ khóa tìm kiếm theo tên |
| brandId | Long | Không | Lọc theo thương hiệu |
| categoryId | Long | Không | Lọc theo danh mục |
| minPrice | BigDecimal | Không | Giá tối thiểu |
| maxPrice | BigDecimal | Không | Giá tối đa |
| attributeFilters | String | Không | Lọc theo thuộc tính |
| ram | String | Không | Lọc theo RAM |
| storage | String | Không | Lọc theo bộ nhớ |
| page | Integer | Không | Số trang (mặc định: 0) |
| size | Integer | Không | Số phần tử mỗi trang (mặc định: 10) |
| sort | String | Không | Sắp xếp (ví dụ: `minPrice,asc`) |

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

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | Long | Có | ID sản phẩm |

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

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| name | String | Có | Tên sản phẩm cần tìm |
| page | Integer | Không | Số trang |
| size | Integer | Không | Kích thước trang |

---

### 3.4 Lấy sản phẩm liên quan

**Endpoint:** `GET /api/products/{id}/related`

**Path Variables:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | Long | Có | ID sản phẩm |

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| limit | Integer | Không | Số lượng sản phẩm trả về (mặc định: 5) |

---

### 3.5 Lấy sản phẩm bán chạy nhất

**Endpoint:** `GET /api/products/top-selling`

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| limit | Integer | Không | Số lượng (mặc định: 5) |

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

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| limit | Integer | Không | Số lượng (mặc định: 5) |

---

### 3.7 Lấy bộ lọc theo danh mục

**Endpoint:** `GET /api/products/filters`

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| categoryId | Long | Có | ID danh mục |
| brandId | Long | Không | ID thương hiệu |

---

### 3.8 Tạo sản phẩm mới (Admin)

**Endpoint:** `POST /api/products`  
**Yêu cầu token:** Có

**Request Body:**

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| name | String | Có | Tên sản phẩm |
| description | String | Không | Mô tả sản phẩm |
| image | String | Không | URL ảnh sản phẩm |
| categoryId | Long | Có | ID danh mục |
| brandId | Long | Có | ID thương hiệu |
| variants | List<VariantRequest> | Không | Danh sách biến thể |

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
  "data": { /* ProductResponse */ }
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

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| name | String | Có | Tên danh mục cần tìm |

---

### 4.3 Lấy thuộc tính của danh mục

**Endpoint:** `GET /api/category/{id}/attributes`

**Path Variables:** `id` (Long) - ID danh mục

**Success Response (200):**
```json
{
  "success": true,
  "message": "Lấy thuộc tính thành công",
  "data": [
    { "attributeId": 1, "attributeName": "RAM", "dataType": "STRING" }
  ]
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

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| name | String | Có | Tên danh mục |
| description | String | Không | Mô tả danh mục |
| attributeIds | Set<Long> | Không | Danh sách ID thuộc tính liên kết |

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


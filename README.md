# TechGadget E-Commerce

TechGadget là dự án web bán hàng thiết bị công nghệ với 2 phần chính:

- `client/`: frontend viết bằng HTML, CSS, JavaScript thuần
- `server/`: backend REST API viết bằng Java 17 và Spring Boot

Hệ thống hiện có cả giao diện khách hàng và giao diện quản trị, hỗ trợ quản lý sản phẩm, biến thể, giỏ hàng, đơn hàng, coupon, popup khuyến mãi, đánh giá và thanh toán online.

## Link deploy

- Frontend: `https://techgadget-ecommerce-platform.vercel.app/`
- Backend: `https://techgadget-ecommerce-platform.onrender.com/`

## Tính năng hiện có

### Khách hàng

- Trang chủ, shop, tìm kiếm và chi tiết sản phẩm
- Đăng ký, đăng nhập, xem tài khoản
- Giỏ hàng và checkout
- Thanh toán qua PayOS
- Theo dõi đơn hàng và xem chi tiết đơn
- Đánh giá sản phẩm
- Tìm kiếm nâng cao, lọc và sắp xếp sản phẩm

### Quản trị

- Dashboard quản trị
- Đăng nhập admin
- Quản lý danh mục, thương hiệu, thuộc tính
- Quản lý sản phẩm và biến thể
- Quản lý coupon và popup khuyến mãi
- Quản lý đơn hàng
- Quản lý người dùng

## Công nghệ sử dụng

### Frontend

- HTML5
- CSS3
- JavaScript ES Modules
- Vercel rewrites cho routing phía client

### Backend

- Java 17
- Spring Boot 4
- Spring Web
- Spring Data JPA
- Spring Security
- PostgreSQL
- Maven

### Tích hợp ngoài

- PayOS cho thanh toán
- Meilisearch cho tìm kiếm sản phẩm

## Cấu trúc thư mục

```text
techgadget-ecommerce/
|-- client/
|   |-- index.html
|   |-- vercel.json
|   |-- modules/
|   |   |-- customer/
|   |   |   |-- assets/
|   |   |   |-- components/
|   |   |   |-- core/
|   |   |   `-- features/
|   |   `-- admin/
|   |       |-- components/
|   |       |-- core/
|   |       `-- features/
|   `-- shared/
|
|-- server/
|   |-- src/main/java/com/techgadget/server/
|   |   |-- config/
|   |   |-- controller/
|   |   |-- exception/
|   |   |-- model/
|   |   |-- repository/
|   |   `-- service/
|   |-- src/main/resources/
|   |   `-- application.properties
|   |-- Dockerfile
|   `-- pom.xml
|
|-- docs/
`-- README.md
```

## Routing frontend hiện tại

Frontend dùng `client/vercel.json` để map URL đẹp sang các file HTML tương ứng.

### Public routes

- `/home`
- `/login`
- `/register`
- `/account`
- `/cart`
- `/checkout`
- `/checkout/success`
- `/checkout/cancel`
- `/shop`
- `/search`
- `/products/:id`

### Admin routes

- `/admin`
- `/admin/login`
- `/admin/dashboard`
- `/admin/category`
- `/admin/brands`
- `/admin/attributes`
- `/admin/products`
- `/admin/products/:id`
- `/admin/popups`
- `/admin/discounts`
- `/admin/order`
- `/admin/order/:id`
- `/admin/users`

## Backend modules chính

Các controller hiện có trong backend:

- `AuthController`
- `ProductController`
- `CategoryController`
- `BrandController`
- `VariantController`
- `CartController`
- `OrderController`
- `PaymentController`
- `CouponController`
- `ReviewController`
- `UserController`
- `PromotionPopupPublicController`
- admin: `CouponController`, `PromotionPopupController`

## Chạy dự án local

### 1. Chạy backend

Yêu cầu:

- Java 17
- Maven
- PostgreSQL

Từ thư mục `server/`:

```bash
./mvnw spring-boot:run
```

Hoặc trên Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend production hiện tại:

```text
https://techgadget-ecommerce-platform.onrender.com
```

### 2. Chạy frontend

Frontend là static site. Có 2 cách phổ biến:

1. Deploy/chạy bằng Vercel để dùng đúng rewrites trong `vercel.json`
2. Serve trực tiếp file HTML nếu chỉ cần kiểm tra giao diện

Entry mặc định:

```text
client/index.html -> redirect sang /home
```

Nếu không dùng Vercel rewrites, có thể mở trực tiếp các file trong:

- `client/modules/customer/features/...`
- `client/modules/admin/features/...`

Frontend production hiện tại:

```text
https://techgadget-ecommerce-platform.vercel.app
```

## Cấu hình môi trường

Hiện backend đọc cấu hình từ `server/src/main/resources/application.properties`.

Các nhóm cấu hình chính đang được sử dụng:

- `spring.datasource.*`: kết nối PostgreSQL
- `payos.*`: cấu hình thanh toán PayOS
- `meilisearch.*`: cấu hình tìm kiếm
- `app.upload.dir`: thư mục upload
- `spring.servlet.multipart.*`: giới hạn file upload

Nên chuyển các giá trị nhạy cảm như database credentials, API keys và checksum keys sang biến môi trường trước khi deploy production.

## Gợi ý biến môi trường

Các biến môi trường đáng tách ra:

```text
PORT
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
PAYOS_RETURN_URL
PAYOS_CANCEL_URL
MEILISEARCH_HOST_URL
MEILISEARCH_API_KEY
MEILISEARCH_PRODUCT_INDEX_UID
MEILISEARCH_SYNC_BATCH_SIZE
```

## Ghi chú triển khai

- Frontend đang deploy trên Vercel
- Backend có `Dockerfile`, phù hợp deploy trên Render hoặc môi trường container khác
- Thư mục `uploads/` dùng để lưu file upload
- Thư mục `docs/` chứa tài liệu và hình minh họa dự án

## Trạng thái hiện tại của repo

Repo hiện không phải dạng SPA framework mà là multi-page app với:

- frontend thuần, chia module rõ cho `customer` và `admin`
- backend REST API tách riêng
- routing public/admin qua Vercel rewrites
- tích hợp thanh toán và tìm kiếm ngoài hệ thống

README này được cập nhật theo cấu trúc code hiện tại của repo, không còn theo cấu trúc cũ kiểu `client/js`, `client/css`, `client/pages`.

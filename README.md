# TechGadget E-Commerce

TechGadget là dự án web thương mại điện tử dành cho thiết bị công nghệ, bao gồm hai phần chính:

* `client/`: frontend viết bằng HTML, CSS, JavaScript thuần
* `server/`: backend REST API sử dụng Java 17 và Spring Boot

Hệ thống cung cấp cả giao diện khách hàng và quản trị, hỗ trợ quản lý sản phẩm, giỏ hàng, đơn hàng, thanh toán và các chức năng liên quan.

---

## Link deploy

* Frontend: [https://techgadget-ecommerce-platform.vercel.app/](https://techgadget-ecommerce-platform.vercel.app/)
* Backend: [https://techgadget-ecommerce-platform.onrender.com/](https://techgadget-ecommerce-platform.onrender.com/)

---

## Tài khoản demo

### Khách hàng

* Email: [dangvu@gmail.com](mailto:dangvu@gmail.com)
* Mật khẩu: 123456

### Quản trị viên

* Email: [admin@gmail.com](mailto:admin@gmail.com)
* Mật khẩu: admin123

---

## Tính năng

### Khách hàng

* Xem danh sách và chi tiết sản phẩm
* Tìm kiếm, lọc và sắp xếp sản phẩm
* Đăng ký, đăng nhập
* Giỏ hàng và đặt hàng
* Thanh toán qua PayOS
* Theo dõi đơn hàng
* Đánh giá sản phẩm

### Quản trị

* Dashboard quản lý
* Quản lý sản phẩm và biến thể
* Quản lý danh mục, thương hiệu, thuộc tính
* Quản lý đơn hàng
* Quản lý người dùng
* Quản lý mã giảm giá và popup

---

## Công nghệ sử dụng

### Frontend

* HTML5
* CSS3
* JavaScript (ES Modules)

### Backend

* Java 17
* Spring Boot
* Spring Data JPA
* Spring Security
* PostgreSQL

### Tích hợp

* PayOS (thanh toán)
---

## Cấu trúc thư mục

```text
techgadget-ecommerce/
|-- client/
|-- server/
|-- docs/
`-- README.md
```

---

## Chạy dự án

### Backend

Yêu cầu:

* Java 17
* Maven
* PostgreSQL

```bash
./mvnw spring-boot:run
```

### Frontend

* Có thể chạy bằng Vercel hoặc mở trực tiếp file HTML

---

## Cấu hình môi trường

Các biến môi trường cần thiết:

```text
PORT
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
PAYOS_RETURN_URL
PAYOS_CANCEL_URL
MEILISEARCH_HOST_URL
MEILISEARCH_API_KEY
```

---

## Triển khai

* Frontend: Vercel
* Backend: Render (Docker)
* Database: Supabase PostgreSQL

---

## Ghi chú

* Backend có thể được đóng gói bằng Docker để deploy
* Dữ liệu và cấu hình nên tách ra bằng biến môi trường
* Hệ thống được xây dựng theo mô hình Monolith với REST API

---

## Trạng thái dự án

* Ứng dụng đã hoàn thiện các chức năng chính
* Phù hợp cho mục đích học tập và demo
* Có thể mở rộng thêm trong tương lai

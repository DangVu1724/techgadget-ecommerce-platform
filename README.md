# TechGadget – E-Commerce Platform

## 1. Giới thiệu

**TechGadget** là hệ thống bán hàng trực tuyến được xây dựng nhằm hỗ trợ cửa hàng bán lẻ điện thoại và laptop quản lý sản phẩm, đơn hàng và khách hàng một cách hiệu quả.

Hệ thống giúp:

* Tự động hóa quy trình đặt hàng
* Quản lý tồn kho chính xác
* Giảm thao tác thủ công
* Cải thiện trải nghiệm mua sắm

---

## 2. Vấn đề đặt ra

Trước khi xây dựng hệ thống, cửa hàng gặp các khó khăn:

* Quản lý đơn hàng qua Facebook và điện thoại
* Không kiểm soát chính xác tồn kho
* Nhân viên mất thời gian trả lời tin nhắn lặp lại
* Khách hàng không theo dõi được trạng thái đơn hàng

---

## 3. Mục tiêu hệ thống

* Xây dựng website bán hàng chuyên nghiệp
* Cho phép khách hàng đặt hàng trực tuyến
* Quản lý sản phẩm và đơn hàng tập trung
* Cập nhật trạng thái đơn hàng minh bạch

---

## 4. Tính năng chính

### 4.1. Đối với khách hàng

* Xem danh sách sản phẩm
* Tìm kiếm sản phẩm
* Xem chi tiết sản phẩm
* Thêm / xóa sản phẩm khỏi giỏ hàng
* Đặt hàng
* Đăng nhập để theo dõi trạng thái đơn hàng

---

### 4.2. Đối với Admin

* Thêm / sửa / xóa sản phẩm
* Cập nhật giá và số lượng tồn kho
* Xem danh sách đơn hàng
* Cập nhật trạng thái đơn hàng

---

## 5. Công nghệ sử dụng

### Frontend (client)

* JavaScript thuần
* HTML5
* CSS3

Deploy: **Vercel**

---

### Backend (server)

* Java 17
* Spring Boot
* Spring Data JPA
* PostgreSQL
* Maven

Deploy: **Render** (Docker)

---

### Database

* PostgreSQL

---

## 6. Cấu trúc thư mục

```
techgadget/
├── client/              # Frontend
│   ├── js/
│   ├── css/
│   ├── pages/
│   └── index.html
│
├── server/              # Spring Boot Backend
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── model/
│   ├── config/
│   ├── Dockerfile
│   └── pom.xml
│
└── README.md
```

---

## 7. Quy trình hoạt động

### 7.1. Khách hàng mua hàng

```
Tìm kiếm sản phẩm
→ Xem chi tiết
→ Thêm vào giỏ hàng
→ Đặt hàng
→ Theo dõi trạng thái
```

### 7.2. Admin xử lý đơn hàng

```
Đăng nhập
→ Xem đơn hàng mới
→ Xác nhận
→ Cập nhật trạng thái "Đã giao"
```

---

## 8. Lợi ích hệ thống

* Hỗ trợ bán hàng 24/7
* Giảm sai sót tồn kho
* Quản lý tập trung
* Nâng cao trải nghiệm khách hàng

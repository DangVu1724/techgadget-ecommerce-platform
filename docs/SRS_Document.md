# **Software Requirements Specification**

# **Project: TechGadget E-Commerce**

**Version:** 1.1

**Author:** Đặng Vũ

**Nhóm:** 4

**Lớp:** HN25_CPL_OU_05

**Date:** 25/02/2026

---

## **Revision History**

| Name            | Date       | Description                                                   | Version |
| --------------- | ---------- | ------------------------------------------------------------- | ------- |
| Đặng Vũ         | 25/02/2026 | Initial draft                                                 | 0.1     |
| Đặng Vũ         | 25/03/2026 | Completed general Use Case list                               | 0.2     |
| Đặng Trung Kiên | 26/03/2026 | Drafted Use Cases and NFRs                                    | 0.3     |
| Đặng Vũ         | 26/03/2026 | Completed detailed Use Cases                                  | 0.4     |
| Đặng Vũ         | 27/02/2026 | Final formatting and document refinement                      | 0.9     |

---

# **1. Giới thiệu**

## **1.1 Mục đích**

Tài liệu Software Requirements Specification (SRS) mô tả đầy đủ các yêu cầu chức năng và phi chức năng của hệ thống TechGadget.

Tài liệu tập trung xác định **hệ thống cần làm gì**, không mô tả chi tiết cách triển khai kỹ thuật.

SRS được sử dụng xuyên suốt vòng đời phát triển phần mềm, làm cơ sở cho:

* Phân tích yêu cầu
* Thiết kế hệ thống
* Phát triển
* Kiểm thử
* Đánh giá và nghiệm thu

---

## **1.2 Phạm vi sản phẩm**

### **1.2.1 Tổng quan dự án**

**Project Name:** TechGadget E-Commerce Website
**Client:** TechGadget Store
**Owner:** Michael

Hiện tại cửa hàng đang xử lý đơn hàng thủ công qua Facebook và điện thoại. Khi lượng đơn tăng, phát sinh các vấn đề:

* Bỏ sót tin nhắn khách hàng
* Bán sản phẩm khi đã hết hàng
* Tốn nhiều thời gian phản hồi thủ công

Dự án được xây dựng nhằm phát triển một website thương mại điện tử giúp tự động hóa quy trình bán hàng.

---

### **1.2.2 Mục tiêu nghiệp vụ**

* Giảm xử lý thủ công
* Tránh bán sản phẩm hết hàng
* Cải thiện trải nghiệm khách hàng
* Tăng hiệu quả vận hành
* Xây dựng hình ảnh chuyên nghiệp

---

### **1.2.3 Chức năng chính**

1. **Product Catalog**
   * Hiển thị danh sách sản phẩm (lọc theo danh mục, thương hiệu, giá, thuộc tính)
   * Trang chi tiết sản phẩm với biến thể (variant), thông số kỹ thuật
   * Sản phẩm liên quan, sản phẩm bán chạy, sản phẩm mới nhất

2. **Product Search**
   * Tìm kiếm theo từ khóa
   * Không phân biệt hoa/thường

3. **Shopping Cart**
   * Thêm sản phẩm (theo variant)
   * Cập nhật số lượng
   * Xóa sản phẩm
   * Hiển thị tổng tiền

4. **Checkout & Payment**
   * Nhập thông tin đặt hàng (họ tên, địa chỉ, số điện thoại)
   * Áp dụng mã giảm giá (coupon)
   * Thanh toán COD (Cash on Delivery)
   * Thanh toán QR qua PayOS
   * Mua ngay (Buy Now) không qua giỏ hàng

5. **User Account**
   * Đăng ký / đăng nhập (JWT)
   * Xem lịch sử đơn hàng
   * Theo dõi trạng thái đơn
   * Cập nhật thông tin cá nhân

6. **Review & Rating**
   * Xem đánh giá sản phẩm (công khai)
   * Lọc đánh giá theo số sao
   * Viết, sửa, xóa đánh giá (yêu cầu đăng nhập)

7. **Promotion Popup**
   * Hiển thị popup khuyến mãi lần đầu mỗi tab
   * Liên kết đến sản phẩm hoặc coupon

8. **Admin Dashboard**
   * CRUD sản phẩm, biến thể, thuộc tính
   * Quản lý danh mục, thương hiệu
   * Quản lý đơn hàng và cập nhật trạng thái
   * Quản lý người dùng
   * Quản lý mã giảm giá (coupon)
   * Quản lý Promotion Popup

---

### **1.2.4 Đối tượng sử dụng**

**Guest (Khách truy cập)**
* Xem danh sách và chi tiết sản phẩm
* Tìm kiếm và lọc sản phẩm
* Xem đánh giá sản phẩm
* Xem popup khuyến mãi

**Customer (Khách hàng đã đăng nhập)**
* Tất cả quyền của Guest
* Quản lý giỏ hàng
* Đặt hàng và thanh toán (COD / QR)
* Xem lịch sử và theo dõi đơn hàng
* Viết, sửa, xóa đánh giá của mình
* Cập nhật thông tin cá nhân

**Admin**
* Tất cả quyền quản trị hệ thống
* CRUD sản phẩm, danh mục, thương hiệu, thuộc tính, biến thể
* Quản lý đơn hàng, người dùng, coupon, popup
* Xóa bất kỳ đánh giá nào

---

### **1.2.5 Giới hạn hệ thống**

* Tích hợp thanh toán QR qua PayOS (không hỗ trợ thẻ tín dụng, ví điện tử khác)
* Không tích hợp API vận chuyển (không tính phí ship tự động)
* Không có ứng dụng mobile riêng
* Thiết kế cho quy mô nhỏ và vừa
* Không sử dụng AI nâng cao
* Không hỗ trợ đa ngôn ngữ

---

## **1.3 Định nghĩa từ viết tắt**

| Term    | Meaning                             |
| ------- | ----------------------------------- |
| SRS     | Software Requirements Specification |
| SDD     | Software Design Document            |
| UI      | User Interface                      |
| UX      | User Experience                     |
| API     | Application Programming Interface   |
| UC      | Use Case                            |
| Admin   | Administrator                       |
| JWT     | JSON Web Token                      |
| COD     | Cash on Delivery                    |
| QR      | Quick Response (thanh toán QR)      |
| CRUD    | Create, Read, Update, Delete        |
| SKU     | Stock Keeping Unit                  |

---

## **1.4 Tài liệu tham khảo**

[1] Jose Montoya and Aslak Tangen, *SRS Template*, GitHub Repository, 2018.

---

## **1.5 Cấu trúc tài liệu**

* Chapter 1: Introduction
* Chapter 2: Overall Description
* Chapter 3: System Requirements

---

# **2. Tổng quan hệ thống**

## **2.1 Bối cảnh sản phẩm**

TechGadget là hệ thống web-based hoạt động theo mô hình Client–Server gồm:

* Frontend (HTML, CSS, JavaScript)
* Backend (Spring Boot REST API)
* Database (PostgreSQL)

Xác thực người dùng sử dụng JWT token. Thanh toán hỗ trợ COD và QR qua PayOS.

---

## **2.2 Các nhóm chức năng chính**

* User Management (Đăng ký, đăng nhập, cập nhật thông tin)
* Product Management (Sản phẩm, biến thể, thuộc tính, danh mục, thương hiệu)
* Cart Management (Giỏ hàng)
* Order Management (Đặt hàng, thanh toán, theo dõi)
* Coupon Management (Mã giảm giá)
* Review Management (Đánh giá sản phẩm)
* Promotion Popup Management (Popup khuyến mãi)
* Admin Management (Quản trị toàn hệ thống)

---

## **2.3 Đặc điểm người dùng**

* Khách hàng: Trình độ công nghệ cơ bản, quen dùng smartphone và trình duyệt web
* Admin: Có kiến thức quản lý dữ liệu cơ bản, không cần kỹ năng lập trình

---

## **2.4 Ràng buộc**

**Technical Constraints**

* Backend: Java Spring Boot
* Database: PostgreSQL
* Frontend: HTML, CSS, JavaScript (Vanilla)
* Authentication: JWT (JSON Web Token)
* Payment: PayOS (QR), COD

**Operational Constraints**

* Hosting chi phí thấp
* Chỉ hỗ trợ thanh toán QR (PayOS) và COD, không tích hợp thẻ ngân hàng trực tiếp

**Security Constraints**

* Mật khẩu mã hóa bằng bcrypt
* Phân quyền RBAC (Role-Based Access Control): ADMIN / CUSTOMER
* Bảo vệ API bằng JWT filter

---

## **2.5 Giả định và phụ thuộc**

**Assumptions**

* Người dùng có kết nối Internet ổn định
* Chủ cửa hàng cung cấp đủ dữ liệu sản phẩm ban đầu
* Tài khoản PayOS đã được cấu hình sẵn cho thanh toán QR

**Dependencies**

* Server hosting
* PostgreSQL database
* Trình duyệt hiện đại (Chrome, Firefox, Safari, Edge)
* PayOS API (cho thanh toán QR)

---

## **2.6 Phân chia yêu cầu**

### Version 1 (Đã triển khai)

* Authentication (JWT)
* Product catalog, search, filter
* Shopping cart
* Checkout với COD và QR Payment (PayOS)
* Buy Now (mua ngay)
* Coupon / mã giảm giá
* Order management
* Admin management (sản phẩm, danh mục, thương hiệu, thuộc tính, biến thể, đơn hàng, người dùng, coupon)
* Promotion popup
* Product review & rating

### Future Version

* Recommendation system (gợi ý sản phẩm AI)
* Wishlist (danh sách yêu thích)
* So sánh sản phẩm
* Thông báo email tự động
* Tích hợp API vận chuyển

---

# 3. Yêu cầu hệ thống

## 3.1. Yêu cầu chức năng

### 3.1.1. Ma trận Use Case

#### Module: Quản lý tài khoản người dùng

| UC ID | Tên                        | Mô tả                                           | Lý do                                                      | Actor      |
| ----- | -------------------------- | ----------------------------------------------- | ---------------------------------------------------------- | ---------- |
| UC001 | Đăng ký                    | Người dùng tạo tài khoản bằng email và mật khẩu | Khách cần tài khoản để đặt hàng và theo dõi đơn hàng       | Khách hàng |
| UC002 | Đăng nhập                  | Người dùng đăng nhập, hệ thống trả về JWT token | Cho phép truy cập giỏ hàng, lịch sử đơn và trạng thái đơn  | Khách hàng |
| UC003 | Cập nhật thông tin cá nhân | Người dùng chỉnh sửa họ tên, địa chỉ, số điện thoại | Đảm bảo thông tin giao hàng chính xác                  | Khách hàng |

#### Module: Xem và tìm kiếm sản phẩm

| UC ID | Tên                          | Mô tả                                                              | Lý do                                        | Actor                      |
| ----- | ---------------------------- | ------------------------------------------------------------------ | -------------------------------------------- | -------------------------- |
| UC004 | Xem danh sách sản phẩm       | Hiển thị sản phẩm, lọc theo danh mục / thương hiệu / giá / thuộc tính | Giảm việc khách phải nhắn tin hỏi giá    | Khách truy cập, Khách hàng |
| UC005 | Lọc sản phẩm                 | Lọc theo danh mục, thương hiệu, khoảng giá, thuộc tính             | Giúp khách tìm nhanh hơn                     | Khách truy cập, Khách hàng |
| UC006 | Tìm kiếm sản phẩm            | Tìm theo từ khóa tên sản phẩm                                      | Đáp ứng nhu cầu tìm nhanh                    | Khách truy cập, Khách hàng |
| UC007 | Xem chi tiết sản phẩm        | Hiển thị giá, mô tả, tồn kho, biến thể, thông số kỹ thuật          | Tránh bán sản phẩm hết hàng gây bức xúc      | Khách truy cập, Khách hàng |

#### Module: Quản lý giỏ hàng

| UC ID | Tên                   | Mô tả                              | Lý do                               | Actor      |
| ----- | --------------------- | ---------------------------------- | ----------------------------------- | ---------- |
| UC008 | Thêm vào giỏ hàng     | Thêm variant sản phẩm vào giỏ      | Thay thế việc đặt hàng qua Facebook | Khách hàng |
| UC009 | Cập nhật số lượng     | Tăng/giảm số lượng sản phẩm        | Cho phép khách thay đổi quyết định  | Khách hàng |
| UC010 | Xóa sản phẩm khỏi giỏ | Loại bỏ sản phẩm khỏi giỏ hàng    | Linh hoạt trước khi thanh toán      | Khách hàng |

#### Module: Checkout & Thanh toán

| UC ID | Tên                          | Mô tả                                                        | Lý do                                              | Actor      |
| ----- | ---------------------------- | ------------------------------------------------------------ | -------------------------------------------------- | ---------- |
| UC011 | Tạo đơn hàng từ giỏ hàng     | Checkout từ giỏ hàng, chọn COD hoặc QR, áp coupon           | Tự động hóa quy trình đặt hàng                     | Khách hàng |
| UC011b| Mua ngay (Buy Now)           | Đặt hàng trực tiếp từ trang chi tiết sản phẩm, không qua giỏ | Rút ngắn quy trình mua hàng                        | Khách hàng |
| UC011c| Áp dụng mã giảm giá          | Nhập coupon code khi checkout để được giảm giá               | Khuyến khích mua hàng, tăng doanh thu              | Khách hàng |
| UC011d| Thanh toán QR (PayOS)        | Quét mã QR để thanh toán online qua PayOS                    | Hỗ trợ thanh toán không tiền mặt                   | Khách hàng |

#### Module: Quản lý đơn hàng

| UC ID | Tên                          | Mô tả                                                                              | Lý do                                    | Actor      |
| ----- | ---------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------- | ---------- |
| UC012 | Xem lịch sử đơn hàng         | Hiển thị các đơn đã mua kèm trạng thái                                             | Khách muốn xem lại đơn cũ                | Khách hàng |
| UC013 | Theo dõi trạng thái đơn hàng | Xem trạng thái: PENDING / CONFIRMED / PROCESSING / SHIPPING / DELIVERED / CANCELLED | Giảm câu hỏi "Đơn của tôi tới đâu rồi?" | Khách hàng |
| UC013b| Hủy đơn hàng                 | Khách hàng hủy đơn khi đơn chưa được xử lý                                        | Cho phép thay đổi quyết định             | Khách hàng |

#### Module: Quản trị hệ thống (Admin)

| UC ID | Tên                          | Mô tả                                                  | Lý do                              | Actor |
| ----- | ---------------------------- | ------------------------------------------------------ | ---------------------------------- | ----- |
| UC014 | Quản lý sản phẩm             | CRUD sản phẩm, upload ảnh, gắn danh mục và thương hiệu | Tránh bán hàng hết tồn             | Admin |
| UC014b| Quản lý biến thể (Variant)   | Thêm/sửa/xóa variant với SKU, giá, tồn kho, thuộc tính | Quản lý chính xác từng phiên bản sản phẩm | Admin |
| UC015 | Quản lý danh mục             | Thêm/Sửa/Xóa danh mục, gắn thuộc tính cho danh mục    | Tổ chức sản phẩm rõ ràng           | Admin |
| UC015b| Quản lý thương hiệu (Brand)  | Thêm/Sửa/Xóa thương hiệu sản phẩm                     | Phân loại sản phẩm theo hãng       | Admin |
| UC015c| Quản lý thuộc tính (Attribute)| Thêm/Sửa/Xóa thuộc tính (RAM, Storage, Color...)      | Mô tả chi tiết đặc tính sản phẩm  | Admin |
| UC016 | Cập nhật trạng thái đơn hàng | Đổi trạng thái đơn (CONFIRMED / SHIPPING / DELIVERED…) | Để khách theo dõi được đơn         | Admin |
| UC017 | Quản lý người dùng           | Xem, tìm kiếm theo email, khóa/mở khóa tài khoản      | Quản lý hệ thống và xử lý vi phạm  | Admin |
| UC017b| Quản lý mã giảm giá (Coupon) | CRUD coupon (PERCENT/FIXED), giới hạn sử dụng, ngày hiệu lực | Điều hành chương trình khuyến mãi | Admin |

#### Module: Đánh giá sản phẩm (Review)

| UC ID | Tên                        | Mô tả                                                   | Lý do                                   | Actor                      |
| ----- | -------------------------- | ------------------------------------------------------- | --------------------------------------- | -------------------------- |
| UC018 | Xem đánh giá sản phẩm      | Hiển thị danh sách đánh giá, lọc theo số sao, đếm tổng  | Giúp khách hàng tham khảo trước khi mua | Khách truy cập, Khách hàng |
| UC019 | Viết đánh giá sản phẩm     | Khách hàng gửi đánh giá (số sao 1–5 + nội dung)         | Thu thập phản hồi thực tế từ người mua  | Khách hàng                 |
| UC020 | Sửa/Xóa đánh giá           | Khách hàng sửa/xóa đánh giá của mình; Admin xóa bất kỳ | Cho phép chỉnh sửa và kiểm duyệt        | Khách hàng, Admin          |

#### Module: Promotion Popup

| UC ID | Tên                     | Mô tả                                                 | Lý do                                  | Actor                      |
| ----- | ----------------------- | ----------------------------------------------------- | -------------------------------------- | -------------------------- |
| UC021 | Xem popup khuyến mãi    | Hiển thị popup lần đầu mỗi tab truy cập trang chủ     | Tăng nhận diện chương trình khuyến mãi | Khách truy cập, Khách hàng |
| UC022 | Quản lý Promotion Popup | Admin thêm, sửa, xóa, bật/tắt popup khuyến mãi       | Linh hoạt điều chỉnh chiến dịch marketing | Admin                   |

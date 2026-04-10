# **Software Requirements Specification**

# **Project: TechGadget E-Commerce**

**Version:** 0.9

**Author:** Đặng Vũ

**Nhóm:** 4 

**Lớp:** HN25_CPL_OU_05

**Date:** 25/02/2026

---

## **Revision History**

| Name            | Date       | Description                              | Version |
| --------------- | ---------- | ---------------------------------------- | ------- |
| Đặng Vũ         | 25/02/2026 | Initial draft                            | 0.1     |
| Đặng Vũ         | 25/03/2026 | Completed general Use Case list          | 0.2     |
| Đặng Trung Kiên | 26/03/2026 | Drafted Use Cases and NFRs               | 0.3     |
| Đặng Vũ         | 26/03/2026 | Completed detailed Use Cases             | 0.4     |
| Đặng Vũ         | 27/02/2026 | Final formatting and document refinement | 0.9     |

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

   * Hiển thị danh sách sản phẩm
   * Trang chi tiết sản phẩm

2. **Product Search**

   * Tìm kiếm theo từ khóa
   * Không phân biệt hoa/thường
   * Hỗ trợ sai chính tả cơ bản

3. **Shopping Cart**

   * Thêm sản phẩm
   * Cập nhật số lượng
   * Xóa sản phẩm
   * Hiển thị tổng tiền

4. **Checkout**

   * Nhập thông tin đặt hàng
   * Thanh toán giả lập
   * Tạo đơn hàng

5. **User Account**

   * Đăng ký / đăng nhập
   * Xem lịch sử đơn hàng
   * Theo dõi trạng thái

6. **Admin Dashboard**

   * CRUD sản phẩm
   * Quản lý đơn hàng
   * Cập nhật trạng thái
   * Theo dõi tồn kho

---

### **1.2.4 Đối tượng sử dụng**

**Guest**

* Xem và tìm kiếm sản phẩm

**Customer**

* Đăng ký / đăng nhập
* Đặt hàng
* Theo dõi đơn

**Admin**

* Quản lý sản phẩm
* Quản lý đơn hàng
* Cập nhật tồn kho

---

### **1.2.5 Giới hạn hệ thống**

* Không tích hợp thanh toán trực tuyến thực tế
* Không tích hợp API vận chuyển
* Không có ứng dụng mobile riêng
* Thiết kế cho quy mô nhỏ và vừa
* Không sử dụng AI nâng cao
* Không hỗ trợ đa ngôn ngữ

---

## **1.3 Định nghĩa từ viết tắt**

| Term  | Meaning                             |
| ----- | ----------------------------------- |
| SRS   | Software Requirements Specification |
| SDD   | Software Design Document            |
| UI    | User Interface                      |
| UX    | User Experience                     |
| API   | Application Programming Interface   |
| UC    | Use Case                            |
| Admin | Administrator                       |

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

* Frontend (UI)
* Backend (Business Logic & API)
* Database (MySQL)

Thanh toán thực hiện theo phương thức giả lập hoặc COD.

---

## **2.2 Các nhóm chức năng chính**

* User Management
* Product Management
* Cart Management
* Order Management
* Admin Management

---

## **2.3 Đặc điểm người dùng**

* Khách hàng: Trình độ công nghệ cơ bản
* Admin: Có kiến thức quản lý dữ liệu cơ bản

---

## **2.4 Ràng buộc**

**Technical Constraints**

* Backend: Java Spring Boot
* Database: MySQL
* Frontend: HTML, CSS, JS

**Operational Constraints**

* Hosting chi phí thấp
* Không tích hợp thanh toán thật

**Security Constraints**

* Bảo mật thông tin người dùng

---

## **2.5 Giả định và phụ thuộc**

**Assumptions**

* Người dùng có Internet
* Chủ cửa hàng cung cấp đủ dữ liệu

**Dependencies**

* Server hosting
* MySQL
* Modern browsers

---

## **2.6 Phân chia yêu cầu**

### Version 1

* Authentication
* Search
* Cart
* Fake payment
* Admin management

### Future Version

* Recommendation system
* Promotion popup
* Product review & rating

---
# 3. Yêu cầu hệ thống

## 3.1. Yêu cầu chức năng

### 3.1.1. Ma trận Use Case

#### Module: Quản lý tài khoản người dùng

| UC ID | Tên                        | Mô tả                                           | Lý do                                                     | Actor      |
| ----- | -------------------------- | ----------------------------------------------- | --------------------------------------------------------- | ---------- |
| UC001 | Đăng ký                    | Người dùng tạo tài khoản bằng email và mật khẩu | Khách cần tài khoản để đặt hàng và theo dõi đơn hàng      | Khách hàng |
| UC002 | Đăng nhập                  | Người dùng đăng nhập vào hệ thống               | Cho phép truy cập giỏ hàng, lịch sử đơn và trạng thái đơn | Khách hàng |
| UC003 | Cập nhật thông tin cá nhân | Người dùng chỉnh sửa thông tin cá nhân          | Đảm bảo giao hàng chính xác                               | Khách hàng |

#### Module: Xem và tìm kiếm sản phẩm

| UC ID | Tên                        | Mô tả                                                           | Lý do                                       | Actor                      |
| ----- | -------------------------- | --------------------------------------------------------------- | ------------------------------------------- | -------------------------- |
| UC004 | Xem danh sách sản phẩm     | Hiển thị toàn bộ laptop, điện thoại                             | Giảm việc khách phải nhắn tin hỏi giá       | Khách truy cập, Khách hàng |
| UC005 | Lọc sản phẩm theo danh mục | Lọc theo Laptop / Điện thoại                                    | Giúp khách tìm nhanh hơn                    | Khách truy cập, Khách hàng |
| UC006 | Tìm kiếm sản phẩm          | Tìm theo từ khóa (hỗ trợ gợi ý & sửa lỗi chính tả như "samung") | Đáp ứng nhu cầu tìm nhanh như email yêu cầu | Khách truy cập, Khách hàng |
| UC007 | Xem chi tiết sản phẩm      | Hiển thị giá, mô tả, tồn kho                                    | Tránh bán sản phẩm hết hàng gây bức xúc     | Khách truy cập, Khách hàng |

#### Module: Quản lý giỏ hàng

| UC ID | Tên                   | Mô tả                       | Lý do                               | Actor      |
| ----- | --------------------- | --------------------------- | ----------------------------------- | ---------- |
| UC008 | Thêm vào giỏ hàng     | Thêm sản phẩm vào giỏ       | Thay thế việc đặt hàng qua Facebook | Khách hàng |
| UC009 | Cập nhật số lượng     | Tăng/giảm số lượng sản phẩm | Cho phép khách thay đổi quyết định  | Khách hàng |
| UC010 | Xóa sản phẩm khỏi giỏ | Loại bỏ sản phẩm            | Linh hoạt trước khi thanh toán      | Khách hàng |

#### Module: Quản lý đơn hàng

| UC ID | Tên                          | Mô tả                               | Lý do                                    | Actor      |
| ----- | ---------------------------- | ----------------------------------- | ---------------------------------------- | ---------- |
| UC011 | Tạo đơn hàng                 | Xác nhận đặt hàng (fake payment)    | Anh Michael chưa muốn tích hợp ngân hàng | Khách hàng |
| UC012 | Xem lịch sử đơn hàng         | Hiển thị các đơn đã mua             | Khách muốn xem lại đơn cũ                | Khách hàng |
| UC013 | Theo dõi trạng thái đơn hàng | Xem trạng thái: Đang xử lý / Đã gửi | Giảm câu hỏi “Đơn của tôi tới đâu rồi?”  | Khách hàng |

#### Module: Quản trị hệ thống (Admin)

| UC ID | Tên                          | Mô tả                              | Lý do                             | Actor |
| ----- | ---------------------------- | ---------------------------------- | --------------------------------- | ----- |
| UC014 | Thêm/Sửa/Xóa sản phẩm        | Quản lý sản phẩm, giá, tồn kho     | Tránh bán hàng hết tồn            | Admin |
| UC015 | Quản lý danh mục             | Thêm/Sửa/Xóa danh mục              | Tổ chức sản phẩm rõ ràng          | Admin |
| UC016 | Cập nhật trạng thái đơn hàng | Đổi trạng thái thành “Shipped”     | Để khách theo dõi được đơn        | Admin |
| UC017 | Quản lý người dùng           | Xem, khóa tài khoản dựa trên email | Quản lý hệ thống và xử lý vi phạm | Admin 


### **3.1.2. Usecase chi tiết** {#3.1.2.-usecase-chi-tiết}

1. UC001: Đăng ký tài khoản

| Thuộc tính | Nội dung |  |
| ----- | ----- | :---- |
| **Use Case ID** | UC001 |  |
| **Tên Use Case** | Đăng ký tài khoản |  |
| **Tác nhân chính** | Khách hàng |  |
| **Tác nhân phụ** | Hệ thống |  |
| **Mô tả** | Người dùng đăng ký tài khoản mới để sử dụng các chức năng hệ thống. |  |
| **Sự kiện kích hoạt** | Người dùng nhấn nút “Đăng ký” trên giao diện |  |
| **Tiền điều kiện** | Người dùng chưa có tài khoản và hệ thống hoạt động bình thường |  |
| **Hậu điều kiện (Thành công)** | Tài khoản được tạo và lưu vào cơ sở dữ liệu; người dùng có thể đăng nhập vào hệ thống. |  |
| **Hậu điều kiện (Thất bại)** | Tài khoản không được tạo và hệ thống hiển thị thông báo lỗi tương ứng. |  |
| **Luồng chính** | 1 | Khách hàng truy cập trang đăng ký. |
|  | 2 | Hệ thống hiển thị form đăng ký. |
|  | 3 | Khách hàng nhập đầy đủ thông tin (email, mật khẩu, họ tên…) |
|  | 4 | Khách hàng nhấn nút “Xác nhận đăng ký”. |
|  | 5 | Hệ thống kiểm tra tính hợp lệ của dữ liệu và tạo tài khoản mới. |
|  | 6 | Hệ thống thông báo đăng ký thành công và chuyển về trang chủ |
| **Luồng thay thế** | 4a | Khách hàng nhập thiếu hoặc sai định dạng dữ liệu → Hệ thống hiển thị thông báo lỗi và yêu cầu nhập lại. |
|  | 5a | Email đã tồn tại trong hệ thống → Hệ thống thông báo “Email đã được sử dụng”. |

2. UC002: Đăng nhập tài khoản

| Thuộc tính | Nội dung |  |
| ----- | ----- | :---- |
| **Use Case ID** | UC002 |  |
| **Tên Use Case** | Đăng nhập tài khoản |  |
| **Tác nhân chính** | Khách hàng |  |
| **Tác nhân phụ** | Hệ thống |  |
| **Mô tả** | Khách hàng đăng nhập vào hệ thống để sử dụng các chức năng hệ thống |  |
| **Sự kiện kích hoạt** | Người dùng nhấn nút “Đăng nhập” trên hệ thống website |  |
| **Tiền điều kiện** | Người dùng đã có tài khoản trên hệ thống  |  |
| **Hậu điều kiện (Thành công)** | Khách hàng đăng nhập vào hệ thống |  |
| **Hậu điều kiện (Thất bại)** | Khách hàng đăng nhập không thành công |  |
| **Luồng chính** | 1 | Khách hàng chọn chức năng đăng nhập |
|  | 2 | Hệ thống hiển thị giao diện đăng nhập |
|  | 3 | Khách hàng nhập tài khoản và mật khẩu |
|  | 4 | Khách hàng nhấn nút Đăng nhập |
|  | 5 | Hệ thống kiểm tra khách hàng có nhập đúng yêu cầu bắt buộc của hệ thống không |
|  | 6 | Hệ thống kiểm tra dữ liệu của người dùng ở database |
|  | 7 | Hệ thống hiện thị trang chủ và các chức năng tương ứng đối với người dùng |
| **Luồng thay thế** | 5a | Hệ thống thông báo lỗi: cần đăng nhập đủ và đúng yêu cầu bắt buộc khi khách nhập sai |
|  | 6a | Hệ thống thông báo lỗi: mật khẩu, tài khoản không chính xác hoặc chưa được đăng kí |

3. UC003: Cập nhật thông tin cá nhân

| Thuộc tính | Nội dung |  |
| ----- | ----- | :---- |
| **Use Case ID** | UC003 |  |
| **Tên Use Case** | Cập nhật thông tin cá nhân |  |
| **Tác nhân chính** | Khách hàng |  |
| **Tác nhân phụ** | Hệ thống |  |
| **Mô tả** | Người dùng chỉnh sửa thông tin tài khoản. |  |
| **Sự kiện kích hoạt** | Người dùng chọn “Thông tin cá nhân”. |  |
| **Tiền điều kiện** | Người dùng đã đăng nhập. |  |
| **Hậu điều kiện (Thành công)** | Thông tin được cập nhật. |  |
| **Hậu điều kiện (Thất bại)** | Thông tin không được thay đổi. |  |
| **Luồng chính** | 1 | Người dùng chỉnh sửa thông tin. |
|  | 2 | Người dùng nhấn “Lưu”. |
|  | 3 | Hệ thống kiểm tra hợp lệ. |
|  | 4 | Hệ thống cập nhật dữ liệu. |
| **Luồng thay thế** | 3a | Dữ liệu không hợp lệ → Hệ thống thông báo lỗi. |

4. UC004: Xem danh sách sản phẩm

| Thuộc tính | Nội dung |  |
| ----- | ----- | :---- |
| **Use Case ID** | UC004 |  |
| **Tên Use Case** | Xem danh sách sản phẩm |  |
| **Tác nhân chính** | Khách truy cập, Khách hàng |  |
| **Tác nhân phụ** | Hệ thống |  |
| **Mô tả** | Hiển thị toàn bộ sản phẩm có trong hệ thống. |  |
| **Sự kiện kích hoạt** | Người dùng truy cập trang sản phẩm. |  |
| **Tiền điều kiện** | Hệ thống hoạt động bình thường. |  |
| **Hậu điều kiện (Thành công)** | Danh sách sản phẩm được hiển thị. |  |
| **Hậu điều kiện (Thất bại)** | Không hiển thị được sản phẩm. |  |
| **Luồng chính** | 1 | Người dùng truy cập trang chủ |
|  | 2 | Hệ thống truy vấn dữ liệu. |
|  | 3 | Hệ thống hiển thị danh sách. |
| **Luồng thay thế** | 2a | Lỗi truy vấn → Hiển thị thông báo lỗi. |

5. UC005: Lọc sản phẩm

| Thuộc tính | Nội dung |  |
| ----- | ----- | :---- |
| **Use Case ID** | UC005 |  |
| **Tên Use Case** | Lọc sản phẩm |  |
| **Tác nhân chính** | Khách truy cập, Khách hàng |  |
| **Tác nhân phụ** | Hệ thống |  |
| **Mô tả** | Người dùng lọc sản phẩm theo danh mục |  |
| **Sự kiện kích hoạt** | Người dùng chọn danh mục. |  |
| **Tiền điều kiện** | Có sản phẩm trong danh mục. |  |
| **Hậu điều kiện (Thành công)** | Hiển thị sản phẩm phù hợp. |  |
| **Hậu điều kiện (Thất bại)** | Không hiển thị được sản phẩm. |  |
| **Luồng chính** | 1 | Người dùng chọn danh mục. |
|  | 2 | Hệ thống hiển thị sản phẩm tương ứng. |
| **Luồng thay thế** | 2a | Không có sản phẩm → Hiển thị thông báo. |

6. UC006: Tìm kiếm sản phẩm

| Thuộc tính | Nội dung |  |
| ----- | ----- | :---- |
| **Use Case ID** | UC006 |  |
| **Tên Use Case** | Tìm kiếm sản phẩm |  |
| **Tác nhân chính** | Khách truy cập, Khách hàng |  |
| **Tác nhân phụ** | Hệ thống |  |
| **Mô tả** | Người dùng tìm kiếm sản phẩm theo từ khóa hoặc bộ lọc (danh mục, giá, thương hiệu). |  |
| **Sự kiện kích hoạt** | Người dùng nhập từ khóa vào ô tìm kiếm hoặc chọn bộ lọc. |  |
| **Tiền điều kiện** | Hệ thống có dữ liệu sản phẩm. |  |
| **Hậu điều kiện (Thành công)** | Danh sách sản phẩm phù hợp với điều kiện tìm kiếm được hiển thị. |  |
| **Hậu điều kiện (Thất bại)** | Không tìm thấy sản phẩm phù hợp, hiển thị thông báo. |  |
| **Luồng chính** | 1 | Người dùng nhập từ khóa hoặc chọn bộ lọc. |
|  | 2 | Người dùng nhấn nút “Tìm kiếm”. |
|  | 3 | Hệ thống tiếp nhận yêu cầu |
|  | 4 | Hệ thống truy xuất sản phẩm phù hợp. |
|  | 5 | Hệ thống hiển thị danh sách sản phẩm. |
| **Luồng thay thế** | 1a | Người dùng không nhập từ khóa → Hệ thống yêu cầu nhập hoặc hiển thị tất cả sản phẩm |
|  | 4a | Không có sản phẩm phù hợp → Hiển thị thông báo “Không tìm thấy sản phẩm” |

7. UC007: Xem chi tiết sản phẩm

| Thuộc tính | Nội dung |  |
| ----- | ----- | :---- |
| **Use Case ID** | UC007 |  |
| **Tên Use Case** | Xem chi tiết sản phẩm |  |
| **Tác nhân chính** | Khách truy cập, Khách hàng |  |
| **Tác nhân phụ** | Hệ thống |  |
| **Mô tả** | Người dùng xem thông tin chi tiết của một sản phẩm cụ thể. |  |
| **Sự kiện kích hoạt** | Người dùng chọn một sản phẩm trong danh sách. |  |
| **Tiền điều kiện** | Sản phẩm tồn tại trong hệ thống. |  |
| **Hậu điều kiện (Thành công)** | Thông tin chi tiết sản phẩm được hiển thị đầy đủ. |  |
| **Hậu điều kiện (Thất bại)** | Không hiển thị được thông tin sản phẩm, hiển thị thông báo lỗi. |  |
| **Luồng chính** | 1 | Người dùng chọn một sản phẩm từ danh sách. |
|  | 2 | Hệ thống nhận yêu cầu xem chi tiết. |
|  | 3 | Hệ thống truy xuất thông tin sản phẩm. |
|  | 4 | Hệ thống hiển thị: Tên sản phẩm Hình ảnh Giá Mô tả |
|  | 5 | Người dùng xem thông tin và kết thúc. |
| **Luồng thay thế** | 3a | Sản phẩm không tồn tại → Hiển thị thông báo lỗi. |
|  | 3b | Lỗi truy xuất dữ liệu → Hiển thị thông báo hệ thống. |

8. UC008: Thêm vào giỏ hàng

| Thuộc tính | Nội dung |  |
| ----- | ----- | :---- |
| **Use Case ID** | UC008 |  |
| **Tên Use Case** | Thêm vào giỏ hàng |  |
| **Tác nhân chính** | Khách hàng |  |
| **Tác nhân phụ** | Hệ thống |  |
| **Mô tả** | Khách hàng thêm sản phẩm vào giỏ hàng để chuẩn bị mua. |  |
| **Sự kiện kích hoạt** | Khách hàng chọn “Thêm vào giỏ hàng”. |  |
| **Tiền điều kiện** | Sản phẩm tồn tại và còn hàng. |  |
| **Hậu điều kiện (Thành công)** | Sản phẩm được thêm vào giỏ hàng. |  |
| **Hậu điều kiện (Thất bại)** | Sản phẩm không được thêm vào giỏ hàng. |  |
| **Luồng chính** | 1 | Khách hàng chọn sản phẩm. |
|  | 2 | Khách hàng nhấn “Thêm vào giỏ hàng”. |
|  | 3 | Hệ thống kiểm tra tình trạng tồn kho. |
|  | 4 | Hệ thống kiểm tra tình trạng tồn kho. |
|  | 5 | Hệ thống hiển thị thông báo thành công. |
| **Luồng thay thế** | 3a | Sản phẩm hết hàng → Hệ thống thông báo lỗi. |
|  | 3b | Người dùng chưa đăng nhập → Hệ thống yêu cầu đăng nhập |

9. UC009: Cập nhật số lượng giỏ hàng

| Thuộc tính | Nội dung |  |
| ----- | ----- | :---- |
| **Use Case ID** | UC009 |  |
| **Tên Use Case** | Cập nhật số lượng giỏ hàng |  |
| **Tác nhân chính** | Khách hàng |  |
| **Tác nhân phụ** | Hệ thống |  |
| **Mô tả** | Khách hàng thay đổi số lượng sản phẩm trong giỏ hàng. |  |
| **Sự kiện kích hoạt** | Khách hàng thay đổi số lượng sản phẩm. |  |
| **Tiền điều kiện** | Sản phẩm tồn tại trong giỏ hàng. |  |
| **Hậu điều kiện (Thành công)** | Số lượng sản phẩm được cập nhật. |  |
| **Hậu điều kiện (Thất bại)** | Số lượng không được thay đổi. |  |
| **Luồng chính** | 1 | Khách hàng truy cập giỏ hàng. |
|  | 2 | Khách hàng chỉnh sửa số lượng sản phẩm. |
|  | 3 | Hệ thống kiểm tra số lượng hợp lệ |
|  | 4 | Hệ thống cập nhật số lượng mới |
|  | 5 | Hệ thống cập nhật tổng tiền |
| **Luồng thay thế** | 3a | Số lượng vượt quá tồn kho → Hệ thống thông báo lỗi. |
|  | 3b | Số lượng nhập không hợp lệ (≤0) → Hệ thống yêu cầu nhập lại. |

10. UC010: Xoá sản phẩm khỏi giỏ hàng

| Thuộc tính | Nội dung |  |
| ----- | ----- | :---- |
| **Use Case ID** | UC010 |  |
| **Tên Use Case** | Xóa sản phẩm khỏi giỏ hàng |  |
| **Tác nhân chính** | Khách hàng |  |
| **Tác nhân phụ** | Hệ thống |  |
| **Mô tả** | Khách hàng xóa sản phẩm không muốn mua khỏi giỏ hàng. |  |
| **Sự kiện kích hoạt** | Khách hàng nhấn nút “Xóa”. |  |
| **Tiền điều kiện** | Sản phẩm tồn tại trong giỏ hàng. |  |
| **Hậu điều kiện (Thành công)** | Sản phẩm được xóa khỏi giỏ hàng. |  |
| **Hậu điều kiện (Thất bại)** | Sản phẩm vẫn còn trong giỏ hàng. |  |
| **Luồng chính** | 1 | Khách hàng truy cập giỏ hàng. |
|  | 2 | Khách hàng chọn sản phẩm cần xóa. |
|  | 3 | Khách hàng nhấn “Xóa”. |
|  | 4 | Hệ thống xóa sản phẩm khỏi giỏ hàng. |
|  | 5 | Hệ thống cập nhật lại tổng tiền |
| **Luồng thay thế** | 3a | Người dùng hủy thao tác → Hệ thống giữ nguyên giỏ hàng. |

11. UC011: Tạo đơn hàng

| Thuộc tính | Nội dung |  |
| ----- | ----- | :---- |
| **Use Case ID** | UC011 |  |
| **Tên Use Case** | Tạo đơn hàng |  |
| **Tác nhân chính** | Khách hàng |  |
| **Tác nhân phụ** | Hệ thống |  |
| **Mô tả** | Cho phép người dùng tạo đơn hàng từ giỏ hàng và thực hiện thanh toán |  |
| **Sự kiện kích hoạt** | Khách hàng nhấn nút “Đặt hàng”. |  |
| **Tiền điều kiện** | Khách hàng đã đăng nhập và có sản phẩm trong giỏ hàng. |  |
| **Hậu điều kiện (Thành công)** | Đơn hàng được tạo và lưu vào hệ thống. |  |
| **Hậu điều kiện (Thất bại)** | Đơn hàng không được tạo. |  |
| **Luồng chính** | 1 | Khách hàng truy cập giỏ hàng. |
|  | 2 | Khách hàng nhấn “Thanh toán” / “Đặt hàng”. |
|  | 3 | Hệ thống hiển thị thông tin xác nhận đơn hàng. |
|  | 4 | Khách hàng xác nhận đặt hàng. |
|  | 5 | Hệ thống tạo đơn hàng với trạng thái “Đang xử lý”. |
|  | 6 | Hệ thống hiển thị thông báo đặt hàng thành công. |
| **Luồng thay thế** | 1a | Giỏ hàng trống → Hệ thống thông báo không thể tạo đơn. |
|  | 3b | Khách hàng hủy xác nhận → Hệ thống quay lại giỏ hàng. |

12. UC012: Xem lịch sử đơn hàng

| Thuộc tính | Nội dung |  |
| ----- | ----- | :---- |
| **Use Case ID** | UC012 |  |
| **Tên Use Case** | Xem lịch sử đơn hàng |  |
| **Tác nhân chính** | Khách hàng |  |
| **Tác nhân phụ** | Hệ thống |  |
| **Mô tả** | Cho phép khách hàng xem danh sách các đơn hàng đã đặt |  |
| **Sự kiện kích hoạt** | Khách hàng truy cập mục “Đơn hàng của tôi” |  |
| **Tiền điều kiện** | Khách hàng đã đăng nhập |  |
| **Hậu điều kiện (Thành công)** | Danh sách đơn hàng được hiển thị theo tình trạng đơn hàng |  |
| **Hậu điều kiện (Thất bại)** | Hệ thống hiển thị thông báo lỗi |  |
| **Luồng chính** | 1 | Người dùng chọn “Đơn hàng của tôi” |
|  | 2 | Hệ thống truy xuất danh sách đơn theo tài khoản |
|  | 3 | Hệ thống hiển thị danh sách đơn hàng |
| **Luồng thay thế** | 2a | Không có đơn hàng → Hiển thị thông báo “Chưa có đơn hàng” |

13. UC013: Theo dõi tình trạng đơn hàng

| Thuộc tính | Nội dung |  |
| ----- | ----- | :---- |
| **Use Case ID** | UC013 |  |
| **Tên Use Case** | Theo dõi tình trạng đơn hàng |  |
| **Tác nhân chính** | Khách hàng |  |
| **Tác nhân phụ** | Hệ thống |  |
| **Mô tả** | Cho phép người dùng theo dõi trạng thái xử lý và vận chuyển của đơn hàng sau khi đã đặt thành công. |  |
| **Sự kiện kích hoạt** | Người dùng truy cập mục “Đơn hàng của tôi” và chọn một đơn hàng cụ thể để theo dõi trạng thái. |  |
| **Tiền điều kiện** | Người dùng đã đăng nhập Đơn hàng đã được tạo trong hệ thống |  |
| **Hậu điều kiện (Thành công)** | Trạng thái hiện tại của đơn hàng được hiển thị chính xác Người dùng xem được lịch sử cập nhật trạng thái (nếu có) |  |
| **Hậu điều kiện (Thất bại)** | Thông tin trạng thái không được hiển thị Hệ thống thông báo lỗi |  |
| **Luồng chính** | 1 | Người dùng truy cập “Đơn hàng của tôi” |
|  | 2 | Hệ thống hiển thị danh sách đơn hàng |
|  | 3 | Người dùng chọn một đơn hàng |
|  | 4 | Hệ thống truy xuất trạng thái hiện tại của đơn |
|  | 5 | Hệ thống hiển thị: Trạng thái (Chờ xử lý / Đang xử lý / Đang giao / Hoàn thành / Đã hủy) Thời điểm cập nhật gần nhất Thông tin vận chuyển (nếu có) |
|  | 6 | Người dùng xem thông tin và kết thúc |
| **Luồng thay thế** | 3a | Đơn hàng không tồn tại → Hệ thống hiển thị thông báo lỗi |
|  | 4a | Lỗi truy xuất dữ liệu → Hiển thị thông báo hệ thống |
|  | 5a | Đơn chưa được cập nhật trạng thái mới → Hiển thị trạng thái mặc định “Chờ xử lý” |

14. UC014: Thêm/Sửa/Xóa sản phẩm

| Thuộc tính | Nội dung |  |
| ----- | ----- | :---- |
| **Use Case ID** | UC014 |  |
| **Tên Use Case** | Thêm/Sửa/Xóa sản phẩm |  |
| **Tác nhân chính** | Admin |  |
| **Tác nhân phụ** | Hệ thống |  |
| **Mô tả** | Cho phép admin quản lý thông tin sản phẩm |  |
| **Sự kiện kích hoạt** | Admin truy cập trang quản lý sản phẩm |  |
| **Tiền điều kiện** | Có tài khoản Admin |  |
| **Hậu điều kiện (Thành công)** | Thông tin sản phẩm được cập nhật trong hệ thống |  |
| **Hậu điều kiện (Thất bại)** | Hệ thống thông báo lỗi và dữ liệu không thay đổi |  |
| **Luồng chính** | 1 | Admin truy cập trang quản lý sản phẩm |
|  | 2 | Hệ thống hiển thị danh sách sản phẩm |
|  | 3 | Admin chọn các thao tác thêm/sửa/xóa |
|  | 4 | Admin nhập hoặc chỉnh sửa thông tin |
|  | 5 | Hệ thống lưu dữ liệu  |
| **Luồng thay thế** | 4a | Thông tin không hợp lệ → Hệ thống yêu cầu nhập lại |
|  | 3a | Xóa sản phẩm đang thuộc đơn hàng → Không cho phép xóa |

15. UC015: Quản lý danh mục

| Thuộc tính | Nội dung |  |
| ----- | ----- | :---- |
| **Use Case ID** | UC015 |  |
| **Tên Use Case** | Quản lý danh mục |  |
| **Tác nhân chính** | Admin |  |
| **Tác nhân phụ** | Hệ thống |  |
| **Mô tả** | Cho phép Admin thêm, chỉnh sửa hoặc xóa danh mục sản phẩm nhằm tổ chức sản phẩm rõ ràng và khoa học. |  |
| **Sự kiện kích hoạt** | Admin truy cập trang quản lý danh mục. |  |
| **Tiền điều kiện** | Admin đã đăng nhập hệ thống. |  |
| **Hậu điều kiện (Thành công)** | Danh mục được thêm/sửa/xóa thành công và cập nhật trong cơ sở dữ liệu. |  |
| **Hậu điều kiện (Thất bại)** | Không có thay đổi nào được lưu trong hệ thống. |  |
| **Luồng chính** | 1 | Admin truy cập chức năng “Quản lý danh mục”. |
|  | 2 | Hệ thống hiển thị danh sách danh mục hiện có. |
|  | 3 | Admin chọn một trong các chức năng: Thêm / Sửa / Xóa. |
|  | 4 | Admin nhập hoặc chỉnh sửa thông tin danh mục (tên, mô tả…). |
|  | 5 | Hệ thống kiểm tra dữ liệu hợp lệ. |
|  | 6 | Hệ thống lưu thay đổi và hiển thị thông báo thành công |
| **Luồng thay thế** | 3a | Xóa danh mục đang chứa sản phẩm → Hệ thống không cho phép xóa và hiển thị thông báo. |
|  | 4a | Thông tin danh mục không hợp lệ → Hệ thống yêu cầu nhập lại. |

16. UC016: Cập nhật trạng thái đơn hàng

| Thuộc tính | Nội dung |  |
| ----- | ----- | :---- |
| **Use Case ID** | UC016 |  |
| **Tên Use Case** | Cập nhật trạng thái đơn hàng |  |
| **Tác nhân chính** | Admin |  |
| **Tác nhân phụ** | Hệ thống |  |
| **Mô tả** | Cho phép Admin thay đổi trạng thái đơn hàng (ví dụ: “Shipped”) để khách hàng theo dõi tiến trình xử lý. |  |
| **Sự kiện kích hoạt** | Admin chọn một đơn hàng trong danh sách quản lý. |  |
| **Tiền điều kiện** | Admin đã đăng nhập và đơn hàng tồn tại trong hệ thống. |  |
| **Hậu điều kiện (Thành công)** | Trạng thái đơn hàng được cập nhật và lưu trong hệ thống. |  |
| **Hậu điều kiện (Thất bại)** | Trạng thái đơn hàng không thay đổi. |  |
| **Luồng chính** | 1 | Admin truy cập danh sách đơn hàng. |
|  | 2 | Hệ thống hiển thị danh sách các đơn hiện có. |
|  | 3 | Admin chọn một đơn hàng. |
|  | 4 | Admin chọn trạng thái mới (Processing / Shipped / Completed / Cancelled…). |
|  | 5 | Hệ thống kiểm tra tính hợp lệ của trạng thái. |
|  | 6 | Hệ thống cập nhật trạng thái và hiển thị thông báo thành công |
| **Luồng thay thế** | 3a | Đơn hàng không tồn tại → Hiển thị thông báo lỗi |
|  | 6a | Trạng thái không hợp lệ → Hệ thống từ chối cập nhật. |

17. UC017: Quản lý người dùng

| Thuộc tính | Nội dung |  |
| ----- | ----- | :---- |
| **Use Case ID** | UC017 |  |
| **Tên Use Case** | Quản lý người dùng |  |
| **Tác nhân chính** | Admin |  |
| **Tác nhân phụ** | Hệ thống |  |
| **Mô tả** | Cho phép Admin xem danh sách người dùng, tìm kiếm theo email và khóa/mở khóa tài khoản nhằm quản lý hệ thống và xử lý vi phạm. |  |
| **Sự kiện kích hoạt** | Admin truy cập trang quản lý người dùng. |  |
| **Tiền điều kiện** | Admin đã đăng nhập hệ thống. |  |
| **Hậu điều kiện (Thành công)** | Thông tin tài khoản hoặc trạng thái khóa được cập nhật thành công. |  |
| **Hậu điều kiện (Thất bại)** | Trạng thái đơn hàng không thay đổi. |  |
| **Luồng chính** | 1 | Admin truy cập chức năng “Quản lý người dùng”. |
|  | 2 | Hệ thống hiển thị danh sách người dùng. |
|  | 3 | Admin chọn khách hàng cần xử lý |
|  | 4 | Hệ thống hiển thị thông tin người dùng tương ứng. |
| **Luồng thay thế** | 3a | Khách hàng không tồn tại → Hệ thống thông báo lỗi |
|

---

## 3.2. Yêu cầu phi chức năng

### 3.2.1. Hiệu suất

**Thời gian phản hồi:**

* Trang chủ, trang chi tiết sản phẩm và các trang chính tải dưới 3 giây với đường truyền internet bình thường.
* Hệ thống tìm kiếm sản phẩm trả kết quả trong dưới 2 giây.

**Hỗ trợ tải đồng thời:**

* Hệ thống cần xử lý ít nhất 100 người dùng truy cập đồng thời mà không làm giảm hiệu năng.
* Tối ưu hóa khả năng xử lý các giao dịch đồng thời trong giờ cao điểm.

### 3.2.2. Khả năng mở rộng

**Dữ liệu:**

* Hệ thống phải hỗ trợ lưu trữ và quản lý dữ liệu lớn (sản phẩm, khách hàng, đơn hàng) với khả năng mở rộng khi quy mô kinh doanh tăng.

**Chức năng:**

* Hệ thống thiết kế theo kiến trúc module, dễ dàng bổ sung hoặc nâng cấp tính năng như tích hợp thêm cổng thanh toán, chatbot AI nâng cao hoặc giao diện mới.

### 3.2.3. Bảo mật

**Mã hóa dữ liệu:**

* Mã hóa mật khẩu người dùng bằng bcrypt.
* Sử dụng HTTPS để đảm bảo dữ liệu truyền tải giữa người dùng và hệ thống được bảo mật.

**Chống tấn công:**

* Đảm bảo an toàn trước các tấn công phổ biến như SQL Injection, Cross-Site Scripting (XSS) và Cross-Site Request Forgery (CSRF).

**Phân quyền truy cập:**

* Quản lý chặt chẽ quyền truy cập cho quản trị viên và nhân viên hỗ trợ, ngăn chặn truy cập trái phép.

### 3.2.4. Tương thích

* Hỗ trợ hoạt động ổn định trên các trình duyệt phổ biến như Google Chrome, Firefox, Safari và Microsoft Edge.
* Website phải tương thích tốt trên máy tính, máy tính bảng và điện thoại di động (Responsive Design).

### 3.2.5. Khả dụng và độ tin cậy

* Đảm bảo hệ thống hoạt động ổn định với thời gian uptime tối thiểu 99.5% mỗi tháng.

### 3.2.6. Dễ sử dụng

**Giao diện người dùng (UI):**

* Thiết kế giao diện trực quan, đơn giản, phù hợp với người dùng ở mọi độ tuổi.
* Các nút chức năng, biểu tượng và văn bản hướng dẫn phải rõ ràng, dễ hiểu.

**Trải nghiệm người dùng (UX):**

* Quy trình tìm kiếm và thanh toán không quá 5 bước.

---

## 3.3. Yêu cầu tuân thủ

### 3.3.1. Tuân thủ pháp lý

**Quy định bảo mật:**

* Hệ thống phải tuân thủ các quy định về bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP của Chính phủ Việt Nam.
* Thông tin cá nhân của người dùng phải được lưu trữ an toàn, hạn chế truy cập trái phép và không chia sẻ cho bên thứ ba nếu chưa có sự đồng ý của người dùng.

**Thông tin minh bạch:**

Website phải hiển thị đầy đủ và rõ ràng:

* Thông tin liên hệ của cửa hàng.
* Chính sách đổi trả và bảo hành sản phẩm.
* Điều khoản sử dụng dịch vụ.
* Chính sách bảo mật thông tin.

### 3.3.2. Tuân thủ tiêu chuẩn tổ chức

**Tiêu chuẩn phát triển phần mềm:**

* Áp dụng quy trình phát triển phần mềm có tài liệu hóa (SRS, SDD).
* Tuân thủ quy tắc đặt tên, cấu trúc mã nguồn và quy ước lập trình thống nhất.
* Sử dụng Git để kiểm soát thay đổi mã nguồn.

**Tiêu chuẩn bảo mật nội bộ:**

* Phân quyền rõ ràng giữa người dùng và quản trị viên.
* Tài khoản quản trị phải được bảo vệ bằng mật khẩu mạnh.
* Không hiển thị thông tin nhạy cảm trên giao diện người dùng.

**Tiêu chuẩn vận hành và hỗ trợ:**

* Giao diện quản trị phải đơn giản, dễ sử dụng đối với nhân viên không chuyên về công nghệ.
* Các thay đổi về giá sản phẩm và trạng thái đơn hàng phải được cập nhật kịp thời và chính xác.


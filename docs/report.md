# BÁO CÁO DỰ ÁN: HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ TECHGADGET

## 1. Giới thiệu

### Tên dự án: **TechGadget – E-Commerce Platform**

### Mô tả tổng quan:

TechGadget là một nền tảng thương mại điện tử toàn diện được thiết kế riêng cho các cửa hàng bán lẻ thiết bị công nghệ (laptops, phones, phụ kiện). Hệ thống không chỉ đơn thuần là một website bán hàng mà còn là giải pháp chuyển đổi số giúp tự động hóa quy trình từ khâu tiếp cận khách hàng đến quản lý vận hành nội bộ. Hệ thống bao gồm hai phân hệ chính:

- **Storefront:** Giao diện chuyên nghiệp dành cho khách hàng tìm kiếm và mua sắm.
- **Admin Dashboard:** Công cụ quản trị tinh gọn dành cho nhân viên cửa hàng.

### Bài toán thực tế (Problem Statement):

Trước khi có hệ thống, TechGadget vận hành dựa trên các kênh thủ công (Facebook, điện thoại trực tiếp). Cách làm này đã bộc lộ những lỗ hổng nghiêm trọng khi quy mô đơn hàng tăng lên:

- **Thất lạc thông tin:** Bỏ sót tin nhắn/cuộc gọi đặt hàng của khách dẫn đến mất doanh thu.
- **Sai lệch tồn kho:** Bán những sản phẩm đã hết hàng, gây ra sự không hài lòng và khiếu nại từ khách hàng.
- **Quá tải nhân sự:** Nhân viên mất quá nhiều thời gian để trả lời các câu hỏi lặp đi lặp lại về giá cả và thông số sản phẩm.
- **Thiếu minh bạch:** Khách hàng hoàn toàn mù mờ về trạng thái đơn hàng sau khi đặt, tạo tâm lý lo lắng.

### Mục tiêu dự án:

1.  **Chuyên nghiệp hóa hình ảnh:** Xây dựng website hiện đại, uy tín để thay thế việc chốt đơn qua tin nhắn.
2.  **Tối ưu hóa tìm kiếm:** Triển khai tính năng tìm kiếm thông minh, hỗ trợ sửa lỗi chính tả (ví dụ: "samung" vẫn ra "samsung") để khách hàng tìm sản phẩm nhanh nhất.
3.  **Tự động hóa quy trình bán hàng:** Cho phép khách hàng tự thực hiện trọn vẹn quy trình từ chọn món, quản lý giỏ hàng đến thanh toán mô phỏng.
4.  **Minh bạch hóa đơn hàng:** Cung cấp hệ thống tra cứu trạng thái đơn hàng (đã đặt, đang giao, hoàn thành) cho người dùng đã đăng nhập.
5.  **Nâng cao năng suất quản trị:** Thiết kế bộ công cụ quản lý sản phẩm và đơn hàng đơn giản, dễ sử dụng cho nhân viên không chuyên về kỹ thuật.
6.  **Cá nhân hóa trải nghiệm (Mục tiêu mở rộng):** Tích hợp tính năng gợi ý sản phẩm liên quan (Recommendation) và hệ thống thông báo khuyến mãi (Sale pop-ups).

### Phạm vi dự án:

- **Bao gồm:** \* Hệ thống xác thực (Đăng ký/Đăng nhập).
  - Danh mục sản phẩm, tìm kiếm mờ (fuzzy search), xem chi tiết sản phẩm.
  - Giỏ hàng động và quy trình đặt hàng (Checkout) với thanh toán giả lập.
  - Trang theo dõi đơn hàng cá nhân.
  - Bảng điều khiển cho Admin: Quản lý kho hàng, cập nhật giá, cập nhật trạng thái vận chuyển.

## 2. Tổng quan hệ thống

### 2.1 Kiến trúc hệ thống

Hệ thống tuân thủ kiến trúc **Monolith** hiện đại, được xây dựng theo mô hình **Client-Server** tách biệt hoàn toàn để đảm bảo tính linh hoạt và dễ bảo trì:

- **Frontend (Client side):** Đóng vai trò giao diện người dùng, giao tiếp với máy chủ thông qua các giao thức RESTful API. Tập trung vào trải nghiệm mượt mà, tốc độ tải trang nhanh và thiết kế đáp ứng (Responsive).
- **Backend (Server side):** Sử dụng framework **Spring Boot**, chịu trách nhiệm xử lý toàn bộ logic nghiệp vụ (Business Logic), bảo mật (Security), và điều phối dữ liệu.
- **Data Layer:** Dữ liệu được quản lý chặt chẽ thông qua các hệ quản trị cơ sở dữ liệu quan hệ (RDBMS), sử dụng JPA/Hibernate để ánh xạ đối tượng, giúp việc truy xuất và thay đổi dữ liệu an toàn, chính xác.

**Cấu trúc phân tầng trong Backend:**

1.  **Controller Layer:** Tiếp nhận các yêu cầu từ phía người dùng, kiểm tra tính hợp lệ của dữ liệu đầu vào.
2.  **Service Layer:** Nơi tập trung toàn bộ "bộ não" của ứng dụng, xử lý các nghiệp vụ như tính toán giỏ hàng, cập nhật tồn kho, xử lý gợi ý sản phẩm.
3.  **Repository Layer:** Tầng giao tiếp trực tiếp với database thông qua các truy vấn tối ưu.
4.  **Database:** Lưu trữ thông tin sản phẩm, người dùng và lịch sử đơn hàng.

### 2.2 Công nghệ sử dụng

Sự kết hợp giữa sức mạnh của hệ sinh thái Java và các công cụ tìm kiếm hiện đại giúp hệ thống hoạt động ổn định và đáp ứng đúng kỳ vọng của doanh nghiệp.

**Backend Stack:**

- **Ngôn ngữ:** Java 17 (LTS).
- **Framework chính:** Spring Boot (Spring Web, Spring Data JPA, Spring Security).
- **Bảo mật:** JWT (JSON Web Token) để duy trì phiên đăng nhập và phân quyền (User/Admin).
- **Công cụ tìm kiếm thông minh:** **Meilisearch** (Giải quyết yêu cầu tìm kiếm mờ/fuzzy search của Michael).
- **Tích hợp:** PayOS (Dành cho việc mô phỏng thanh toán).
- **Quản lý dự án:** Maven.

**Frontend Stack:**

- **Nền tảng:** HTML5, CSS3, JavaScript.
- **Thư viện/UI:** Tận dụng CSS hiện đại để tạo giao diện chuyên nghiệp, thân thiện với thiết bị di động.
- **Triển khai:** Vercel (Frontend Hosting).

**Database & DevOps:**

- **Database:** PostgreSQL
- **Containerization:** Docker (Giúp đóng gói và triển khai ứng dụng nhất quán trên mọi môi trường).
- **Monitoring/Testing:** Postman (Kiểm thử API), Spring Boot DevTools (Tăng tốc độ phát triển).

---

## 3. Thiết kế cơ sở dữ liệu

### 3.1 ERD

- Chèn ảnh hoặc link sơ đồ

### 3.2 Các bảng chính

Hệ thống bao gồm các bảng chính sau:

- **users**  
  Lưu thông tin người dùng: email, tên, mật khẩu, vai trò.
- **products**  
  Lưu thông tin sản phẩm: tên, mô tả, hình ảnh, danh mục, thương hiệu.
- **product_variants**  
  Lưu các biến thể của sản phẩm (ví dụ: màu sắc, dung lượng), bao gồm giá và tồn kho.
- **attributes**  
  Định nghĩa các thuộc tính sản phẩm (màu sắc, kích thước, dung lượng).
- **variant_attribute_values**  
  Lưu giá trị thuộc tính tương ứng với từng biến thể sản phẩm.
- **categories**  
  Phân loại sản phẩm theo danh mục.
- **brands**  
  Quản lý thương hiệu sản phẩm.
- **cart**  
  Lưu giỏ hàng của người dùng.
- **cart_item**  
  Lưu các sản phẩm trong giỏ hàng.
- **orders**  
  Lưu thông tin đơn hàng: tổng tiền, trạng thái, địa chỉ giao hàng, phương thức thanh toán.
- **order_details**  
  Lưu chi tiết từng sản phẩm trong đơn hàng.
- **coupons**  
  Lưu thông tin mã giảm giá.
- **coupon_usages**  
  Lưu lịch sử sử dụng mã giảm giá của người dùng.
- **reviews**  
  Lưu đánh giá sản phẩm của người dùng.
- **pending_payments**  
  Lưu thông tin thanh toán đang chờ xử lý.
- **promotion_popups**  
  Lưu thông tin popup khuyến mãi hiển thị trên giao diện.

### 3.3 Quan hệ giữa các bảng

Các bảng trong hệ thống được liên kết với nhau thông qua các quan hệ sau:

- **users – orders (1:N)**  
  Một người dùng có thể tạo nhiều đơn hàng, mỗi đơn hàng thuộc về một người dùng.
- **orders – order_details (1:N)**  
  Một đơn hàng bao gồm nhiều sản phẩm, mỗi sản phẩm được lưu dưới dạng một dòng trong order_details.
- **products – product_variants (1:N)**  
  Một sản phẩm có nhiều biến thể khác nhau (ví dụ: màu sắc, cấu hình).
- **product_variants – variant_attribute_values (1:N)**  
  Mỗi biến thể có nhiều thuộc tính đi kèm.
- **attributes – variant_attribute_values (1:N)**  
  Một thuộc tính có thể áp dụng cho nhiều biến thể sản phẩm.
- **categories – products (1:N)**  
  Một danh mục chứa nhiều sản phẩm.
- **brands – products (1:N)**  
  Một thương hiệu có nhiều sản phẩm.
- **users – cart (1:1)**  
  Mỗi người dùng có một giỏ hàng.
- **cart – cart_item (1:N)**  
  Một giỏ hàng có nhiều sản phẩm.
- **product_variants – cart_item (1:N)**  
  Một biến thể sản phẩm có thể xuất hiện trong nhiều giỏ hàng.
- **products – reviews (1:N)**  
  Một sản phẩm có nhiều đánh giá từ người dùng.
- **users – reviews (1:N)**  
  Một người dùng có thể viết nhiều đánh giá.
- **coupons – coupon_usages (1:N)**  
  Một mã giảm giá có thể được sử dụng nhiều lần.
- **users – coupon_usages (1:N)**  
  Một người dùng có thể sử dụng nhiều mã giảm giá.
- **orders – pending_payments (1:1 hoặc 1:N)**  
  Một đơn hàng có thể có một hoặc nhiều bản ghi thanh toán đang chờ xử lý.

---

## 4. Chức năng hệ thống

### 4.1 Chức năng khách hàng

#### 4.1.1 Xem danh sách sản phẩm

- Hiển thị danh sách tất cả sản phẩm đang kinh doanh
- Bao gồm: hình ảnh, tên, giá, thông tin khuyến mãi (nếu có)
- Hỗ trợ phân trang để tải dữ liệu hiệu quả

#### 4.1.2 Tìm kiếm sản phẩm

- Tìm kiếm theo từ khóa (tên sản phẩm)
- Lọc theo danh mục, thương hiệu, thuộc tính
- Sắp xếp theo giá, độ phổ biến hoặc đánh giá

#### 4.1.3 Xem chi tiết sản phẩm

- Hiển thị đầy đủ thông tin sản phẩm: mô tả, hình ảnh, thông số
- Hiển thị các biến thể (màu sắc, dung lượng, phiên bản)
- Hiển thị đánh giá và điểm trung bình

#### 4.1.4 Quản lý giỏ hàng

- Thêm sản phẩm vào giỏ hàng
- Xóa sản phẩm khỏi giỏ
- Cập nhật số lượng sản phẩm
- Tính toán tổng tiền theo thời gian thực

#### 4.1.5 Đặt hàng

- Chuyển giỏ hàng thành đơn hàng
- Nhập thông tin giao hàng (địa chỉ, số điện thoại)
- Chọn phương thức thanh toán
- Xác nhận đơn hàng

#### 4.1.6 Đăng ký và đăng nhập

- Đăng ký tài khoản mới
- Đăng nhập bằng email và mật khẩu
- Lưu thông tin người dùng để sử dụng lâu dài

#### 4.1.7 Theo dõi trạng thái đơn hàng

- Hiển thị trạng thái đơn hàng: chờ xử lý, đã xác nhận, đang giao, hoàn tất
- Cập nhật trạng thái theo thời gian thực hoặc gần thời gian thực

#### 4.1.8 Xem lịch sử đơn hàng

- Hiển thị danh sách đơn hàng đã đặt
- Xem chi tiết từng đơn hàng
- Hỗ trợ đặt lại đơn hàng cũ

---

### 4.2 Chức năng quản trị viên

#### 4.2.1 Quản lý sản phẩm

- Thêm mới sản phẩm
- Cập nhật thông tin sản phẩm
- Xóa sản phẩm
- Quản lý giá, tồn kho, hình ảnh

#### 4.2.2 Quản lý danh mục, thương hiệu và thuộc tính

- Tạo mới danh mục, thương hiệu, thuộc tính
- Cập nhật và xóa dữ liệu liên quan
- Hỗ trợ phân loại và lọc sản phẩm

#### 4.2.3 Quản lý đơn hàng

- Xem danh sách đơn hàng
- Xem chi tiết từng đơn
- Cập nhật trạng thái đơn hàng

#### 4.2.4 Quản lý khách hàng

- Xem danh sách người dùng
- Tìm kiếm khách hàng
- Quản lý thông tin và quyền truy cập

#### 4.2.5 Quản lý mã giảm giá

- Tạo mã giảm giá mới
- Cập nhật thông tin mã
- Xóa mã giảm giá
- Thiết lập điều kiện áp dụng

#### 4.2.6 Quản lý popup khuyến mãi

- Tạo popup quảng cáo
- Cập nhật nội dung hiển thị
- Xóa popup

#### 4.2.7 Xác thực quản trị viên

- Đăng nhập hệ thống quản trị
- Phân quyền truy cập
- Bảo vệ các endpoint admin

---

### 4.3 Chức năng hệ thống chung

#### 4.3.1 Backend REST API

- Cung cấp API cho frontend
- Xử lý nghiệp vụ
- Trả dữ liệu dạng JSON

#### 4.3.2 Xác thực bằng JWT

- Tạo và xác thực token
- Bảo vệ API
- Quản lý phiên đăng nhập

#### 4.3.3 Lưu trữ dữ liệu

- Sử dụng cơ sở dữ liệu quan hệ
- Lưu trữ sản phẩm, đơn hàng, người dùng, giỏ hàng

#### 4.3.4 Thanh toán

- Xử lý thanh toán qua các phương thức
- Nhận webhook từ cổng thanh toán
- Cập nhật trạng thái thanh toán

#### 4.3.5 Quản lý đánh giá

- Cho phép người dùng gửi đánh giá
- Hiển thị bình luận và điểm số

#### 4.3.6 Phân tách API

- API công khai cho người dùng
- API riêng cho quản trị viên
- Kiểm soát truy cập theo vai trò

## 5. Giao diện người dùng

- Hình ảnh trang chủ
- Hình ảnh trang chi tiết sản phẩm
- Hình ảnh trang thanh toán

---

## 6. Triển khai

### 6.1 Môi trường

**Môi trường phát triển (Development):**

- Backend chạy local với Java 17 (Spring Boot)
- Frontend chạy bằng trình duyệt hoặc server static (Node nếu cần)
- Database sử dụng Supabase (PostgreSQL) hoặc PostgreSQL local

**Môi trường production:**

- Backend được deploy trên Render
- Frontend tĩnh (HTML/CSS/JavaScript) được deploy trên Vercel
- Database sử dụng Supabase (PostgreSQL) làm dịch vụ cloud

---

### 6.2 Hosting

**Frontend:**

- Deploy trên Vercel
- Hỗ trợ static hosting và CDN giúp tăng tốc độ tải trang

**Backend:**

- Deploy trên Render
- Chạy ứng dụng Spring Boot dưới dạng service
- Kết nối tới Supabase thông qua connection string

**Database:**

- Sử dụng Supabase (PostgreSQL)
- Dữ liệu được lưu trữ trên cloud
- Kết nối bảo mật thông qua biến môi trường

---

### 6.3 CI/CD

Hiện tại hệ thống chưa triển khai pipeline CI/CD hoàn chỉnh, tuy nhiên có thể áp dụng các giải pháp như GitHub Actions.

**Continuous Integration (CI):**

- Build backend bằng Maven
- Kiểm tra lỗi cú pháp và dependency
- (Optional) chạy test tự động

**Continuous Deployment (CD):**

- Frontend tự động deploy lên Vercel khi push/merge vào branch chính
- Backend tự động deploy trên Render khi có thay đổi từ GitHub
- Tự động build và deploy lại service

**Cấu hình môi trường:**

- Sử dụng biến môi trường để lưu:
  - Database URL (Supabase)
  - JWT secret
  - API keys
- Cấu hình riêng cho môi trường development và production

## 7. Kiểm thử

Hiện tại hệ thống chủ yếu được kiểm thử bằng phương pháp kiểm thử thủ công (Manual Testing) sau khi hoàn thành các chức năng.

### 7.1 Kiểm thử thủ công

Việc kiểm thử được thực hiện trực tiếp trên giao diện người dùng và thông qua các công cụ hỗ trợ như Postman để đảm bảo các chức năng hoạt động đúng như mong đợi.

Các kịch bản kiểm thử chính bao gồm:

- **Chức năng người dùng:**
  - Đăng ký, đăng nhập tài khoản
  - Xem danh sách sản phẩm
  - Tìm kiếm sản phẩm
  - Thêm sản phẩm vào giỏ hàng
  - Đặt hàng và theo dõi trạng thái đơn hàng
- **Chức năng quản trị:**
  - Thêm, sửa, xóa sản phẩm
  - Cập nhật tồn kho và giá
  - Quản lý đơn hàng và cập nhật trạng thái
- **Kiểm thử API:**
  - Sử dụng Postman để gửi request tới các endpoint
  - Kiểm tra dữ liệu trả về (response) và mã trạng thái (status code)

---

### 7.2 Kết quả kiểm thử

- Các chức năng chính của hệ thống hoạt động ổn định
- Quy trình đặt hàng và thanh toán mô phỏng hoạt động đúng logic
- Không phát hiện lỗi nghiêm trọng ảnh hưởng đến trải nghiệm người dùng

---

### 7.3 Hạn chế

- Chưa triển khai Unit Test và Integration Test tự động
- Việc kiểm thử phụ thuộc vào thao tác thủ công nên có thể bỏ sót một số trường hợp biên
- Chưa có hệ thống kiểm thử tự động trong pipeline CI/CD

---

## 8. Tổ chức làm việc nhóm

### 8.1 Phân chia công việc

Nhóm áp dụng mô hình phân chia theo chức năng để tối ưu hóa chuyên môn của từng thành viên:

| Thành viên            | Vai trò                       | Nhiệm vụ chính                                                                                                              |
| --------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Đặng Vũ (Nhóm trưởng) | Backend / Admin / Integration | Xây dựng API, thiết kế database, xử lý logic nghiệp vụ, phát triển admin, kết nối backend và frontend (Home, Product, Shop) |
| Lê Quang Huy          | Frontend Developer            | Phát triển giao diện người dùng, tối ưu UI/UX, tích hợp API từ backend                                                      |
| Đặng Trung Kiên       | Backend / Feature Developer   | Phát triển một phần admin, xây dựng các chức năng như mã giảm giá, đánh giá sản phẩm, quản lý tài khoản                     |

Các thành viên phối hợp chặt chẽ và hỗ trợ lẫn nhau trong quá trình phát triển, đặc biệt trong các giai đoạn tích hợp hệ thống.

---

### 8.2 Quy trình làm việc

Nhóm sử dụng Git làm công cụ quản lý mã nguồn chính với quy trình như sau:

**Quản lý nhánh:**

- main/master: chứa mã nguồn ổn định
- feature/\*: phát triển từng chức năng riêng biệt

**Quy trình làm việc:**

1. Tạo nhánh feature
2. Phát triển và commit code
3. Tạo Pull Request
4. Review và merge vào nhánh develop

---

### 8.3 Họp và phối hợp

- Họp định kỳ hàng tuần:
  - Cập nhật tiến độ
  - Giải quyết vấn đề kỹ thuật
  - Điều chỉnh kế hoạch

- Họp khi có Pull Request:
  - Review code
  - Thảo luận giải pháp
  - Quyết định merge hoặc chỉnh sửa

---

### 8.4 Công cụ sử dụng

- Quản lý mã nguồn: GitHub
- Kiểm thử API: Postman
- Quản lý công việc: Jira
- Trao đổi: Zalo, Google Meet

---

### 8.5 Đánh giá hiệu quả

- Công việc được hoàn thành đúng tiến độ
- Hệ thống được tích hợp ổn định giữa frontend và backend
- Quy trình làm việc giúp phát hiện lỗi sớm và đảm bảo tính đồng bộ giữa các thành viên

---

## 9. Hướng phát triển

- Tối ưu hiệu năng
  - Tối ưu truy vấn backend bằng cách thêm chỉ số (index) cho các cột tìm kiếm và lọc thường dùng.
  - Tối ưu tải trang frontend bằng cách nén hình ảnh, sử dụng lazy-load cho ảnh sản phẩm và chỉ tải dữ liệu khi cần.
  - Tối ưu cache trên frontend cho dữ liệu không thay đổi thường xuyên như danh mục, thương hiệu.
  - Tối ưu backend bằng cách giảm số lần gọi API, gộp request khi có thể và xử lý bất đồng bộ/parallel khi load nhiều tài nguyên.

- Gợi ý sản phẩm
  - Thêm cơ chế hiển thị sản phẩm liên quan theo danh mục, thương hiệu, hoặc sản phẩm đã xem.
  - Có thể phát triển tính năng “khách hàng cũng mua” dựa trên lịch sử đơn hàng.
  - Nâng cấp thuật toán gợi ý dần dần sang dựa trên hành vi người dùng để tăng độ chính xác.

- Cải thiện giao diện
  - Làm giao diện sạch, nhất quán, dễ đọc và thân thiện với thiết bị di động.
  - Cải thiện trải nghiệm người dùng ở các bước chính: tìm kiếm, lọc, thêm giỏ hàng, checkout.
  - Chuẩn hóa các thành phần UI như button, card sản phẩm, thẻ trạng thái đơn hàng để tăng tính chuyên nghiệp.
  - Thêm animation nhẹ, tooltip, thông báo rõ ràng và trạng thái tải dữ liệu để trang nhìn hiện đại và dễ dùng hơn.

## 10. Đánh giá kết quả và bài học rút ra

### 10.1 Đánh giá kết quả

Trong quá trình thực hiện dự án, nhóm đã rút ra được nhiều kinh nghiệm quan trọng:

- **Kỹ năng làm việc nhóm:**
  Hiểu rõ cách phân chia công việc hợp lý, phối hợp giữa frontend và backend, cũng như tầm quan trọng của việc trao đổi thường xuyên.

- **Quản lý mã nguồn:**
  Sử dụng Git và Pull Request giúp kiểm soát thay đổi, giảm xung đột code và nâng cao chất lượng sản phẩm.

- **Thiết kế hệ thống:**
  Nắm được cách xây dựng hệ thống theo kiến trúc phân tầng (Controller – Service – Repository), giúp code rõ ràng và dễ bảo trì.

- **Tích hợp hệ thống:**
  Hiểu cách kết nối frontend – backend – database và làm việc với các dịch vụ bên thứ ba như thanh toán hoặc tìm kiếm.

- **Giải quyết vấn đề:**
  Cải thiện khả năng debug, xử lý lỗi và tối ưu logic trong quá trình phát triển.

---

### 10.2 Bài học rút ra

Bên cạnh những kết quả đạt được, dự án vẫn còn một số hạn chế:

- Chưa triển khai kiểm thử tự động (Unit Test, Integration Test)
- Chưa xây dựng hệ thống CI/CD hoàn chỉnh
- Một số chức năng chưa được tối ưu hiệu năng
- Giao diện người dùng còn có thể cải thiện thêm về trải nghiệm
- Hệ thống hiện tại vẫn ở mức Monolith, chưa tách thành các service độc lập

---

## 11. Kết luận

Dự án TechGadget đã xây dựng thành công một hệ thống thương mại điện tử cơ bản, đáp ứng được các chức năng chính như quản lý sản phẩm, giỏ hàng, đặt hàng và quản trị hệ thống.

Hệ thống giúp giải quyết các vấn đề trong việc quản lý thủ công trước đây, đồng thời mang lại trải nghiệm mua sắm thuận tiện hơn cho người dùng.

Mặc dù vẫn còn một số hạn chế, dự án đã đạt được các mục tiêu đề ra và có thể tiếp tục phát triển trong tương lai để trở thành một hệ thống hoàn chỉnh hơn.

# PC Builder Website

PC Builder Website là trang bán linh kiện máy tính kết hợp công cụ xây dựng cấu hình PC. Người dùng có thể xem sản phẩm, lọc theo danh mục/thương hiệu, tự build PC, kiểm tra tương thích linh kiện, thêm vào giỏ hàng, dùng mã khuyến mãi và đặt hàng.

## Chức năng chính

- Xem danh sách linh kiện PC: CPU, mainboard, RAM, GPU, storage, PSU.
- Tìm kiếm, lọc sản phẩm theo danh mục, thương hiệu và sắp xếp theo giá.
- Xem chi tiết sản phẩm, thông số kỹ thuật và sản phẩm gợi ý tương tự.
- Đăng ký, đăng nhập, quên mật khẩu bằng OTP.
- Tạo cấu hình PC bằng PC Builder, kiểm tra lỗi tương thích và ước tính công suất nguồn.
- Nhận gợi ý cấu hình theo mục đích và ngân sách.
- Lưu cấu hình, tải lại cấu hình đã lưu, so sánh các cấu hình.
- Thêm sản phẩm hoặc toàn bộ cấu hình vào giỏ hàng.
- Áp mã khuyến mãi, nhập địa chỉ giao hàng, chọn phương thức thanh toán và đặt hàng.
- Theo dõi đơn hàng, điểm thành viên và các mã của tài khoản.
- Trang quản trị để quản lý sản phẩm, danh mục, thương hiệu, đơn hàng, người dùng và khuyến mãi.

## Yêu cầu cài đặt

- Node.js 20.9 trở lên.
- PostgreSQL.
- npm.

## Cách chạy website trên máy

1. Cài dependencies:

```bash
npm install
```

2. Tạo file `.env.local` ở thư mục gốc:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/pc_builder"
JWT_SECRET="thay-bang-chuoi-bi-mat-cua-ban"

# Tùy chọn: dùng cho chatbot AI
GEMINI_API_KEY=""

# Tùy chọn: dùng cho gửi OTP qua email
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""
```

3. Tạo database `pc_builder` trong PostgreSQL nếu chưa có. Có thể tạo bằng pgAdmin hoặc lệnh:

```bash
createdb pc_builder
```

4. Đồng bộ database và seed dữ liệu mẫu:

```bash
npm run prisma:push
npm run prisma:seed
node seed-admin.cjs
```

5. Chạy server:

```bash
npm run dev
```

6. Mở trình duyệt tại:

```text
http://localhost:3000
```

## Tài khoản demo local

Sau khi chạy `node seed-admin.cjs`, có thể dùng:

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Quản trị viên | `admin@pcbuilder.com` | `Admin@123` |
| Khách hàng | `user@example.com` | `User@123` |

Các tài khoản này chỉ nên dùng để kiểm thử trên môi trường local.

## Hướng dẫn sử dụng cho khách hàng

### 1. Đăng ký hoặc đăng nhập

- Bấm **Đăng ký** để tạo tài khoản mới.
- Bấm **Đăng nhập** nếu đã có tài khoản.
- Một số chức năng như PC Builder, giỏ hàng, đặt hàng và xem đơn hàng yêu cầu đăng nhập.
- Nếu quên mật khẩu, vào trang **Quên mật khẩu**, nhập email và làm theo mã OTP.

### 2. Xem và tìm sản phẩm

- Vào menu **Sản phẩm**.
- Dùng ô tìm kiếm để tìm theo tên hoặc mô tả sản phẩm.
- Chọn danh mục như CPU, GPU, RAM, Mainboard, Storage hoặc PSU.
- Chọn thương hiệu nếu muốn lọc theo hãng.
- Dùng sắp xếp để xem sản phẩm mới nhất, giá tăng dần hoặc giá giảm dần.
- Bấm vào một sản phẩm để xem chi tiết, tồn kho, mô tả và thông số kỹ thuật.

### 3. Thêm sản phẩm vào giỏ hàng

- Ở trang chi tiết sản phẩm hoặc thẻ sản phẩm, bấm **Thêm vào giỏ hàng**.
- Bấm biểu tượng giỏ hàng trên thanh menu để xem giỏ.
- Trong giỏ hàng, có thể tăng/giảm số lượng hoặc xóa sản phẩm.

### 4. Dùng PC Builder

- Vào menu **Builder**.
- Nếu chưa đăng nhập, website sẽ chuyển bạn tới trang đăng nhập trước.
- Chọn lần lượt các linh kiện cho cấu hình: CPU, Mainboard, RAM, GPU, Storage, PSU, Case và Cooling.
- Website tự kiểm tra một số điều kiện tương thích như socket CPU/mainboard, loại RAM và công suất nguồn.
- Có thể chọn preset ngân sách hoặc nhập ngân sách để kiểm soát tổng tiền.
- Nếu cần gợi ý nhanh, chọn mục đích sử dụng như gaming, văn phòng, đồ họa hoặc lập trình, nhập ngân sách rồi bấm tạo gợi ý.
- Khi cấu hình hợp lệ, bấm thêm toàn bộ linh kiện vào giỏ hàng.

### 5. Lưu và quản lý cấu hình PC

- Trong trang Builder, bấm **Lưu build** để lưu cấu hình.
- Có thể đánh dấu cấu hình đã hoàn thành hoặc công khai.
- Vào **Cấu hình của tôi** để xem lại các cấu hình đã lưu.
- Tại đây có thể tải lại cấu hình, xem mã cấu hình hoặc xóa cấu hình không còn cần.

### 6. Dùng chatbot AI tư vấn

- Bấm nút chat ở góc dưới bên phải màn hình.
- Có thể hỏi những câu như:

```text
Build cho tôi bộ PC gaming 20 triệu
Tôi muốn nâng cấp GPU
Build PC văn phòng ngân sách 10 triệu
```

- Nếu chatbot đề xuất cấu hình, bấm xác nhận để đưa cấu hình đó vào PC Builder.
- Chức năng này cần `GEMINI_API_KEY`; nếu chưa cấu hình, chatbot sẽ báo chưa sẵn sàng.

### 7. Áp mã khuyến mãi

- Vào trang **Khuyến mãi** để xem các mã đang hoạt động.
- Bấm sao chép mã.
- Vào **Giỏ hàng**, nhập mã ở ô khuyến mãi và bấm áp dụng.
- Tổng tiền sẽ tự cập nhật nếu mã hợp lệ.

### 8. Đặt hàng

- Vào **Giỏ hàng** sau khi đã thêm sản phẩm.
- Nhập hoặc chọn địa chỉ giao hàng.
- Chọn phương thức thanh toán: COD, VNPAY hoặc MOMO.
- Kiểm tra tạm tính, phí giao hàng, giảm giá và tổng tiền.
- Bấm **Đặt hàng** để hoàn tất.
- Sau khi đặt hàng thành công, website sẽ hiển thị mã đơn hàng.

### 9. Theo dõi tài khoản

- Bấm vào menu người dùng ở góc phải.
- Vào **Hồ sơ** để xem thông tin tài khoản, số đơn hàng, số sản phẩm trong giỏ và điểm thành viên.
- Vào **Đơn hàng** để xem lịch sử mua hàng và trạng thái đơn.
- Vào **Mã của tôi** để xem mã đơn hàng, mã cấu hình PC và mã khuyến mãi đang có.

## Hướng dẫn cho quản trị viên

Đăng nhập bằng tài khoản quản trị rồi vào `/admin` hoặc chọn **Admin** trong menu tài khoản.

Quản trị viên có thể:

- Xem thống kê tổng sản phẩm, người dùng, đơn hàng và khuyến mãi.
- Thêm, sửa, xóa sản phẩm.
- Quản lý danh mục sản phẩm.
- Quản lý thương hiệu.
- Theo dõi và cập nhật trạng thái đơn hàng.
- Quản lý người dùng và phân quyền.
- Tạo, sửa, xóa mã khuyến mãi.

## Các đường dẫn nhanh

| Trang | Đường dẫn |
| --- | --- |
| Trang chủ | `/` |
| Sản phẩm | `/products` |
| PC Builder | `/builder` |
| Khuyến mãi | `/promotions` |
| Giỏ hàng / thanh toán | `/cart` |
| Hồ sơ | `/profile` |
| Đơn hàng | `/orders` |
| Cấu hình đã lưu | `/my-builds` |
| Mã của tôi | `/account/codes` |
| Quản trị | `/admin` |

## Lệnh thường dùng

```bash
npm run dev              # chạy môi trường phát triển
npm run build            # build production
npm run start            # chạy bản production sau khi build
npm run lint             # kiểm tra lint
npm test                 # chạy test
npm run prisma:studio    # mở Prisma Studio
```

## Lưu ý

- `checkout` hiện được xử lý trực tiếp trong trang giỏ hàng; đường dẫn `/checkout` sẽ chuyển về `/cart`.
- COD, VNPAY và MOMO hiện là phương thức được ghi nhận trong đơn hàng; nếu muốn thanh toán thật cần tích hợp thêm cổng thanh toán.
- Khi chưa cấu hình SMTP, chức năng quên mật khẩu ở môi trường development có thể trả về OTP dev để kiểm thử.
- Dữ liệu seed dùng để demo, không nên dùng trực tiếp cho production.

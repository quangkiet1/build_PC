# Tài Liệu Thuyết Trình Đồ Án Cơ Sở

## Website PC Builder - Bán linh kiện và hỗ trợ xây dựng cấu hình máy tính

**Tên dự án:** PC Builder Website  
**Mục tiêu:** Xây dựng website thương mại điện tử bán linh kiện máy tính, kết hợp công cụ chọn linh kiện, kiểm tra tương thích, lưu cấu hình, đặt hàng, quản trị và tư vấn bằng AI.  
**Thời điểm tổng hợp:** 06/06/2026  
**Nguồn phân tích:** Mã nguồn trong project `pc-builder-website`

---

## 1. Tóm Tắt Đề Tài

PC Builder Website là một hệ thống web hỗ trợ người dùng mua linh kiện máy tính và tự xây dựng cấu hình PC phù hợp với nhu cầu, ngân sách. Bên cạnh các chức năng thương mại điện tử như xem sản phẩm, lọc sản phẩm, giỏ hàng, mã khuyến mãi và đặt hàng, hệ thống còn có công cụ PC Builder giúp chọn từng nhóm linh kiện như CPU, mainboard, RAM, GPU, ổ cứng và nguồn.

Điểm nổi bật của đề tài là website không chỉ bán sản phẩm riêng lẻ mà còn hỗ trợ người dùng ra quyết định khi ráp máy. Hệ thống kiểm tra tương thích cơ bản giữa CPU và mainboard, RAM và mainboard, đồng thời ước tính công suất nguồn để cảnh báo khi cấu hình chưa phù hợp. Ngoài ra, website có chatbot AI dùng Gemini để tư vấn nâng cấp hoặc đề xuất cấu hình theo ngân sách.

---

## 2. Lý Do Chọn Đề Tài

Việc tự chọn linh kiện máy tính thường gây khó khăn cho người dùng phổ thông vì có nhiều yếu tố kỹ thuật cần cân nhắc: socket CPU, chuẩn RAM, công suất nguồn, ngân sách và mục đích sử dụng. Nếu chỉ xây dựng một website bán hàng thông thường, người dùng vẫn phải tự tìm hiểu phần lớn kiến thức này.

Đề tài PC Builder được chọn vì giải quyết được cả hai nhu cầu:

- Nhu cầu mua linh kiện máy tính trực tuyến.
- Nhu cầu được hỗ trợ xây dựng cấu hình PC hợp lý, dễ hiểu và có cảnh báo kỹ thuật.

Đề tài cũng phù hợp với đồ án cơ sở vì có đủ các phần quan trọng: giao diện người dùng, xử lý nghiệp vụ, cơ sở dữ liệu, xác thực, phân quyền, quản trị, kiểm thử và tích hợp API bên ngoài.

---

## 3. Mục Tiêu Đề Tài

### Mục tiêu tổng quát

Xây dựng một website full-stack cho phép khách hàng tìm kiếm, mua linh kiện máy tính và tạo cấu hình PC cá nhân; đồng thời cung cấp trang quản trị để quản lý dữ liệu kinh doanh.

### Mục tiêu cụ thể

- Hiển thị danh sách sản phẩm linh kiện PC theo danh mục, thương hiệu, giá và từ khóa tìm kiếm.
- Cho phép người dùng đăng ký, đăng nhập, đăng xuất và quên mật khẩu bằng OTP.
- Cho phép khách hàng thêm sản phẩm vào giỏ hàng, nhập địa chỉ, áp mã giảm giá và tạo đơn hàng.
- Xây dựng công cụ PC Builder để chọn linh kiện theo từng vị trí trong cấu hình.
- Kiểm tra tương thích cơ bản giữa các linh kiện đã chọn.
- Lưu, xem lại và so sánh cấu hình PC.
- Tích hợp chatbot AI để tư vấn build PC hoặc nâng cấp linh kiện.
- Xây dựng trang admin để quản lý sản phẩm, danh mục, thương hiệu, đơn hàng, người dùng và khuyến mãi.
- Viết test tự động cho các phần nghiệp vụ quan trọng.

---

## 4. Đối Tượng Sử Dụng

| Nhóm người dùng | Nhu cầu chính |
| --- | --- |
| Khách chưa đăng nhập | Xem trang chủ, sản phẩm, chi tiết sản phẩm, khuyến mãi |
| Khách hàng đã đăng nhập | Dùng PC Builder, thêm giỏ hàng, đặt hàng, xem đơn, xem hồ sơ, lưu build |
| Quản trị viên | Quản lý sản phẩm, danh mục, thương hiệu, đơn hàng, người dùng, khuyến mãi |

---

## 5. Công Nghệ Sử Dụng

| Nhóm | Công nghệ |
| --- | --- |
| Frontend | Next.js 16.2.2, React 19.2.4, TypeScript |
| UI và hiệu ứng | Tailwind CSS 4, Radix UI, lucide-react, Framer Motion, GSAP, animejs |
| 3D/visual | Three.js, React Three Fiber, Drei |
| Backend | Next.js App Router Route Handlers |
| Cơ sở dữ liệu | PostgreSQL, Prisma ORM |
| Xác thực | JWT, bcryptjs, HttpOnly cookie |
| State client | Zustand, React Context |
| Đa ngôn ngữ | next-intl, hỗ trợ tiếng Việt và tiếng Anh |
| AI | Google Generative AI, Gemini 2.5 Flash |
| Email OTP | Nodemailer, SMTP |
| Bản đồ/địa chỉ | OpenStreetMap Nominatim và component Google Maps dự phòng |
| Kiểm thử | Vitest |

---

## 6. Kiến Trúc Tổng Quan

Project sử dụng Next.js App Router. Các route giao diện nằm trong thư mục `app/`, các API được đặt trong `app/api/`, logic dùng chung nằm trong `lib/`, trạng thái client nằm trong `context/`, `store/` và các provider.

```text
Người dùng / Admin
        |
        v
Next.js App Router UI
        |
        v
Route Handlers trong app/api
        |
        v
Service/helper trong lib
        |
        v
Prisma ORM
        |
        v
PostgreSQL
```

Các tích hợp ngoài như Gemini AI, SMTP và dịch vụ tìm kiếm địa chỉ được gọi từ API hoặc component tương ứng.

---

## 7. Cấu Trúc Thư Mục Chính

| Thư mục / file | Vai trò |
| --- | --- |
| `app/` | Chứa các trang giao diện và API theo App Router |
| `app/api/` | Chứa API xử lý auth, sản phẩm, giỏ hàng, đơn hàng, builder, admin, AI |
| `app/components/` | Component riêng cho các trang trong App Router |
| `components/` | Component dùng chung như header, modal, UI, chatbot wrapper |
| `context/AuthContext.tsx` | Quản lý trạng thái đăng nhập phía client |
| `store/useBuilderStore.ts` | Lưu trạng thái build PC, saved builds và compare bằng Zustand |
| `lib/` | Logic nghiệp vụ: auth, cart, orders, coupons, recommendations, Prisma |
| `prisma/schema.prisma` | Định nghĩa schema cơ sở dữ liệu |
| `prisma/seed.ts` | Tạo dữ liệu mẫu cho demo |
| `messages/` | Bản dịch tiếng Việt và tiếng Anh |
| `tests/` | Test tự động bằng Vitest |
| `proxy.ts` | Bảo vệ route `/admin` và `/profile` |

---

## 8. Cơ Sở Dữ Liệu

Hệ thống sử dụng PostgreSQL với Prisma ORM. Schema hiện có các bảng chính sau:

| Model | Ý nghĩa |
| --- | --- |
| `NguoiDung` | Tài khoản người dùng, vai trò, điểm tích lũy |
| `DanhMuc` | Danh mục linh kiện |
| `ThuongHieu` | Registry thương hiệu |
| `SanPham` | Thông tin sản phẩm, giá, tồn kho, thông số kỹ thuật |
| `GioHang`, `GioHangItem` | Giỏ hàng và sản phẩm trong giỏ |
| `DonHang`, `ChiTietDonHang` | Đơn hàng và chi tiết đơn |
| `ThanhToan` | Thông tin thanh toán của đơn hàng |
| `KhuyenMai` | Mã giảm giá toàn đơn |
| `KhuyenMaiSanPham` | Khuyến mãi theo sản phẩm |
| `UserKhuyenMai`, `SuDungKhuyenMai` | Gán và ghi nhận lượt dùng mã khuyến mãi |
| `CauHinhPC`, `BuildItem` | Cấu hình PC đã lưu và linh kiện trong cấu hình |
| `LichSuDiem` | Lịch sử cộng/trừ điểm thành viên |
| `TinNhanChat` | Lưu lịch sử chat AI của người dùng |
| `MaXacNhan` | Mã OTP quên mật khẩu |

### Quan hệ dữ liệu tiêu biểu

```mermaid
erDiagram
  NguoiDung ||--o{ DonHang : dat
  NguoiDung ||--|| GioHang : co
  NguoiDung ||--o{ CauHinhPC : luu
  NguoiDung ||--o{ TinNhanChat : chat
  DanhMuc ||--o{ SanPham : phan_loai
  GioHang ||--o{ GioHangItem : gom
  SanPham ||--o{ GioHangItem : nam_trong
  DonHang ||--o{ ChiTietDonHang : gom
  SanPham ||--o{ ChiTietDonHang : duoc_mua
  CauHinhPC ||--o{ BuildItem : gom
  SanPham ||--o{ BuildItem : duoc_chon
  KhuyenMai ||--o{ DonHang : ap_dung
```

### Dữ liệu seed phục vụ demo

Theo `prisma/seed.ts`, dữ liệu mẫu tạo:

- 6 danh mục chính: CPU, Mainboard, RAM, Storage, GPU, PSU.
- 100 sản phẩm mẫu:
  - 45 CPU
  - 20 GPU
  - 14 RAM
  - 14 Storage
  - 5 PSU
  - 14 Motherboard
- 2 tài khoản demo:
  - Admin: `admin@pcbuilder.com` / `Admin@123`
  - User: `user@example.com` / `User@123`

Lưu ý: Logic PC Builder có thiết kế 8 slot gồm CPU, mainboard, RAM, GPU, storage, PSU, case và cooling. Dữ liệu seed hiện tập trung vào 6 nhóm chính để demo các chức năng cốt lõi.

---

## 9. Chức Năng Theo Vai Trò

### 9.1. Khách chưa đăng nhập

- Xem trang chủ với sản phẩm nổi bật, danh mục và phần giới thiệu Builder.
- Xem danh sách sản phẩm tại `/products`.
- Tìm kiếm sản phẩm theo tên hoặc mô tả.
- Lọc theo danh mục, thương hiệu.
- Sắp xếp theo mới nhất, giá tăng dần, giá giảm dần.
- Xem chi tiết sản phẩm tại `/products/[slug]`.
- Xem sản phẩm liên quan.
- Xem trang khuyến mãi.
- Đăng ký hoặc đăng nhập.

### 9.2. Khách hàng đã đăng nhập

- Sử dụng PC Builder tại `/builder`.
- Chọn linh kiện theo từng slot.
- Kiểm tra lỗi tương thích.
- Lưu cấu hình PC.
- Tải lại hoặc xóa cấu hình đã lưu.
- So sánh cấu hình.
- Thêm sản phẩm hoặc toàn bộ cấu hình vào giỏ hàng.
- Áp mã khuyến mãi.
- Nhập địa chỉ giao hàng.
- Chọn phương thức thanh toán: COD, VNPAY, MOMO.
- Tạo đơn hàng.
- Xem lịch sử đơn hàng.
- Xem hồ sơ, điểm tích lũy và hạng thành viên.
- Sử dụng chatbot AI tư vấn.

### 9.3. Quản trị viên

- Xem dashboard thống kê số sản phẩm, người dùng, đơn hàng, đơn chờ xác nhận và khuyến mãi.
- Quản lý sản phẩm: thêm, sửa, xóa, upload ảnh, nhập thông số kỹ thuật JSON.
- Quản lý danh mục.
- Quản lý thương hiệu.
- Quản lý đơn hàng và cập nhật trạng thái.
- Quản lý người dùng và phân quyền.
- Quản lý mã khuyến mãi: phần trăm, số tiền cố định, giá trị đơn tối thiểu, giới hạn tổng lượt dùng, giới hạn mỗi người.

---

## 10. PC Builder - Điểm Nổi Bật Của Đồ Án

PC Builder là chức năng trung tâm của hệ thống. Người dùng có thể chọn linh kiện theo từng nhóm:

- CPU
- Mainboard
- RAM
- GPU
- Storage
- PSU
- Case
- Cooling

Trong đó CPU, mainboard, RAM, storage và PSU là các nhóm quan trọng; GPU, case, cooling có thể tùy chọn theo nhu cầu.

### Luồng hoạt động

1. Người dùng vào `/builder`.
2. Nếu chưa đăng nhập, hệ thống chuyển về đăng nhập và giữ `next=/builder`.
3. Hệ thống lấy danh sách sản phẩm từ database.
4. Hàm mapping chuyển sản phẩm bán hàng thành dạng `BuilderProduct`.
5. Người dùng chọn từng linh kiện theo slot.
6. Hệ thống lọc sản phẩm theo slot đang chọn.
7. Hệ thống kiểm tra tương thích và cảnh báo.
8. Người dùng có thể lưu build, so sánh build hoặc thêm toàn bộ vào giỏ hàng.

### Quy tắc kiểm tra tương thích

| Kiểm tra | Cách xử lý |
| --- | --- |
| CPU - Mainboard | So sánh socket CPU với socket mainboard hỗ trợ |
| RAM - Mainboard | So sánh chuẩn RAM với chuẩn RAM mainboard hỗ trợ |
| PSU | Tính tổng TDP CPU + GPU và thêm buffer |
| GPU công suất cao | Cảnh báo nếu chọn GPU TDP cao nhưng chưa chọn PSU |
| Gợi ý bước tiếp theo | Nếu chọn CPU thì gợi ý chọn mainboard; nếu chọn mainboard thì gợi ý chọn RAM |

### Vì sao chức năng này đáng trình bày

Chức năng này thể hiện project không chỉ CRUD dữ liệu mà có xử lý nghiệp vụ riêng của lĩnh vực phần cứng máy tính. Đây là phần giúp đồ án khác biệt so với website bán hàng thông thường.

---

## 11. Gợi Ý Sản Phẩm Và Cấu Hình

Hệ thống có hai lớp gợi ý:

### 11.1. Gợi ý sản phẩm tương tự

Ở trang chi tiết sản phẩm, hệ thống dùng `getSimilarProducts()` để tìm sản phẩm liên quan dựa trên:

- Cùng danh mục.
- Cùng thương hiệu.
- Khoảng giá gần nhau.
- Thông số kỹ thuật giống nhau như socket, RAM, chipset, wattage, TDP, VRAM.

### 11.2. Gợi ý cấu hình theo mục đích và ngân sách

Trong PC Builder, API `/api/recommendations/build` gọi `recommendBuild()` để đề xuất cấu hình theo:

- Mục đích: office, gaming, graphics, programming.
- Ngân sách.
- Linh kiện người dùng đã chọn trước đó.
- Tỷ lệ phân bổ ngân sách theo từng nhóm linh kiện.
- Điều kiện tương thích hiện tại của build.

---

## 12. Chatbot AI

Chatbot nằm ở góc màn hình và được tải động để tránh ảnh hưởng server-side rendering. API chính là `/api/ai/chat`.

### Cách hoạt động

1. Người dùng nhập yêu cầu, ví dụ: "Build PC gaming 20 triệu".
2. Frontend gửi prompt, lịch sử chat và cấu hình hiện tại lên API.
3. API kiểm tra người dùng đã đăng nhập chưa.
4. Controller gọi Gemini để phân tích ý định thành JSON:
   - Ngân sách.
   - Linh kiện muốn đổi/nâng cấp.
   - Có phải yêu cầu build PC hay chỉ hỏi tư vấn.
5. Hệ thống truy vấn kho sản phẩm bằng Prisma.
6. Hệ thống chọn linh kiện phù hợp với ngân sách và kiểm tra tương thích.
7. AI tạo câu trả lời ngắn gọn cho người dùng.
8. Nếu AI đề xuất build, người dùng có thể xác nhận để đưa cấu hình sang PC Builder.

### Xử lý lỗi AI

Hệ thống có cơ chế retry khi Gemini bị rate limit hoặc quá tải. Nếu model chính `gemini-2.5-flash` gặp vấn đề quota, hệ thống thử fallback sang `gemini-2.5-flash-lite`.

Nếu chưa cấu hình `GEMINI_API_KEY`, chatbot trả lời rằng API key chưa được cấu hình, thay vì làm website bị lỗi.

---

## 13. Giỏ Hàng Và Đặt Hàng

### Giỏ hàng

API `/api/cart` hỗ trợ:

- `GET`: lấy giỏ hàng của người dùng.
- `POST`: thêm sản phẩm vào giỏ.
- `PATCH`: cập nhật số lượng.
- `DELETE`: xóa sản phẩm khỏi giỏ.

Các rule kiểm tra:

- Số lượng phải là số nguyên từ 1 đến 99.
- Số lượng mong muốn không được vượt tồn kho.
- Người dùng phải đăng nhập mới thao tác được giỏ hàng.

### Đặt hàng

Đặt hàng được xử lý trong `/api/orders`.

Luồng chính:

1. Kiểm tra đăng nhập.
2. Kiểm tra địa chỉ giao hàng tối thiểu 10 ký tự.
3. Kiểm tra phương thức thanh toán thuộc COD, VNPAY, MOMO.
4. Lấy giỏ hàng và kiểm tra tồn kho.
5. Tính tạm tính.
6. Nếu có mã khuyến mãi thì validate mã.
7. Chạy transaction:
   - Trừ tồn kho.
   - Tạo đơn hàng.
   - Tạo chi tiết đơn hàng.
   - Tạo bản ghi thanh toán.
   - Ghi nhận lượt dùng mã khuyến mãi nếu có.
   - Xóa giỏ hàng sau khi đặt hàng.

Điểm đáng chú ý là hệ thống dùng transaction để đảm bảo tính nhất quán: nếu một bước lỗi, toàn bộ thao tác đặt hàng không bị ghi dở dang.

---

## 14. Khuyến Mãi Và Điểm Thành Viên

### Khuyến mãi

Mã khuyến mãi hỗ trợ:

- Giảm theo phần trăm.
- Giảm theo số tiền cố định.
- Giá trị đơn tối thiểu.
- Ngày bắt đầu và ngày kết thúc.
- Trạng thái bật/tắt.
- Giới hạn tổng lượt sử dụng.
- Giới hạn số lần dùng trên mỗi người.

Khi tạo khuyến mãi mới, hệ thống cố gắng gán mã này cho tất cả người dùng thông qua bảng `UserKhuyenMai`.

### Điểm thành viên

Hệ thống có hàm cộng điểm khi đơn hàng được chuyển sang trạng thái `DA_GIAO`.

Quy tắc:

- Điểm = `tongTien / 1000`, làm tròn xuống.
- Hạng thành viên:
  - Silver: dưới 10.000 điểm.
  - Gold: từ 10.000 điểm.
  - Platinum: từ 50.000 điểm.

---

## 15. Xác Thực Và Phân Quyền

### Xác thực

Hệ thống sử dụng:

- `bcryptjs` để hash mật khẩu.
- `jsonwebtoken` để tạo access token.
- Cookie `pcbuilder_token` dạng HttpOnly, SameSite=Lax.
- Cookie tự bật `Secure` khi chạy production qua HTTPS, nhưng không ép Secure khi chạy localhost.

### Phân quyền

Có hai vai trò:

- `KHACH_HANG`
- `QUAN_TRI_VIEN`

`proxy.ts` bảo vệ:

- `/admin/:path*`
- `/profile/:path*`

Các API admin cũng gọi `authorizeRoles(request, ['QUAN_TRI_VIEN'])` để kiểm tra lại quyền ở server.

### Quên mật khẩu bằng OTP

Luồng quên mật khẩu:

1. Người dùng nhập email.
2. Hệ thống kiểm tra email tồn tại.
3. Tạo OTP 6 chữ số.
4. OTP hết hạn sau 2 phút.
5. Chống gửi lại liên tục bằng cooldown 60 giây.
6. Cho tối đa 5 lần nhập sai.
7. Sau khi OTP hợp lệ, người dùng đặt lại mật khẩu.

Trong môi trường development, nếu SMTP chưa cấu hình, API có thể trả về `devOtp` để kiểm thử.

---

## 16. Đa Ngôn Ngữ

Project hỗ trợ:

- Tiếng Việt: `vi`
- Tiếng Anh: `en`

Mặc định là tiếng Việt. Locale được lưu trong cookie `pc-builder-locale`. Các trang server component dùng `getTranslator()` và `getI18nServer()` để lấy bản dịch theo cookie. Header có `LanguageSwitcher` để đổi ngôn ngữ và refresh lại UI.

---

## 17. Giao Diện Và Trải Nghiệm Người Dùng

Giao diện có phong cách hiện đại, nền tối, nhấn màu cam/vàng. Một số điểm nổi bật:

- Header cố định, responsive.
- Trang chủ có hero 3D.
- Card sản phẩm có trạng thái tồn kho, giá, discount, thông số nổi bật.
- PC Builder có stepper, progress bar, trạng thái lỗi/cảnh báo.
- Giỏ hàng có tổng tiền, phí ship, mã giảm giá, phương thức thanh toán.
- Admin dùng bảng quản lý có tìm kiếm, modal và confirm dialog.
- Có animation bằng Framer Motion, GSAP, animejs.
- Có nút back-to-top và chatbot floating.

---

## 18. API Chính

| Nhóm | Endpoint tiêu biểu | Vai trò |
| --- | --- | --- |
| Auth | `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/me` | Đăng nhập, đăng ký, đăng xuất, lấy user hiện tại |
| OTP | `/api/auth/forgot-password`, `/api/auth/verify-otp`, `/api/auth/reset-password`, `/api/auth/skip-reset` | Quên mật khẩu và OTP |
| Products | `/api/products`, `/api/products/[slug]` | Lấy, tạo, sửa, xóa sản phẩm ở một số luồng |
| Categories | `/api/categories`, `/api/categories/[id]` | Danh mục public/basic |
| Cart | `/api/cart` | CRUD giỏ hàng |
| Orders | `/api/orders`, `/api/user/orders` | Đặt hàng và xem đơn |
| Promotions | `/api/promotions`, `/api/promotions/check`, `/api/promotions/apply` | Xem và áp mã giảm giá |
| Builder | `/api/build/save`, `/api/build/my`, `/api/build/[id]`, `/api/builder` | Lưu, xem, xóa cấu hình |
| Recommendations | `/api/recommendations/build`, `/api/recommendations/product/[id]` | Gợi ý build và sản phẩm tương tự |
| AI | `/api/ai/chat` | Chatbot tư vấn |
| Admin | `/api/admin/products`, `/api/admin/categories`, `/api/admin/brands`, `/api/admin/orders`, `/api/admin/users`, `/api/admin/promotions` | Quản trị hệ thống |

---

## 19. Kiểm Thử

Project dùng Vitest. Các test hiện có bao phủ:

- Auth utilities: JWT secret, cookie secure, tạo và verify token.
- Proxy auth: redirect khi cookie sai, cho admin vào admin, chặn khách hàng vào admin.
- Cart validation: số lượng không hợp lệ, vượt tồn kho.
- Order validation: địa chỉ, phương thức thanh toán, mã đơn.
- Admin product helpers: slug tiếng Việt, validate payload, unique slug, normalize brand.
- Chatbot budget guard: không đề xuất thêm linh kiện khi ngân sách còn lại âm.
- Chatbot network fallback: trả lỗi thân thiện khi provider AI lỗi.

Kết quả chạy test thực tế:

```text
npm test
Test Files  7 passed (7)
Tests       19 passed (19)
```

Ghi chú: Lần chạy đầu trong sandbox bị lỗi `spawn EPERM`; sau khi chạy lại ngoài sandbox, toàn bộ test pass.

---

## 20. Cài Đặt Và Chạy Demo

### Yêu cầu

- Node.js
- PostgreSQL
- npm

### Biến môi trường cần có

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pc_builder"
JWT_SECRET="chuoi-bi-mat"
GEMINI_API_KEY=""
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""
```

### Lệnh chạy

```bash
npm install
npm run prisma:push
npm run prisma:seed
node seed-admin.cjs
npm run dev
```

Truy cập:

```text
http://localhost:3000
```

### Tài khoản demo

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | `admin@pcbuilder.com` | `Admin@123` |
| Khách hàng | `user@example.com` | `User@123` |

---

## 21. Kịch Bản Demo Gợi Ý

### Demo 1: Khách hàng mua linh kiện

1. Vào trang chủ.
2. Mở `/products`.
3. Tìm kiếm hoặc lọc sản phẩm theo danh mục.
4. Mở chi tiết một sản phẩm.
5. Thêm vào giỏ hàng.
6. Vào giỏ hàng, tăng/giảm số lượng.
7. Nhập địa chỉ.
8. Chọn COD/MOMO/VNPAY.
9. Đặt hàng và hiển thị mã đơn.

### Demo 2: PC Builder

1. Đăng nhập user demo.
2. Vào `/builder`.
3. Chọn CPU.
4. Chọn mainboard khác socket để cho thấy cảnh báo.
5. Đổi mainboard phù hợp.
6. Chọn RAM và PSU.
7. Xem tổng tiền và cảnh báo công suất nguồn.
8. Bấm lưu build.
9. Thêm toàn bộ cấu hình vào giỏ hàng.

### Demo 3: Chatbot AI

1. Mở chatbot.
2. Nhập: "Build cho tôi PC gaming 20 triệu".
3. Cho thấy AI trả lời và đề xuất linh kiện.
4. Bấm xác nhận để đẩy cấu hình vào Builder.

Nếu chưa cấu hình `GEMINI_API_KEY`, chỉ cần nói: "Phần AI có cơ chế kiểm tra API key; khi chưa có key, hệ thống trả thông báo thân thiện thay vì crash."

### Demo 4: Admin

1. Đăng nhập admin.
2. Vào `/admin`.
3. Mở quản lý sản phẩm, tạo hoặc sửa sản phẩm.
4. Mở quản lý đơn hàng, cập nhật trạng thái sang `DA_GIAO`.
5. Nói rằng khi đơn giao thành công, hệ thống tự cộng điểm thành viên.
6. Mở quản lý khuyến mãi, tạo mã mới.

---

## 22. Dàn Ý Slide Thuyết Trình

### Slide 1: Tên đề tài

PC Builder Website - Website bán linh kiện và hỗ trợ xây dựng cấu hình máy tính.

### Slide 2: Lý do chọn đề tài

Người dùng khó tự chọn linh kiện vì phải hiểu socket, RAM, PSU, ngân sách. Website giải quyết bằng catalog + PC Builder + AI tư vấn.

### Slide 3: Mục tiêu

Xây dựng website full-stack có bán hàng, builder, đặt hàng, quản trị, xác thực và kiểm thử.

### Slide 4: Công nghệ

Next.js 16, React 19, TypeScript, Prisma, PostgreSQL, Tailwind, Zustand, next-intl, Gemini AI, Vitest.

### Slide 5: Kiến trúc hệ thống

UI Next.js -> API Route Handlers -> lib nghiệp vụ -> Prisma -> PostgreSQL.

### Slide 6: Cơ sở dữ liệu

Trình bày các bảng chính: người dùng, sản phẩm, danh mục, giỏ hàng, đơn hàng, cấu hình PC, khuyến mãi, thanh toán, OTP, chat.

### Slide 7: Chức năng khách hàng

Xem sản phẩm, lọc, chi tiết, giỏ hàng, mã giảm giá, đặt hàng, đơn hàng, hồ sơ.

### Slide 8: PC Builder

Chọn linh kiện theo slot, kiểm tra tương thích, lưu build, so sánh, thêm build vào giỏ.

### Slide 9: Chatbot AI

Gemini phân tích ý định, tìm linh kiện trong kho, đề xuất cấu hình theo ngân sách.

### Slide 10: Admin

Dashboard, CRUD sản phẩm/danh mục/thương hiệu/người dùng/khuyến mãi, cập nhật đơn hàng.

### Slide 11: Bảo mật và phân quyền

JWT HttpOnly cookie, bcrypt, proxy bảo vệ route, role admin/customer, OTP quên mật khẩu.

### Slide 12: Kiểm thử

Vitest: 7 file test, 19 test case pass.

### Slide 13: Hạn chế và hướng phát triển

Tích hợp thanh toán thật, mở rộng rule tương thích, object storage cho ảnh, e2e test, deploy production.

### Slide 14: Demo

Demo theo 4 luồng: sản phẩm/đặt hàng, builder, chatbot, admin.

---

## 23. Lời Thuyết Trình Mẫu

Kính chào thầy cô, em xin trình bày đồ án cơ sở với đề tài PC Builder Website. Đây là website bán linh kiện máy tính kết hợp công cụ hỗ trợ xây dựng cấu hình PC.

Lý do em chọn đề tài này là vì khi người dùng tự ráp máy tính, họ không chỉ quan tâm đến giá sản phẩm mà còn phải biết linh kiện có tương thích hay không, ví dụ CPU có đúng socket với mainboard không, RAM có đúng chuẩn mainboard hỗ trợ không, hoặc nguồn có đủ công suất không. Vì vậy, em xây dựng website theo hướng vừa là một trang thương mại điện tử, vừa là công cụ tư vấn cấu hình.

Về công nghệ, project sử dụng Next.js App Router, React, TypeScript cho phần giao diện và backend API. Dữ liệu được lưu trong PostgreSQL thông qua Prisma ORM. Hệ thống dùng JWT trong HttpOnly cookie để xác thực, bcrypt để mã hóa mật khẩu, next-intl để hỗ trợ tiếng Việt và tiếng Anh, Zustand để quản lý trạng thái PC Builder, và Gemini AI cho chatbot tư vấn.

Về chức năng, khách hàng có thể xem sản phẩm, lọc theo danh mục, thương hiệu, sắp xếp theo giá, xem chi tiết, thêm giỏ hàng và đặt hàng. Khi đặt hàng, hệ thống kiểm tra tồn kho, kiểm tra mã khuyến mãi, tạo đơn hàng và thanh toán trong một transaction để đảm bảo dữ liệu nhất quán.

Phần nổi bật nhất là PC Builder. Người dùng chọn lần lượt CPU, mainboard, RAM, GPU, storage và PSU. Hệ thống kiểm tra tương thích giữa CPU và mainboard, RAM và mainboard, đồng thời ước tính công suất nguồn. Người dùng cũng có thể lưu cấu hình, so sánh cấu hình và thêm toàn bộ build vào giỏ hàng.

Ngoài ra, hệ thống có chatbot AI. Chatbot nhận yêu cầu như "Build PC gaming 20 triệu", phân tích ngân sách và mục đích sử dụng, sau đó tìm linh kiện trong kho và đề xuất cấu hình. Nếu người dùng đồng ý, cấu hình được đưa sang PC Builder để tiếp tục chỉnh sửa.

Với quản trị viên, hệ thống có dashboard và các trang quản lý sản phẩm, danh mục, thương hiệu, đơn hàng, người dùng và khuyến mãi. Khi đơn hàng được cập nhật sang trạng thái đã giao, hệ thống có thể cộng điểm tích lũy cho người dùng.

Về kiểm thử, project có test tự động bằng Vitest cho các phần auth, cart, order, admin product, proxy và chatbot. Kết quả hiện tại là 7 file test, 19 test case đều pass.

Tóm lại, đồ án đã hoàn thành một hệ thống full-stack có đầy đủ chức năng bán hàng, quản trị và hỗ trợ kỹ thuật cho việc build PC. Trong tương lai, em có thể phát triển thêm tích hợp cổng thanh toán thật, mở rộng thuật toán tương thích phần cứng và bổ sung kiểm thử end-to-end.

---

## 24. Câu Hỏi Dự Phòng Khi Bảo Vệ

### Câu 1: Vì sao dùng Next.js thay vì React thuần?

Next.js cho phép xây dựng full-stack trong cùng một project. Em có thể tạo giao diện bằng React, đồng thời tạo API bằng Route Handlers trong `app/api`. Ngoài ra Next.js hỗ trợ server component, routing theo file system, tối ưu ảnh, metadata và triển khai production thuận tiện hơn.

### Câu 2: Vì sao dùng Prisma?

Prisma giúp định nghĩa schema rõ ràng, sinh client TypeScript an toàn kiểu dữ liệu, giảm viết SQL thủ công và dễ quản lý migration. Với đồ án, Prisma giúp thao tác với PostgreSQL nhanh và hạn chế lỗi truy vấn.

### Câu 3: JWT được lưu ở đâu?

JWT được lưu trong cookie `pcbuilder_token` với HttpOnly, SameSite=Lax. Nhờ HttpOnly, JavaScript phía client không đọc trực tiếp được token, giảm rủi ro bị đánh cắp qua XSS.

### Câu 4: Làm sao phân quyền admin?

Token có trường role. `proxy.ts` kiểm tra role khi truy cập `/admin`. Ngoài ra các API admin cũng gọi `authorizeRoles()` để đảm bảo nếu người dùng gọi API trực tiếp vẫn bị chặn nếu không phải quản trị viên.

### Câu 5: PC Builder kiểm tra tương thích như thế nào?

Hệ thống đọc thông số kỹ thuật JSON của sản phẩm. Sau đó so sánh socket CPU với socket mainboard, chuẩn RAM với chuẩn mainboard, và công suất PSU với tổng TDP CPU + GPU cộng thêm buffer.

### Câu 6: Nếu đặt hàng cùng lúc làm sao tránh âm tồn kho?

Trong API đặt hàng, hệ thống dùng transaction và `updateMany` với điều kiện `soLuongTon >= soLuong`. Nếu tồn kho không đủ, update thất bại và transaction bị hủy.

### Câu 7: Chatbot AI có tự chọn sản phẩm không?

Có. AI phân tích ý định và ngân sách, còn việc lấy sản phẩm thực tế từ database do hệ thống thực hiện qua Prisma. Điều này giúp chatbot chỉ đề xuất sản phẩm đang có trong kho.

### Câu 8: Nếu AI hết quota thì sao?

Controller có retry và fallback model. Nếu vẫn lỗi, API trả thông báo thân thiện. Website không bị crash.

### Câu 9: Dự án đã kiểm thử gì?

Project có test cho auth, cookie, proxy, validate giỏ hàng, validate đơn hàng, tạo slug sản phẩm, chuẩn hóa thương hiệu, chatbot budget guard và lỗi provider AI.

### Câu 10: Hạn chế hiện tại là gì?

Một số hạn chế là thanh toán VNPAY/MOMO mới ghi nhận phương thức chứ chưa tích hợp cổng thanh toán thật; rule tương thích phần cứng mới ở mức cơ bản; upload ảnh đang hỗ trợ base64/demo, production nên dùng object storage; và cần bổ sung e2e test.

---

## 25. Hạn Chế Và Hướng Phát Triển

### Hạn chế hiện tại

- Cổng thanh toán COD/VNPAY/MOMO mới được ghi nhận trong đơn hàng, chưa tích hợp thanh toán thật.
- Kiểm tra tương thích phần cứng mới tập trung vào socket, RAM và PSU.
- Dữ liệu seed tập trung 6 nhóm linh kiện chính, trong khi Builder đã có slot case và cooling.
- Ảnh sản phẩm trong admin có thể lưu base64, chưa tối ưu cho production.
- Chatbot phụ thuộc `GEMINI_API_KEY` và quota API.
- Test hiện là unit/integration nhỏ, chưa có e2e test bằng trình duyệt.

### Hướng phát triển

- Tích hợp cổng thanh toán thật.
- Mở rộng thuật toán tương thích: kích thước case, chuẩn mainboard, số khe RAM, PCIe, chiều dài GPU, chuẩn nguồn.
- Thêm object storage cho ảnh sản phẩm.
- Thêm email xác nhận đơn hàng.
- Thêm trang theo dõi vận chuyển.
- Thêm đánh giá sản phẩm.
- Thêm e2e test cho các luồng đăng nhập, đặt hàng, admin và builder.
- Deploy production với PostgreSQL cloud, SMTP thật và cấu hình bảo mật cookie HTTPS.

---

## 26. Checklist Trước Khi Thuyết Trình

- Chạy được `npm run dev`.
- Database đã seed dữ liệu.
- Đăng nhập được tài khoản user và admin.
- Có ít nhất vài sản phẩm trong giỏ để demo nhanh.
- Chuẩn bị sẵn một mã khuyến mãi nếu muốn demo áp mã.
- Nếu demo chatbot, kiểm tra `GEMINI_API_KEY`.
- Nếu không có key AI, chuẩn bị câu giải thích fallback.
- Mở sẵn các trang: `/`, `/products`, `/builder`, `/cart`, `/admin`.
- Nhớ nhấn mạnh PC Builder và transaction đặt hàng vì đây là phần có nghiệp vụ rõ nhất.


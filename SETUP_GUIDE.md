# 🚀 PC BUILDER - Hướng dẫn Cài đặt & Chạy

## 📋 Yêu cầu

- Node.js 18+
- PostgreSQL (hoặc cơ sở dữ liệu khác)
- npm hoặc yarn

## 🔧 Cài đặt

### 1. Clone & Cài đặt packages
```bash
cd pc-builder-website
npm install
# hoặc
yarn install
```

### 2. Cấu hình Database

Tạo file `.env.local` ở gốc project:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pc_builder"

# Hoặc nếu dùng PostgreSQL cục bộ:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/pc_builder"

# Hoặc nếu dùng các dịch vụ khác:
# DATABASE_URL="mongodb://localhost:27017/pc_builder"
# DATABASE_URL="mysql://user:password@localhost:3306/pc_builder"
```

### 3. Tạo database & chạy migration

```bash
# Tạo database (nếu cần)
# createdb pc_builder

# Chạy migration từ Prisma
npx prisma migrate deploy

# Hoặc nếu bạn muốn tạo migration mới
npx prisma migrate dev --name init_db
```

### 4. Seed dữ liệu mẫu (tùy chọn)

```bash
# Thêm dữ liệu mẫu vào database
npx prisma db seed
```

Nếu gặp lỗi, thêm vào `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Kiểm tra database

```bash
# Mở Prisma Studio
npx prisma studio
```

## ▶️ Chạy Development Server

```bash
npm run dev
# hoặc
yarn dev
```

Truy cập: `http://localhost:3000`

## 📁 Cấu trúc Project

```
pc-builder-website/
├── app/
│   ├── api/
│   │   └── products/route.ts          # API lấy sản phẩm
│   ├── components/
│   │   ├── ProductCard.tsx            # Component thẻ sản phẩm
│   │   └── ProductList.tsx            # Component danh sách sản phẩm
│   ├── (main)/
│   ├── layout.tsx                     # Layout chính
│   ├── page.tsx                       # Trang Home
│   └── globals.css                    # CSS toàn cục
├── lib/
│   └── prisma.ts                      # Cấu hình Prisma Client
├── prisma/
│   ├── schema.prisma                  # Schema database
│   ├── seed.ts                        # Script seed dữ liệu
│   └── migrations/                    # Migration files
├── package.json
└── tsconfig.json
```

## 🔄 Các API Endpoint

### GET /api/products
Lấy danh sách sản phẩm

**Query params:**
- `page` (mặc định: 1)
- `limit` (mặc định: 12)
- `search` (tìm kiếm theo tên)
- `danhMucId` (lọc theo danh mục)

```bash
# Lấy sản phẩm trang 1
http://localhost:3000/api/products

# Lấy 20 sản phẩm
http://localhost:3000/api/products?limit=20

# Tìm kiếm
http://localhost:3000/api/products?search=CPU

# Lọc theo danh mục
http://localhost:3000/api/products?danhMucId=<category-id>
```

## 🎨 Features Hiện tại

✅ Trang Home với hero section
✅ Hiển thị danh sách sản phẩm
✅ Component ProductCard responsive
✅ API lấy sản phẩm từ database
✅ Phân trang & tìm kiếm (backend ready)
✅ Tailwind CSS styling

## 📝 Tiếp theo

- [ ] CRUD sản phẩm (admin panel)
- [ ] Đăng ký / Đăng nhập
- [ ] Giỏ hàng
- [ ] PC Builder (chọn linh kiện & kiểm tra tương thích)
- [ ] AI Chat endpoint
- [ ] Thanh toán (COD/VNPay/Momo mock)
- [ ] Quản lý đơn hàng

## 🐛 Troubleshooting

### Lỗi "DATABASE_URL is not defined"
→ Kiểm tra file `.env.local` có tồn tại không

### Lỗi kết nối database
→ Kiểm tra PostgreSQL service có chạy không:
```bash
# Windows
services.msc # Tìm PostgreSQL

# macOS
brew services list

# Linux
sudo service postgresql status
```

### Lỗi schema.prisma
→ Chạy:
```bash
npx prisma format
npx prisma validate
```

### Lỗi khi chạy seed
→ Đảm bảo database đã được tạo:
```bash
npx prisma migrate deploy
npx prisma db seed
```

## 📚 Tài liệu

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com)

---

**Tác giả:** PC Builder Team  
**Năm:** 2026

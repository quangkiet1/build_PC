-- CreateEnum
CREATE TYPE "VaiTro" AS ENUM ('KHACH_HANG', 'QUAN_TRI_VIEN');

-- CreateEnum
CREATE TYPE "TrangThaiDon" AS ENUM ('CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_GIAO', 'DA_GIAO', 'DA_HUY');

-- CreateEnum
CREATE TYPE "VaiTroTinNhan" AS ENUM ('USER', 'AI');

-- CreateTable
CREATE TABLE "nguoi_dung" (
    "id" TEXT NOT NULL,
    "hoTen" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "matKhauHash" TEXT NOT NULL,
    "vaiTro" "VaiTro" NOT NULL DEFAULT 'KHACH_HANG',
    "soDienThoai" TEXT,
    "diaChi" TEXT,
    "ngayTao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngayCapNhat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nguoi_dung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "danh_muc" (
    "id" TEXT NOT NULL,
    "tenDanhMuc" TEXT NOT NULL,
    "moTa" TEXT,

    CONSTRAINT "danh_muc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "san_pham" (
    "id" TEXT NOT NULL,
    "tenSanPham" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "gia" DOUBLE PRECISION NOT NULL,
    "hinhAnh" TEXT,
    "hinhAnhs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "moTa" TEXT,
    "soLuongTon" INTEGER NOT NULL DEFAULT 100,
    "thongSoKyThuat" JSONB,
    "danhMucId" TEXT NOT NULL,

    CONSTRAINT "san_pham_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cau_hinh_pc" (
    "id" TEXT NOT NULL,
    "tenCauHinh" TEXT,
    "tongGia" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ngayTao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nguoiDungId" TEXT NOT NULL,

    CONSTRAINT "cau_hinh_pc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "build_item" (
    "id" TEXT NOT NULL,
    "soLuong" INTEGER NOT NULL DEFAULT 1,
    "cauHinhPCId" TEXT NOT NULL,
    "sanPhamId" TEXT NOT NULL,

    CONSTRAINT "build_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gio_hang" (
    "id" TEXT NOT NULL,
    "nguoiDungId" TEXT NOT NULL,

    CONSTRAINT "gio_hang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gio_hang_item" (
    "id" TEXT NOT NULL,
    "soLuong" INTEGER NOT NULL DEFAULT 1,
    "gioHangId" TEXT NOT NULL,
    "sanPhamId" TEXT NOT NULL,

    CONSTRAINT "gio_hang_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "don_hang" (
    "id" TEXT NOT NULL,
    "maDonHang" TEXT NOT NULL,
    "trangThai" "TrangThaiDon" NOT NULL DEFAULT 'CHO_XAC_NHAN',
    "tongTien" DOUBLE PRECISION NOT NULL,
    "diaChiGiaoHang" TEXT NOT NULL,
    "ghiChu" TEXT,
    "ngayTao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nguoiDungId" TEXT NOT NULL,

    CONSTRAINT "don_hang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chi_tiet_don_hang" (
    "id" TEXT NOT NULL,
    "soLuong" INTEGER NOT NULL,
    "giaBanLucMua" DOUBLE PRECISION NOT NULL,
    "donHangId" TEXT NOT NULL,
    "sanPhamId" TEXT NOT NULL,

    CONSTRAINT "chi_tiet_don_hang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thanh_toan" (
    "id" TEXT NOT NULL,
    "maThanhToan" TEXT NOT NULL,
    "soTien" DOUBLE PRECISION NOT NULL,
    "phuongThuc" TEXT NOT NULL,
    "trangThai" TEXT NOT NULL DEFAULT 'PENDING',
    "ngayThanhToan" TIMESTAMP(3),
    "donHangId" TEXT NOT NULL,

    CONSTRAINT "thanh_toan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tin_nhan_chat" (
    "id" TEXT NOT NULL,
    "noiDung" TEXT NOT NULL,
    "vaiTro" "VaiTroTinNhan" NOT NULL,
    "ngayTao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nguoiDungId" TEXT NOT NULL,

    CONSTRAINT "tin_nhan_chat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nguoi_dung_email_key" ON "nguoi_dung"("email");

-- CreateIndex
CREATE UNIQUE INDEX "san_pham_slug_key" ON "san_pham"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "build_item_cauHinhPCId_sanPhamId_key" ON "build_item"("cauHinhPCId", "sanPhamId");

-- CreateIndex
CREATE UNIQUE INDEX "gio_hang_nguoiDungId_key" ON "gio_hang"("nguoiDungId");

-- CreateIndex
CREATE UNIQUE INDEX "gio_hang_item_gioHangId_sanPhamId_key" ON "gio_hang_item"("gioHangId", "sanPhamId");

-- CreateIndex
CREATE UNIQUE INDEX "don_hang_maDonHang_key" ON "don_hang"("maDonHang");

-- CreateIndex
CREATE UNIQUE INDEX "thanh_toan_maThanhToan_key" ON "thanh_toan"("maThanhToan");

-- AddForeignKey
ALTER TABLE "san_pham" ADD CONSTRAINT "san_pham_danhMucId_fkey" FOREIGN KEY ("danhMucId") REFERENCES "danh_muc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cau_hinh_pc" ADD CONSTRAINT "cau_hinh_pc_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "nguoi_dung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build_item" ADD CONSTRAINT "build_item_cauHinhPCId_fkey" FOREIGN KEY ("cauHinhPCId") REFERENCES "cau_hinh_pc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build_item" ADD CONSTRAINT "build_item_sanPhamId_fkey" FOREIGN KEY ("sanPhamId") REFERENCES "san_pham"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gio_hang" ADD CONSTRAINT "gio_hang_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "nguoi_dung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gio_hang_item" ADD CONSTRAINT "gio_hang_item_gioHangId_fkey" FOREIGN KEY ("gioHangId") REFERENCES "gio_hang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gio_hang_item" ADD CONSTRAINT "gio_hang_item_sanPhamId_fkey" FOREIGN KEY ("sanPhamId") REFERENCES "san_pham"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "don_hang" ADD CONSTRAINT "don_hang_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "nguoi_dung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chi_tiet_don_hang" ADD CONSTRAINT "chi_tiet_don_hang_donHangId_fkey" FOREIGN KEY ("donHangId") REFERENCES "don_hang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chi_tiet_don_hang" ADD CONSTRAINT "chi_tiet_don_hang_sanPhamId_fkey" FOREIGN KEY ("sanPhamId") REFERENCES "san_pham"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thanh_toan" ADD CONSTRAINT "thanh_toan_donHangId_fkey" FOREIGN KEY ("donHangId") REFERENCES "don_hang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tin_nhan_chat" ADD CONSTRAINT "tin_nhan_chat_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "nguoi_dung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

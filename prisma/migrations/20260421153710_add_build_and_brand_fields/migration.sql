/*
  Warnings:

  - Added the required column `updatedAt` to the `san_pham` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "build_item" DROP CONSTRAINT "build_item_cauHinhPCId_fkey";

-- DropForeignKey
ALTER TABLE "build_item" DROP CONSTRAINT "build_item_sanPhamId_fkey";

-- DropForeignKey
ALTER TABLE "cau_hinh_pc" DROP CONSTRAINT "cau_hinh_pc_nguoiDungId_fkey";

-- DropForeignKey
ALTER TABLE "chi_tiet_don_hang" DROP CONSTRAINT "chi_tiet_don_hang_donHangId_fkey";

-- DropForeignKey
ALTER TABLE "chi_tiet_don_hang" DROP CONSTRAINT "chi_tiet_don_hang_sanPhamId_fkey";

-- DropForeignKey
ALTER TABLE "don_hang" DROP CONSTRAINT "don_hang_nguoiDungId_fkey";

-- DropForeignKey
ALTER TABLE "gio_hang" DROP CONSTRAINT "gio_hang_nguoiDungId_fkey";

-- DropForeignKey
ALTER TABLE "gio_hang_item" DROP CONSTRAINT "gio_hang_item_gioHangId_fkey";

-- DropForeignKey
ALTER TABLE "gio_hang_item" DROP CONSTRAINT "gio_hang_item_sanPhamId_fkey";

-- DropForeignKey
ALTER TABLE "thanh_toan" DROP CONSTRAINT "thanh_toan_donHangId_fkey";

-- DropForeignKey
ALTER TABLE "tin_nhan_chat" DROP CONSTRAINT "tin_nhan_chat_nguoiDungId_fkey";

-- AlterTable
ALTER TABLE "cau_hinh_pc" ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "san_pham" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "thuongHieu" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "khuyen_mai" (
    "id" TEXT NOT NULL,
    "maKhuyenMai" TEXT NOT NULL,
    "tenKhuyenMai" TEXT NOT NULL,
    "moTa" TEXT,
    "phanTramGiam" INTEGER NOT NULL,
    "ngayBatDau" TIMESTAMP(3) NOT NULL,
    "ngayKetThuc" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "khuyen_mai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "khuyen_mai_san_pham" (
    "id" TEXT NOT NULL,
    "phanTramGiam" INTEGER NOT NULL,
    "ngayBatDau" TIMESTAMP(3) NOT NULL,
    "ngayKetThuc" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "khuyenMaiId" TEXT,
    "sanPhamId" TEXT NOT NULL,

    CONSTRAINT "khuyen_mai_san_pham_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_khuyen_mai" (
    "id" TEXT NOT NULL,
    "nguoiDungId" TEXT NOT NULL,
    "khuyenMaiId" TEXT NOT NULL,
    "daSuDung" BOOLEAN NOT NULL DEFAULT false,
    "ngayCap" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngaySuDung" TIMESTAMP(3),

    CONSTRAINT "user_khuyen_mai_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "khuyen_mai_maKhuyenMai_key" ON "khuyen_mai"("maKhuyenMai");

-- CreateIndex
CREATE UNIQUE INDEX "khuyen_mai_san_pham_khuyenMaiId_sanPhamId_key" ON "khuyen_mai_san_pham"("khuyenMaiId", "sanPhamId");

-- CreateIndex
CREATE UNIQUE INDEX "user_khuyen_mai_nguoiDungId_khuyenMaiId_key" ON "user_khuyen_mai"("nguoiDungId", "khuyenMaiId");

-- AddForeignKey
ALTER TABLE "khuyen_mai_san_pham" ADD CONSTRAINT "khuyen_mai_san_pham_khuyenMaiId_fkey" FOREIGN KEY ("khuyenMaiId") REFERENCES "khuyen_mai"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "khuyen_mai_san_pham" ADD CONSTRAINT "khuyen_mai_san_pham_sanPhamId_fkey" FOREIGN KEY ("sanPhamId") REFERENCES "san_pham"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cau_hinh_pc" ADD CONSTRAINT "cau_hinh_pc_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "nguoi_dung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build_item" ADD CONSTRAINT "build_item_cauHinhPCId_fkey" FOREIGN KEY ("cauHinhPCId") REFERENCES "cau_hinh_pc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build_item" ADD CONSTRAINT "build_item_sanPhamId_fkey" FOREIGN KEY ("sanPhamId") REFERENCES "san_pham"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gio_hang" ADD CONSTRAINT "gio_hang_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "nguoi_dung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gio_hang_item" ADD CONSTRAINT "gio_hang_item_gioHangId_fkey" FOREIGN KEY ("gioHangId") REFERENCES "gio_hang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gio_hang_item" ADD CONSTRAINT "gio_hang_item_sanPhamId_fkey" FOREIGN KEY ("sanPhamId") REFERENCES "san_pham"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "don_hang" ADD CONSTRAINT "don_hang_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "nguoi_dung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chi_tiet_don_hang" ADD CONSTRAINT "chi_tiet_don_hang_donHangId_fkey" FOREIGN KEY ("donHangId") REFERENCES "don_hang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chi_tiet_don_hang" ADD CONSTRAINT "chi_tiet_don_hang_sanPhamId_fkey" FOREIGN KEY ("sanPhamId") REFERENCES "san_pham"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thanh_toan" ADD CONSTRAINT "thanh_toan_donHangId_fkey" FOREIGN KEY ("donHangId") REFERENCES "don_hang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tin_nhan_chat" ADD CONSTRAINT "tin_nhan_chat_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "nguoi_dung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_khuyen_mai" ADD CONSTRAINT "user_khuyen_mai_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "nguoi_dung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_khuyen_mai" ADD CONSTRAINT "user_khuyen_mai_khuyenMaiId_fkey" FOREIGN KEY ("khuyenMaiId") REFERENCES "khuyen_mai"("id") ON DELETE CASCADE ON UPDATE CASCADE;

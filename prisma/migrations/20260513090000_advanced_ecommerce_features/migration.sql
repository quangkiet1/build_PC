-- Advanced e-commerce features: coupons, reward points, and order discount metadata.

-- CreateEnum
CREATE TYPE "LoaiGiamGia" AS ENUM ('PHAN_TRAM', 'SO_TIEN');

-- CreateEnum
CREATE TYPE "LoaiGiaoDichDiem" AS ENUM ('CONG', 'TRU');

-- AlterTable
ALTER TABLE "nguoi_dung"
ADD COLUMN "diemTichLuy" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "khuyen_mai"
ADD COLUMN "loaiGiamGia" "LoaiGiamGia" NOT NULL DEFAULT 'PHAN_TRAM',
ADD COLUMN "giaTriGiam" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "minOrderValue" DOUBLE PRECISION,
ADD COLUMN "gioiHanTong" INTEGER,
ADD COLUMN "gioiHanMoiNguoi" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "soLuotDaDung" INTEGER NOT NULL DEFAULT 0;

-- Backfill new discount value from the legacy percentage field.
UPDATE "khuyen_mai"
SET "giaTriGiam" = "phanTramGiam"
WHERE "giaTriGiam" = 0;

-- AlterTable
ALTER TABLE "don_hang"
ADD COLUMN "tamTinh" DOUBLE PRECISION,
ADD COLUMN "tienGiam" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "khuyenMaiId" TEXT;

UPDATE "don_hang"
SET "tamTinh" = "tongTien"
WHERE "tamTinh" IS NULL;

-- CreateTable
CREATE TABLE "lich_su_diem" (
    "id" TEXT NOT NULL,
    "diem" INTEGER NOT NULL,
    "loai" "LoaiGiaoDichDiem" NOT NULL,
    "lyDo" TEXT NOT NULL,
    "ngayTao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nguoiDungId" TEXT NOT NULL,
    "donHangId" TEXT,

    CONSTRAINT "lich_su_diem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "su_dung_khuyen_mai" (
    "id" TEXT NOT NULL,
    "maKhuyenMai" TEXT NOT NULL,
    "soTienGiam" DOUBLE PRECISION NOT NULL,
    "ngaySuDung" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nguoiDungId" TEXT NOT NULL,
    "khuyenMaiId" TEXT NOT NULL,
    "donHangId" TEXT NOT NULL,

    CONSTRAINT "su_dung_khuyen_mai_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lich_su_diem_donHangId_key" ON "lich_su_diem"("donHangId");

-- CreateIndex
CREATE INDEX "lich_su_diem_nguoiDungId_ngayTao_idx" ON "lich_su_diem"("nguoiDungId", "ngayTao");

-- CreateIndex
CREATE UNIQUE INDEX "su_dung_khuyen_mai_donHangId_key" ON "su_dung_khuyen_mai"("donHangId");

-- CreateIndex
CREATE INDEX "su_dung_khuyen_mai_nguoiDungId_khuyenMaiId_idx" ON "su_dung_khuyen_mai"("nguoiDungId", "khuyenMaiId");

-- AddForeignKey
ALTER TABLE "don_hang" ADD CONSTRAINT "don_hang_khuyenMaiId_fkey" FOREIGN KEY ("khuyenMaiId") REFERENCES "khuyen_mai"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lich_su_diem" ADD CONSTRAINT "lich_su_diem_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "nguoi_dung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lich_su_diem" ADD CONSTRAINT "lich_su_diem_donHangId_fkey" FOREIGN KEY ("donHangId") REFERENCES "don_hang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "su_dung_khuyen_mai" ADD CONSTRAINT "su_dung_khuyen_mai_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "nguoi_dung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "su_dung_khuyen_mai" ADD CONSTRAINT "su_dung_khuyen_mai_khuyenMaiId_fkey" FOREIGN KEY ("khuyenMaiId") REFERENCES "khuyen_mai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "su_dung_khuyen_mai" ADD CONSTRAINT "su_dung_khuyen_mai_donHangId_fkey" FOREIGN KEY ("donHangId") REFERENCES "don_hang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

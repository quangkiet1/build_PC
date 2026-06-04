import { prisma } from '@/lib/prisma';
import { Product, Category } from '@/app/types/builder';
import { normalizeCategoryName } from '@/lib/catalog';
import { readSpecNumber, readSpecString } from '@/lib/types';

// Hàm lấy linh kiện, trả về một Mảng chứa các đối tượng Product
export async function layTop3LinhKien(tenLoai: string, mucGiaToiDa?: number | null, tuKhoaPhu?: string, giaMin?: number | null): Promise<Product[]> {
    try {
        const loaiCanTim = normalizeCategoryName(tenLoai) || tenLoai;

        // LÊN DANH SÁCH YÊU CẦU CHO DATABASE
        const dieuKienTimKiem: any = {
            where: {
                danhMuc: {
                    tenDanhMuc: {
                        contains: loaiCanTim,
                        mode: 'insensitive' 
                    }
                },
                soLuongTon: { gt: 0 }
            },
            take: 10, 
            orderBy: { gia: 'desc' }, 
            include: { danhMuc: true } 
        };

        // LỌC GIÁ TIỀN 
        if (mucGiaToiDa != null || giaMin != null) {
            dieuKienTimKiem.where.gia = {};
            
            if (mucGiaToiDa != null) {
                dieuKienTimKiem.where.gia.lte = mucGiaToiDa; // Nhỏ hơn hoặc bằng ngân sách
            }
            
            if (giaMin != null) {
                dieuKienTimKiem.where.gia.gt = giaMin; // Lớn hơn hẳn giá món cũ (Nâng cấp)
            }
        }

        // LỌC THEO YÊU CẦU RIÊNG (Ví dụ: "64GB", "ASUS")
        if (tuKhoaPhu != null && tuKhoaPhu.trim() !== "") {
            dieuKienTimKiem.where.tenSanPham = { contains: tuKhoaPhu, mode: 'insensitive' };
        }

        //
        // CHUI XUỐNG KHO LẤY HÀNG
        const danhSachTuDB = await prisma.sanPham.findMany(dieuKienTimKiem);
        const ketQuaCuoiCung: Product[] = [];

        for (let i = 0; i < danhSachTuDB.length; i++) {
            const monHang = danhSachTuDB[i] as any; 
            const thongSo = monHang.thongSoKyThuat || {};
            
            const theLoaiChuan = normalizeCategoryName(monHang.danhMuc?.tenDanhMuc);
            if (theLoaiChuan == null) continue;

            let hinhAnhBia = '';
            if (monHang.hinhAnhs != null && monHang.hinhAnhs[0] != null) {
                 hinhAnhBia = monHang.hinhAnhs[0];
            } else if (monHang.hinhAnh != null) {
                 hinhAnhBia = monHang.hinhAnh;
            }

            const rawRamType = readSpecString(
                monHang.thongSoKyThuat,
                'ram_type',
                'type',
                'memoryType',
                'memory',
                'loaiRam'
            )?.toUpperCase();
            const ramType = rawRamType?.match(/DDR[45]/)?.[0] as 'DDR4' | 'DDR5' | undefined;
            const supportedRamRaw = readSpecString(
                monHang.thongSoKyThuat,
                'supported_ram',
                'ram_type',
                'memory',
                'memoryType',
                'loaiRam'
            );
            const supportedRam = supportedRamRaw
                ? supportedRamRaw
                    .split('/')
                    .flatMap((item) => item.split(','))
                    .map((item) => item.trim().toUpperCase().match(/DDR[45]/)?.[0])
                    .filter(Boolean) as Array<'DDR4' | 'DDR5'>
                : undefined;
            const socket = readSpecString(monHang.thongSoKyThuat, 'supported_socket', 'socket');

            // Nhét dữ liệu vào đúng khuôn Product 
            const sanPhamChuan: Product = {
                id: monHang.id,
                name: monHang.tenSanPham,
                brand: thongSo.brand || monHang.thuongHieu || 'PC Builder',
                category: theLoaiChuan as Category,
                price: monHang.gia,
                image: hinhAnhBia, 
                rating: 5, 
                socket,
                supportedSocket: socket,
                supportedRam,
                tdp: readSpecNumber(monHang.thongSoKyThuat, 'tdp', 'tgp', 'watt'),
                ramType,
                wattage: readSpecNumber(monHang.thongSoKyThuat, 'wattage', 'watt'),
            };

            // Nhét lén 2 cục này vào bằng cửa sau.
            (sanPhamChuan as any).thongSoKyThuat = monHang.thongSoKyThuat;
            (sanPhamChuan as any).danhMuc = monHang.danhMuc;

            ketQuaCuoiCung.push(sanPhamChuan);
        }

        return ketQuaCuoiCung;

    } catch (error) {
        console.error("Lỗi khi Model chui vào DB lấy linh kiện:", error);
        return []; 
    }
}

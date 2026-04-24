import { prisma } from '@/lib/prisma';
import { Product, Category } from '@/app/types/builder';

// Hàm lấy linh kiện, trả về một Mảng chứa các đối tượng Product
export async function layTop3LinhKien(tenLoai: string, mucGiaToiDa?: number | null, tuKhoaPhu?: string, giaMin?: number | null): Promise<Product[]> {
    try {
        // LÊN DANH SÁCH YÊU CẦU CHO DATABASE
        const dieuKienTimKiem: any = {
            where: {
                danhMuc: {
                    tenDanhMuc: {
                        contains: tenLoai,
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
            
            let theLoaiChuan = 'khac';
            if (monHang.danhMuc != null && monHang.danhMuc.tenDanhMuc != null) {
                 theLoaiChuan = monHang.danhMuc.tenDanhMuc.toLowerCase();
            }

            let hinhAnhBia = '';
            if (monHang.hinhAnhs != null && monHang.hinhAnhs[0] != null) {
                 hinhAnhBia = monHang.hinhAnhs[0];
            } else if (monHang.hinhAnh != null) {
                 hinhAnhBia = monHang.hinhAnh;
            }

            // Nhét dữ liệu vào đúng khuôn Product 
            const sanPhamChuan: Product = {
                id: monHang.id,
                name: monHang.tenSanPham,
                brand: thongSo.brand || 'Đang cập nhật',
                category: theLoaiChuan as Category,
                price: monHang.gia,
                image: hinhAnhBia, 
                rating: 5, 
                socket: thongSo.socket,
                tdp: thongSo.tdp || thongSo.watt,
                // Ép hoa chữ DDR5 để hàm check không báo lỗi
                ramType: (thongSo.type || thongSo.ram_type || thongSo.memoryType || thongSo.loaiRam || '').toUpperCase(),
                wattage: thongSo.wattage || thongSo.watt,
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
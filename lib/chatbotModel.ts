// 1. Lấy đồ nghề kết nối Database (Đường dẫn chuẩn của Next.js)
import { prisma } from '@/lib/prisma';

// 2. Lấy cái khuôn đúc của nhóm trưởng vào
import { Product, Category } from '@/app/types/builder';

// Hàm lấy linh kiện, trả về một Mảng chứa các đối tượng đúng chuẩn Product
export async function layTop3LinhKien(tenLoai: string, mucGiaToiDa?: number | null, tuKhoaPhu?: string): Promise<Product[]> {
    try {
        // ==========================================
        // BƯỚC 1: LÊN DANH SÁCH YÊU CẦU CHO DATABASE
        // ==========================================
        // Dùng any ở đây vì biến này của Prisma rất phức tạp, mình viết đơn giản cho dễ hiểu
        const dieuKienTimKiem: any = {
            where: {
                danhMuc: {
                    tenDanhMuc: {
                        contains: tenLoai,
                        mode: 'insensitive' // 'CPU' hay 'cpu' đều tìm ra hết
                    }
                },
                soLuongTon: { gt: 0 } // Bắt buộc phải còn hàng
            },
            // Lấy 10 món để ra ngoài Controller tha hồ đem đi Check tương thích. 
            // Check xong rớt bớt là vừa.
            take: 10, 
            
            // Ưu tiên xếp hàng xịn (giá cao nhất) lên đầu
            orderBy: { gia: 'desc' }, 
            
            // Lấy luôn tên danh mục kèm theo sản phẩm
            include: { danhMuc: true } 
        };

        // Nếu khách hàng có yêu cầu ngân sách thì mới thêm vào bộ lọc
        if (mucGiaToiDa) {
            dieuKienTimKiem.where.gia = { lte: mucGiaToiDa }; // lte: Nhỏ hơn hoặc bằng
        }

        if (tuKhoaPhu && tuKhoaPhu.trim() !== "") {
            // Nếu khách đòi "64GB", tìm thẳng vào tên sản phẩm
            dieuKienTimKiem.where.tenSanPham = { contains: tuKhoaPhu, mode: 'insensitive' };
        }

        // ==========================================
        // BƯỚC 2: CHUI XUỐNG KHO LẤY HÀNG
        // ==========================================
        const danhSachTuDB = await prisma.sanPham.findMany(dieuKienTimKiem);


        // ==========================================
        // BƯỚC 3: GỌT GIŨA VÀ ĐẬP VÀO KHUÔN "Product"
        // ==========================================
        // ==========================================
        // BƯỚC 3: GỌT GIŨA VÀ ĐẬP VÀO KHUÔN "Product"
        // ==========================================
        const ketQuaCuoiCung: Product[] = [];

        for (let i = 0; i < danhSachTuDB.length; i++) {
            // SỬA Ở ĐÂY: Ép kiểu thành 'any' để TS không bắt bẻ thuộc tính 'danhMuc'
            const monHang = danhSachTuDB[i] as any; 
            
            // Lấy cột thông số kỹ thuật (JSON) ra. 
            const thongSo = monHang.thongSoKyThuat || {};

            // Nhét dữ liệu vào đúng khuôn Product của nhóm trưởng
            const sanPhamChuan: Product = {
                id: monHang.id,
                name: monHang.tenSanPham,
                brand: thongSo.brand || 'Đang cập nhật',
                
                // Mặc dù 'danhMuc' có thể bị gạch đỏ, nhưng khi chạy nó vẫn lấy được dữ liệu thật
                category: (monHang.danhMuc?.tenDanhMuc?.toLowerCase() || 'khac') as Category,
                price: monHang.gia,
                
                // Lấy tấm hình đầu tiên
                image: monHang.hinhAnhs?.[0] || monHang.hinhAnh || '', 
                
                rating: 5, 
                
                // --- Đổ thông số kỹ thuật vào ---
                socket: thongSo.socket,
                tdp: thongSo.tdp || thongSo.watt,
                
                // Tìm đến dòng này trong chatbotModel.ts
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
        return []; // Nếu lỗi thì trả về cái mảng rỗng cho web khỏi sập
    }
}
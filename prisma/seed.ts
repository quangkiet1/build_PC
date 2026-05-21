// prisma/seed.ts
// Chạy với: npx prisma db seed

import { PrismaClient, VaiTro } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Hàm thay đổi vai trò của người dùng
 * @param email - Email của tài khoản cần thay đổi
 * @param vaiTroMoi - Vai trò mới (KHACH_HANG hoặc QUAN_TRI_VIEN)
 */
async function thayDoiVaiTro(email: string, vaiTroMoi: VaiTro) {
  try {
    const nguoiDungCapNhat = await prisma.nguoiDung.update({
      where: { email },
      data: { vaiTro: vaiTroMoi },
    })

    console.log(`Thành công! Tài khoản ${email} hiện có vai trò là: ${nguoiDungCapNhat.vaiTro}`)
    return nguoiDungCapNhat
  } catch (error) {
    console.error('Lỗi khi cập nhật vai trò (Có thể email không tồn tại):', error)
    throw error
  }
}

async function main() {
  console.log('🌱 Bắt đầu seeding database...')

  // Xóa dữ liệu cũ
  await prisma.buildItem.deleteMany()
  await prisma.cauHinhPC.deleteMany()
  await prisma.gioHangItem.deleteMany()
  await prisma.gioHang.deleteMany()
  await prisma.chiTietDonHang.deleteMany()
  await prisma.thanhToan.deleteMany()
  await prisma.donHang.deleteMany()
  await prisma.sanPham.deleteMany()
  await prisma.danhMuc.deleteMany()
  await prisma.nguoiDung.deleteMany()

  // Tạo danh mục
  const cpuCat = await prisma.danhMuc.create({
    data: { tenDanhMuc: 'CPU', moTa: 'Bộ xử lý trung tâm' },
  })

  const mainboardCat = await prisma.danhMuc.create({
    data: { tenDanhMuc: 'Mainboard', moTa: 'Bo mạch chủ' },
  })

  const ramCat = await prisma.danhMuc.create({
    data: { tenDanhMuc: 'RAM', moTa: 'Bộ nhớ truy cập ngẫu nhiên' },
  })

  const storageCat = await prisma.danhMuc.create({
    data: { tenDanhMuc: 'Storage', moTa: 'Ổ cứng SSD/HDD' },
  })

  const gpuCat = await prisma.danhMuc.create({
    data: { tenDanhMuc: 'GPU', moTa: 'Card màn hình' },
  })

  const psuCat = await prisma.danhMuc.create({
    data: { tenDanhMuc: 'PSU', moTa: 'Nguồn điện' },
  })

  // ============== THÊM NHIỀU CPU ==============
  const cpuProducts = [
    // Intel CPUs
    {
      tenSanPham: 'Intel Core i9-14900KS',
      slug: 'intel-core-i9-14900ks',
      gia: 24500000,
      hinhAnh: '../public/images/1.jpg',
      moTa: 'CPU flagship Intel phiên bản K Special Edition, 24 cores/32 threads',
      thuongHieu: 'Intel',
      thongSoKyThuat: {
        cores: 24,
        threads: 32,
        baseFreq: '3.2 GHz',
        boostFreq: '6.2 GHz',
        socket: 'LGA 1700',
        tdp: '150W'
      }
    },
    {
      tenSanPham: 'Intel Core i9-14900K',
      slug: 'intel-core-i9-14900k',
      gia: 22500000,
      hinhAnh: '../public/images/2.jpg',
      moTa: 'CPU cao cấp Intel thế hệ 14, 24 cores/32 threads',
      thuongHieu: 'Intel',
      thongSoKyThuat: {
        cores: 24,
        threads: 32,
        baseFreq: '3.2 GHz',
        boostFreq: '5.6 GHz',
        socket: 'LGA 1700',
        tdp: '125W'
      }
    },
    {
      tenSanPham: 'Intel Core i7-14700K',
      slug: 'intel-core-i7-14700k',
      gia: 18500000,
      hinhAnh: '../public/images/3.jpg',
      moTa: 'CPU cao cấp Intel thế hệ 14 cho gaming và xử lý đa nhiệm',
      thuongHieu: 'Intel',
      thongSoKyThuat: {
        cores: 20,
        threads: 28,
        baseFreq: '3.4 GHz',
        boostFreq: '5.6 GHz',
        socket: 'LGA 1700',
        tdp: '125W'
      }
    },
    {
      tenSanPham: 'Intel Core i7-14700',
      slug: 'intel-core-i7-14700',
      gia: 16000000,
      hinhAnh: '../public/images/4.jpg',
      moTa: 'Intel Core i7 phiên bản tiêu chuẩn, 20 cores/28 threads',
      thuongHieu: 'Intel',
      thongSoKyThuat: {
        cores: 20,
        threads: 28,
        baseFreq: '3.4 GHz',
        boostFreq: '5.4 GHz',
        socket: 'LGA 1700',
        tdp: '65W'
      }
    },
    {
      tenSanPham: 'Intel Core i5-14600K',
      slug: 'intel-core-i5-14600k',
      gia: 8500000,
      hinhAnh: '../public/images/5.jpg',
      moTa: 'CPU mid-range Intel đa năng cho gaming và công việc',
      thuongHieu: 'Intel',
      thongSoKyThuat: {
        cores: 14,
        threads: 20,
        baseFreq: '3.5 GHz',
        boostFreq: '5.3 GHz',
        socket: 'LGA 1700',
        tdp: '125W'
      }
    },
    // AMD CPUs
    {
      tenSanPham: 'AMD Ryzen 9 7950X3D',
      slug: 'amd-ryzen-9-7950x3d',
      gia: 22000000,
      hinhAnh: '../public/images/5.jpg',
      moTa: 'Ryzen 9 cao cấp với công nghệ 3D V-Cache, 16 cores/32 threads',
      thuongHieu: 'AMD',
      thongSoKyThuat: {
        cores: 16,
        threads: 32,
        baseFreq: '4.2 GHz',
        boostFreq: '5.7 GHz',
        socket: 'AM5',
        tdp: '162W'
      }
    },
    {
      tenSanPham: 'AMD Ryzen 9 7950X',
      slug: 'amd-ryzen-9-7950x',
      gia: 20000000,
      hinhAnh: '../public/images/',
      moTa: 'AMD Ryzen 9 phiên bản X, 16 cores/32 threads',
      thuongHieu: 'AMD',
      thongSoKyThuat: {
        cores: 16,
        threads: 32,
        baseFreq: '4.5 GHz',
        boostFreq: '5.7 GHz',
        socket: 'AM5',
        tdp: '105W'
      }
    },
    {
      tenSanPham: 'AMD Ryzen 9 7900X',
      slug: 'amd-ryzen-9-7900x',
      gia: 15500000,
      moTa: 'Ryzen 9 phiên bản X, 12 cores/24 threads',
      thuongHieu: 'AMD',
      thongSoKyThuat: {
        cores: 12,
        threads: 24,
        baseFreq: '4.7 GHz',
        boostFreq: '5.6 GHz',
        socket: 'AM5',
        tdp: '120W'
      }
    },
    {
      tenSanPham: 'AMD Ryzen 7 7700X',
      slug: 'amd-ryzen-7-7700x',
      gia: 11500000,
      moTa: 'Ryzen 7 bản X cho gaming và xử lý nội dung',
      thuongHieu: 'AMD',
      thongSoKyThuat: {
        cores: 8,
        threads: 16,
        baseFreq: '4.5 GHz',
        boostFreq: '5.4 GHz',
        socket: 'AM5',
        tdp: '105W'
      }
    },
    {
      tenSanPham: 'AMD Ryzen 5 7500F',
      slug: 'amd-ryzen-5-7500f',
      gia: 4500000,
      moTa: 'Ryzen 5 phiên bản F (không có GPU tích hợp), 6 cores/12 threads',
      thuongHieu: 'AMD',
      thongSoKyThuat: {
        cores: 6,
        threads: 12,
        baseFreq: '3.7 GHz',
        boostFreq: '5.0 GHz',
        socket: 'AM5',
        tdp: '65W'
      }
    }
    ,
    {
      tenSanPham: 'AMD Ryzen 9 9950X3D (Tray)',
      slug: 'amd-ryzen-9-9950x3d',
      gia: 19990000,
      hinhAnh: '../public/images/',
      moTa: '16 nhân, 32 luồng, 5.7 GHz, Socket AM5',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 16, threads: 32, boostFreq: '5.7 GHz', socket: 'AM5' }
    },
    {
      tenSanPham: 'AMD Ryzen 5 7600X',
      slug: 'amd-ryzen-5-7600x',
      gia: 6490000,
      hinhAnh: '../public/images/',
      moTa: '6 nhân, 12 luồng, 4.7 GHz, Socket AM5',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 6, threads: 12, boostFreq: '4.7 GHz', socket: 'AM5' }
    },
    {
      tenSanPham: 'AMD Ryzen 7 7700X (WOF)',
      slug: 'amd-ryzen-7-7700x-wof',
      gia: 9190000,
      hinhAnh: '../public/images/',
      moTa: '8 nhân, 16 luồng, 4.5 GHz, Socket AM5',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 8, threads: 16, boostFreq: '4.5 GHz', socket: 'AM5' }
    },
    {
      tenSanPham: 'AMD Ryzen 5 5500GT',
      slug: 'amd-ryzen-5-5500gt',
      gia: 3590000,
      hinhAnh: '../public/images/',
      moTa: '6 nhân, 12 luồng, 4.4 GHz, Socket AM4',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 6, threads: 12, boostFreq: '4.4 GHz', socket: 'AM4' }
    },
    {
      tenSanPham: 'AMD Ryzen 9 9950X',
      slug: 'amd-ryzen-9-9950x',
      gia: 16690000,
      hinhAnh: '../public/images/',
      moTa: '16 nhân, 32 luồng, 5.7 GHz, Socket AM5',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 16, threads: 32, boostFreq: '5.7 GHz', socket: 'AM5' }
    },
    {
      tenSanPham: 'AMD Ryzen 7 7800X3D (Tray)',
      slug: 'amd-ryzen-7-7800x3d',
      gia: 9290000,
      hinhAnh: '../public/images/',
      moTa: '8 nhân, 16 luồng, 5.0 GHz, Socket AM5',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 8, threads: 16, boostFreq: '5.0 GHz', socket: 'AM5' }
    },
    {
      tenSanPham: 'AMD Ryzen 7 5700X (Tray)',
      slug: 'amd-ryzen-7-5700x',
      gia: 5490000,
      hinhAnh: '../public/images/',
      moTa: '8 nhân, 16 luồng, 4.6 GHz, Socket AM4',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 8, threads: 16, boostFreq: '4.6 GHz', socket: 'AM4' }
    },
    {
      tenSanPham: 'AMD Ryzen 5 5500',
      slug: 'amd-ryzen-5-5500',
      gia: 2490000,
      hinhAnh: '../public/images/',
      moTa: '6 nhân, 12 luồng, 3.6 GHz, Socket AM4',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 6, threads: 12, baseFreq: '3.6 GHz', socket: 'AM4' }
    },
    {
      tenSanPham: 'AMD Ryzen 5 5600X',
      slug: 'amd-ryzen-5-5600x',
      gia: 4090000,
      hinhAnh: '../public/images/',
      moTa: '6 nhân, 12 luồng, 3.7 GHz, Socket AM4',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 6, threads: 12, baseFreq: '3.7 GHz', socket: 'AM4' }
    },
    {
      tenSanPham: 'AMD Ryzen 3 3200G (MPK)',
      slug: 'amd-ryzen-3-3200g',
      gia: 1990000,
      hinhAnh: '../public/images/',
      moTa: '4 nhân, 4 luồng, 4.0 GHz, Socket AM4',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 4, threads: 4, baseFreq: '4.0 GHz', socket: 'AM4' }
    },
    {
      tenSanPham: 'AMD Ryzen 5 5600GT (MPK)',
      slug: 'amd-ryzen-5-5600gt',
      gia: 3990000,
      hinhAnh: '../public/images/',
      moTa: '6 nhân, 12 luồng, 5.2 GHz, Socket AM4',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 6, threads: 12, boostFreq: '5.2 GHz', socket: 'AM4' }
    },
    {
      tenSanPham: 'AMD Ryzen 5 3400G (MPK)',
      slug: 'amd-ryzen-5-3400g',
      gia: 2090000,
      hinhAnh: '../public/images/',
      moTa: '4 nhân, 8 luồng, 4.2 GHz, Socket AM4',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 4, threads: 8, baseFreq: '4.2 GHz', socket: 'AM4' }
    },
    {
      tenSanPham: 'AMD Ryzen 5 7600',
      slug: 'amd-ryzen-5-7600',
      gia: 5490000,
      hinhAnh: '../public/images/',
      moTa: '6 nhân, 12 luồng, 3.8 GHz, Socket AM5',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 6, threads: 12, baseFreq: '3.8 GHz', socket: 'AM5' }
    },
    {
      tenSanPham: 'AMD Ryzen 3 4300G',
      slug: 'amd-ryzen-3-4300g',
      gia: 2390000,
      hinhAnh: '../public/images/',
      moTa: '4 nhân, 8 luồng, 3.8 GHz, Socket AM4',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 4, threads: 8, baseFreq: '3.8 GHz', socket: 'AM4' }
    },
    {
      tenSanPham: 'AMD Athlon 3000G',
      slug: 'amd-athlon-3000g',
      gia: 1290000,
      hinhAnh: '../public/images/',
      moTa: '2 nhân, 4 luồng, 3.5 GHz, Socket AM4',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 2, threads: 4, baseFreq: '3.5 GHz', socket: 'AM4' }
    },
    {
      tenSanPham: 'AMD Ryzen 7 9800X3D (WOF)',
      slug: 'amd-ryzen-7-9800x3d',
      gia: 13990000,
      hinhAnh: '../public/images/',
      moTa: '8 nhân, 16 luồng, 5.2 GHz, Socket AM5',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 8, threads: 16, boostFreq: '5.2 GHz', socket: 'AM5' }
    },
    // Intel CPUs from provided list
    {
      tenSanPham: 'Intel Core i5 14600KF',
      slug: 'intel-core-i5-14600kf',
      gia: 6990000,
      hinhAnh: '../public/images/',
      moTa: '14 nhân, 20 luồng, 3.4 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 14, threads: 20, baseFreq: '3.4 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core i7 14700',
      slug: 'intel-core-i7-14700',
      gia: 11990000,
      hinhAnh: '../public/images/',
      moTa: '20 nhân, 28 luồng, 2.1 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 20, threads: 28, baseFreq: '2.1 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core i5-12400F (TRAY)',
      slug: 'intel-core-i5-12400f',
      gia: 3990000,
      hinhAnh: '../public/images/',
      moTa: '6 nhân, 12 luồng, 4.40 GHz, Socket FCLGA1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 6, threads: 12, boostFreq: '4.4 GHz', socket: 'FCLGA1700' }
    },
    {
      tenSanPham: 'Intel Core i7 14700K',
      slug: 'intel-core-i7-14700k',
      gia: 12290000,
      hinhAnh: '../public/images/',
      moTa: '20 nhân, 28 luồng, 3.4 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 20, threads: 28, baseFreq: '3.4 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core i5 14500',
      slug: 'intel-core-i5-14500',
      gia: 8990000,
      hinhAnh: '../public/images/',
      moTa: '14 nhân, 20 luồng, 2.6 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 14, threads: 20, baseFreq: '2.6 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core i5 13400F (Tray)',
      slug: 'intel-core-i5-13400f',
      gia: 4290000,
      hinhAnh: '../public/images/',
      moTa: '10 nhân, 16 luồng, 4.6 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 10, threads: 16, boostFreq: '4.6 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core Ultra 9 285K',
      slug: 'intel-core-ultra-9-285k',
      gia: 16990000,
      hinhAnh: '../public/images/',
      moTa: '24 nhân, 24 luồng, 5.7 GHz, Socket FCLGA1851',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 24, threads: 24, boostFreq: '5.7 GHz', socket: 'FCLGA1851' }
    },
    {
      tenSanPham: 'Intel Core i5 14600K (Tray)',
      slug: 'intel-core-i5-14600k',
      gia: 7690000,
      hinhAnh: '../public/images/',
      moTa: '14 nhân, 20 luồng, 5.3 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 14, threads: 20, boostFreq: '5.3 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core i7 14700F',
      slug: 'intel-core-i7-14700f',
      gia: 10490000,
      hinhAnh: '../public/images/',
      moTa: '20 nhân, 28 luồng, 2.1 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 20, threads: 28, baseFreq: '2.1 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core i5 14400F (Tray)',
      slug: 'intel-core-i5-14400f',
      gia: 5990000,
      hinhAnh: '../public/images/',
      moTa: '10 nhân, 16 luồng, 4.7 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 10, threads: 16, boostFreq: '4.7 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core i3 13100F',
      slug: 'intel-core-i3-13100f',
      gia: 2990000,
      hinhAnh: '../public/images/',
      moTa: '4 nhân, 8 luồng, 3.4 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 4, threads: 8, baseFreq: '3.4 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core i3 14100F',
      slug: 'intel-core-i3-14100f',
      gia: 3290000,
      hinhAnh: '../public/images/',
      moTa: '4 nhân, 8 luồng, 3.5 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 4, threads: 8, baseFreq: '3.5 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core i5-12500',
      slug: 'intel-core-i5-12500',
      gia: 5990000,
      hinhAnh: '../public/images/',
      moTa: '6 nhân, 12 luồng, 4.6 GHz, Socket FCLGA1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 6, threads: 12, boostFreq: '4.6 GHz', socket: 'FCLGA1700' }
    },
    {
      tenSanPham: 'Intel Core i9 14900',
      slug: 'intel-core-i9-14900',
      gia: 19990000,
      hinhAnh: '../public/images/',
      moTa: '24 nhân, 32 luồng, 2.0 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 24, threads: 32, baseFreq: '2.0 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core i5 12400 (Tray)',
      slug: 'intel-core-i5-12400',
      gia: 5690000,
      hinhAnh: '../public/images/',
      moTa: '6 nhân, 12 luồng, 4.4 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 6, threads: 12, boostFreq: '4.4 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Pentium Gold G6405',
      slug: 'intel-pentium-g6405',
      gia: 1990000,
      hinhAnh: '../public/images/',
      moTa: '2 nhân, 4 luồng, 4.1 GHz, Socket LGA 1200',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 2, threads: 4, baseFreq: '4.1 GHz', socket: 'LGA 1200' }
    },
    {
      tenSanPham: 'Intel Core Ultra 5 225 (Tray)',
      slug: 'intel-core-ultra-5-225',
      gia: 4690000,
      hinhAnh: '../public/images/',
      moTa: '10 nhân, 10 luồng, 4.9 GHz, Socket FCLGA1851',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 10, threads: 10, boostFreq: '4.9 GHz', socket: 'FCLGA1851' }
    },
    {
      tenSanPham: 'Intel Core i3 14100 (Tray)',
      slug: 'intel-core-i3-14100',
      gia: 4490000,
      hinhAnh: '../public/images/',
      moTa: '4 nhân, 8 luồng, 4.7 GHz, Socket FCLGA1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 4, threads: 8, boostFreq: '4.7 GHz', socket: 'FCLGA1700' }
    },
    {
      tenSanPham: 'Intel Core i7 12700 (Tray)',
      slug: 'intel-core-i7-12700',
      gia: 9290000,
      hinhAnh: '../public/images/',
      moTa: '12 nhân, 20 luồng, 4.9 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 12, threads: 20, boostFreq: '4.9 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core i3 12100 (Tray)',
      slug: 'intel-core-i3-12100',
      gia: 4490000,
      hinhAnh: '../public/images/',
      moTa: '4 nhân, 8 luồng, 4.3 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 4, threads: 8, boostFreq: '4.3 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core Ultra 5 225F (Tray)',
      slug: 'intel-core-ultra-5-225f',
      gia: 4290000,
      hinhAnh: '../public/images/',
      moTa: '10 nhân, 10 luồng, 4.9 GHz, Socket LGA 1851',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 10, threads: 10, boostFreq: '4.9 GHz', socket: 'LGA 1851' }
    },
    {
      tenSanPham: 'Intel Core Ultra 5 245K',
      slug: 'intel-core-ultra-5-245k',
      gia: 8290000,
      hinhAnh: '../public/images/',
      moTa: '14 nhân, 14 luồng, 5.2 GHz, Socket FCLGA1851',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 14, threads: 14, boostFreq: '5.2 GHz', socket: 'FCLGA1851' }
    },
    {
      tenSanPham: 'Intel Core Ultra 5 245KF',
      slug: 'intel-core-ultra-5-245kf',
      gia: 7990000,
      hinhAnh: '../public/images/',
      moTa: '14 nhân, 14 luồng, 5.2 GHz, Socket FCLGA1851',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 14, threads: 14, boostFreq: '5.2 GHz', socket: 'FCLGA1851' }
    },
    {
      tenSanPham: 'Intel Core i7 14700KF',
      slug: 'intel-core-i7-14700kf',
      gia: 10990000,
      hinhAnh: '../public/images/',
      moTa: '20 nhân, 28 luồng, 3.4 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 20, threads: 28, baseFreq: '3.4 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core i9 14900KF',
      slug: 'intel-core-i9-14900kf',
      gia: 15990000,
      hinhAnh: '../public/images/',
      moTa: '24 nhân, 32 luồng, 3.2 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 24, threads: 32, baseFreq: '3.2 GHz', socket: 'LGA 1700' }
    }
  ]

  for (const cpu of cpuProducts) {
    await prisma.sanPham.create({
      data: {
        ...cpu,
        hinhAnh: (cpu as any).hinhAnh || `https://via.placeholder.com/300x300?text=${cpu.slug}`,
        soLuongTon: 50,
        danhMucId: cpuCat.id
      }
    })
  }

  // ============== THÊM NHIỀU GPU ==============
  const gpuProducts = [
    {
      tenSanPham: 'NVIDIA RTX 4090',
      slug: 'nvidia-rtx-4090',
      gia: 42000000,
      moTa: 'Card đồ họa flagship NVIDIA, 24GB GDDR6X',
      thuongHieu: 'NVIDIA',
      thongSoKyThuat: {
        memory: '24GB GDDR6X',
        memoryClock: '20 Gbps',
        cudaCores: 16384,
        tgp: '575W'
      }
    },
    {
      tenSanPham: 'NVIDIA RTX 4080 Super',
      slug: 'nvidia-rtx-4080-super',
      gia: 35000000,
      moTa: 'Card đồ họa cao cấp NVIDIA RTX 4080 Super, 16GB',
      thuongHieu: 'NVIDIA',
      thongSoKyThuat: {
        memory: '16GB GDDR6X',
        memoryClock: '20 Gbps',
        cudaCores: 10240,
        tgp: '320W'
      }
    },
    {
      tenSanPham: 'NVIDIA RTX 4080',
      slug: 'nvidia-rtx-4080',
      gia: 32000000,
      moTa: 'Card đồ họa cao cấp cho gaming 1440p+',
      thuongHieu: 'NVIDIA',
      thongSoKyThuat: {
        memory: '16GB GDDR6X',
        memoryClock: '20 Gbps',
        cudaCores: 9728,
        tgp: '320W'
      }
    },
    {
      tenSanPham: 'NVIDIA RTX 4070 Ti Super',
      slug: 'nvidia-rtx-4070-ti-super',
      gia: 31000000,
      moTa: 'RTX 4070 Ti phiên bản Super, 12GB GDDR6X',
      thuongHieu: 'NVIDIA',
      thongSoKyThuat: {
        memory: '12GB GDDR6X',
        memoryClock: '21 Gbps',
        cudaCores: 8064,
        tgp: '285W'
      }
    },
    {
      tenSanPham: 'NVIDIA RTX 4070 Ti',
      slug: 'nvidia-rtx-4070-ti',
      gia: 28500000,
      moTa: 'Card đồ họa mid-high end, 12GB GDDR6X',
      thuongHieu: 'NVIDIA',
      thongSoKyThuat: {
        memory: '12GB GDDR6X',
        memoryClock: '21 Gbps',
        cudaCores: 7680,
        tgp: '285W'
      }
    },
    {
      tenSanPham: 'NVIDIA RTX 4070',
      slug: 'nvidia-rtx-4070',
      gia: 21000000,
      moTa: 'Card đồ họa tầm trung cho gaming 1440p',
      thuongHieu: 'NVIDIA',
      thongSoKyThuat: {
        memory: '12GB GDDR6',
        memoryClock: '21 Gbps',
        cudaCores: 5888,
        tgp: '200W'
      }
    },
    {
      tenSanPham: 'AMD Radeon RX 7900 XTX',
      slug: 'amd-radeon-rx-7900-xtx',
      gia: 31000000,
      moTa: 'Card đồ họa AMD cao cấp, 24GB GDDR6',
      thuongHieu: 'AMD',
      thongSoKyThuat: {
        memory: '24GB GDDR6',
        memoryClock: '20 Gbps',
        streamProcessors: 6144,
        tgp: '500W'
      }
    },
    {
      tenSanPham: 'AMD Radeon RX 7900 XT',
      slug: 'amd-radeon-rx-7900-xt',
      gia: 24000000,
      moTa: 'Card đồ họa AMD Radeon RX 7900 XT',
      thuongHieu: 'AMD',
      thongSoKyThuat: {
        memory: '20GB GDDR6',
        memoryClock: '20 Gbps',
        streamProcessors: 5376,
        tgp: '420W'
      }
    }
  ]

  for (const gpu of gpuProducts) {
    await prisma.sanPham.create({
      data: {
        ...gpu,
        hinhAnh: (gpu as any).hinhAnh || `https://via.placeholder.com/300x300?text=${gpu.slug}`,
        soLuongTon: 30,
        danhMucId: gpuCat.id
      }
    })
  }

  // ============== THÊM NHIỀU RAM ==============
  const ramProducts = [
    {
      tenSanPham: 'Corsair Vengeance DDR5 64GB (2x32GB)',
      slug: 'corsair-vengeance-ddr5-64gb',
      gia: 9500000,
      moTa: 'Bộ RAM DDR5 Corsair Vengeance 64GB tốc độ cao',
      thuongHieu: 'Corsair',
      thongSoKyThuat: {
        capacity: '64GB (2x32GB)',
        type: 'DDR5',
        speed: '6400MHz',
        latency: 'CL32'
      }
    },
    {
      tenSanPham: 'Corsair Vengeance DDR5 32GB (2x16GB)',
      slug: 'corsair-vengeance-ddr5-32gb',
      gia: 4500000,
      moTa: 'Bộ RAM DDR5 Corsair, 32GB tốc độ 6400MHz',
      thuongHieu: 'Corsair',
      thongSoKyThuat: {
        capacity: '32GB (2x16GB)',
        type: 'DDR5',
        speed: '6400MHz',
        latency: 'CL32'
      }
    },
    {
      tenSanPham: 'Kingston Fury Beast DDR5 32GB',
      slug: 'kingston-fury-beast-ddr5-32gb',
      gia: 4200000,
      moTa: 'RAM Kingston Fury Beast DDR5 32GB',
      thuongHieu: 'Kingston',
      thongSoKyThuat: {
        capacity: '32GB (2x16GB)',
        type: 'DDR5',
        speed: '6400MHz',
        latency: 'CL32'
      }
    },
    {
      tenSanPham: 'G.Skill Trident Z5 DDR5 48GB',
      slug: 'gskill-trident-z5-ddr5-48gb',
      gia: 7200000,
      moTa: 'RAM G.Skill Trident Z5 DDR5 48GB tốc độ siêu cao',
      thuongHieu: 'G.Skill',
      thongSoKyThuat: {
        capacity: '48GB (2x24GB)',
        type: 'DDR5',
        speed: '7200MHz',
        latency: 'CL30'
      }
    },
    {
      tenSanPham: 'Crucial Pro DDR5 32GB',
      slug: 'crucial-pro-ddr5-32gb',
      gia: 4000000,
      moTa: 'RAM Crucial Pro DDR5 32GB đáng tin cậy',
      thuongHieu: 'Crucial',
      thongSoKyThuat: {
        capacity: '32GB (2x16GB)',
        type: 'DDR5',
        speed: '6400MHz',
        latency: 'CL32'
      }
    },
    {
      tenSanPham: 'ROG STRIX FLARE II DDR5 32GB',
      slug: 'rog-strix-flare-ii-ddr5-32gb',
      gia: 5500000,
      moTa: 'RAM ASUS ROG STRIX Flare II DDR5 32GB RGB',
      thuongHieu: 'ASUS',
      thongSoKyThuat: {
        capacity: '32GB (2x16GB)',
        type: 'DDR5',
        speed: '7200MHz',
        latency: 'CL34'
      }
    },
    {
      tenSanPham: 'RAM Laptop Kingston 1.2V 8GB 3200MHz',
      slug: 'ram-laptop-kingston-1-2v-8gb-3200mhz',
      gia: 2490000,
      moTa: 'RAM Laptop Kingston 1.2V 8GB 3200MHz DDR4',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '8GB',
        type: 'DDR4',
        speed: '3200MHz',
        voltage: '1.2V',
        formFactor: 'SO-DIMM'
      }
    },
    {
      tenSanPham: 'RAM Laptop Kingston Sodimm 1.2V 16GB 3200MHz',
      slug: 'ram-laptop-kingston-sodimm-1-2v-16gb-3200mhz',
      gia: 3990000,
      moTa: 'RAM Laptop Kingston Sodimm 1.2V 16GB 3200MHz DDR4',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '16GB',
        type: 'DDR4',
        speed: '3200MHz',
        voltage: '1.2V',
        formFactor: 'SO-DIMM'
      }
    },
    {
      tenSanPham: 'RAM Laptop Kingston DDR4 3200MHz 8GB',
      slug: 'ram-laptop-kingston-ddr4-3200mhz-8gb',
      gia: 2490000,
      moTa: 'RAM Laptop Kingston DDR4 3200MHz 8GB',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '8GB',
        type: 'DDR4',
        speed: '3200MHz',
        formFactor: 'SO-DIMM'
      }
    },
    {
      tenSanPham: 'RAM Laptop Kingston DDR5 5600MHz 16GB',
      slug: 'ram-laptop-kingston-ddr5-5600mhz-16gb',
      gia: 6490000,
      moTa: 'RAM Laptop Kingston DDR5 5600MHz 16GB',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '16GB',
        type: 'DDR5',
        speed: '5600MHz',
        formFactor: 'SO-DIMM'
      }
    },
    {
      tenSanPham: 'RAM PC Kingston Fury Beast DDR4 3200MHz 16GB',
      slug: 'ram-pc-kingston-fury-beast-ddr4-3200mhz-16gb',
      gia: 3990000,
      moTa: 'RAM PC Kingston Fury Beast DDR4 3200MHz 16GB',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '16GB',
        type: 'DDR4',
        speed: '3200MHz',
        formFactor: 'DIMM'
      }
    },
    {
      tenSanPham: 'RAM Laptop Kingston DDR5 5600MHz 8GB',
      slug: 'ram-laptop-kingston-ddr5-5600mhz-8gb',
      gia: 3490000,
      moTa: 'RAM Laptop Kingston DDR5 5600MHz 8GB',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '8GB',
        type: 'DDR5',
        speed: '5600MHz',
        formFactor: 'SO-DIMM'
      }
    },
    {
      tenSanPham: 'RAM Laptop Kingston DDR4 3200MHz 16GB',
      slug: 'ram-laptop-kingston-ddr4-3200mhz-16gb',
      gia: 3990000,
      moTa: 'RAM Laptop Kingston DDR4 3200MHz 16GB',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '16GB',
        type: 'DDR4',
        speed: '3200MHz',
        formFactor: 'SO-DIMM'
      }
    },
    {
      tenSanPham: 'RAM Laptop Kingston 1.2V 3200MHz KVR32S22D8/32',
      slug: 'ram-laptop-kingston-kvr32s22d8-32-3200mhz',
      gia: 10990000,
      moTa: 'RAM Laptop Kingston 1.2V 3200MHz KVR32S22D8/32, 32GB DDR4',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '32GB',
        type: 'DDR4',
        speed: '3200MHz',
        voltage: '1.2V',
        formFactor: 'SO-DIMM',
        model: 'KVR32S22D8/32'
      }
    },
    {
      tenSanPham: 'RAM PC Kingston Fury DDR5 5600MHz 32GB (2x16GB)',
      slug: 'ram-pc-kingston-fury-ddr5-5600mhz-32gb-2x16',
      gia: 13990000,
      moTa: 'RAM PC Kingston Fury DDR5 5600MHz 32GB (2x16GB)',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '32GB (2x16GB)',
        type: 'DDR5',
        speed: '5600MHz',
        formFactor: 'DIMM'
      }
    },
    {
      tenSanPham: 'RAM PC Kingston Fury DDR5 5600MHz 16GB (1x16GB)',
      slug: 'ram-pc-kingston-fury-ddr5-5600mhz-16gb-1x16',
      gia: 7290000,
      moTa: 'RAM PC Kingston Fury DDR5 5600MHz 16GB (1x16GB)',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '16GB (1x16GB)',
        type: 'DDR5',
        speed: '5600MHz',
        formFactor: 'DIMM'
      }
    },
    {
      tenSanPham: 'RAM PC Kingston Fury DDR5 6000MHz 16GB (1x16GB)',
      slug: 'ram-pc-kingston-fury-ddr5-6000mhz-16gb-1x16',
      gia: 7290000,
      moTa: 'RAM PC Kingston Fury DDR5 6000MHz 16GB (1x16GB)',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '16GB (1x16GB)',
        type: 'DDR5',
        speed: '6000MHz',
        formFactor: 'DIMM'
      }
    },
    {
      tenSanPham: 'RAM PC Kingston Fury 8GB 3200MHz KF432C16BB/8',
      slug: 'ram-pc-kingston-fury-8gb-3200mhz-kf432c16bb-8',
      gia: 2490000,
      moTa: 'RAM PC Kingston Fury 8GB 3200MHz KF432C16BB/8',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '8GB',
        type: 'DDR4',
        speed: '3200MHz',
        formFactor: 'DIMM',
        model: 'KF432C16BB/8'
      }
    },
    {
      tenSanPham: 'RAM PC Kingston Fury RGB DDR5 6000MHz 64GB (2x32GB)',
      slug: 'ram-pc-kingston-fury-rgb-ddr5-6000mhz-64gb-2x32',
      gia: 26990000,
      moTa: 'RAM PC Kingston Fury RGB DDR5 6000MHz 64GB (2x32GB)',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '64GB (2x32GB)',
        type: 'DDR5',
        speed: '6000MHz',
        formFactor: 'DIMM',
        rgb: true
      }
    },
    {
      tenSanPham: 'RAM PC Kingston Fury RGB DDR5 6000MHz 32GB (2x16GB)',
      slug: 'ram-pc-kingston-fury-rgb-ddr5-6000mhz-32gb-2x16',
      gia: 14490000,
      moTa: 'RAM PC Kingston Fury RGB DDR5 6000MHz 32GB (2x16GB)',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '32GB (2x16GB)',
        type: 'DDR5',
        speed: '6000MHz',
        formFactor: 'DIMM',
        rgb: true
      }
    },
    {
      tenSanPham: 'RAM PC Kingston Fury DDR5 6000MHz 32GB (2x16GB)',
      slug: 'ram-pc-kingston-fury-ddr5-6000mhz-32gb-2x16',
      gia: 14490000,
      moTa: 'RAM PC Kingston Fury DDR5 6000MHz 32GB (2x16GB)',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '32GB (2x16GB)',
        type: 'DDR5',
        speed: '6000MHz',
        formFactor: 'DIMM'
      }
    },
    {
      tenSanPham: 'RAM PC Kingston Fury Beast RGB DDR5 5600MHz 64GB (2x32GB)',
      slug: 'ram-pc-kingston-fury-beast-rgb-ddr5-5600mhz-64gb-2x32',
      gia: 26990000,
      moTa: 'RAM PC Kingston Fury Beast RGB DDR5 5600MHz 64GB (2x32GB)',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '64GB (2x32GB)',
        type: 'DDR5',
        speed: '5600MHz',
        formFactor: 'DIMM',
        rgb: true
      }
    },
    {
      tenSanPham: 'RAM PC Kingston Fury RGB DDR5 6000MHz 32GB (1x32GB)',
      slug: 'ram-pc-kingston-fury-rgb-ddr5-6000mhz-32gb-1x32',
      gia: 14490000,
      moTa: 'RAM PC Kingston Fury RGB DDR5 6000MHz 32GB (1x32GB)',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '32GB (1x32GB)',
        type: 'DDR5',
        speed: '6000MHz',
        formFactor: 'DIMM',
        rgb: true
      }
    },
    {
      tenSanPham: 'RAM Kingston DDR5 5600MT/s 32GB',
      slug: 'ram-kingston-ddr5-5600mt-s-32gb',
      gia: 14990000,
      moTa: 'RAM Kingston DDR5 5600MT/s 32GB',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '32GB',
        type: 'DDR5',
        speed: '5600MT/s',
        formFactor: 'DIMM'
      }
    },
    {
      tenSanPham: 'RAM PC Kingston Fury Beast Black 16GB 3200MHz DDR4',
      slug: 'ram-pc-kingston-fury-beast-black-ddr4-3200mhz-16gb',
      gia: 3990000,
      moTa: 'RAM PC Kingston Fury Beast Black 16GB 3200MHz DDR4',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '16GB',
        type: 'DDR4',
        speed: '3200MHz',
        formFactor: 'DIMM'
      }
    },
    {
      tenSanPham: 'RAM PC Kingston Fury Beast DDR4 3200MHz 8GB',
      slug: 'ram-pc-kingston-fury-beast-ddr4-3200mhz-8gb',
      gia: 2490000,
      moTa: 'RAM PC Kingston Fury Beast DDR4 3200MHz 8GB',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '8GB',
        type: 'DDR4',
        speed: '3200MHz',
        formFactor: 'DIMM'
      }
    },
    {
      tenSanPham: 'RAM PC ADATA XPG D50 RGB 16GB (1x16GB) 3200MHz',
      slug: 'ram-pc-adata-xpg-d50-rgb-16gb-1x16-3200mhz',
      gia: 4290000,
      moTa: 'RAM PC ADATA XPG D50 RGB 16GB (1x16GB) 3200MHz DDR4',
      thuongHieu: 'ADATA',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '16GB (1x16GB)',
        type: 'DDR4',
        speed: '3200MHz',
        formFactor: 'DIMM',
        rgb: true
      }
    },
    {
      tenSanPham: 'RAM PC ADATA XPG D50 RGB 8GB (1x8GB) 3200MHz DDR4',
      slug: 'ram-pc-adata-xpg-d50-rgb-8gb-1x8-3200mhz',
      gia: 2690000,
      moTa: 'RAM PC ADATA XPG D50 RGB 8GB (1x8GB) 3200MHz DDR4',
      thuongHieu: 'ADATA',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '8GB (1x8GB)',
        type: 'DDR4',
        speed: '3200MHz',
        formFactor: 'DIMM',
        rgb: true
      }
    },
    {
      tenSanPham: 'RAM PC ADATA XPG LANCER RGB 16GB (1x16GB) 6000MHz',
      slug: 'ram-pc-adata-xpg-lancer-rgb-16gb-1x16-6000mhz',
      gia: 7690000,
      moTa: 'RAM PC ADATA XPG LANCER RGB 16GB (1x16GB) 6000MHz DDR5',
      thuongHieu: 'ADATA',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '16GB (1x16GB)',
        type: 'DDR5',
        speed: '6000MHz',
        formFactor: 'DIMM',
        rgb: true
      }
    },
    {
      tenSanPham: 'RAM PC ADATA XPG D35G RGB 16GB (1x16GB) 3200MHz',
      slug: 'ram-pc-adata-xpg-d35g-rgb-16gb-1x16-3200mhz',
      gia: 4290000,
      moTa: 'RAM PC ADATA XPG D35G RGB 16GB (1x16GB) 3200MHz DDR4',
      thuongHieu: 'ADATA',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '16GB (1x16GB)',
        type: 'DDR4',
        speed: '3200MHz',
        formFactor: 'DIMM',
        rgb: true
      }
    },
    {
      tenSanPham: 'RAM PC ADATA XPG D35G RGB 8GB (1x8GB) 3200MHz',
      slug: 'ram-pc-adata-xpg-d35g-rgb-8gb-1x8-3200mhz',
      gia: 2690000,
      moTa: 'RAM PC ADATA XPG D35G RGB 8GB (1x8GB) 3200MHz DDR4',
      thuongHieu: 'ADATA',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '8GB (1x8GB)',
        type: 'DDR4',
        speed: '3200MHz',
        formFactor: 'DIMM',
        rgb: true
      }
    },
    {
      tenSanPham: 'RAM PNY XLR8 DDR4 3200MHz Heatsink RGB 8GB',
      slug: 'ram-pny-xlr8-ddr4-3200mhz-heatsink-rgb-8gb',
      gia: 2690000,
      moTa: 'RAM PNY XLR8 DDR4 3200MHz Heatsink RGB 8GB',
      thuongHieu: 'PNY',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '8GB',
        type: 'DDR4',
        speed: '3200MHz',
        formFactor: 'DIMM',
        rgb: true
      }
    }
  ]

  for (const ram of ramProducts) {
    await prisma.sanPham.create({
      data: {
        ...ram,
        hinhAnh: (ram as any).hinhAnh || `https://via.placeholder.com/300x300?text=${ram.slug}`,
        soLuongTon: 100,
        danhMucId: ramCat.id
      }
    })
  }

  // ============== THÊM NHIỀU STORAGE ==============
  const storageProducts = [
    {
      tenSanPham: 'Samsung 990 Pro 4TB',
      slug: 'samsung-990-pro-4tb',
      gia: 16500000,
      moTa: 'SSD NVMe Samsung 990 Pro 4TB PCIe 4.0',
      thuongHieu: 'Samsung',
      thongSoKyThuat: {
        capacity: '4TB',
        interface: 'NVMe PCIe 4.0',
        readSpeed: '7450MB/s',
        writeSpeed: '6900MB/s'
      }
    },
    {
      tenSanPham: 'Samsung 990 Pro 2TB',
      slug: 'samsung-990-pro-2tb',
      gia: 8500000,
      moTa: 'SSD NVMe Samsung 990 Pro 2TB PCIe 4.0',
      thuongHieu: 'Samsung',
      thongSoKyThuat: {
        capacity: '2TB',
        interface: 'NVMe PCIe 4.0',
        readSpeed: '7450MB/s',
        writeSpeed: '6900MB/s'
      }
    },
    {
      tenSanPham: 'WD Black SN850X 2TB',
      slug: 'wd-black-sn850x-2tb',
      gia: 7200000,
      moTa: 'SSD WD Black SN850X NVMe PCIe 4.0 2TB',
      thuongHieu: 'WD',
      thongSoKyThuat: {
        capacity: '2TB',
        interface: 'NVMe PCIe 4.0',
        readSpeed: '7100MB/s',
        writeSpeed: '5700MB/s'
      }
    },
    {
      tenSanPham: 'WD Black SN850X 4TB',
      slug: 'wd-black-sn850x-4tb',
      gia: 14000000,
      moTa: 'SSD WD Black SN850X NVMe 4TB',
      thuongHieu: 'WD',
      thongSoKyThuat: {
        capacity: '4TB',
        interface: 'NVMe PCIe 4.0',
        readSpeed: '7100MB/s',
        writeSpeed: '5700MB/s'
      }
    },
    {
      tenSanPham: 'Kingston NV2 1TB',
      slug: 'kingston-nv2-1tb',
      gia: 2500000,
      moTa: 'SSD Kingston NV2 NVMe 1TB giá rẻ',
      thuongHieu: 'Kingston',
      thongSoKyThuat: {
        capacity: '1TB',
        interface: 'NVMe M.2',
        readSpeed: '3500MB/s',
        writeSpeed: '2800MB/s'
      }
    },
    {
      tenSanPham: 'Seagate Barracuda 4TB HDD',
      slug: 'seagate-barracuda-4tb',
      gia: 2800000,
      moTa: 'Ổ cứng HDD Seagate Barracuda 4TB',
      thuongHieu: 'Seagate',
      thongSoKyThuat: {
        capacity: '4TB',
        interface: 'SATA 3.5"',
        rpm: '5400 RPM',
        cache: '256MB'
      }
    },
    {
      tenSanPham: 'Kingston NV3 PCIe 4.0 NVMe 1TB',
      slug: 'kingston-nv3-pcie-4-0-nvme-1tb',
      gia: 4990000,
      moTa: 'SSD Kingston NV3 PCIe 4.0 NVMe 1TB',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '1TB',
        interface: 'M.2 PCIe Gen 4x4',
        readSpeed: '6000MB/s',
        writeSpeed: '4000MB/s'
      }
    },
    {
      tenSanPham: 'Kingston NV3 PCIe 4.0 NVMe 500GB',
      slug: 'kingston-nv3-pcie-4-0-nvme-500gb',
      gia: 3190000,
      moTa: 'SSD Kingston NV3 PCIe 4.0 NVMe 500GB',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '500GB',
        interface: 'M.2 PCIe Gen 4x4',
        readSpeed: '5000MB/s',
        writeSpeed: '3000MB/s'
      }
    },
    {
      tenSanPham: 'Samsung 990 PRO PCIe Gen 4.0 x4 NVMe 1TB',
      slug: 'samsung-990-pro-pcie-gen-4-x4-nvme-1tb',
      gia: 8990000,
      moTa: 'SSD Samsung 990 PRO PCIe Gen 4.0 x4 NVMe 1TB',
      thuongHieu: 'Samsung',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '1TB',
        interface: 'M.2 PCIe Gen 4x4',
        readSpeed: '7450MB/s',
        writeSpeed: '6900MB/s'
      }
    },
    {
      tenSanPham: 'Transcend 110S NVMe PCIe Gen3 x4 512GB',
      slug: 'transcend-110s-nvme-pcie-gen3-x4-512gb',
      gia: 2890000,
      moTa: 'SSD Transcend 110S NVMe PCIe Gen3 x4 512GB',
      thuongHieu: 'Transcend',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '512GB',
        interface: 'M.2 PCIe Gen3 x4',
        readSpeed: '1700MB/s',
        writeSpeed: '1500MB/s'
      }
    },
    {
      tenSanPham: 'VSP 860G SATA III 2.5" 256GB',
      slug: 'vsp-860g-sata-iii-2-5-256gb',
      gia: 1690000,
      moTa: 'SSD VSP 860G SATA III 2.5" 256GB',
      thuongHieu: 'VSP',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '256GB',
        interface: 'SATA III 2.5"',
        readSpeed: '560MB/s',
        writeSpeed: '500MB/s'
      }
    },
    {
      tenSanPham: 'Samsung 990 PRO PCIe Gen 4.0 x4 NVMe 2TB',
      slug: 'samsung-990-pro-pcie-gen-4-x4-nvme-2tb',
      gia: 16990000,
      moTa: 'SSD Samsung 990 PRO PCIe Gen 4.0 x4 NVMe 2TB',
      thuongHieu: 'Samsung',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '2TB',
        interface: 'M.2 PCIe Gen 4x4',
        readSpeed: '7450MB/s',
        writeSpeed: '6900MB/s'
      }
    },
    {
      tenSanPham: 'Kingston NV3 PCIe 4.0 NVMe 2TB',
      slug: 'kingston-nv3-pcie-4-0-nvme-2tb',
      gia: 8490000,
      moTa: 'SSD Kingston NV3 PCIe 4.0 NVMe 2TB',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '2TB',
        interface: 'M.2 PCIe Gen 4x4',
        readSpeed: '6000MB/s',
        writeSpeed: '5000MB/s'
      }
    },
    {
      tenSanPham: 'Transcend 110S NVMe PCIe Gen3 x4 256GB',
      slug: 'transcend-110s-nvme-pcie-gen3-x4-256gb',
      gia: 1790000,
      moTa: 'SSD Transcend 110S NVMe PCIe Gen3 x4 256GB',
      thuongHieu: 'Transcend',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '256GB',
        interface: 'M.2 PCIe Gen3 x4',
        readSpeed: '1600MB/s',
        writeSpeed: '1100MB/s'
      }
    },
    {
      tenSanPham: 'ADATA SU650 SATA III 2.5" 512GB',
      slug: 'adata-su650-sata-iii-2-5-512gb',
      gia: 2890000,
      moTa: 'SSD ADATA SU650 SATA III 2.5" 512GB',
      thuongHieu: 'ADATA',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '512GB',
        interface: 'SATA III 2.5"',
        readSpeed: '520MB/s',
        writeSpeed: '450MB/s'
      }
    },
    {
      tenSanPham: 'WD Blue SN5000 NVMe PCIe Gen4 x4 500GB',
      slug: 'wd-blue-sn5000-nvme-pcie-gen4-x4-500gb',
      gia: 3190000,
      moTa: 'SSD WD Blue SN5000 NVMe PCIe Gen4 x4 500GB',
      thuongHieu: 'WD',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '500GB',
        interface: 'M.2 PCIe Gen4 x4',
        readSpeed: '5000MB/s',
        writeSpeed: '4000MB/s'
      }
    },
    {
      tenSanPham: 'WD Blue SN5000 NVMe PCIe Gen4 x4 1TB',
      slug: 'wd-blue-sn5000-nvme-pcie-gen4-x4-1tb',
      gia: 4990000,
      moTa: 'SSD WD Blue SN5000 NVMe PCIe Gen4 x4 1TB',
      thuongHieu: 'WD',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '1TB',
        interface: 'M.2 PCIe Gen4 x4',
        readSpeed: '5150MB/s',
        writeSpeed: '4900MB/s'
      }
    },
    {
      tenSanPham: 'Sandisk E61 Extreme Portable 1TB',
      slug: 'sandisk-e61-extreme-portable-1tb',
      gia: 5790000,
      moTa: 'SSD di động Sandisk E61 Extreme Portable 1TB USB 3.2 Gen 2',
      thuongHieu: 'Sandisk',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '1TB',
        interface: 'USB 3.2 Gen 2',
        readSpeed: '1050MB/s',
        writeSpeed: '1000MB/s',
        formFactor: 'Portable'
      }
    },
    {
      tenSanPham: 'Transcend MTE410S M.2 2242 PCIe Gen4 x4 1TB',
      slug: 'transcend-mte410s-m2-2242-pcie-gen4-x4-1tb',
      gia: 4990000,
      moTa: 'SSD Transcend MTE410S M.2 2242 PCIe Gen4 x4 1TB',
      thuongHieu: 'Transcend',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '1TB',
        interface: 'M.2 PCIe Gen4 x4',
        formFactor: '2242',
        readSpeed: '5000MB/s',
        writeSpeed: '3500MB/s'
      }
    },
    {
      tenSanPham: 'Transcend MTE410S M.2 2242 PCIe Gen4 x4 512GB',
      slug: 'transcend-mte410s-m2-2242-pcie-gen4-x4-512gb',
      gia: 3190000,
      moTa: 'SSD Transcend MTE410S M.2 2242 PCIe Gen4 x4 512GB',
      thuongHieu: 'Transcend',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '512GB',
        interface: 'M.2 PCIe Gen4 x4',
        formFactor: '2242',
        readSpeed: '5000MB/s',
        writeSpeed: '3200MB/s'
      }
    },
    {
      tenSanPham: 'ADATA LEGEND 860 PCIe Gen4 x4 M.2 2280 1TB',
      slug: 'adata-legend-860-pcie-gen4-x4-m2-2280-1tb',
      gia: 4990000,
      moTa: 'SSD ADATA LEGEND 860 PCIe Gen4 x4 M.2 2280 1TB',
      thuongHieu: 'ADATA',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '1TB',
        interface: 'M.2 PCIe Gen4 x4',
        formFactor: '2280',
        readSpeed: '6000MB/s',
        writeSpeed: '5000MB/s'
      }
    },
    {
      tenSanPham: 'Patriot P400 Lite M.2 PCIe Gen 4x4 1TB',
      slug: 'patriot-p400-lite-m2-pcie-gen-4x4-1tb',
      gia: 4490000,
      moTa: 'SSD Patriot P400 Lite M.2 PCIe Gen 4x4 1TB',
      thuongHieu: 'Patriot',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '1TB',
        interface: 'M.2 PCIe Gen4 x4',
        readSpeed: '3500MB/s',
        writeSpeed: '2700MB/s'
      }
    },
    {
      tenSanPham: 'Sandisk E61 Extreme Portable 2TB',
      slug: 'sandisk-e61-extreme-portable-2tb',
      gia: 8690000,
      moTa: 'SSD di động Sandisk E61 Extreme Portable 2TB USB 3.2 Gen 2',
      thuongHieu: 'Sandisk',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '2TB',
        interface: 'USB 3.2 Gen 2',
        readSpeed: '1050MB/s',
        writeSpeed: '1000MB/s',
        formFactor: 'Portable'
      }
    },
    {
      tenSanPham: 'ADATA LEGEND 860 PCIe Gen4 x4 M.2 2280 500GB',
      slug: 'adata-legend-860-pcie-gen4-x4-m2-2280-500gb',
      gia: 3190000,
      moTa: 'SSD ADATA LEGEND 860 PCIe Gen4 x4 M.2 2280 500GB',
      thuongHieu: 'ADATA',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '500GB',
        interface: 'M.2 PCIe Gen4 x4',
        formFactor: '2280',
        readSpeed: '6000MB/s',
        writeSpeed: '4000MB/s'
      }
    },
    {
      tenSanPham: 'Transcend MTE310S M.2 2230 PCIe Gen4 x4 512GB',
      slug: 'transcend-mte310s-m2-2230-pcie-gen4-x4-512gb',
      gia: 3190000,
      moTa: 'SSD Transcend MTE310S M.2 2230 PCIe Gen4 x4 512GB',
      thuongHieu: 'Transcend',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '512GB',
        interface: 'M.2 PCIe Gen4 x4',
        formFactor: '2230',
        readSpeed: '5000MB/s',
        writeSpeed: '3500MB/s'
      }
    },
    {
      tenSanPham: 'Transcend MTE310S M.2 2230 PCIe Gen4 x4 1TB',
      slug: 'transcend-mte310s-m2-2230-pcie-gen4-x4-1tb',
      gia: 4990000,
      moTa: 'SSD Transcend MTE310S M.2 2230 PCIe Gen4 x4 1TB',
      thuongHieu: 'Transcend',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '1TB',
        interface: 'M.2 PCIe Gen4 x4',
        formFactor: '2230',
        readSpeed: '5000MB/s',
        writeSpeed: '4000MB/s'
      }
    },
    {
      tenSanPham: 'Kingston SKC3000 M.2 PCIe NVMe 1TB',
      slug: 'kingston-skc3000-m2-pcie-nvme-1tb',
      gia: 8990000,
      moTa: 'SSD Kingston SKC3000 M.2 PCIe NVMe 1TB',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '1TB',
        interface: 'M.2 PCIe Gen4 x4',
        readSpeed: '7000MB/s',
        writeSpeed: '6000MB/s'
      }
    },
    {
      tenSanPham: 'Kingston Fury Renegade G5 PCIe 5.0 NVMe 1TB',
      slug: 'kingston-fury-renegade-g5-pcie-5-0-nvme-1tb',
      gia: 10990000,
      moTa: 'SSD Kingston Fury Renegade G5 PCIe 5.0 NVMe 1TB',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '1TB',
        interface: 'M.2 PCIe Gen 5x4',
        readSpeed: '14200MB/s',
        writeSpeed: '10200MB/s'
      }
    },
    {
      tenSanPham: 'Kingston Fury Renegade G5 PCIe 5.0 NVMe 2TB',
      slug: 'kingston-fury-renegade-g5-pcie-5-0-nvme-2tb',
      gia: 18990000,
      moTa: 'SSD Kingston Fury Renegade G5 PCIe 5.0 NVMe 2TB',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '2TB',
        interface: 'M.2 PCIe Gen 5x4',
        readSpeed: '14700MB/s',
        writeSpeed: '12000MB/s'
      }
    },
    {
      tenSanPham: 'Samsung 990 EVO Plus PCIe Gen 4.0 x4 1TB',
      slug: 'samsung-990-evo-plus-pcie-gen-4-x4-1tb',
      gia: 4990000,
      moTa: 'SSD Samsung 990 EVO Plus PCIe Gen 4.0 x4 1TB',
      thuongHieu: 'Samsung',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '1TB',
        interface: 'M.2 PCIe Gen 4x4',
        readSpeed: '7250MB/s',
        writeSpeed: '6300MB/s'
      }
    },
    {
      tenSanPham: 'Kingston SA400S37 SATA 2.5 inch 240GB',
      slug: 'kingston-sa400s37-sata-2-5-240gb',
      gia: 1090000,
      moTa: 'SSD Kingston SA400S37 SATA 2.5 inch 240GB',
      thuongHieu: 'Kingston',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '240GB',
        interface: 'SATA III 2.5"',
        readSpeed: '500MB/s',
        writeSpeed: '350MB/s',
        formFactor: '2.5 inch'
      }
    },
    {
      tenSanPham: 'ADATA LEGEND 710 PCIe Gen3 x4 M.2 2280 256GB',
      slug: 'adata-legend-710-pcie-gen3-x4-m2-2280-256gb',
      gia: 1790000,
      moTa: 'SSD ADATA LEGEND 710 PCIe Gen3 x4 M.2 2280 256GB',
      thuongHieu: 'ADATA',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '256GB',
        interface: 'M.2 PCIe Gen 3x4',
        formFactor: '2280',
        readSpeed: '2400MB/s',
        writeSpeed: '1000MB/s'
      }
    },
    {
      tenSanPham: 'ADATA LEGEND 710 PCIe Gen3 x4 M.2 2280 512GB',
      slug: 'adata-legend-710-pcie-gen3-x4-m2-2280-512gb',
      gia: 2890000,
      moTa: 'SSD ADATA LEGEND 710 PCIe Gen3 x4 M.2 2280 512GB',
      thuongHieu: 'ADATA',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '512GB',
        interface: 'M.2 PCIe Gen 3x4',
        formFactor: '2280',
        readSpeed: '2400MB/s',
        writeSpeed: '1600MB/s'
      }
    },
    {
      tenSanPham: 'SanDisk Creator Desk Drive 8TB',
      slug: 'sandisk-creator-desk-drive-8tb',
      gia: 22990000,
      moTa: 'SSD SanDisk Creator Desk Drive 8TB USB 3.2 Gen 1 Type-C',
      thuongHieu: 'SanDisk',
      hinhAnh: '../public/images/',
      thongSoKyThuat: {
        capacity: '8TB',
        interface: 'USB 3.2 Gen 1 Type-C',
        readSpeed: '1000MB/s',
        formFactor: 'Portable'
      }
    }
  ]

  for (const storage of storageProducts) {
    await prisma.sanPham.create({
      data: {
        ...storage,
        hinhAnh: (storage as any).hinhAnh || `https://via.placeholder.com/300x300?text=${storage.slug}`,
        soLuongTon: 75,
        danhMucId: storageCat.id
      }
    })
  }

  // ============== THÊM NHIỀU PSU ==============
  const psuProducts = [
    {
      tenSanPham: 'Corsair HX1200i 1200W',
      slug: 'corsair-hx1200i-1200w',
      gia: 8500000,
      moTa: 'Nguồn Corsair HX1200i 1200W 80+ Platinum',
      thuongHieu: 'Corsair',
      thongSoKyThuat: {
        wattage: '1200W',
        efficiency: '80+ Platinum',
        modular: 'Fully Modular'
      }
    },
    {
      tenSanPham: 'Corsair RM850x 850W',
      slug: 'corsair-rm850x-850w',
      gia: 3200000,
      moTa: 'Nguồn Corsair RM850x 850W 80+ Gold',
      thuongHieu: 'Corsair',
      thongSoKyThuat: {
        wattage: '850W',
        efficiency: '80+ Gold',
        modular: 'Fully Modular'
      }
    },
    {
      tenSanPham: 'EVGA SuperNOVA 850 G6',
      slug: 'evga-supernova-850-g6',
      gia: 3500000,
      moTa: 'Nguồn EVGA SuperNOVA 850 G6 850W 80+ Gold',
      thuongHieu: 'EVGA',
      thongSoKyThuat: {
        wattage: '850W',
        efficiency: '80+ Gold',
        modular: 'Fully Modular'
      }
    },
    {
      tenSanPham: 'Seasonic Focus 750W',
      slug: 'seasonic-focus-750w',
      gia: 3000000,
      moTa: 'Nguồn Seasonic Focus 750W 80+ Gold',
      thuongHieu: 'Seasonic',
      thongSoKyThuat: {
        wattage: '750W',
        efficiency: '80+ Gold',
        modular: 'Fully Modular'
      }
    },
    {
      tenSanPham: 'MSI MAG A650GL 650W',
      slug: 'msi-mag-a650gl-650w',
      gia: 2200000,
      moTa: 'Nguồn MSI MAG A650GL 650W 80+ Gold',
      thuongHieu: 'MSI',
      thongSoKyThuat: {
        wattage: '650W',
        efficiency: '80+ Gold',
        modular: 'Fully Modular'
      }
    }
  ]

  for (const psu of psuProducts) {
    await prisma.sanPham.create({
      data: {
        ...psu,
        hinhAnh: (psu as any).hinhAnh || `https://via.placeholder.com/300x300?text=${psu.slug}`,
        soLuongTon: 60,
        danhMucId: psuCat.id
      }
    })
  }

  // ============== THÊM NHIỀU MAINBOARD ==============
  const motherboardProducts = [
    // ASUS
    {
      tenSanPham: 'Asus TUF Gaming B760M-PLUS Wifi D4',
      slug: 'asus-tuf-b760m-plus-wifi-d4',
      gia: 3790000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA 1700, M-ATX, DDR4',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'Asus PRIME H610M-K D4',
      slug: 'asus-prime-h610m-k-d4',
      gia: 1790000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA 1700, M-ATX, DDR4',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'Asus Prime B760M-A DDR4',
      slug: 'asus-prime-b760m-a-ddr4',
      gia: 2790000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA 1700, PCIe 4.0, DDR4',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { socket: 'LGA 1700', pcie: 'PCIe 4.0', memory: 'DDR4' }
    },
    {
      tenSanPham: 'Asus TUF Gaming B760M-PLUS WIFI D5',
      slug: 'asus-tuf-b760m-plus-wifi-d5',
      gia: 4290000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA 1700, ATX, DDR5',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'ATX', memory: 'DDR5' }
    },
    {
      tenSanPham: 'Asus Prime B760M-K D4',
      slug: 'asus-prime-b760m-k-d4',
      gia: 2490000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA 1700, M-ATX, DDR4',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'ASUS TUF Gaming X870-PLUS WIFI',
      slug: 'asus-tuf-x870-plus-wifi',
      gia: 8990000,
      hinhAnh: '../public/images/',
      moTa: 'Socket AM5, ATX, DDR5',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { socket: 'AM5', formFactor: 'ATX', memory: 'DDR5' }
    },
    {
      tenSanPham: 'ASUS TUF Gaming Z890-PLUS WIFI',
      slug: 'asus-tuf-z890-plus-wifi',
      gia: 7590000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA1851, ATX, DDR5',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { socket: 'LGA1851', formFactor: 'ATX', memory: 'DDR5' }
    },
    {
      tenSanPham: 'Asus Prime B860M-K DDR5',
      slug: 'asus-prime-b860m-k-ddr5',
      gia: 3590000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA1851, micro-ATX, DDR5',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { socket: 'LGA1851', formFactor: 'Micro ATX', memory: 'DDR5' }
    },
    {
      tenSanPham: 'ASUS PRIME B650M-K',
      slug: 'asus-prime-b650m-k',
      gia: 3290000,
      hinhAnh: '../public/images/',
      moTa: 'Socket AM5, Micro ATX, DDR5',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { socket: 'AM5', formFactor: 'Micro ATX', memory: 'DDR5' }
    },
    {
      tenSanPham: 'Asus TUF Gaming B760M-PLUS D4',
      slug: 'asus-tuf-b760m-plus-d4',
      gia: 3690000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA 1700, M-ATX, DDR4',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'Micro ATX', memory: 'DDR4' }
    },

    // GIGABYTE
    {
      tenSanPham: 'Gigabyte B760M Gaming Plus Wifi D4',
      slug: 'gigabyte-b760m-gaming-plus-wifi-d4',
      gia: 3190000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA 1700, Micro ATX, DDR4',
      thuongHieu: 'Gigabyte',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'Gigabyte B550M H ARGB AM4 D4',
      slug: 'gigabyte-b550m-h-argb-am4-d4',
      gia: 2090000,
      hinhAnh: '../public/images/',
      moTa: 'Socket AM4, Micro ATX, DDR4',
      thuongHieu: 'Gigabyte',
      thongSoKyThuat: { socket: 'AM4', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'Gigabyte B760M DS3H DDR4',
      slug: 'gigabyte-b760m-ds3h-ddr4',
      gia: 3090000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA 1700, M-ATX, DDR4',
      thuongHieu: 'Gigabyte',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'Gigabyte B860M Eagle WIFI6 V2 D5',
      slug: 'gigabyte-b860m-eagle-wifi6-v2-d5',
      gia: 3790000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA1851, Micro ATX, DDR5',
      thuongHieu: 'Gigabyte',
      thongSoKyThuat: { socket: 'LGA1851', formFactor: 'Micro ATX', memory: 'DDR5' }
    },
    {
      tenSanPham: 'Gigabyte H810M H D5',
      slug: 'gigabyte-h810m-h-d5',
      gia: 2690000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA1851, Micro ATX, DDR5',
      thuongHieu: 'Gigabyte',
      thongSoKyThuat: { socket: 'LGA1851', formFactor: 'Micro ATX', memory: 'DDR5' }
    },
    {
      tenSanPham: 'Gigabyte Z790M Aorus Elite AX D5',
      slug: 'gigabyte-z790m-aorus-elite-ax-d5',
      gia: 6490000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA 1700, M-ATX, DDR5',
      thuongHieu: 'Gigabyte',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'Micro ATX', memory: 'DDR5' }
    },
    {
      tenSanPham: 'Gigabyte B860M K DDR5',
      slug: 'gigabyte-b860m-k-ddr5',
      gia: 3390000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA1851, Micro-ATX, DDR5',
      thuongHieu: 'Gigabyte',
      thongSoKyThuat: { socket: 'LGA1851', formFactor: 'Micro ATX', memory: 'DDR5' }
    },
    {
      tenSanPham: 'Gigabyte Z790 A Elite AX DDR4',
      slug: 'gigabyte-z790-a-elite-ax-ddr4',
      gia: 8200000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA 1700, ATX, DDR4',
      thuongHieu: 'Gigabyte',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'ATX', memory: 'DDR4' }
    },

    // MSI
    {
      tenSanPham: 'MSI Pro H610M-S DDR4',
      slug: 'msi-pro-h610m-s-ddr4',
      gia: 1690000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA 1700, M-ATX, DDR4',
      thuongHieu: 'MSI',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'MSI Pro B760M-E DDR4',
      slug: 'msi-pro-b760m-e-ddr4',
      gia: 2490000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA 1700, M-ATX, DDR4',
      thuongHieu: 'MSI',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'MSI PRO B760M-A WIFI DDR4',
      slug: 'msi-pro-b760m-a-wifi-ddr4',
      gia: 3290000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA 1700, M-ATX, DDR4',
      thuongHieu: 'MSI',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'MSI B760M Gaming WIFI DDR5',
      slug: 'msi-b760m-gaming-wifi-ddr5',
      gia: 3190000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA 1700, M-ATX, DDR5',
      thuongHieu: 'MSI',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'Micro ATX', memory: 'DDR5' }
    },
    {
      tenSanPham: 'MSI B650M Gaming Wifi DDR5',
      slug: 'msi-b650m-gaming-wifi-ddr5',
      gia: 3690000,
      hinhAnh: '../public/images/',
      moTa: 'Socket AM5, M-ATX, DDR5',
      thuongHieu: 'MSI',
      thongSoKyThuat: { socket: 'AM5', formFactor: 'Micro ATX', memory: 'DDR5' }
    },
    {
      tenSanPham: 'MSI A520M-A Pro D4 AM4',
      slug: 'msi-a520m-a-pro-d4-am4',
      gia: 1490000,
      hinhAnh: '../public/images/',
      moTa: 'Socket AM4, M-ATX, DDR4',
      thuongHieu: 'MSI',
      thongSoKyThuat: { socket: 'AM4', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'MSI Z790 Gaming Plus WF DDR5',
      slug: 'msi-z790-gaming-plus-wf-ddr5',
      gia: 5990000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA 1700, ATX, DDR5',
      thuongHieu: 'MSI',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'ATX', memory: 'DDR5' }
    },
    {
      tenSanPham: 'MSI B450M-A PRO MAX II',
      slug: 'msi-b450m-a-pro-max-ii',
      gia: 1790000,
      hinhAnh: '../public/images/',
      moTa: 'Socket AM4, M-ATX, DDR4',
      thuongHieu: 'MSI',
      thongSoKyThuat: { socket: 'AM4', formFactor: 'Micro ATX', memory: 'DDR4' }
    },

    // ASRock
    {
      tenSanPham: 'ASRock A520M/AC D4 AM4 Wifi',
      slug: 'asrock-a520m-ac-d4-am4-wifi',
      gia: 1590000,
      hinhAnh: '../public/images/',
      moTa: 'Socket AM4, M-ATX, DDR4',
      thuongHieu: 'ASRock',
      thongSoKyThuat: { socket: 'AM4', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'ASRock H610M-HVS/M.2 R2.0',
      slug: 'asrock-h610m-hvs-m2-r2-0',
      gia: 1690000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA 1700, M-ATX, DDR4',
      thuongHieu: 'ASRock',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'Asrock B760M Pro RS/D4',
      slug: 'asrock-b760m-pro-rs-d4',
      gia: 2890000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA 1700, M-ATX, DDR4',
      thuongHieu: 'ASRock',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'ASRock A520M-HVS D4 AM4',
      slug: 'asrock-a520m-hvs-d4-am4',
      gia: 1490000,
      hinhAnh: '../public/images/',
      moTa: 'Socket AM4, M-ATX, DDR4',
      thuongHieu: 'ASRock',
      thongSoKyThuat: { socket: 'AM4', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'ASRock H610M-HD/M.2 D4',
      slug: 'asrock-h610m-hd-m2-d4',
      gia: 1690000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA 1700, M-ATX, DDR4',
      thuongHieu: 'ASRock',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'ASRock B450M HDV R4',
      slug: 'asrock-b450m-hdv-r4',
      gia: 1650000,
      hinhAnh: '../public/images/',
      moTa: 'Socket AM4, M-ATX, DDR4',
      thuongHieu: 'ASRock',
      thongSoKyThuat: { socket: 'AM4', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'Asrock B760M Pro RS/D4 Wifi',
      slug: 'asrock-b760m-pro-rs-d4-wifi',
      gia: 3190000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA 1700, M-ATX, DDR4',
      thuongHieu: 'ASRock',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'ASRock B550M Pro 4 DDR4',
      slug: 'asrock-b550m-pro-4-ddr4',
      gia: 2790000,
      hinhAnh: '../public/images/',
      moTa: 'Socket AM4, M-ATX, DDR4',
      thuongHieu: 'ASRock',
      thongSoKyThuat: { socket: 'AM4', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'ASRock B650M Pro RS WiFi D5',
      slug: 'asrock-b650m-pro-rs-wifi-d5',
      gia: 3890000,
      hinhAnh: '../public/images/',
      moTa: 'Socket AM5, Micro ATX, DDR5',
      thuongHieu: 'ASRock',
      thongSoKyThuat: { socket: 'AM5', formFactor: 'Micro ATX', memory: 'DDR5' }
    },
    {
      tenSanPham: 'Asrock X870 Pro RS Wifi D5',
      slug: 'asrock-x870-pro-rs-wifi-d5',
      gia: 6690000,
      hinhAnh: '../public/images/',
      moTa: 'Socket AM5, ATX, DDR5',
      thuongHieu: 'ASRock',
      thongSoKyThuat: { socket: 'AM5', formFactor: 'ATX', memory: 'DDR5' }
    },
    {
      tenSanPham: 'ASRock B660M Pro RS',
      slug: 'asrock-b660m-pro-rs',
      gia: 2890000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA 1700, M-ATX, DDR4',
      thuongHieu: 'ASRock',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'ASRock Z790 Pro RS Wifi D5',
      slug: 'asrock-z790-pro-rs-wifi-d5',
      gia: 5490000,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA 1700, PCIe 5.0, DDR5',
      thuongHieu: 'ASRock',
      thongSoKyThuat: { socket: 'LGA 1700', pcie: 'PCIe 5.0', memory: 'DDR5' }
    },
    {
      tenSanPham: 'ASRock A620AM-HVS DDR5',
      slug: 'asrock-a620am-hvs-ddr5',
      gia: 1990000,
      hinhAnh: '../public/images/',
      moTa: 'Socket AM5, Micro ATX, DDR5',
      thuongHieu: 'ASRock',
      thongSoKyThuat: { socket: 'AM5', formFactor: 'Micro ATX', memory: 'DDR5' }
    },
    {
      tenSanPham: 'ASRock Z890 Pro RS Wifi D5',
      slug: 'asrock-z890-pro-rs-wifi-d5',
      gia: 0,
      hinhAnh: '../public/images/',
      moTa: 'Socket LGA 1851RL-ILM, ATX, DDR5 - Giá liên hệ',
      thuongHieu: 'ASRock',
      thongSoKyThuat: { socket: 'LGA 1851RL-ILM', formFactor: 'ATX', memory: 'DDR5' }
    }
  ]

  for (const mobo of motherboardProducts) {
    await prisma.sanPham.create({
      data: {
        ...mobo,
        hinhAnh: (mobo as any).hinhAnh || `https://via.placeholder.com/300x300?text=${mobo.slug}`,
        soLuongTon: 40,
        danhMucId: mainboardCat.id
      }
    })
  }

  // Tạo người dùng demo
  const user = await prisma.nguoiDung.create({
    data: {
      hoTen: 'Nguyễn Văn A',
      email: 'user@example.com',
      matKhauHash: 'hashed_password_here',
      vaiTro: VaiTro.KHACH_HANG,
      soDienThoai: '0123456789',
      diaChi: '123 Đường ABC, TP HCM',
    },
  })

  // Ví dụ sử dụng hàm thay đổi vai trò
  // await thayDoiVaiTro('user@example.com', VaiTro.QUAN_TRI_VIEN)

  // Tạo giỏ hàng cho user
  await prisma.gioHang.create({
    data: {
      nguoiDungId: user.id,
    },
  })

  console.log('✅ Seeding hoàn tất!')
  console.log('📊 Tổng cộng:')
  console.log('   - 6 danh mục')
  console.log('   - 51 CPU')
  console.log('   - 8 GPU')
  console.log('   - 32 RAM')
  console.log('   - 34 Storage')
  console.log('   - 5 PSU')
  console.log('   - 40 Motherboard')
  console.log('   = 170 sản phẩm')
}

// Tạo user admin nếu chưa tồn tại, rồi cập nhật vai trò
const adminEmail = 'huynhkietzuki@gmail.com'
const existingAdmin = await prisma.nguoiDung.findUnique({ where: { email: adminEmail } })
if (!existingAdmin) {
  await prisma.nguoiDung.create({
    data: {
      hoTen: 'Admin User',
      email: adminEmail,
      matKhauHash: '$2a$10$dummyhashfortestingonly',
      vaiTro: VaiTro.QUAN_TRI_VIEN
    }
  })
  console.log(`✅ Created admin user: ${adminEmail}`)
} else {
  await prisma.nguoiDung.update({
    where: { email: adminEmail },
    data: { vaiTro: VaiTro.QUAN_TRI_VIEN }
  })
  console.log(`✅ Updated admin role: ${adminEmail}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

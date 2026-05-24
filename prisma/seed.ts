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
    {
      tenSanPham: 'Intel Core i9-14900KS',
      slug: 'intel-core-i9-14900ks',
      gia: 24500000,
      hinhAnh: '/images/1.jpg',
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
      hinhAnh: '/images/2.jpg',
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
      hinhAnh: '/images/3.jpg',
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
      hinhAnh: '/images/4.jpg',
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
      hinhAnh: '/images/5.jpg',
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
    {
      tenSanPham: 'AMD Ryzen 9 7950X3D',
      slug: 'amd-ryzen-9-7950x3d',
      gia: 22000000,
      hinhAnh: '/images/6.jpg',
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
      hinhAnh: '/images/7.jpg',
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
      tenSanPham: 'AMD Ryzen 7 7700X',
      slug: 'amd-ryzen-7-7700x',
      gia: 11500000,
      hinhAnh: '/images/8.jpg',
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
      hinhAnh: '/images/9.jpg',
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
    },
    {
      tenSanPham: 'AMD Ryzen 9 9950X3D (Tray)',
      slug: 'amd-ryzen-9-9950x3d',
      gia: 19990000,
      hinhAnh: '/images/10.jpg',
      moTa: '16 nhân, 32 luồng, 5.7 GHz, Socket AM5',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 16, threads: 32, boostFreq: '5.7 GHz', socket: 'AM5' }
    },
    {
      tenSanPham: 'AMD Ryzen 5 7600X',
      slug: 'amd-ryzen-5-7600x',
      gia: 6490000,
      hinhAnh: '/images/11.jpg',
      moTa: '6 nhân, 12 luồng, 4.7 GHz, Socket AM5',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 6, threads: 12, boostFreq: '4.7 GHz', socket: 'AM5' }
    },
    {
      tenSanPham: 'AMD Ryzen 7 7700X (WOF)',
      slug: 'amd-ryzen-7-7700x-wof',
      gia: 9190000,
      hinhAnh: '/images/12.jpg',
      moTa: '8 nhân, 16 luồng, 4.5 GHz, Socket AM5',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 8, threads: 16, boostFreq: '4.5 GHz', socket: 'AM5' }
    },
    {
      tenSanPham: 'AMD Ryzen 5 5500GT',
      slug: 'amd-ryzen-5-5500gt',
      gia: 3590000,
      hinhAnh: '/images/13.jpg',
      moTa: '6 nhân, 12 luồng, 4.4 GHz, Socket AM4',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 6, threads: 12, boostFreq: '4.4 GHz', socket: 'AM4' }
    },
    {
      tenSanPham: 'AMD Ryzen 9 9950X',
      slug: 'amd-ryzen-9-9950x',
      gia: 16690000,
      hinhAnh: '/images/14.jpg',
      moTa: '16 nhân, 32 luồng, 5.7 GHz, Socket AM5',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 16, threads: 32, boostFreq: '5.7 GHz', socket: 'AM5' }
    },
    {
      tenSanPham: 'AMD Ryzen 7 7800X3D (Tray)',
      slug: 'amd-ryzen-7-7800x3d',
      gia: 9290000,
      hinhAnh: '/images/15.jpg',
      moTa: '8 nhân, 16 luồng, 5.0 GHz, Socket AM5',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 8, threads: 16, boostFreq: '5.0 GHz', socket: 'AM5' }
    },
    {
      tenSanPham: 'AMD Ryzen 7 5700X (Tray)',
      slug: 'amd-ryzen-7-5700x',
      gia: 5490000,
      hinhAnh: '/images/16.jpg',
      moTa: '8 nhân, 16 luồng, 4.6 GHz, Socket AM4',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 8, threads: 16, boostFreq: '4.6 GHz', socket: 'AM4' }
    },
    {
      tenSanPham: 'AMD Ryzen 5 5500',
      slug: 'amd-ryzen-5-5500',
      gia: 2490000,
      hinhAnh: '/images/17.jpg',
      moTa: '6 nhân, 12 luồng, 3.6 GHz, Socket AM4',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 6, threads: 12, baseFreq: '3.6 GHz', socket: 'AM4' }
    },
    {
      tenSanPham: 'AMD Ryzen 5 5600X',
      slug: 'amd-ryzen-5-5600x',
      gia: 4090000,
      hinhAnh: '/images/18.jpg',
      moTa: '6 nhân, 12 luồng, 3.7 GHz, Socket AM4',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 6, threads: 12, baseFreq: '3.7 GHz', socket: 'AM4' }
    },
    {
      tenSanPham: 'AMD Ryzen 3 3200G (MPK)',
      slug: 'amd-ryzen-3-3200g',
      gia: 1990000,
      hinhAnh: '/images/19.jpg',
      moTa: '4 nhân, 4 luồng, 4.0 GHz, Socket AM4',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 4, threads: 4, baseFreq: '4.0 GHz', socket: 'AM4' }
    },
    {
      tenSanPham: 'AMD Ryzen 5 5600GT (MPK)',
      slug: 'amd-ryzen-5-5600gt',
      gia: 3990000,
      hinhAnh: '/images/20.jpg',
      moTa: '6 nhân, 12 luồng, 5.2 GHz, Socket AM4',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 6, threads: 12, boostFreq: '5.2 GHz', socket: 'AM4' }
    },
    {
      tenSanPham: 'AMD Ryzen 5 3400G (MPK)',
      slug: 'amd-ryzen-5-3400g',
      gia: 2090000,
      hinhAnh: '/images/21.jpg',
      moTa: '4 nhân, 8 luồng, 4.2 GHz, Socket AM4',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 4, threads: 8, baseFreq: '4.2 GHz', socket: 'AM4' }
    },
    {
      tenSanPham: 'AMD Ryzen 5 7600',
      slug: 'amd-ryzen-5-7600',
      gia: 5490000,
      hinhAnh: '/images/22.jpg',
      moTa: '6 nhân, 12 luồng, 3.8 GHz, Socket AM5',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 6, threads: 12, baseFreq: '3.8 GHz', socket: 'AM5' }
    },
    {
      tenSanPham: 'AMD Ryzen 3 4300G',
      slug: 'amd-ryzen-3-4300g',
      gia: 2390000,
      hinhAnh: '/images/23.jpg',
      moTa: '4 nhân, 8 luồng, 3.8 GHz, Socket AM4',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 4, threads: 8, baseFreq: '3.8 GHz', socket: 'AM4' }
    },
    {
      tenSanPham: 'AMD Athlon 3000G',
      slug: 'amd-athlon-3000g',
      gia: 1290000,
      hinhAnh: '/images/24.jpg',
      moTa: '2 nhân, 4 luồng, 3.5 GHz, Socket AM4',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 2, threads: 4, baseFreq: '3.5 GHz', socket: 'AM4' }
    },
    {
      tenSanPham: 'AMD Ryzen 7 9800X3D (WOF)',
      slug: 'amd-ryzen-7-9800x3d',
      gia: 13990000,
      hinhAnh: '/images/25.jpg',
      moTa: '8 nhân, 16 luồng, 5.2 GHz, Socket AM5',
      thuongHieu: 'AMD',
      thongSoKyThuat: { cores: 8, threads: 16, boostFreq: '5.2 GHz', socket: 'AM5' }
    },
    {
      tenSanPham: 'Intel Core i5 14600KF',
      slug: 'intel-core-i5-14600kf',
      gia: 6990000,
      hinhAnh: '/images/26.jpg',
      moTa: '14 nhân, 20 luồng, 3.4 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 14, threads: 20, baseFreq: '3.4 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core i5-12400F (TRAY)',
      slug: 'intel-core-i5-12400f',
      gia: 3990000,
      hinhAnh: '/images/27.jpg',
      moTa: '6 nhân, 12 luồng, 4.40 GHz, Socket FCLGA1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 6, threads: 12, boostFreq: '4.4 GHz', socket: 'FCLGA1700' }
    },
    {
      tenSanPham: 'Intel Core i5 14500',
      slug: 'intel-core-i5-14500',
      gia: 8990000,
      hinhAnh: '/images/28.jpg',
      moTa: '14 nhân, 20 luồng, 2.6 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 14, threads: 20, baseFreq: '2.6 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core i5 13400F (Tray)',
      slug: 'intel-core-i5-13400f',
      gia: 4290000,
      hinhAnh: '/images/29.jpg',
      moTa: '10 nhân, 16 luồng, 4.6 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 10, threads: 16, boostFreq: '4.6 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core Ultra 9 285K',
      slug: 'intel-core-ultra-9-285k',
      gia: 16990000,
      hinhAnh: '/images/30.jpg',
      moTa: '24 nhân, 24 luồng, 5.7 GHz, Socket FCLGA1851',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 24, threads: 24, boostFreq: '5.7 GHz', socket: 'FCLGA1851' }
    },
    {
      tenSanPham: 'Intel Core i7 14700F',
      slug: 'intel-core-i7-14700f',
      gia: 10490000,
      hinhAnh: '/images/31.jpg',
      moTa: '20 nhân, 28 luồng, 2.1 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 20, threads: 28, baseFreq: '2.1 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core i5 14400F (Tray)',
      slug: 'intel-core-i5-14400f',
      gia: 5990000,
      hinhAnh: '/images/32.jpg',
      moTa: '10 nhân, 16 luồng, 4.7 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 10, threads: 16, boostFreq: '4.7 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core i3 13100F',
      slug: 'intel-core-i3-13100f',
      gia: 2990000,
      hinhAnh: '/images/33.jpg',
      moTa: '4 nhân, 8 luồng, 3.4 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 4, threads: 8, baseFreq: '3.4 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core i3 14100F',
      slug: 'intel-core-i3-14100f',
      gia: 3290000,
      hinhAnh: '/images/34.jpg',
      moTa: '4 nhân, 8 luồng, 3.5 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 4, threads: 8, baseFreq: '3.5 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core i5-12500',
      slug: 'intel-core-i5-12500',
      gia: 5990000,
      hinhAnh: '/images/35.jpg',
      moTa: '6 nhân, 12 luồng, 4.6 GHz, Socket FCLGA1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 6, threads: 12, boostFreq: '4.6 GHz', socket: 'FCLGA1700' }
    },
    {
      tenSanPham: 'Intel Core i9 14900',
      slug: 'intel-core-i9-14900',
      gia: 19990000,
      hinhAnh: '/images/36.jpg',
      moTa: '24 nhân, 32 luồng, 2.0 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 24, threads: 32, baseFreq: '2.0 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core i5 12400 (Tray)',
      slug: 'intel-core-i5-12400',
      gia: 5690000,
      hinhAnh: '/images/37.jpg',
      moTa: '6 nhân, 12 luồng, 4.4 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 6, threads: 12, boostFreq: '4.4 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Pentium Gold G6405',
      slug: 'intel-pentium-g6405',
      gia: 1990000,
      hinhAnh: '/images/38.jpg',
      moTa: '2 nhân, 4 luồng, 4.1 GHz, Socket LGA 1200',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 2, threads: 4, baseFreq: '4.1 GHz', socket: 'LGA 1200' }
    },
    {
      tenSanPham: 'Intel Core Ultra 5 225 (Tray)',
      slug: 'intel-core-ultra-5-225',
      gia: 4690000,
      hinhAnh: '/images/39.jpg',
      moTa: '10 nhân, 10 luồng, 4.9 GHz, Socket FCLGA1851',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 10, threads: 10, boostFreq: '4.9 GHz', socket: 'FCLGA1851' }
    },
    {
      tenSanPham: 'Intel Core i3 14100 (Tray)',
      slug: 'intel-core-i3-14100',
      gia: 4490000,
      hinhAnh: '/images/40.jpg',
      moTa: '4 nhân, 8 luồng, 4.7 GHz, Socket FCLGA1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 4, threads: 8, boostFreq: '4.7 GHz', socket: 'FCLGA1700' }
    },
    {
      tenSanPham: 'Intel Core i7 12700 (Tray)',
      slug: 'intel-core-i7-12700',
      gia: 9290000,
      hinhAnh: '/images/41.jpg',
      moTa: '12 nhân, 20 luồng, 4.9 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 12, threads: 20, boostFreq: '4.9 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core i3 12100 (Tray)',
      slug: 'intel-core-i3-12100',
      gia: 4490000,
      hinhAnh: '/images/42.jpg',
      moTa: '4 nhân, 8 luồng, 4.3 GHz, Socket LGA 1700',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 4, threads: 8, boostFreq: '4.3 GHz', socket: 'LGA 1700' }
    },
    {
      tenSanPham: 'Intel Core Ultra 5 225F (Tray)',
      slug: 'intel-core-ultra-5-225f',
      gia: 4290000,
      hinhAnh: '/images/43.jpg',
      moTa: '10 nhân, 10 luồng, 4.9 GHz, Socket LGA 1851',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 10, threads: 10, boostFreq: '4.9 GHz', socket: 'LGA 1851' }
    },
    {
      tenSanPham: 'Intel Core Ultra 5 245K',
      slug: 'intel-core-ultra-5-245k',
      gia: 8290000,
      hinhAnh: '/images/44.jpg',
      moTa: '14 nhân, 14 luồng, 5.2 GHz, Socket FCLGA1851',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 14, threads: 14, boostFreq: '5.2 GHz', socket: 'FCLGA1851' }
    },
    {
      tenSanPham: 'Intel Core Ultra 5 245KF',
      slug: 'intel-core-ultra-5-245kf',
      gia: 7990000,
      hinhAnh: '/images/45.jpg',
      moTa: '14 nhân, 14 luồng, 5.2 GHz, Socket FCLGA1851',
      thuongHieu: 'Intel',
      thongSoKyThuat: { cores: 14, threads: 14, boostFreq: '5.2 GHz', socket: 'FCLGA1851' }
    }
  ]

  const intelCpuImages = ['/images/1.jpg', '/images/2.jpg', '/images/3.jpg', '/images/4.jpg', '/images/5.jpg'];
  const amdCpuImages = ['/images/6.jpg', '/images/7.jpg', '/images/8.jpg', '/images/9.jpg', '/images/10.jpg', '/images/11.jpg', '/images/12.jpg', '/images/13.jpg', '/images/14.jpg', '/images/15.jpg'];
  let intelCpuIdx = 0; let amdCpuIdx = 0;
  for (const cpu of cpuProducts) {
    const existingImg = (cpu as any).hinhAnh && (cpu as any).hinhAnh.startsWith('/') ? (cpu as any).hinhAnh : null;
    let img: string;
    if (existingImg) {
      img = existingImg;
    } else if ((cpu as any).thuongHieu?.toLowerCase() === 'amd') {
      img = amdCpuImages[amdCpuIdx % amdCpuImages.length]; amdCpuIdx++;
    } else {
      img = intelCpuImages[intelCpuIdx % intelCpuImages.length]; intelCpuIdx++;
    }
    await prisma.sanPham.create({
      data: { ...cpu, hinhAnh: img, soLuongTon: 50, danhMucId: cpuCat.id }
    })
  }

  // ============== THÊM NHIỀU GPU ==============
    const gpuProducts = [
    {
      tenSanPham: 'VGA Asus Geforce GT710 2GB GT710-SL-2GD5-BRK-EVO',
      slug: 'vga-asus-geforce-gt710-2gb-gt710sl2gd5brkevo',
      gia: 1990000,
      hinhAnh: '/images/46.jpg',
      moTa: 'Card màn hình VGA Asus Geforce GT710 2GB GT710-SL-2GD5-BRK-EVO. Thông số: 2GB, GDDR5, 300W',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { memory: '2GB', vramType: 'GDDR5', psu: '300W' }
    },
    {
      tenSanPham: 'VGA MSI GeForce RTX 3060 VENTUS 2X 12G OC',
      slug: 'vga-msi-geforce-rtx-3060-ventus-2x-12g-oc',
      gia: 9490000,
      hinhAnh: '/images/47.jpg',
      moTa: 'Card màn hình VGA MSI GeForce RTX 3060 VENTUS 2X 12G OC. Thông số: 12GB, GDDR6, 550W',
      thuongHieu: 'MSI',
      thongSoKyThuat: { memory: '12GB', vramType: 'GDDR6', psu: '550W' }
    },
    {
      tenSanPham: 'VGA MSI GeForce RTX 5060 8GB VENTUS 2X OC',
      slug: 'vga-msi-geforce-rtx-5060-8gb-ventus-2x-oc',
      gia: 10690000,
      hinhAnh: '/images/48.jpg',
      moTa: 'Card màn hình VGA MSI GeForce RTX 5060 8GB VENTUS 2X OC. Thông số: 8GB, GDDR7, 550W',
      thuongHieu: 'MSI',
      thongSoKyThuat: { memory: '8GB', vramType: 'GDDR7', psu: '550W' }
    },
    {
      tenSanPham: 'VGA ASUS Dual Geforce RTX 3060 OC 12GB DUAL-RTX3060-O12G-V2',
      slug: 'vga-asus-dual-geforce-rtx-3060-oc-12gb-dual-rtx3060-o12g-v2',
      gia: 9490000,
      hinhAnh: '/images/49.jpg',
      moTa: 'Card màn hình VGA ASUS Dual Geforce RTX 3060 OC 12GB DUAL-. Thông số: 12GB, GDDR6, Từ 650W - 2.7 slot',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { memory: '12GB', vramType: 'GDDR6', psu: 'Từ 650W - 2.7 slot' }
    },
    {
      tenSanPham: 'VGA Asus Tuf Gaming Geforce RTX 5070 OC 12GB',
      slug: 'vga-asus-tuf-gaming-geforce-rtx-5070-oc-12gb',
      gia: 26990000,
      hinhAnh: '/images/50.jpg',
      moTa: 'Card màn hình VGA Asus Tuf Gaming Geforce RTX 5070 OC 12GB. Thông số: 12GB, GDDR7, 750W',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { memory: '12GB', vramType: 'GDDR7', psu: '750W' }
    },
    {
      tenSanPham: 'VGA MSI Geforce RTX 5060 8GB Shadow 2X OC',
      slug: 'vga-msi-geforce-rtx-5060-8gb-shadow-2x-oc',
      gia: 9990000,
      hinhAnh: '/images/51.jpg',
      moTa: 'Card màn hình VGA MSI Geforce RTX 5060 8GB Shadow 2X OC. Thông số: 8GB, GDDR7, 550W',
      thuongHieu: 'MSI',
      thongSoKyThuat: { memory: '8GB', vramType: 'GDDR7', psu: '550W' }
    },
    {
      tenSanPham: 'VGA MSI Geforce RTX 5090 32G Gaming Trio OC',
      slug: 'vga-msi-geforce-rtx-5090-32g-gaming-trio-oc',
      gia: 119000000,
      hinhAnh: '/images/52.jpg',
      moTa: 'Card màn hình VGA MSI Geforce RTX 5090 32G Gaming Trio OC. Thông số: 32GB, GDDR7, 1000W',
      thuongHieu: 'MSI',
      thongSoKyThuat: { memory: '32GB', vramType: 'GDDR7', psu: '1000W' }
    },
    {
      tenSanPham: 'VGA Asus Dual Radeon RX 6500 XT OC 4GB DUAL-RX6500XT-O4G-V2',
      slug: 'vga-asus-dual-radeon-rx-6500-xt-oc-4gb-dual-rx6500xt-o4g-v2',
      gia: 5190000,
      hinhAnh: '/images/53.jpg',
      moTa: 'Card màn hình VGA Asus Dual Radeon RX 6500 XT OC 4GB DUAL-. Thông số: 4GB, GDDR6, 500W',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { memory: '4GB', vramType: 'GDDR6', psu: '500W' }
    },
    {
      tenSanPham: 'VGA MSI GeForce RTX 3050 VENTUS 2X 6G OC',
      slug: 'vga-msi-geforce-rtx-3050-ventus-2x-6g-oc',
      gia: 6190000,
      hinhAnh: '/images/54.jpg',
      moTa: 'Card màn hình VGA MSI GeForce RTX 3050 VENTUS 2X 6G OC. Thông số: 6GB, GDDR6, 300W',
      thuongHieu: 'MSI',
      thongSoKyThuat: { memory: '6GB', vramType: 'GDDR6', psu: '300W' }
    },
    {
      tenSanPham: 'VGA Gigabyte Radeon RX 6500 XT Eagle 4GB GV-R65XTEAGLE-4GD',
      slug: 'vga-gigabyte-radeon-rx-6500-xt-eagle-4gb-gv-r65xteagle-4gd',
      gia: 5190000,
      hinhAnh: '/images/55.jpg',
      moTa: 'Card màn hình VGA Gigabyte Radeon RX 6500 XT Eagle 4GB GV-R65XTEAGLE-4GD. Thông số: 4GB, GDDR6, 400W',
      thuongHieu: 'Gigabyte',
      thongSoKyThuat: { memory: '4GB', vramType: 'GDDR6', psu: '400W' }
    },
    {
      tenSanPham: 'VGA Asrock Intel ARC A380 Challenger ITX 6GB OC',
      slug: 'vga-asrock-intel-arc-a380-challenger-itx-6gb-oc',
      gia: 4390000,
      hinhAnh: '/images/56.jpg',
      moTa: 'Card màn hình VGA Asrock Intel ARC A380 Challenger ITX 6GB OC. Thông số: 6GB, GDDR6, 500W',
      thuongHieu: 'ASRock',
      thongSoKyThuat: { memory: '6GB', vramType: 'GDDR6', psu: '500W' }
    },
    {
      tenSanPham: 'VGA MSI GeForce RTX 5070 12GB VENTUS 2X OC',
      slug: 'vga-msi-geforce-rtx-5070-12gb-ventus-2x-oc',
      gia: 21990000,
      hinhAnh: '/images/57.jpg',
      moTa: 'Card màn hình VGA MSI GeForce RTX 5070 12GB VENTUS 2X OC. Thông số: 12GB, GDDR7, 650W',
      thuongHieu: 'MSI',
      thongSoKyThuat: { memory: '12GB', vramType: 'GDDR7', psu: '650W' }
    },
    {
      tenSanPham: 'VGA Asus Phoenix Radeon RX 7600 OC 8GB DUAL-RX7600-O8G-EVO',
      slug: 'vga-asus-phoenix-radeon-rx-7600-oc-8gb-dualrx7600-o8g-evo',
      gia: 8490000,
      hinhAnh: '/images/58.jpg',
      moTa: 'Card màn hình VGA Asus Phoenix Radeon RX 7600 OC 8GB DUAL-RX7600-O8G-EVO. Thông số: 8GB, GDDR6, 550W',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { memory: '8GB', vramType: 'GDDR6', psu: '550W' }
    },
    {
      tenSanPham: 'VGA MSI GeForce RTX 5060 Ti 8G Ventus 2X OC Plus',
      slug: 'vga-msi-geforce-rtx-5060-ti-8g-ventus-2x-oc-plus',
      gia: 13990000,
      hinhAnh: '/images/59.jpg',
      moTa: 'Card màn hình VGA MSI GeForce RTX 5060 Ti 8G Ventus 2X OC Plus. Thông số: 8GB, GDDR7, 600W',
      thuongHieu: 'MSI',
      thongSoKyThuat: { memory: '8GB', vramType: 'GDDR7', psu: '600W' }
    },
    {
      tenSanPham: 'VGA Gigabyte RTX 5050 WindForce OC 8GB',
      slug: 'vga-gigabyte-rtx-5050-windforce-oc-8gb',
      gia: 8490000,
      hinhAnh: '/images/60.jpg',
      moTa: 'Card màn hình VGA Gigabyte RTX 5050 WindForce OC 8GB. Thông số: 8GB, GDDR6, 550W',
      thuongHieu: 'Gigabyte',
      thongSoKyThuat: { memory: '8GB', vramType: 'GDDR6', psu: '550W' }
    },
    {
      tenSanPham: 'VGA Asus Prime Radeon RX 9070 XT OC 16GB PRIME-RX9070XT-O16G',
      slug: 'vga-asus-prime-radeon-rx-9070-xt-oc-16gb-prime',
      gia: 24990000,
      hinhAnh: '/images/61.jpg',
      moTa: 'Card màn hình VGA Asus Prime Radeon RX 9070 XT OC 16GB PRIME-RX9070XT-O16G. Thông số: 16GB, GDDR6, 750W',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { memory: '16GB', vramType: 'GDDR6', psu: '750W' }
    },
    {
      tenSanPham: 'VGA MSI Geforce RTX 5070 12G Gaming Trio OC',
      slug: 'vga-msi-geforce-rtx-5070-12g-gaming-trio-oc',
      gia: 23990000,
      hinhAnh: '/images/62.jpg',
      moTa: 'Card màn hình VGA MSI Geforce RTX 5070 12G Gaming Trio OC. Thông số: 12GB, GDDR7, 650W',
      thuongHieu: 'MSI',
      thongSoKyThuat: { memory: '12GB', vramType: 'GDDR7', psu: '650W' }
    },
    {
      tenSanPham: 'VGA MSI GeForce RTX 5070 Ti 16G Shadow 3X OC',
      slug: 'vga-msi-geforce-rtx-5070-ti-16g-shadow-3x-oc',
      gia: 32990000,
      hinhAnh: '/images/63.jpg',
      moTa: 'Card màn hình VGA MSI GeForce RTX 5070 Ti 16G Shadow 3X OC. Thông số: 16GB, GDDR7, 750W',
      thuongHieu: 'MSI',
      thongSoKyThuat: { memory: '16GB', vramType: 'GDDR7', psu: '750W' }
    },
    {
      tenSanPham: 'VGA Asus Prime Geforce RTX 5060 Ti 16GB OC PRIME-RTX5060TI-O16G',
      slug: 'vga-asus-prime-geforce-rtx-5060-ti-16gb-oc-prime',
      gia: 20990000,
      hinhAnh: '/images/64.jpg',
      moTa: 'Card màn hình VGA Asus Prime Geforce RTX 5060 Ti 16GB OC PRIME-RTX5060TI-O16G. Thông số: 16GB, GDDR7, 550W',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { memory: '16GB', vramType: 'GDDR7', psu: '550W' }
    },
    {
      tenSanPham: 'VGA Gigabyte GeForce RTX 3050 WindForce OC 6GB GV-N3050WF2OCV2-6GD',
      slug: 'vga-gigabyte-geforce-rtx-3050-windforce-oc-6gb-gv-n3050wf2ocv2-6gd',
      gia: 6190000,
      hinhAnh: '/images/65.jpg',
      moTa: 'Card màn hình VGA Gigabyte GeForce RTX 3050 WindForce OC 6GB GV-N3050WF2OCV2-6GD. Thông số: 6GB, GDDR6, 300W',
      thuongHieu: 'Gigabyte',
      thongSoKyThuat: { memory: '6GB', vramType: 'GDDR6', psu: '300W' }
    }
  ]

  const gpuImages = ['/images/1.jpg', '/images/2.jpg', '/images/3.jpg', '/images/4.jpg', '/images/5.jpg', '/images/6.jpg', '/images/7.jpg', '/images/8.jpg'];
  let gpuIdx = 0;
  for (const gpu of gpuProducts) {
    const img = (gpu as any).hinhAnh && (gpu as any).hinhAnh.startsWith('/') ? (gpu as any).hinhAnh : gpuImages[gpuIdx++ % gpuImages.length];
    await prisma.sanPham.create({
      data: { ...gpu, hinhAnh: img, soLuongTon: 30, danhMucId: gpuCat.id }
    })
  }

  // ============== THÊM NHIỀU RAM ==============
  const ramProducts = [
    {
      tenSanPham: 'Corsair Vengeance DDR5 64GB (2x32GB)',
      slug: 'corsair-vengeance-ddr5-64gb',
      gia: 9500000,
      hinhAnh: '/images/66.jpg',
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
      hinhAnh: '/images/67.jpg',
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
      hinhAnh: '/images/68.jpg',
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
      hinhAnh: '/images/69.jpg',
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
      hinhAnh: '/images/70.jpg',
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
      hinhAnh: '/images/71.jpg',
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
      hinhAnh: '',
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
      hinhAnh: '',
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
      hinhAnh: '',
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
      hinhAnh: '',
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
      hinhAnh: '',
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
      hinhAnh: '',
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
      hinhAnh: '',
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
      hinhAnh: '',
      thongSoKyThuat: {
        capacity: '32GB',
        type: 'DDR4',
        speed: '3200MHz',
        voltage: '1.2V',
        formFactor: 'SO-DIMM',
        model: 'KVR32S22D8/32'
      }
    }
  ]

  const ramImages = ['/images/3.jpg', '/images/4.jpg', '/images/5.jpg', '/images/6.jpg', '/images/7.jpg', '/images/8.jpg'];
  let ramIdx = 0;
  for (const ram of ramProducts) {
    const img = (ram as any).hinhAnh && (ram as any).hinhAnh.startsWith('/') ? (ram as any).hinhAnh : ramImages[ramIdx++ % ramImages.length];
    await prisma.sanPham.create({
      data: { ...ram, hinhAnh: img, soLuongTon: 100, danhMucId: ramCat.id }
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
      hinhAnh: '',
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
      hinhAnh: '',
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
      hinhAnh: '',
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
      hinhAnh: '',
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
      hinhAnh: '',
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
      hinhAnh: '',
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
      hinhAnh: '',
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
      hinhAnh: '',
      thongSoKyThuat: {
        capacity: '256GB',
        interface: 'M.2 PCIe Gen3 x4',
        readSpeed: '1600MB/s',
        writeSpeed: '1100MB/s'
      }
    }
  ]

  const storageImages = ['/images/9.jpg', '/images/10.jpg', '/images/11.jpg', '/images/12.jpg'];
  let storageIdx = 0;
  for (const storage of storageProducts) {
    const img = (storage as any).hinhAnh && (storage as any).hinhAnh.startsWith('/') ? (storage as any).hinhAnh : storageImages[storageIdx++ % storageImages.length];
    await prisma.sanPham.create({
      data: { ...storage, hinhAnh: img, soLuongTon: 80, danhMucId: storageCat.id }
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

  const psuImages = ['/images/13.jpg', '/images/14.jpg', '/images/15.jpg'];
  let psuIdx = 0;
  for (const psu of psuProducts) {
    const img = (psu as any).hinhAnh && (psu as any).hinhAnh.startsWith('/') ? (psu as any).hinhAnh : psuImages[psuIdx++ % psuImages.length];
    await prisma.sanPham.create({
      data: { ...psu, hinhAnh: img, soLuongTon: 60, danhMucId: psuCat.id }
    })
  }

  // ============== THÊM NHIỀU MAINBOARD ==============
  const motherboardProducts = [
    {
      tenSanPham: 'Asus TUF Gaming B760M-PLUS Wifi D4',
      slug: 'asus-tuf-b760m-plus-wifi-d4',
      gia: 3790000,
      hinhAnh: '',
      moTa: 'Socket LGA 1700, M-ATX, DDR4',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'Asus PRIME H610M-K D4',
      slug: 'asus-prime-h610m-k-d4',
      gia: 1790000,
      hinhAnh: '',
      moTa: 'Socket LGA 1700, M-ATX, DDR4',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'Asus Prime B760M-A DDR4',
      slug: 'asus-prime-b760m-a-ddr4',
      gia: 2790000,
      hinhAnh: '',
      moTa: 'Socket LGA 1700, PCIe 4.0, DDR4',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { socket: 'LGA 1700', pcie: 'PCIe 4.0', memory: 'DDR4' }
    },
    {
      tenSanPham: 'Asus TUF Gaming B760M-PLUS WIFI D5',
      slug: 'asus-tuf-b760m-plus-wifi-d5',
      gia: 4290000,
      hinhAnh: '',
      moTa: 'Socket LGA 1700, ATX, DDR5',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'ATX', memory: 'DDR5' }
    },
    {
      tenSanPham: 'Asus Prime B760M-K D4',
      slug: 'asus-prime-b760m-k-d4',
      gia: 2490000,
      hinhAnh: '',
      moTa: 'Socket LGA 1700, M-ATX, DDR4',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'ASUS TUF Gaming X870-PLUS WIFI',
      slug: 'asus-tuf-x870-plus-wifi',
      gia: 8990000,
      hinhAnh: '',
      moTa: 'Socket AM5, ATX, DDR5',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { socket: 'AM5', formFactor: 'ATX', memory: 'DDR5' }
    },
    {
      tenSanPham: 'ASUS TUF Gaming Z890-PLUS WIFI',
      slug: 'asus-tuf-z890-plus-wifi',
      gia: 7590000,
      hinhAnh: '',
      moTa: 'Socket LGA1851, ATX, DDR5',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { socket: 'LGA1851', formFactor: 'ATX', memory: 'DDR5' }
    },
    {
      tenSanPham: 'Asus Prime B860M-K DDR5',
      slug: 'asus-prime-b860m-k-ddr5',
      gia: 3590000,
      hinhAnh: '',
      moTa: 'Socket LGA1851, micro-ATX, DDR5',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { socket: 'LGA1851', formFactor: 'Micro ATX', memory: 'DDR5' }
    },
    {
      tenSanPham: 'ASUS PRIME B650M-K',
      slug: 'asus-prime-b650m-k',
      gia: 3290000,
      hinhAnh: '',
      moTa: 'Socket AM5, Micro ATX, DDR5',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { socket: 'AM5', formFactor: 'Micro ATX', memory: 'DDR5' }
    },
    {
      tenSanPham: 'Asus TUF Gaming B760M-PLUS D4',
      slug: 'asus-tuf-b760m-plus-d4',
      gia: 3690000,
      hinhAnh: '',
      moTa: 'Socket LGA 1700, M-ATX, DDR4',
      thuongHieu: 'ASUS',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'Gigabyte B760M Gaming Plus Wifi D4',
      slug: 'gigabyte-b760m-gaming-plus-wifi-d4',
      gia: 3190000,
      hinhAnh: '',
      moTa: 'Socket LGA 1700, Micro ATX, DDR4',
      thuongHieu: 'Gigabyte',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'Gigabyte B550M H ARGB AM4 D4',
      slug: 'gigabyte-b550m-h-argb-am4-d4',
      gia: 2090000,
      hinhAnh: '',
      moTa: 'Socket AM4, Micro ATX, DDR4',
      thuongHieu: 'Gigabyte',
      thongSoKyThuat: { socket: 'AM4', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'Gigabyte B760M DS3H DDR4',
      slug: 'gigabyte-b760m-ds3h-ddr4',
      gia: 3090000,
      hinhAnh: '',
      moTa: 'Socket LGA 1700, M-ATX, DDR4',
      thuongHieu: 'Gigabyte',
      thongSoKyThuat: { socket: 'LGA 1700', formFactor: 'Micro ATX', memory: 'DDR4' }
    },
    {
      tenSanPham: 'Gigabyte B860M Eagle WIFI6 V2 D5',
      slug: 'gigabyte-b860m-eagle-wifi6-v2-d5',
      gia: 3790000,
      hinhAnh: '',
      moTa: 'Socket LGA1851, Micro ATX, DDR5',
      thuongHieu: 'Gigabyte',
      thongSoKyThuat: { socket: 'LGA1851', formFactor: 'Micro ATX', memory: 'DDR5' }
    }
  ]

  const moboImages = ['/images/1.jpg', '/images/2.jpg', '/images/3.jpg', '/images/4.jpg', '/images/5.jpg', '/images/6.jpg', '/images/7.jpg', '/images/8.jpg', '/images/9.jpg', '/images/10.jpg', '/images/11.jpg', '/images/12.jpg', '/images/13.jpg', '/images/14.jpg', '/images/15.jpg'];
  let moboIdx = 0;
  for (const mobo of motherboardProducts) {
    const img = (mobo as any).hinhAnh && (mobo as any).hinhAnh.startsWith('/') ? (mobo as any).hinhAnh : moboImages[moboIdx++ % moboImages.length];
    await prisma.sanPham.create({
      data: { ...mobo, hinhAnh: img, soLuongTon: 40, danhMucId: mainboardCat.id }
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

  console.log('✅ Seeding hoàn tất!')
  console.log('📊 Tổng cộng:')
  console.log('   - 6 danh mục')
  console.log('   - 45 CPU')
  console.log('   - 20 GPU')
  console.log('   - 14 RAM')
  console.log('   - 14 Storage')
  console.log('   - 5 PSU')
  console.log('   - 14 Motherboard')
  console.log('   = 100 sản phẩm')


}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

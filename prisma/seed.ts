// prisma/seed.ts
// Chạy với: npx prisma db seed

import { prisma } from '../lib/prisma'

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

  // Tạo sản phẩm CPU
  await prisma.sanPham.create({
    data: {
      tenSanPham: 'Intel Core i7-13700K',
      slug: 'intel-i7-13700k',
      gia: 12500000,
      hinhAnh: 'https://via.placeholder.com/300x300?text=i7-13700K',
      moTa: 'CPU desktop cao cấp, LGA1700 Socket, 16 lõi / 24 luồng',
      soLuongTon: 15,
      thongSoKyThuat: {
        socket: 'LGA1700',
        cores: 16,
        threads: 24,
        tdp: '125W',
      },
      danhMucId: cpuCat.id,
    },
  })

  await prisma.sanPham.create({
    data: {
      tenSanPham: 'AMD Ryzen 7 7700X',
      slug: 'amd-ryzen-7-7700x',
      gia: 11800000,
      hinhAnh: 'https://via.placeholder.com/300x300?text=Ryzen-7700X',
      moTa: 'CPU desktop hiệu suất cao, AM5 Socket, 8 lõi / 16 luồng',
      soLuongTon: 20,
      thongSoKyThuat: {
        socket: 'AM5',
        cores: 8,
        threads: 16,
        tdp: '105W',
      },
      danhMucId: cpuCat.id,
    },
  })

  // Tạo sản phẩm Mainboard
  await prisma.sanPham.create({
    data: {
      tenSanPham: 'ASUS ROG STRIX Z790-E',
      slug: 'asus-rog-strix-z790-e',
      gia: 8500000,
      hinhAnh: 'https://via.placeholder.com/300x300?text=ROG-Z790',
      moTa: 'Bo mạch chủ chuyên game, LGA1700, PCIe 5.0',
      soLuongTon: 8,
      thongSoKyThuat: {
        socket: 'LGA1700',
        chipset: 'Z790',
        ramType: 'DDR5',
      },
      danhMucId: mainboardCat.id,
    },
  })

  await prisma.sanPham.create({
    data: {
      tenSanPham: 'MSI MPG B850-E EDGE WIFI',
      slug: 'msi-mpg-b850-e-edge',
      gia: 6500000,
      hinhAnh: 'https://via.placeholder.com/300x300?text=B850-Edge',
      moTa: 'Bo mạch chủ chuyên game, AM5, PCIe 5.0',
      soLuongTon: 12,
      thongSoKyThuat: {
        socket: 'AM5',
        chipset: 'B850',
        ramType: 'DDR5',
      },
      danhMucId: mainboardCat.id,
    },
  })

  // Tạo sản phẩm RAM
  await prisma.sanPham.create({
    data: {
      tenSanPham: 'CORSAIR Vengeance DDR5 32GB',
      slug: 'corsair-vengeance-ddr5-32gb',
      gia: 2800000,
      hinhAnh: 'https://via.placeholder.com/300x300?text=DDR5-32GB',
      moTa: 'RAM DDR5, 32GB (2x16GB), 6000MHz',
      soLuongTon: 30,
      thongSoKyThuat: {
        ramType: 'DDR5',
        capacity: '32GB',
        frequency: '6000MHz',
      },
      danhMucId: ramCat.id,
    },
  })

  await prisma.sanPham.create({
    data: {
      tenSanPham: 'G.SKILL Trident Z5 32GB DDR5',
      slug: 'gskill-trident-z5-32gb',
      gia: 2600000,
      hinhAnh: 'https://via.placeholder.com/300x300?text=TridentZ5',
      moTa: 'RAM DDR5, 32GB (2x16GB), 5600MHz',
      soLuongTon: 25,
      thongSoKyThuat: {
        ramType: 'DDR5',
        capacity: '32GB',
        frequency: '5600MHz',
      },
      danhMucId: ramCat.id,
    },
  })

  // Tạo sản phẩm Storage
  await prisma.sanPham.create({
    data: {
      tenSanPham: 'Samsung 990 Pro 1TB NVMe',
      slug: 'samsung-990-pro-1tb',
      gia: 2500000,
      hinhAnh: 'https://via.placeholder.com/300x300?text=990Pro-1TB',
      moTa: 'SSD NVMe M.2, 1TB, PCIe 4.0',
      soLuongTon: 40,
      thongSoKyThuat: {
        type: 'NVMe',
        capacity: '1TB',
        interface: 'PCIe 4.0',
      },
      danhMucId: storageCat.id,
    },
  })

  await prisma.sanPham.create({
    data: {
      tenSanPham: 'WD Blue SSD 1TB',
      slug: 'wd-blue-ssd-1tb',
      gia: 1800000,
      hinhAnh: 'https://via.placeholder.com/300x300?text=WD-Blue-1TB',
      moTa: 'SSD SATA, 1TB, 2.5 inch',
      soLuongTon: 35,
      thongSoKyThuat: {
        type: 'SATA',
        capacity: '1TB',
        formFactor: '2.5 inch',
      },
      danhMucId: storageCat.id,
    },
  })

  // Tạo sản phẩm GPU
  await prisma.sanPham.create({
    data: {
      tenSanPham: 'NVIDIA RTX 4090',
      slug: 'nvidia-rtx-4090',
      gia: 49500000,
      hinhAnh: 'https://via.placeholder.com/300x300?text=RTX-4090',
      moTa: 'Card màn hình cao cấp, 24GB GDDR6X',
      soLuongTon: 3,
      thongSoKyThuat: {
        memory: '24GB',
        tdp: '450W',
        interface: 'PCIe 4.0',
      },
      danhMucId: gpuCat.id,
    },
  })

  await prisma.sanPham.create({
    data: {
      tenSanPham: 'AMD Radeon RX 7900 XT',
      slug: 'amd-rx-7900-xt',
      gia: 35000000,
      hinhAnh: 'https://via.placeholder.com/300x300?text=RX-7900XT',
      moTa: 'Card màn hình gaming, 24GB GDDR6',
      soLuongTon: 5,
      thongSoKyThuat: {
        memory: '24GB',
        tdp: '420W',
        interface: 'PCIe 4.0',
      },
      danhMucId: gpuCat.id,
    },
  })

  // Tạo sản phẩm PSU
  await prisma.sanPham.create({
    data: {
      tenSanPham: 'CORSAIR RM1000x Gold',
      slug: 'corsair-rm1000x-gold',
      gia: 4500000,
      hinhAnh: 'https://via.placeholder.com/300x300?text=RM1000x',
      moTa: 'Nguồn 1000W fully modular, 80+ Gold',
      soLuongTon: 10,
      thongSoKyThuat: {
        wattage: '1000W',
        certification: '80+ Gold',
        modularity: 'Fully Modular',
      },
      danhMucId: psuCat.id,
    },
  })

  await prisma.sanPham.create({
    data: {
      tenSanPham: 'Seasonic Focus Plus 850W Gold',
      slug: 'seasonic-focus-plus-850w',
      gia: 3200000,
      hinhAnh: 'https://via.placeholder.com/300x300?text=Focus-850W',
      moTa: 'Nguồn 850W fully modular, 80+ Gold',
      soLuongTon: 15,
      thongSoKyThuat: {
        wattage: '850W',
        certification: '80+ Gold',
        modularity: 'Fully Modular',
      },
      danhMucId: psuCat.id,
    },
  })

  // Tạo người dùng
  const user = await prisma.nguoiDung.create({
    data: {
      hoTen: 'Nguyễn Văn A',
      email: 'user@example.com',
      matKhauHash: 'hashed_password_here', // Trong thực tế phải hash bằng bcrypt
      vaiTro: 'KHACH_HANG',
      soDienThoai: '0123456789',
      diaChi: '123 Đường ABC, TP HCM',
    },
  })

  // Tạo giỏ hàng cho user
  await prisma.gioHang.create({
    data: {
      nguoiDungId: user.id,
    },
  })

  console.log('✅ Seeding hoàn tất!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

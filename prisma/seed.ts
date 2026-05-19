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
      hinhAnh: 'https://www.intel.com/content/dam/support/us/en/images/processors/97035-img11.png',
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
      hinhAnh: 'https://hoanghapccdn.com/media/product/4720_core_i9_14900k_sale_t4_2026.jpg',
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
      hinhAnh: 'https://hoanghapccdn.com/media/product/4636_core_i7_14700k_sale_t4_2026.jpg',
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
      hinhAnh: 'https://hoanghapccdn.com/media/product/4550_core_i7_14700_sale_t4_2026.jpg',
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
    {
      tenSanPham: 'ASUS ROG MAXIMUS Z890-E',
      slug: 'asus-rog-maximus-z890-e',
      gia: 8500000,
      moTa: 'Bo mạch chủ ASUS ROG MAXIMUS Z890-E Socket LGA 1700',
      thuongHieu: 'ASUS',
      thongSoKyThuat: {
        socket: 'LGA 1700',
        chipset: 'Z890',
        formFactor: 'ATX',
        memory: 'DDR5'
      }
    },
    {
      tenSanPham: 'MSI MPG Z890 CARBON WiFi',
      slug: 'msi-mpg-z890-carbon-wifi',
      gia: 7500000,
      moTa: 'Bo mạch chủ MSI MPG Z890 Carbon WiFi LGA 1700',
      thuongHieu: 'MSI',
      thongSoKyThuat: {
        socket: 'LGA 1700',
        chipset: 'Z890',
        formFactor: 'ATX',
        memory: 'DDR5'
      }
    },
    {
      tenSanPham: 'Gigabyte Z890 MASTER',
      slug: 'gigabyte-z890-master',
      gia: 6800000,
      moTa: 'Bo mạch chủ Gigabyte Z890 Master Socket LGA 1700',
      thuongHieu: 'Gigabyte',
      thongSoKyThuat: {
        socket: 'LGA 1700',
        chipset: 'Z890',
        formFactor: 'ATX',
        memory: 'DDR5'
      }
    },
    {
      tenSanPham: 'ASUS ROG STRIX X870-E-E GAMING WiFi',
      slug: 'asus-rog-strix-x870-e-gaming',
      gia: 9200000,
      moTa: 'Bo mạch chủ ASUS ROG STRIX X870-E Socket AM5',
      thuongHieu: 'ASUS',
      thongSoKyThuat: {
        socket: 'AM5',
        chipset: 'X870-E',
        formFactor: 'ATX',
        memory: 'DDR5'
      }
    },
    {
      tenSanPham: 'MSI MPG B850 EDGE WiFi',
      slug: 'msi-mpg-b850-edge-wifi',
      gia: 5500000,
      moTa: 'Bo mạch chủ MSI MPG B850 Edge WiFi Socket AM5',
      thuongHieu: 'MSI',
      thongSoKyThuat: {
        socket: 'AM5',
        chipset: 'B850',
        formFactor: 'ATX',
        memory: 'DDR5'
      }
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
  console.log('   - 10 CPU')
  console.log('   - 8 GPU')
  console.log('   - 6 RAM')
  console.log('   - 6 Storage')
  console.log('   - 5 PSU')
  console.log('   - 5 Motherboard')
  console.log('   = 45 sản phẩm')
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

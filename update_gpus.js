const fs = require('fs');

const gpusRaw = `
VGA Asus Geforce GT710 2GB GT710-SL-2GD5-BRK-EVO
Thông số: 2GB, GDDR5, 300W
Giá bán: 1.990.000₫ (Giá cũ: 2.490.000₫)
Ưu đãi: Smember giảm đến 40.000₫

VGA MSI GeForce RTX 3060 VENTUS 2X 12G OC
Thông số: 12GB, GDDR6, 550W
Giá bán: 9.490.000₫ (Giá cũ: 9.990.000₫)
Ưu đãi: Smember giảm đến 190.000₫

VGA MSI GeForce RTX 5060 8GB VENTUS 2X OC
Thông số: 8GB, GDDR7, 550W
Giá bán: 10.690.000₫ (Giá cũ: 13.990.000₫)
Ưu đãi: Smember giảm đến 214.000₫

VGA ASUS Dual Geforce RTX 3060 OC 12GB DUAL-...
Thông số: 12GB, GDDR6, Từ 650W - 2.7 slot
Giá bán: 9.490.000₫ (Giá cũ: 9.990.000₫)
Ưu đãi: Smember giảm đến 190.000₫

VGA Asus Tuf Gaming Geforce RTX 5070 OC 12GB...
Thông số: 12GB, GDDR7, 750W
Giá bán: 26.990.000₫ (Giá cũ: 29.990.000₫)
Ưu đãi: Smember giảm đến 540.000₫

VGA MSI Geforce RTX 5060 8GB Shadow 2X OC
Thông số: 8GB, GDDR7, 550W
Giá bán: 9.990.000₫ (Giá cũ: 12.990.000₫)
Ưu đãi: Smember giảm đến 200.000₫

VGA MSI Geforce RTX 5090 32G Gaming Trio OC
Thông số: 32GB, GDDR7, 1000W
Giá bán: 119.000.000₫ (Giá cũ: 129.000.000₫)
Ưu đãi: Smember giảm đến 2.380.000₫

VGA Asus Dual Radeon RX 6500 XT OC 4GB DUAL-...
Thông số: 4GB, GDDR6, 500W
Giá bán: 5.190.000₫ (Giá cũ: 6.490.000₫)
Ưu đãi: Smember giảm đến 104.000₫

VGA MSI GeForce RTX 3050 VENTUS 2X 6G OC
Thông số: 6GB, GDDR6, 300W
Giá bán: 6.190.000₫ (Giá cũ: 7.490.000₫)
Ưu đãi: Smember giảm đến 124.000₫

VGA Gigabyte Radeon RX 6500 XT Eagle 4GB GV-...
Thông số: 4GB, GDDR6, 400W
Giá bán: 5.190.000₫ (Giá cũ: 6.490.000₫)
Ưu đãi: Smember giảm đến 104.000₫

VGA Asrock Intel ARC A380 Challenger ITX 6GB OC
Thông số: 6GB, GDDR6, 500W
Giá bán: 4.390.000₫ (Giá cũ: 4.990.000₫)
Ưu đãi: Smember giảm đến 88.000₫

VGA MSI GeForce RTX 5070 12GB VENTUS 2X OC
Thông số: 12GB, GDDR7, 650W
Giá bán: 21.990.000₫ (Giá cũ: 26.990.000₫)
Ưu đãi: Smember giảm đến 440.000₫

VGA Asus Phoenix Radeon RX 7600 OC 8GB DUAL-RX760...
Thông số: 8GB, GDDR6, 550W
Giá bán: 8.490.000₫ (Giá cũ: 9.990.000₫)
Ưu đãi: Smember giảm đến 170.000₫

VGA MSI GeForce RTX 5060 Ti 8G Ventus 2X OC Plus
Thông số: 8GB, GDDR7, 600W
Giá bán: 13.990.000₫ (Giá cũ: 17.990.000₫)
Ưu đãi: Smember giảm đến 280.000₫

VGA Gigabyte RTX 5050 WindForce OC 8GB...
Thông số: 8GB, GDDR6, 550W
Giá bán: 8.490.000₫ (Giá cũ: 9.990.000₫)
Ưu đãi: Smember giảm đến 170.000₫

VGA Asus Prime Radeon RX 9070 XT OC 16GB PRIME-...
Thông số: 16GB, GDDR6, 750W
Giá bán: 24.990.000₫ (Giá cũ: 26.990.000₫)
Ưu đãi: Smember giảm đến 500.000₫

VGA MSI Geforce RTX 5070 12G Gaming Trio OC
Thông số: 12GB, GDDR7, 650W
Giá bán: 23.990.000₫ (Giá cũ: 28.990.000₫)
Ưu đãi: Smember giảm đến 480.000₫

VGA MSI GeForce RTX 5070 Ti 16G Shadow 3X OC
Thông số: 16GB, GDDR7, 750W
Giá bán: 32.990.000₫ (Giá cũ: 38.990.000₫)
Ưu đãi: Smember giảm đến 660.000₫

VGA Asus Prime Geforce RTX 5060 Ti 16GB OC PRIME-...
Thông số: 16GB, GDDR7, 550W
Giá bán: 20.990.000₫ (Giá cũ: 23.990.000₫)
Ưu đãi: Smember giảm đến 420.000₫

VGA Gigabyte GeForce RTX 3050 WindForce OC 6GB G...
Thông số: 6GB, GDDR6, 300W
Giá bán: 6.190.000₫
Ưu đãi: Hàng mới về
`;

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

const blocks = gpusRaw.trim().split('\n\n');
const gpuList = blocks.map(block => {
  const lines = block.split('\n');
  const tenSanPham = lines[0].replace(/\.+$/, ''); // remove trailing dots
  const thongSo = lines[1].replace('Thông số: ', '').split(', ');
  const giaStr = lines[2].replace('Giá bán: ', '').split('₫')[0].replace(/\./g, '');
  const gia = parseInt(giaStr, 10);
  
  let thuongHieu = 'Khác';
  if (tenSanPham.toLowerCase().includes('asus')) thuongHieu = 'ASUS';
  else if (tenSanPham.toLowerCase().includes('msi')) thuongHieu = 'MSI';
  else if (tenSanPham.toLowerCase().includes('gigabyte')) thuongHieu = 'Gigabyte';
  else if (tenSanPham.toLowerCase().includes('asrock')) thuongHieu = 'ASRock';

  return `    {
      tenSanPham: '${tenSanPham}',
      slug: '${slugify(tenSanPham)}',
      gia: ${gia},
      hinhAnh: '',
      moTa: 'Card màn hình ${tenSanPham}. Thông số: ${lines[1].replace('Thông số: ', '')}',
      thuongHieu: '${thuongHieu}',
      thongSoKyThuat: { memory: '${thongSo[0]}', vramType: '${thongSo[1]}', psu: '${thongSo[2]}' }
    }`;
});

const newGpuProductsStr = `  const gpuProducts = [\n${gpuList.join(',\n')}\n  ]`;

let content = fs.readFileSync('prisma/seed.ts', 'utf8');

// The file currently has:
//   const gpuProducts = [
//     {
//       tenSanPham: 'AMD Radeon RX 7900 XT',
//       ...
//     }
//   ]
const startRegex = /const gpuProducts = \[\s*\{[\s\S]*?\}\s*\]/;
content = content.replace(startRegex, newGpuProductsStr);

// update counts if we want, currently it says 8 GPU but we have 20.
content = content.replace(/console\.log\('   - 8 GPU'\)/, "console.log('   - 20 GPU')");

fs.writeFileSync('prisma/seed.ts', content, 'utf8');
console.log('Replaced GPU products successfully.');

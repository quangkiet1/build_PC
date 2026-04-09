import { Product, Category, CompatibilityIssue } from '@/app/types/builder';

export type Build = Partial<Record<Category, Product>>;

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(price);
}

export function checkCompatibility(build: Build): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = [];

  const cpu = build.cpu;
  const mainboard = build.mainboard;
  const ram = build.ram;
  const gpu = build.gpu;
  const psu = build.psu;

  // CPU <-> Mainboard socket check
  if (cpu && mainboard) {
    if (cpu.socket && mainboard.supportedSocket && cpu.socket !== mainboard.supportedSocket) {
      issues.push({
        type: 'error',
        message: `CPU (${cpu.socket}) không tương thích với Mainboard (${mainboard.supportedSocket})`,
        suggestion: `Hãy chọn mainboard hỗ trợ socket ${cpu.socket} hoặc chọn CPU phù hợp với socket ${mainboard.supportedSocket}`,
      });
    }
  }

  // RAM <-> Mainboard type check
  if (ram && mainboard) {
    if (mainboard.supportedRam && !mainboard.supportedRam.includes(ram.ramType || '')) {
      issues.push({
        type: 'error',
        message: `RAM ${ram.ramType} không tương thích với Mainboard (hỗ trợ: ${mainboard.supportedRam.join(', ')})`,
        suggestion: `Chọn RAM ${mainboard.supportedRam[0]} để phù hợp với mainboard này`,
      });
    }
  }

  // PSU wattage check
  if (psu) {
    const totalTdp = (cpu?.tdp || 0) + (gpu?.tdp || 0);
    const requiredWattage = totalTdp + 100; // buffer
    if (psu.wattage && psu.wattage < requiredWattage) {
      issues.push({
        type: 'error',
        message: `Nguồn ${psu.wattage}W không đủ cho cấu hình này (cần ít nhất ${requiredWattage}W)`,
        suggestion: `Nâng cấp lên nguồn ${Math.ceil(requiredWattage / 50) * 50}W hoặc cao hơn để đảm bảo ổn định`,
      });
    } else if (psu.wattage && psu.wattage < requiredWattage + 150) {
      issues.push({
        type: 'warning',
        message: `Nguồn ${psu.wattage}W đủ nhưng khuyến nghị dùng nguồn lớn hơn để headroom tốt hơn`,
        suggestion: `Nguồn ${psu.wattage + 200}W sẽ cho phép nâng cấp trong tương lai`,
      });
    }
  }

  // High TDP GPU without PSU
  if (gpu && !psu && gpu.tdp && gpu.tdp > 200) {
    issues.push({
      type: 'warning',
      message: `GPU ${gpu.name} có TDP ${gpu.tdp}W. Cần nguồn ít nhất ${(gpu.tdp || 0) + (cpu?.tdp || 65) + 100}W`,
    });
  }

  // Suggestions
  if (cpu && !mainboard) {
    issues.push({
      type: 'info',
      message: `Hãy chọn mainboard socket ${cpu.socket} tương thích với CPU của bạn`,
    });
  }

  if (mainboard && !ram) {
    issues.push({
      type: 'info',
      message: `Mainboard này hỗ trợ ${mainboard.supportedRam?.join(', ')}. Hãy chọn RAM phù hợp`,
    });
  }

  return issues;
}

export function isProductCompatibleWithBuild(
  product: Product,
  build: Build
): { compatible: boolean; reason?: string } {
  if (product.category === 'mainboard') {
    if (build.cpu && product.supportedSocket && product.supportedSocket !== build.cpu.socket) {
      return { compatible: false, reason: `Không hỗ trợ socket ${build.cpu.socket}` };
    }
    if (build.ram && product.supportedRam && !product.supportedRam.includes(build.ram.ramType || '')) {
      return { compatible: false, reason: `Không hỗ trợ ${build.ram.ramType}` };
    }
  }

  if (product.category === 'cpu') {
    if (build.mainboard && product.socket && product.socket !== build.mainboard.supportedSocket) {
      return { compatible: false, reason: `Socket không khớp với mainboard` };
    }
  }

  if (product.category === 'ram') {
    if (build.mainboard && build.mainboard.supportedRam && !build.mainboard.supportedRam.includes(product.ramType || '')) {
      return { compatible: false, reason: `Mainboard không hỗ trợ ${product.ramType}` };
    }
  }

  if (product.category === 'psu') {
    const totalTdp = (build.cpu?.tdp || 0) + (build.gpu?.tdp || 0);
    const needed = totalTdp + 100;
    if (product.wattage && product.wattage < needed) {
      return { compatible: false, reason: `Không đủ công suất (cần ${needed}W)` };
    }
  }

  return { compatible: true };
}

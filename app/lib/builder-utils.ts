import { Product, Category, CompatibilityIssue } from '@/app/types/builder';
import type { AppLocale } from '@/i18n/config'

export type Build = Partial<Record<Category, Product>>;

type TranslateCompatibility = (key: string, values?: Record<string, string | number>) => string

export function formatPrice(price: number, locale: AppLocale = 'vi'): string {
  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(price);
}

export function checkCompatibility(build: Build, t: TranslateCompatibility): CompatibilityIssue[] {
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
        message: t('cpuMainboardMismatch', { cpuSocket: cpu.socket, boardSocket: mainboard.supportedSocket }),
        suggestion: t('cpuMainboardSuggestion', { cpuSocket: cpu.socket, boardSocket: mainboard.supportedSocket }),
      });
    }
  }

  // RAM <-> Mainboard type check
  if (ram && mainboard) {
    if (mainboard.supportedRam && !mainboard.supportedRam.includes(ram.ramType || '')) {
      issues.push({
        type: 'error',
        message: t('ramMainboardMismatch', { ramType: ram.ramType || '', supported: mainboard.supportedRam.join(', ') }),
        suggestion: t('ramMainboardSuggestion', { suggested: mainboard.supportedRam[0] || '' }),
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
        message: t('psuInsufficient', { wattage: psu.wattage, requiredWattage }),
        suggestion: t('psuInsufficientSuggestion', { suggestedWattage: Math.ceil(requiredWattage / 50) * 50 }),
      });
    } else if (psu.wattage && psu.wattage < requiredWattage + 150) {
      issues.push({
        type: 'warning',
        message: t('psuWarning', { wattage: psu.wattage }),
        suggestion: t('psuWarningSuggestion', { suggestedWattage: psu.wattage + 200 }),
      });
    }
  }

  // High TDP GPU without PSU
  if (gpu && !psu && gpu.tdp && gpu.tdp > 200) {
    issues.push({
      type: 'warning',
      message: t('gpuNeedsPsu', { name: gpu.name, tdp: gpu.tdp || 0, requiredWattage: (gpu.tdp || 0) + (cpu?.tdp || 65) + 100 }),
    });
  }

  // Suggestions
  if (cpu && !mainboard) {
    issues.push({
      type: 'info',
      message: t('selectMainboard', { socket: cpu.socket || '' }),
    });
  }

  if (mainboard && !ram) {
    issues.push({
      type: 'info',
      message: t('selectRam', { supported: mainboard.supportedRam?.join(', ') || '' }),
    });
  }

  return issues;
}

export function isProductCompatibleWithBuild(
  product: Product,
  build: Build,
  t: TranslateCompatibility
): { compatible: boolean; reason?: string } {
  if (product.category === 'mainboard') {
    if (build.cpu && product.supportedSocket && product.supportedSocket !== build.cpu.socket) {
      return { compatible: false, reason: t('unsupportedSocket', { socket: build.cpu.socket || '' }) };
    }
    if (build.ram && product.supportedRam && !product.supportedRam.includes(build.ram.ramType || '')) {
      return { compatible: false, reason: t('unsupportedRam', { ramType: build.ram.ramType || '' }) };
    }
  }

  if (product.category === 'cpu') {
    if (build.mainboard && product.socket && product.socket !== build.mainboard.supportedSocket) {
      return { compatible: false, reason: t('socketMismatch') };
    }
  }

  if (product.category === 'ram') {
    if (build.mainboard && build.mainboard.supportedRam && !build.mainboard.supportedRam.includes(product.ramType || '')) {
      return { compatible: false, reason: t('mainboardUnsupportedRam', { ramType: product.ramType || '' }) };
    }
  }

  if (product.category === 'psu') {
    const totalTdp = (build.cpu?.tdp || 0) + (build.gpu?.tdp || 0);
    const needed = totalTdp + 100;
    if (product.wattage && product.wattage < needed) {
      return { compatible: false, reason: t('insufficientWattage', { wattage: needed }) };
    }
  }

  return { compatible: true };
}

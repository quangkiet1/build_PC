'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Cpu, Monitor, Database, HardDrive, Zap, Package, Wind, LayoutGrid,
  Plus, X, CheckCircle2, AlertTriangle, AlertCircle, ShoppingCart,
  ChevronRight, Search, Info, Lightbulb, Wrench, Star
} from 'lucide-react';
import { Product, Category } from '@/app/types/builder';
import { Build, formatPrice, checkCompatibility, isProductCompatibleWithBuild } from '@/app/lib/builder-utils';

interface BuildSlot {
  category: Category;
  label: string;
  icon: React.ElementType;
  required: boolean;
  description: string;
}

const buildSlots: BuildSlot[] = [
  { category: 'cpu', label: 'CPU / Bộ vi xử lý', icon: Cpu, required: true, description: 'Bộ não của máy tính' },
  { category: 'mainboard', label: 'Mainboard / Bo mạch chủ', icon: LayoutGrid, required: true, description: 'Kết nối tất cả linh kiện' },
  { category: 'ram', label: 'RAM / Bộ nhớ', icon: Database, required: true, description: 'Bộ nhớ tạm thời cho hệ thống' },
  { category: 'gpu', label: 'GPU / Card đồ họa', icon: Monitor, required: false, description: 'Xử lý đồ họa và gaming' },
  { category: 'storage', label: 'Ổ cứng / Lưu trữ', icon: HardDrive, required: true, description: 'Lưu trữ dữ liệu' },
  { category: 'psu', label: 'PSU / Nguồn máy tính', icon: Zap, required: true, description: 'Cung cấp điện cho hệ thống' },
  { category: 'case', label: 'Case / Vỏ máy tính', icon: Package, required: false, description: 'Bao vỏ và bảo vệ linh kiện' },
  { category: 'cooling', label: 'Tản nhiệt', icon: Wind, required: false, description: 'Làm mát CPU và hệ thống' },
];

interface PCBuilderProps {
  products: Product[];
}

export function PCBuilder({ products }: PCBuilderProps) {
  const [build, setBuild] = useState<Build>({});
  const [activeSlot, setActiveSlot] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const issues = useMemo(() => checkCompatibility(build), [build]);
  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');
  const infos = issues.filter(i => i.type === 'info');

  const compatibilityStatus: 'good' | 'warning' | 'error' | 'empty' =
    Object.keys(build).length === 0 ? 'empty' :
    errors.length > 0 ? 'error' :
    warnings.length > 0 ? 'warning' : 'good';

  const totalPrice = Object.values(build).reduce((sum, p) => sum + (p?.price || 0), 0);

  const slotProducts = useMemo(() => {
    if (!activeSlot) return [];
    let filtered = products.filter(p => p.category === activeSlot);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [activeSlot, searchQuery, products]);

  const addToBuildAndClose = (product: Product) => {
    setBuild(prev => ({ ...prev, [product.category]: product }));
    setActiveSlot(null);
    setSearchQuery('');
  };

  const filledSlots = buildSlots.filter(s => build[s.category]);
  const progress = (filledSlots.length / buildSlots.length) * 100;

  const budgetPresets = [
    { label: 'Gaming 15 triệu', budget: 15000000, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    { label: 'Gaming 25 triệu', budget: 25000000, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
    { label: 'Workstation 50 triệu', budget: 50000000, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900/95 border-b border-slate-800 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <Link href="/" className="hover:text-blue-400">Trang chủ</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-300">PC Builder</span>
              </div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Wrench className="w-6 h-6 text-blue-400" />
                PC Builder
              </h1>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              {budgetPresets.map(preset => (
                <button
                  key={preset.label}
                  className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-all hover:opacity-80 ${preset.color}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT: Build Slots */}
          <div className="lg:col-span-2 space-y-4">
            {/* Progress */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Tiến độ build: {filledSlots.length}/{buildSlots.length} linh kiện</span>
                <span className="text-blue-400 text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Slot Cards */}
            <div className="space-y-2">
              {buildSlots.map(slot => {
                const selected = build[slot.category];
                const isActive = activeSlot === slot.category;

                return (
                  <div key={slot.category}>
                    <div
                      className={`group bg-slate-900/50 border rounded-xl p-4 transition-all cursor-pointer ${
                        isActive
                          ? 'border-blue-500 ring-1 ring-blue-500/30'
                          : selected
                          ? 'border-slate-700 hover:border-blue-500/50'
                          : 'border-slate-800 hover:border-blue-500/40 border-dashed'
                      }`}
                      onClick={() => {
                        if (!selected) {
                          setActiveSlot(isActive ? null : slot.category);
                          setSearchQuery('');
                        }
                      }}
                    >
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                          selected ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'
                        }`}>
                          <slot.icon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        {selected ? (
                          <div className="flex-1 min-w-0 flex items-center gap-3">
                            <img
                              src={selected.image}
                              alt={selected.name}
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                              onError={(e) => {
                                e.currentTarget.src = '/images/cpu-i7.svg';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-blue-400 mb-0.5">{selected.brand}</p>
                              <p className="text-slate-200 text-sm font-medium truncate">{selected.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {selected.socket && (
                                  <span className="text-xs text-slate-500">{selected.socket}</span>
                                )}
                                {selected.ramType && (
                                  <span className="text-xs text-slate-500">{selected.ramType}</span>
                                )}
                                {selected.wattage && (
                                  <span className="text-xs text-slate-500">{selected.wattage}W</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-blue-400 font-bold text-sm">{formatPrice(selected.price)}</p>
                              {selected.originalPrice && (
                                <p className="text-slate-600 text-xs line-through">{formatPrice(selected.originalPrice)}</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <p className="text-slate-300 text-sm font-medium">{slot.label}</p>
                            <p className="text-slate-600 text-xs">{slot.description}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {slot.required && !selected && (
                            <span className="text-xs text-amber-500/70 border border-amber-500/30 px-1.5 py-0.5 rounded">Bắt buộc</span>
                          )}
                          {selected ? (
                            <>
                              <button
                                onClick={e => { e.stopPropagation(); setActiveSlot(slot.category); setSearchQuery(''); }}
                                className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-all"
                              >
                                Thay đổi
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); setBuild(prev => { const n = {...prev}; delete n[slot.category]; return n; }); }}
                                className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                              isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500 group-hover:bg-blue-500/20 group-hover:text-blue-400'
                            }`}>
                              <Plus className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Product Picker - Inline */}
                    {isActive && (
                      <div className="mt-2 bg-slate-900/50 border border-blue-500/40 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-3 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                              <input
                                type="text"
                                placeholder={`Tìm ${slot.label}...`}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                autoFocus
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-all"
                              />
                            </div>
                            <button
                              onClick={() => { setActiveSlot(null); setSearchQuery(''); }}
                              className="p-2 text-slate-400 hover:text-white transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                          {slotProducts.length === 0 ? (
                            <p className="text-center text-slate-500 text-sm py-6">Không tìm thấy sản phẩm</p>
                          ) : (
                            slotProducts.map(product => {
                              const compat = isProductCompatibleWithBuild(product, build);
                              return (
                                <div
                                  key={product.id}
                                  className={`flex items-center gap-3 p-3 border-b border-slate-800 last:border-0 cursor-pointer transition-all ${
                                    compat.compatible
                                      ? 'hover:bg-blue-500/10'
                                      : 'opacity-50 hover:bg-red-500/5'
                                  }`}
                                  onClick={() => compat.compatible && addToBuildAndClose(product)}
                                >
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                                    onError={(e) => {
                                      e.currentTarget.src = '/images/cpu-i7.svg';
                                    }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <p className="text-xs text-blue-400">{product.brand}</p>
                                      {!compat.compatible && (
                                        <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                          <AlertCircle className="w-2.5 h-2.5" /> Không tương thích
                                        </span>
                                      )}
                                      {compat.compatible && Object.keys(build).length > 0 && (
                                        <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                          <CheckCircle2 className="w-2.5 h-2.5" /> Tương thích
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-slate-200 text-sm truncate">{product.name}</p>
                                    {compat.reason && (
                                      <p className="text-red-400 text-xs">{compat.reason}</p>
                                    )}
                                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                      {product.socket && <span className="text-slate-500 text-xs">{product.socket}</span>}
                                      {product.ramType && <span className="text-slate-500 text-xs">{product.ramType}</span>}
                                      {product.wattage && <span className="text-slate-500 text-xs">{product.wattage}W</span>}
                                      {product.tdp && <span className="text-slate-500 text-xs">TDP: {product.tdp}W</span>}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-blue-400 font-bold text-sm">{formatPrice(product.price)}</p>
                                    <div className="flex items-center gap-0.5 justify-end mt-0.5">
                                      <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                      <span className="text-slate-500 text-xs">{product.rating}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Build Summary */}
          <div className="space-y-4">
            {/* Compatibility Status */}
            <div className={`rounded-xl p-4 border ${
              compatibilityStatus === 'good' ? 'bg-emerald-500/10 border-emerald-500/30' :
              compatibilityStatus === 'error' ? 'bg-red-500/10 border-red-500/30' :
              compatibilityStatus === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
              'bg-slate-900/50 border-slate-800'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {compatibilityStatus === 'good' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {compatibilityStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
                {compatibilityStatus === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {compatibilityStatus === 'empty' && <Info className="w-5 h-5 text-slate-500" />}
                <h3 className={`font-semibold text-sm ${
                  compatibilityStatus === 'good' ? 'text-emerald-400' :
                  compatibilityStatus === 'error' ? 'text-red-400' :
                  compatibilityStatus === 'warning' ? 'text-amber-400' : 'text-slate-400'
                }`}>
                  {compatibilityStatus === 'good' ? 'Tương thích hoàn hảo' :
                   compatibilityStatus === 'error' ? `${errors.length} lỗi tương thích` :
                   compatibilityStatus === 'warning' ? `${warnings.length} cảnh báo` :
                   'Chưa có linh kiện nào'}
                </h3>
              </div>

              <div className="space-y-2">
                {errors.map((issue, i) => (
                  <div key={i} className="flex gap-2 p-2 bg-red-500/10 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-300 text-xs">{issue.message}</p>
                      {issue.suggestion && (
                        <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3 text-amber-400" />
                          {issue.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {warnings.map((issue, i) => (
                  <div key={i} className="flex gap-2 p-2 bg-amber-500/10 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-300 text-xs">{issue.message}</p>
                      {issue.suggestion && (
                        <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3 text-amber-400" />
                          {issue.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {infos.map((issue, i) => (
                  <div key={i} className="flex gap-2 p-2 bg-blue-500/10 rounded-lg">
                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-blue-300 text-xs">{issue.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Build Summary */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden sticky top-24">
              <div className="p-4 border-b border-slate-800">
                <h3 className="text-white font-semibold text-sm">Cấu hình đã chọn</h3>
              </div>

              <div className="divide-y divide-slate-800 max-h-64 overflow-y-auto">
                {buildSlots.map(slot => {
                  const selected = build[slot.category];
                  return (
                    <div key={slot.category} className="flex items-center gap-3 px-4 py-3">
                      <slot.icon className={`w-4 h-4 shrink-0 ${selected ? 'text-blue-400' : 'text-slate-600'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-500 text-xs">{slot.label.split('/')[0].trim()}</p>
                        {selected ? (
                          <p className="text-slate-200 text-xs truncate">{selected.name}</p>
                        ) : (
                          <p className="text-slate-600 text-xs italic">Chưa chọn</p>
                        )}
                      </div>
                      {selected && (
                        <span className="text-blue-400 text-xs font-medium shrink-0">
                          {formatPrice(selected.price)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div className="p-4 border-t border-slate-800 bg-slate-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Tổng giá cấu hình</span>
                  <span className="text-2xl font-bold text-blue-400">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                {totalPrice > 0 && (
                  <p className="text-slate-500 text-xs mb-4">
                    {filledSlots.length} linh kiện • {errors.length === 0 ? 'Tất cả tương thích' : `${errors.length} lỗi cần sửa`}
                  </p>
                )}

                <button
                  disabled={Object.keys(build).length === 0 || errors.length > 0}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                    Object.keys(build).length === 0 || errors.length > 0
                      ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-lg hover:shadow-blue-500/30'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Thêm vào giỏ hàng
                </button>

                {errors.length > 0 && (
                  <p className="text-red-400 text-xs text-center mt-2">
                    Vui lòng sửa lỗi tương thích trước khi thêm vào giỏ
                  </p>
                )}

                <button
                  onClick={() => { setBuild({}); setActiveSlot(null); }}
                  className="w-full mt-2 py-2 text-slate-500 hover:text-white text-sm transition-colors"
                >
                  Làm mới cấu hình
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <h3 className="text-slate-300 text-sm font-medium mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Mẹo build PC
              </h3>
              <ul className="space-y-2 text-slate-500 text-xs">
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-400 mt-0.5">•</span>
                  CPU và Mainboard phải cùng socket (LGA1700 hoặc AM5)
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-400 mt-0.5">•</span>
                  RAM phải đúng loại (DDR4/DDR5) mà mainboard hỗ trợ
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-400 mt-0.5">•</span>
                  Nguồn cần dư tối thiểu 100W so với tổng TDP
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-400 mt-0.5">•</span>
                  RTX 4090 cần nguồn tối thiểu 850W
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

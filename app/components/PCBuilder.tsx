'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Cpu, Monitor, Database, HardDrive, Zap, Package, Wind, LayoutGrid,
  Plus, X, CheckCircle2, AlertTriangle, AlertCircle, ShoppingCart,
  ChevronRight, Search, Info, Lightbulb, Wrench, Star
} from 'lucide-react';
import { Product, Category } from '@/app/types/builder';
import { Build, formatPrice, checkCompatibility, isProductCompatibleWithBuild } from '@/app/lib/builder-utils';
import { useToast } from '@/app/providers/toast-provider';
import { useCart } from '@/app/providers/cart-provider';

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
  const [budgetLimit, setBudgetLimit] = useState<number | null>(null);
  const { addToast } = useToast();
  const { addItem } = useCart();
  const router = useRouter();

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

  const handleAddAllToCart = async () => {
    const selectedProducts = Object.values(build).filter((product): product is Product => Boolean(product));
    if (selectedProducts.length === 0) return;

    try {
      await Promise.all(selectedProducts.map((product) => addItem(product.id, 1)));
      addToast('Da them toan bo cau hinh vao gio hang', 'success');
      router.push('/cart');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Khong the them cau hinh vao gio hang';
      addToast(message, 'error');
      if (message.toLowerCase().includes('dang nhap')) {
        router.push('/?auth=required');
      }
    }
  };

  const filledSlots = buildSlots.filter(s => build[s.category]);
  const progress = (filledSlots.length / buildSlots.length) * 100;

  const budgetPresets = [
    { label: 'Gaming 15 triệu', budget: 15000000, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    { label: 'Gaming 25 triệu', budget: 25000000, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
    { label: 'Workstation 50 triệu', budget: 50000000, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  ];

  return (
    <div className="min-h-screen bg-[#050609] text-white" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Header */}
      <div className="bg-[#0a0b10]/95 border-b border-indigo-500/10 py-6 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <Link href="/" className="hover:text-indigo-400 transition-colors">Trang chủ</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-300">PC Builder</span>
              </div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                  <Wrench className="w-6 h-6" />
                </div>
                PC Builder
              </h1>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              {budgetPresets.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => setBudgetLimit(budgetLimit === preset.budget ? null : preset.budget)}
                  className={`px-4 py-2 border rounded-lg text-xs font-medium transition-all hover:scale-105 ${preset.color} ${budgetLimit === preset.budget ? 'ring-2 ring-offset-2 ring-offset-[#0a0b10]' : ''}`}
                >
                  {budgetLimit === preset.budget ? '✓ ' : ''}{preset.label}
                </button>
              ))}
              {budgetLimit && (
                <button
                  onClick={() => setBudgetLimit(null)}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors hover:bg-slate-800/50 rounded-lg"
                >
                  ✕ Bỏ
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT: Build Slots */}
          <div className="lg:col-span-2">
            {/* Progress */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 mb-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-300 text-sm font-medium">Tiến độ build: {filledSlots.length}/{buildSlots.length} linh kiện</span>
                <span className="text-indigo-400 text-lg font-bold">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden border border-indigo-500/20">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full transition-all duration-700 shadow-lg shadow-indigo-500/50"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Slot Cards */}
            <div className="space-y-3">
              {buildSlots.map(slot => {
                const selected = build[slot.category];
                const isActive = activeSlot === slot.category;

                return (
                  <div key={slot.category}>
                    <div
                      className={`group bg-[#0f1117] border rounded-2xl p-5 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl ${
                        isActive
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-500/5'
                          : selected
                          ? 'border-slate-700 hover:border-indigo-500/60 hover:bg-indigo-500/5'
                          : 'border-slate-800 hover:border-indigo-500/40 border-dashed hover:bg-indigo-500/5'
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
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                          selected ? 'bg-indigo-500/30 text-indigo-300 shadow-lg shadow-indigo-500/20' : 'bg-slate-800/50 text-slate-600 group-hover:bg-indigo-500/20 group-hover:text-indigo-400'
                        }`}>
                          <slot.icon className="w-6 h-6" />
                        </div>

                        {/* Content */}
                        {selected ? (
                          <div className="flex-1 min-w-0 flex items-center gap-4">
                            <img
                              src={selected.image}
                              alt={selected.name}
                              className="w-12 h-12 rounded-lg object-cover shrink-0 border border-indigo-500/20"
                              onError={(e) => {
                                e.currentTarget.src = '/images/cpu-i7.svg';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-indigo-400 mb-1 font-semibold">{selected.brand}</p>
                              <p className="text-slate-100 text-sm font-bold truncate">{selected.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {selected.socket && (
                                  <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded">{selected.socket}</span>
                                )}
                                {selected.ramType && (
                                  <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded">{selected.ramType}</span>
                                )}
                                {selected.wattage && (
                                  <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded">{selected.wattage}W</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-indigo-400 font-bold text-base">{formatPrice(selected.price)}</p>
                              {selected.originalPrice && (
                                <p className="text-slate-600 text-xs line-through">{formatPrice(selected.originalPrice)}</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <p className="text-slate-200 text-sm font-semibold">{slot.label}</p>
                            <p className="text-slate-500 text-xs mt-1">{slot.description}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {slot.required && !selected && (
                            <span className="text-xs text-amber-500 border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 rounded-lg font-medium">Bắt buộc</span>
                          )}
                          {selected ? (
                            <>
                              <button
                                onClick={e => { e.stopPropagation(); setActiveSlot(slot.category); setSearchQuery(''); }}
                                className="px-3 py-2 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-all font-medium"
                              >
                                Đổi
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); setBuild(prev => { const n = {...prev}; delete n[slot.category]; return n; }); }}
                                className="p-2 text-slate-500 hover:text-red-400 transition-colors hover:bg-red-500/10 rounded-lg"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                              isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50' : 'bg-slate-800 text-slate-500 group-hover:bg-indigo-500/30 group-hover:text-indigo-400'
                            }`}>
                              <Plus className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Product Picker - Inline */}
                    {isActive && (
                      <div className="mt-3 bg-[#0f1117] border border-indigo-500/30 rounded-2xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="p-4 border-b border-slate-800/50 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                              <input
                                type="text"
                                placeholder={`Tìm ${slot.label}...`}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                autoFocus
                                className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 focus:bg-slate-800 transition-all"
                              />
                            </div>
                            <button
                              onClick={() => { setActiveSlot(null); setSearchQuery(''); }}
                              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <div className="max-h-[28rem] overflow-y-auto">
                          {slotProducts.length === 0 ? (
                            <p className="text-center text-slate-500 text-sm py-8">Không tìm thấy sản phẩm</p>
                          ) : (
                            slotProducts.map((product, idx) => {
                              const compat = isProductCompatibleWithBuild(product, build);
                              const exceedsBudget = budgetLimit && totalPrice + product.price > budgetLimit;
                              return (
                                <div
                                  key={product.id}
                                  className={`flex items-center gap-4 p-4 border-b border-slate-800/30 last:border-0 cursor-pointer transition-all ${
                                    compat.compatible && !exceedsBudget
                                      ? 'hover:bg-indigo-500/10'
                                      : exceedsBudget
                                      ? 'opacity-60 hover:bg-amber-500/5'
                                      : 'opacity-50 hover:bg-red-500/5'
                                  }`}
                                  onClick={() => compat.compatible && !exceedsBudget && addToBuildAndClose(product)}
                                >
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-12 h-12 rounded-lg object-cover shrink-0 border border-indigo-500/20"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-xs text-indigo-400 font-semibold">{product.brand}</p>
                                      {!compat.compatible && (
                                        <span className="text-xs text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-1 rounded flex items-center gap-1 font-medium">
                                          <AlertCircle className="w-3 h-3" /> Không tương thích
                                        </span>
                                      )}
                                      {compat.compatible && Object.keys(build).length > 0 && (
                                        <span className="text-xs text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-1 rounded flex items-center gap-1 font-medium">
                                          <CheckCircle2 className="w-3 h-3" /> Tương thích
                                        </span>
                                      )}
                                      {exceedsBudget && (
                                        <span className="text-xs text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-1 rounded font-medium">
                                          Vượt ngân sách
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-slate-200 text-sm font-medium truncate">{product.name}</p>
                                    {compat.reason && (
                                      <p className="text-red-400 text-xs mt-1">{compat.reason}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                      {product.socket && <span className="text-slate-500 text-xs bg-slate-800/50 px-2 py-1 rounded">{product.socket}</span>}
                                      {product.ramType && <span className="text-slate-500 text-xs bg-slate-800/50 px-2 py-1 rounded">{product.ramType}</span>}
                                      {product.wattage && <span className="text-slate-500 text-xs bg-slate-800/50 px-2 py-1 rounded">{product.wattage}W</span>}
                                      {product.tdp && <span className="text-slate-500 text-xs bg-slate-800/50 px-2 py-1 rounded">TDP: {product.tdp}W</span>}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-indigo-400 font-bold text-sm">{formatPrice(product.price)}</p>
                                    <div className="flex items-center gap-1 justify-end mt-1">
                                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                      <span className="text-slate-500 text-xs font-medium">{product.rating}</span>
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
          <div className="space-y-6">
            {/* Compatibility Status */}
            <div className={`rounded-2xl p-6 border backdrop-blur-sm ${
              compatibilityStatus === 'good' ? 'bg-emerald-500/15 border-emerald-500/30 shadow-lg shadow-emerald-500/10' :
              compatibilityStatus === 'error' ? 'bg-red-500/15 border-red-500/30 shadow-lg shadow-red-500/10' :
              compatibilityStatus === 'warning' ? 'bg-amber-500/15 border-amber-500/30 shadow-lg shadow-amber-500/10' :
              'bg-slate-800/30 border-slate-700/50'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {compatibilityStatus === 'good' && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
                {compatibilityStatus === 'error' && <AlertCircle className="w-6 h-6 text-red-400" />}
                {compatibilityStatus === 'warning' && <AlertTriangle className="w-6 h-6 text-amber-400" />}
                {compatibilityStatus === 'empty' && <Info className="w-6 h-6 text-slate-500" />}
                <h3 className={`font-bold text-base ${
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

              <div className="space-y-3">
                {errors.map((issue, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-red-500/20 rounded-lg border border-red-500/20">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-300 text-xs font-medium">{issue.message}</p>
                      {issue.suggestion && (
                        <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                          {issue.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {warnings.map((issue, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-amber-500/20 rounded-lg border border-amber-500/20">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-300 text-xs font-medium">{issue.message}</p>
                      {issue.suggestion && (
                        <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                          {issue.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {infos.map((issue, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-blue-500/20 rounded-lg border border-blue-500/20">
                    <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-blue-300 text-xs font-medium">{issue.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Build Summary */}
            <div className="bg-[#0f1117] border border-indigo-500/20 rounded-2xl overflow-hidden sticky top-24 shadow-xl">
              <div className="p-6 border-b border-slate-800/50 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                <h3 className="text-white font-bold text-base">Cấu hình đã chọn</h3>
              </div>

              <div className="divide-y divide-slate-800/30 max-h-72 overflow-y-auto">
                {buildSlots.map(slot => {
                  const selected = build[slot.category];
                  return (
                    <div key={slot.category} className="flex items-center gap-3 px-6 py-4 hover:bg-indigo-500/5 transition-colors">
                      <slot.icon className={`w-5 h-5 shrink-0 ${selected ? 'text-indigo-400' : 'text-slate-600'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-500 text-xs font-medium">{slot.label.split('/')[0].trim()}</p>
                        {selected ? (
                          <p className="text-slate-200 text-xs font-medium truncate">{selected.name}</p>
                        ) : (
                          <p className="text-slate-600 text-xs italic">Chưa chọn</p>
                        )}
                      </div>
                      {selected && (
                        <span className="text-indigo-400 text-xs font-bold shrink-0">
                          {formatPrice(selected.price)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Budget Tracker */}
              {budgetLimit && (
                <div className="p-6 border-t border-slate-800/30 bg-slate-900/50">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-500 text-xs font-medium">Ngân sách: {formatPrice(budgetLimit)}</span>
                      <span className={`text-xs font-bold ${totalPrice > budgetLimit ? 'text-red-400' : 'text-emerald-400'}`}>
                        {totalPrice > budgetLimit ? `Vượt ${formatPrice(totalPrice - budgetLimit)}` : `Còn ${formatPrice(budgetLimit - totalPrice)}`}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden border border-indigo-500/10">
                      <div
                        className={`h-full rounded-full transition-all ${totalPrice > budgetLimit ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min((totalPrice / budgetLimit) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className={`p-6 border-t border-slate-800/30 ${budgetLimit ? 'bg-slate-900/30' : 'bg-gradient-to-br from-indigo-500/15 to-purple-500/15'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-sm font-medium">Tổng cấu hình</span>
                  <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                {totalPrice > 0 && (
                  <p className="text-slate-500 text-xs mb-6 font-medium">
                    {filledSlots.length} linh kiện • {errors.length === 0 ? '✓ Tất cả tương thích' : `✗ ${errors.length} lỗi cần sửa`}
                  </p>
                )}

                <button
                  onClick={handleAddAllToCart}
                  disabled={Object.keys(build).length === 0 || errors.length > 0}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all ${
                    Object.keys(build).length === 0 || errors.length > 0
                      ? 'bg-slate-700/40 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Thêm toàn bộ vào giỏ
                </button>

                {errors.length > 0 && (
                  <p className="text-red-400 text-xs text-center mt-3 font-medium">
                    Vui lòng sửa lỗi trước khi thêm vào giỏ
                  </p>
                )}

                <button
                  onClick={() => { setBuild({}); setActiveSlot(null); }}
                  className="w-full mt-3 py-2.5 text-slate-500 hover:text-slate-300 text-xs transition-colors font-medium"
                >
                  ↻ Làm mới cấu hình
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-[#0f1117] border border-indigo-500/20 rounded-2xl p-6 shadow-lg">
              <h3 className="text-slate-300 text-sm font-bold mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/20 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                </div>
                Mẹo build PC
              </h3>
              <ul className="space-y-3 text-slate-500 text-xs">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5 font-bold">→</span>
                  <span>CPU và Mainboard phải cùng socket (LGA1700 hoặc AM5)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5 font-bold">→</span>
                  <span>RAM phải đúng loại (DDR4/DDR5) mà mainboard hỗ trợ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5 font-bold">→</span>
                  <span>Nguồn cần dư tối thiểu 100W so với tổng TDP</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5 font-bold">→</span>
                  <span>RTX 4090 cần nguồn tối thiểu 850W</span>
                </li>
              </ul>
            </div>

            {/* Power Consumption */}
            {(build.cpu || build.gpu) && (
              <div className="bg-[#0f1117] border border-indigo-500/20 rounded-2xl p-6 shadow-lg">
                <h3 className="text-slate-300 text-sm font-bold mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                    <Zap className="w-4 h-4 text-yellow-400" />
                  </div>
                  Ước tính tiêu thụ điện
                </h3>
                <div className="space-y-3">
                  {build.cpu && (
                    <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                      <span className="text-slate-500 text-xs font-medium">CPU TDP</span>
                      <span className="text-slate-300 text-xs font-bold">{build.cpu.tdp || 0}W</span>
                    </div>
                  )}
                  {build.gpu && (
                    <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                      <span className="text-slate-500 text-xs font-medium">GPU TDP</span>
                      <span className="text-slate-300 text-xs font-bold">{build.gpu.tdp || 0}W</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                    <span className="text-slate-500 text-xs font-medium">Hệ thống (ước tính)</span>
                    <span className="text-slate-300 text-xs font-bold">~50W</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-indigo-500/15 border border-indigo-500/30 rounded-lg">
                    <span className="text-slate-400 text-xs font-bold">Tổng TDP ước tính</span>
                    <span className="text-indigo-400 text-sm font-bold">{(build.cpu?.tdp || 0) + (build.gpu?.tdp || 0) + 50}W</span>
                  </div>
                  <p className="text-slate-600 text-xs mt-2 p-3 bg-slate-800/20 rounded-lg">
                    Khuyến nghị nguồn: <span className="text-indigo-400 font-bold">{Math.ceil(((build.cpu?.tdp || 0) + (build.gpu?.tdp || 0) + 150) / 50) * 50}W+</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

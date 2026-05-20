'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useBuilderStore } from '@/store/useBuilderStore';

type Message = { role: 'user' | 'model'; content: string };
type PendingBuild = { products: any[]; totalPrice: number };

const QUICK_ACTIONS = [
  { label: '🎮 Gaming 20 triệu', prompt: 'Build cho tôi bộ PC gaming 20 triệu' },
  { label: '💼 Văn phòng 10 triệu', prompt: 'Build PC văn phòng ngân sách 10 triệu' },
  { label: '🎨 Đồ họa 30 triệu', prompt: 'Build PC làm đồ họa 30 triệu' },
  { label: '⚡ Nâng cấp GPU', prompt: 'Tôi muốn nâng cấp card đồ họa' },
];

const CAT_LABELS: Record<string, string> = {
  cpu: 'CPU', mainboard: 'Mainboard', motherboard: 'Mainboard', ram: 'RAM',
  gpu: 'GPU', storage: 'Ổ cứng', psu: 'Nguồn', case: 'Vỏ case', cooling: 'Tản nhiệt',
};

export default function Chatbot() {
  const router = useRouter();
  const keLinhKien  = useBuilderStore(s => s.build);
  const setProduct  = useBuilderStore(s => s.setProduct);
  const setBuildFromAI = useBuilderStore(s => s.setBuildFromAI);
  const resetBuild  = useBuilderStore(s => s.resetBuild);

  const [isOpen,       setIsOpen]       = useState(false);
  const [input,        setInput]        = useState('');
  const [isLoading,    setIsLoading]    = useState(false);
  const [pendingBuild, setPendingBuild] = useState<PendingBuild | null>(null);
  const [messages, setMessages] = useState<Message[]>([{
    role: 'model',
    content: '👋 Xin chào! Tôi là AI tư vấn PCStore.\n\n• Build cấu hình theo ngân sách\n• Đổi linh kiện bất kỳ\n• Kiểm tra tương thích\n\nThử: "Build PC gaming 20 triệu" 🚀',
  }]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, pendingBuild, isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const ctx = pendingBuild
      ? Object.fromEntries(pendingBuild.products.filter(p => p.category).map(p => [p.category, p]))
      : { ...keLinhKien };
    const wasEditing = !!pendingBuild;
    const newMsgs = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMsgs);
    setInput('');
    setIsLoading(true);
    setPendingBuild(null);

    try {
      const res  = await fetch('/api/ai/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, lichSuChat: newMsgs, keLinhKien: ctx }),
      });
      const data = await res.json();
      if (data.error) { setMessages(p => [...p, { role: 'model', content: `⚠️ ${data.error}` }]); return; }
      const reply = data.tinNhanBot?.trim() || 'Dạ, em đã xử lý xong!';
      setMessages(p => [...p, { role: 'model', content: reply }]);
      const shelf: any[] = data.danhSachTrenKeMoi ?? [];
      const newly: any[] = data.duLieuGoiY ?? [];
      if (!data.chiHoiTuVan && shelf.length > 0) {
        if (data.yeuCauBuildPC || wasEditing) {
          setPendingBuild({ products: shelf, totalPrice: shelf.reduce((s, p) => s + (p.price || 0), 0) });
        } else if (newly.length > 0) {
          newly.forEach(p => setProduct(p));
        }
      }
    } catch {
      setMessages(p => [...p, { role: 'model', content: 'Kết nối bị gián đoạn, thử lại nhé!' }]);
    } finally { setIsLoading(false); }
  }, [isLoading, messages, pendingBuild, keLinhKien, setProduct]);

  const handleConfirm = () => {
    if (!pendingBuild) return;
    setBuildFromAI(pendingBuild.products);
    setMessages(p => [...p, { role: 'model', content: `✅ Đã thêm ${pendingBuild.products.length} linh kiện!\nTổng: ${pendingBuild.totalPrice.toLocaleString('vi-VN')}đ` }]);
    setPendingBuild(null);
    setTimeout(() => { router.push('/builder'); setIsOpen(false); }, 600);
  };

  const handleCancel = () => {
    setPendingBuild(null);
    setMessages(p => [...p, { role: 'model', content: 'Đã huỷ. Bạn muốn thay đổi gì không? 😊' }]);
  };

  const handleSwap = (item: any) => {
    const label = CAT_LABELS[item.category] || item.category;
    sendMessage(`Đổi ${label} sang loại khác phù hợp hơn`);
  };

  const buildCount = Object.keys(keLinhKien).length;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 w-[370px] md:w-[420px] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{ height: '580px', background: '#0a0a0f', border: '1px solid rgba(247,147,26,0.25)', boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(247,147,26,0.08)' }}>

          {/* ── Header ── */}
          <div className="shrink-0 px-4 py-3 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #111108 0%, #1a1200 50%, #0f0d00 100%)', borderBottom: '1px solid rgba(247,147,26,0.2)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold shrink-0"
                style={{ background: 'linear-gradient(135deg, #F7931A, #FFD600)', boxShadow: '0 0 16px rgba(247,147,26,0.4)' }}>
                ⚡
              </div>
              <div>
                <div className="font-bold text-sm" style={{ color: '#FFD600', letterSpacing: '0.02em' }}>AI Tư Vấn PCStore</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400">Trực tuyến 24/7</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {buildCount > 0 && (
                <>
                  <button onClick={resetBuild}
                    className="text-[11px] px-2 py-1 rounded-lg transition-all"
                    style={{ color: '#94A3B8', border: '1px solid rgba(255,255,255,0.1)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}>
                    🗑️
                  </button>
                  <button onClick={() => { router.push('/builder'); setIsOpen(false); }}
                    className="text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all"
                    style={{ color: '#F7931A', border: '1px solid rgba(247,147,26,0.3)', background: 'rgba(247,147,26,0.08)' }}>
                    🔧 {buildCount} món
                  </button>
                </>
              )}
              <button onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-lg transition-all"
                style={{ color: '#64748B' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}>×</button>
            </div>
          </div>

          {/* ── Messages ── */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3"
            style={{ background: '#06060b', scrollbarWidth: 'thin', scrollbarColor: 'rgba(247,147,26,0.2) transparent' }}>

            {messages.map((msg, i) => (
              <div key={i} className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'self-end rounded-br-sm' : 'self-start rounded-bl-sm'}`}
                style={msg.role === 'user'
                  ? { background: 'linear-gradient(135deg, #F7931A, #EA580C)', color: '#fff', boxShadow: '0 4px 16px rgba(247,147,26,0.25)' }
                  : { background: '#111118', color: '#CBD5E1', border: '1px solid rgba(247,147,26,0.12)' }}>
                {msg.content}
              </div>
            ))}

            {/* Loading */}
            {isLoading && (
              <div className="self-start px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2"
                style={{ background: '#111118', border: '1px solid rgba(247,147,26,0.12)' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: '#F7931A', animationDelay: `${i * 0.18}s` }} />
                ))}
                <span className="text-[12px] text-slate-400 ml-1">AI đang xử lý...</span>
              </div>
            )}

            {/* ── Pending Build Panel ── */}
            {pendingBuild && !isLoading && (
              <div className="self-stretch rounded-2xl p-4 space-y-3"
                style={{ background: 'linear-gradient(135deg, rgba(247,147,26,0.08), rgba(255,214,0,0.04))', border: '1px solid rgba(247,147,26,0.35)' }}>
                <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid rgba(247,147,26,0.15)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">🛒</span>
                    <span className="font-semibold text-[13px]" style={{ color: '#FFD600' }}>Cấu hình AI đề xuất</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(247,147,26,0.15)', color: '#F7931A' }}>
                    {pendingBuild.products.length} linh kiện
                  </span>
                </div>

                <div className="space-y-2">
                  {pendingBuild.products.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 group">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 w-[62px] text-center"
                        style={{ background: 'rgba(247,147,26,0.15)', color: '#F7931A' }}>
                        {CAT_LABELS[p.category] || p.category}
                      </span>
                      <span className="text-[12px] flex-1 truncate text-slate-300" title={p.name}>{p.name}</span>
                      <span className="text-[11px] shrink-0" style={{ color: '#FFD600' }}>
                        {(p.price || 0).toLocaleString('vi-VN')}đ
                      </span>
                      <button onClick={() => handleSwap(p)}
                        className="shrink-0 text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all"
                        style={{ background: 'rgba(247,147,26,0.2)', color: '#F7931A', border: '1px solid rgba(247,147,26,0.3)' }}>
                        🔄
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid rgba(247,147,26,0.15)' }}>
                  <span className="text-[12px] text-slate-400">Tổng cộng:</span>
                  <span className="font-bold text-sm" style={{ color: '#FFD600' }}>
                    {pendingBuild.totalPrice.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                <div className="flex gap-2">
                  <button onClick={handleConfirm}
                    className="flex-1 py-2 rounded-xl text-[12px] font-bold transition-all"
                    style={{ background: 'linear-gradient(135deg, #F7931A, #EA580C)', color: '#fff', boxShadow: '0 4px 16px rgba(247,147,26,0.3)' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                    ✅ Xác nhận & Vào Builder
                  </button>
                  <button onClick={handleCancel}
                    className="px-3 py-2 rounded-xl text-[12px] transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B', border: '1px solid rgba(255,255,255,0.1)' }}>
                    Huỷ
                  </button>
                </div>
                <p className="text-[10px] text-center" style={{ color: 'rgba(247,147,26,0.4)' }}>
                  Hover vào linh kiện → 🔄 để đổi sang món khác
                </p>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* ── Quick Actions ── */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-3 py-2 flex flex-wrap gap-1.5 shrink-0"
              style={{ background: '#06060b', borderTop: '1px solid rgba(247,147,26,0.1)' }}>
              {QUICK_ACTIONS.map(a => (
                <button key={a.label} onClick={() => sendMessage(a.prompt)}
                  className="text-[11px] px-2.5 py-1.5 rounded-full transition-all whitespace-nowrap"
                  style={{ background: 'rgba(247,147,26,0.08)', color: '#F7931A', border: '1px solid rgba(247,147,26,0.25)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(247,147,26,0.18)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(247,147,26,0.08)'; }}>
                  {a.label}
                </button>
              ))}
            </div>
          )}

          {/* ── Input ── */}
          <div className="p-3 flex gap-2 shrink-0"
            style={{ background: '#0a0a0f', borderTop: '1px solid rgba(247,147,26,0.15)' }}>
            <input type="text"
              className="flex-1 text-[13px] text-white rounded-xl px-3.5 py-2.5 outline-none placeholder-slate-600 disabled:opacity-50"
              style={{ background: '#111118', border: '1px solid rgba(247,147,26,0.2)' }}
              onFocus={e => (e.currentTarget.style.border = '1px solid rgba(247,147,26,0.5)')}
              onBlur={e => (e.currentTarget.style.border = '1px solid rgba(247,147,26,0.2)')}
              placeholder={pendingBuild ? 'Đổi linh kiện nào? (vd: đổi CPU)' : 'Hỏi về cấu hình PC...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isLoading && sendMessage(input)}
              disabled={isLoading}
            />
            <button onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              className="px-4 rounded-xl text-[13px] font-bold transition-all disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg, #F7931A, #EA580C)', color: '#fff', boxShadow: '0 4px 12px rgba(247,147,26,0.3)' }}>
              Gửi
            </button>
          </div>
        </div>
      )}

      {/* ── Toggle Button ── */}
      <button onClick={() => setIsOpen(v => !v)}
        className="relative w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 active:scale-95"
        style={{ background: isOpen ? '#1a1200' : 'linear-gradient(135deg, #F7931A, #EA580C)', border: isOpen ? '2px solid rgba(247,147,26,0.5)' : 'none', boxShadow: '0 8px 32px rgba(247,147,26,0.4)', color: '#fff' }}>
        <span className={`transition-all duration-200 ${isOpen ? 'rotate-90 scale-75' : ''}`}>
          {isOpen ? '✕' : '💬'}
        </span>
        {buildCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
            style={{ background: '#FFD600', color: '#000', boxShadow: '0 0 8px rgba(255,214,0,0.6)' }}>
            {buildCount}
          </span>
        )}
        {pendingBuild && !isOpen && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full animate-pulse"
            style={{ background: '#10b981', border: '2px solid #06060b' }} />
        )}
      </button>
    </div>
  );
}

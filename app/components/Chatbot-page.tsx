'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useBuilderStore } from '@/store/useBuilderStore';
import type { AppLocale } from '@/i18n/config';
import { formatCurrency } from '@/lib/format';

type Message = { role: 'user' | 'model'; content: string };
type PendingBuild = { products: any[]; totalPrice: number };

export default function Chatbot() {
  const t = useTranslations('chatbot');
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const keLinhKien  = useBuilderStore(s => s.build);
  const setProduct  = useBuilderStore(s => s.setProduct);
  const setBuildFromAI = useBuilderStore(s => s.setBuildFromAI);
  const resetBuild  = useBuilderStore(s => s.resetBuild);

  const [isOpen,       setIsOpen]       = useState(false);
  const [input,        setInput]        = useState('');
  const [isLoading,    setIsLoading]    = useState(false);
  const [pendingBuild, setPendingBuild] = useState<PendingBuild | null>(null);
  const intro = t('intro');
  const quickActions = [
    { label: `🎮 ${t('quickActions.gaming20Label')}`, prompt: t('quickActions.gaming20Prompt') },
    { label: `💼 ${t('quickActions.office10Label')}`, prompt: t('quickActions.office10Prompt') },
    { label: `🎨 ${t('quickActions.graphics30Label')}`, prompt: t('quickActions.graphics30Prompt') },
    { label: `⚡ ${t('quickActions.upgradeGpuLabel')}`, prompt: t('quickActions.upgradeGpuPrompt') },
  ];
  const categoryLabels: Record<string, string> = {
    cpu: t('categories.cpu'),
    mainboard: t('categories.mainboard'),
    motherboard: t('categories.mainboard'),
    ram: t('categories.ram'),
    gpu: t('categories.gpu'),
    storage: t('categories.storage'),
    psu: t('categories.psu'),
    case: t('categories.case'),
    cooling: t('categories.cooling'),
  };
  const [messages, setMessages] = useState<Message[]>([{ role: 'model', content: intro }]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ role: 'model', content: intro }]);
    setPendingBuild(null);
  }, [intro]);

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
        body: JSON.stringify({ prompt: text, lichSuChat: newMsgs, keLinhKien: ctx, locale }),
      });
      const data = await res.json();
      if (data.error) { setMessages(p => [...p, { role: 'model', content: `⚠️ ${data.error}` }]); return; }
      const reply = data.tinNhanBot?.trim() || t('fallbackReply');
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
      setMessages(p => [...p, { role: 'model', content: t('networkError') }]);
    } finally { setIsLoading(false); }
  }, [isLoading, messages, pendingBuild, keLinhKien, locale, setProduct, t]);

  const handleConfirm = () => {
    if (!pendingBuild) return;
    setBuildFromAI(pendingBuild.products);
    setMessages(p => [...p, { role: 'model', content: `✅ ${t('confirmMessage', { count: pendingBuild.products.length, total: formatCurrency(pendingBuild.totalPrice, locale) })}` }]);
    setPendingBuild(null);
    setTimeout(() => { router.push('/builder'); setIsOpen(false); }, 600);
  };

  const handleCancel = () => {
    setPendingBuild(null);
    setMessages(p => [...p, { role: 'model', content: t('cancelMessage') }]);
  };

  const handleSwap = (item: any) => {
    const label = categoryLabels[item.category] || item.category;
    sendMessage(t('swapPrompt', { label }));
  };

  const buildCount = Object.keys(keLinhKien).length;

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
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
                <div className="font-bold text-sm" style={{ color: '#FFD600', letterSpacing: '0.02em' }}>{t('title')}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400">{t('online')}</span>
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
                    🔧 {t('itemCount', { count: buildCount })}
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
                <span className="text-[12px] text-slate-400 ml-1">{t('processing')}</span>
              </div>
            )}

            {/* ── Pending Build Panel ── */}
            {pendingBuild && !isLoading && (
              <div className="self-stretch rounded-2xl p-4 space-y-3"
                style={{ background: 'linear-gradient(135deg, rgba(247,147,26,0.08), rgba(255,214,0,0.04))', border: '1px solid rgba(247,147,26,0.35)' }}>
                <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid rgba(247,147,26,0.15)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">🛒</span>
                    <span className="font-semibold text-[13px]" style={{ color: '#FFD600' }}>{t('proposal')}</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(247,147,26,0.15)', color: '#F7931A' }}>
                    {t('componentCount', { count: pendingBuild.products.length })}
                  </span>
                </div>

                <div className="space-y-2">
                  {pendingBuild.products.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 group">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 w-[62px] text-center"
                        style={{ background: 'rgba(247,147,26,0.15)', color: '#F7931A' }}>
                        {categoryLabels[p.category] || p.category}
                      </span>
                      <span className="text-[12px] flex-1 truncate text-slate-300" title={p.name}>{p.name}</span>
                      <span className="text-[11px] shrink-0" style={{ color: '#FFD600' }}>
                        {formatCurrency(p.price || 0, locale)}
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
                  <span className="text-[12px] text-slate-400">{t('total')}</span>
                  <span className="font-bold text-sm" style={{ color: '#FFD600' }}>
                    {formatCurrency(pendingBuild.totalPrice, locale)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button onClick={handleConfirm}
                    className="flex-1 py-2 rounded-xl text-[12px] font-bold transition-all"
                    style={{ background: 'linear-gradient(135deg, #F7931A, #EA580C)', color: '#fff', boxShadow: '0 4px 16px rgba(247,147,26,0.3)' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                    ✅ {t('confirm')}
                  </button>
                  <button onClick={handleCancel}
                    className="px-3 py-2 rounded-xl text-[12px] transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {t('cancel')}
                  </button>
                </div>
                <p className="text-[10px] text-center" style={{ color: 'rgba(247,147,26,0.4)' }}>
                  {t('swapHint')}
                </p>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* ── Quick Actions ── */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-3 py-2 flex flex-wrap gap-1.5 shrink-0"
              style={{ background: '#06060b', borderTop: '1px solid rgba(247,147,26,0.1)' }}>
              {quickActions.map(a => (
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
              placeholder={pendingBuild ? t('swapPlaceholder') : t('questionPlaceholder')}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isLoading && sendMessage(input)}
              disabled={isLoading}
            />
            <button onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              className="px-4 rounded-xl text-[13px] font-bold transition-all disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg, #F7931A, #EA580C)', color: '#fff', boxShadow: '0 4px 12px rgba(247,147,26,0.3)' }}>
              {t('send')}
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

'use client'; 

import { useState } from 'react';
import { useBuilderStore } from '@/store/useBuilderStore';

export default function Chatbot() {
  const keLinhKienHienTai = useBuilderStore((state) => state.build);
  const setProduct = useBuilderStore((state) => state.setProduct);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'model', content: '👋 Xin chào! Tôi là AI tư vấn PCStore.\n\nTôi có thể giúp bạn chọn linh kiện phù hợp ngân sách, kiểm tra tương thích và tư vấn build PC. Hãy hỏi tôi bất cứ điều gì!' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: input, 
          lichSuChat: newMessages,
          keLinhKien: keLinhKienHienTai
        }),
      });

      const data = await response.json();

      if (data.error) {
          alert(data.error); 
          setIsLoading(false);
          return;
      }
      let textHienThi = data.tinNhanBot;
      if (!textHienThi || textHienThi.trim() === "") {
          textHienThi = "Dạ, em đã tìm được các linh kiện tương thích và đẩy lên kệ cho anh/chị rồi ạ. Anh/chị kiểm tra nhé!";
      }

      setMessages((prev) => [...prev, { role: 'model', content: textHienThi }]);
      if (data.duLieuGoiY && data.duLieuGoiY.length > 0) {
          for (let i = 0; i < data.duLieuGoiY.length; i++) {
              let monDoCuaAI = data.duLieuGoiY[i];
              setProduct(monDoCuaAI); 
          }
      }

    } catch (error) {
      console.error('Lỗi khi gọi API Chat:', error);
      setMessages((prev) => [...prev, { role: 'model', content: 'Xin lỗi, máy chủ AI đang bận. Vui lòng thử lại!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 h-[500px] flex flex-col bg-[#1E1E2E] border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
          
          <div className="bg-[#6B21A8] p-4 flex justify-between items-center text-white">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">🤖 AI Tư Vấn PCStore</h3>
              <p className="text-xs text-green-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400"></span> Trực tuyến 24/7
              </p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-300 font-bold text-xl">×</button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-[#181825] flex flex-col gap-3 text-sm">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`max-w-[85%] p-3 rounded-lg whitespace-pre-wrap ${msg.role === 'user' ? 'bg-[#4C1D95] self-end rounded-tr-none text-white' : 'bg-[#313244] self-start rounded-tl-none text-gray-200'}`}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="self-start bg-[#313244] text-gray-200 p-3 rounded-lg rounded-tl-none">
                <span className="animate-pulse">AI đang suy nghĩ...</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-[#1E1E2E] border-t border-gray-700 flex gap-2">
            <input
              type="text"
              className="flex-1 bg-[#313244] text-white rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-purple-500 placeholder-gray-400 disabled:opacity-50"
              placeholder="Hỏi về cấu hình PC..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              disabled={isLoading} 
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors"
            >
              Gửi
            </button>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-transform hover:scale-110"
        >
          💬
        </button>
      )}
    </div>
  );
}
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth'; 
import { xuLyTinNhan } from "@/lib/chatbotController";

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (user == null) {
      return NextResponse.json({ error: 'Cần đăng nhập để dùng AI tư vấn' }, { status: 401 });
  }
  const body = await request.json();
  
  let prompt = body.prompt;
  if (prompt != null) {
      prompt = prompt.trim();
  }

  let lichSuChat = body.lichSuChat;
  if (lichSuChat == null) {
      lichSuChat = [];
  }

  let keLinhKien = body.keLinhKien;
  if (keLinhKien == null) {
      keLinhKien = {};
  }

  if (prompt == null || prompt === "") {
      return NextResponse.json({ error: 'Yêu cầu tư vấn không được để trống' }, { status: 400 });
  }

  try {
      const ketQuaAI = await xuLyTinNhan(prompt, lichSuChat, keLinhKien);
      if (prisma.tinNhanChat != null) {
          await prisma.tinNhanChat.createMany({
              data: [
                  { noiDung: prompt, vaiTro: 'USER', nguoiDungId: user.id },
                  { noiDung: ketQuaAI.tinNhanBot, vaiTro: 'AI', nguoiDungId: user.id }
              ]
          });
      }
      return NextResponse.json({ 
          tinNhanBot: ketQuaAI.tinNhanBot, 
          duLieuGoiY: ketQuaAI.duLieuGoiY, 
          hieuLenhUI: ketQuaAI.hieuLenhUI 
      });

  } catch (error) {
      console.error("Lỗi hệ thống AI tại Router:", error);
      return NextResponse.json({ error: 'Hệ thống AI đang bảo trì.' }, { status: 500 });
  }
}
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { layTop3LinhKien } from './chatbotModel'; 
import { isProductCompatibleWithBuild } from '@/app/lib/builder-utils';

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const TEN_MODEL_AI = "gemini-2.5-flash"; 

async function goiPhanTichJSON(tinNhanKhach: string) {
    const modelThuKy = genAI.getGenerativeModel({ model: TEN_MODEL_AI, generationConfig: { responseMimeType: "application/json" } });
    
    const cauLenhPhanTich = `Ban la cong cu boc tach. Tra ve 1 JSON co dang:
    {
      "nganSach": number hoac null,
      "nhungMonMuonDoi": [ { "loai": "ram", "tuKhoa": "64GB" }, { "loai": "cpu", "tuKhoa": "" } ]
    }
    Quy uoc 'loai' bat buoc la: cpu, motherboard, ram, gpu, storage, psu, case, cooling (VD: 'chip' la 'cpu', 'bo nho' la 'storage', 'card' la 'gpu'). Neu khach muon nang cap/doi mon nao, them vao nhungMonMuonDoi. Khong giai thich. Tin nhan khach: ` + tinNhanKhach;
    
    try {
        const phanHoi = await modelThuKy.generateContent(cauLenhPhanTich);
        return phanHoi.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    } catch (e) { return '{"nganSach": null, "nhungMonMuonDoi": []}'; }
}

async function goillm(luatChoBot: string, tinNhanMoiNhat: string, lichSuChat: any[]) {
    const modelChuyenGia = genAI.getGenerativeModel({ model: TEN_MODEL_AI, systemInstruction: luatChoBot });
    try {
        // CÁCH MỚI: Biến lịch sử thành chuỗi Text an toàn tuyệt đối, không bao giờ bị Crash!
        let chuoiLichSu = "";
        for (let i = 0; i < lichSuChat.length - 1; i++) {
            let ng = lichSuChat[i].role === 'user' ? 'Khách' : 'AI';
            chuoiLichSu += `${ng}: ${lichSuChat[i].content}\n`;
        }

        const promptGop = `[LỊCH SỬ HỘI THOẠI TRƯỚC ĐÓ - DÙNG ĐỂ HIỂU NGỮ CẢNH]\n${chuoiLichSu}\n\n[TIN NHẮN MỚI NHẤT CỦA KHÁCH]\n${tinNhanMoiNhat}`;
        
        const phanHoiCuoi = await modelChuyenGia.generateContent(promptGop);
        return phanHoiCuoi.response.text();
    } catch (error) { 
        console.log("LỖI AI CHUYÊN GIA:", error);
        return ""; 
    }
}

export async function xuLyTinNhan(tinNhanCuaKhach: string, lichSuChat: any[], keLinhKienHienTai: any) {
    const ketQuaPhanTichStr = await goiPhanTichJSON(tinNhanCuaKhach);
    const duLieuDaPhanTich = JSON.parse(ketQuaPhanTichStr);

    let danhSachTrenKe: any[] = [];
    let cacTheLoaiDaCo: string[] = [];
    let tongTienDaTieu = 0;

    let nhungMonMuonDoi = duLieuDaPhanTich.nhungMonMuonDoi || [];
    let cacLoaiKhachDoi: string[] = [];
    for (let i = 0; i < nhungMonMuonDoi.length; i++) {
        cacLoaiKhachDoi.push(nhungMonMuonDoi[i].loai.toLowerCase());
    }

    if (keLinhKienHienTai != null) {
        let mangTam = Object.values(keLinhKienHienTai);
        for (let i = 0; i < mangTam.length; i++) {
            if (mangTam[i] != null) {
                let monDo = mangTam[i] as any;
                let theLoaiMonDo = monDo.category ? monDo.category.toLowerCase() : "";
                
                if (!cacLoaiKhachDoi.includes(theLoaiMonDo)) {
                    danhSachTrenKe.push(monDo);
                    tongTienDaTieu += (monDo.price || 0); 
                    if (theLoaiMonDo) cacTheLoaiDaCo.push(theLoaiMonDo);
                }
            }
        }
    }

    // Nếu khách không đưa ngân sách mới, lấy 50 triệu làm chuẩn
    let nganSachHienTai = duLieuDaPhanTich.nganSach || 50000000;
    let nganSachConLai = nganSachHienTai - tongTienDaTieu;

    let danhSachDiCho: any[] = [];
    for (let i = 0; i < nhungMonMuonDoi.length; i++) danhSachDiCho.push(nhungMonMuonDoi[i]);
    const TAT_CA_THE_LOAI = ["cpu", "motherboard", "ram", "gpu", "storage", "psu", "case", "cooling"]; 
    for (let i = 0; i < TAT_CA_THE_LOAI.length; i++) {
        let loai = TAT_CA_THE_LOAI[i];
        if (!cacTheLoaiDaCo.includes(loai) && !cacLoaiKhachDoi.includes(loai)) {
            danhSachDiCho.push({ loai: loai, tuKhoa: "" });
        }
    }

    let doGoiYTuKho: any[] = [];
    
    for (let i = 0; i < danhSachDiCho.length; i++) {
        let monCanMua = danhSachDiCho[i];
        let ketQuaTrongKho = await layTop3LinhKien(monCanMua.loai, null, monCanMua.tuKhoa); 

        // ========================================================
        // TÍNH NĂNG MỚI: BIẾT TIÊU TIỀN ĐÚNG CÁCH
        // ========================================================
        let laMonCanNangCap = cacLoaiKhachDoi.includes(monCanMua.loai.toLowerCase());
        
        if (laMonCanNangCap) {
            // Khách đòi đổi/nâng cấp: Lấy con ĐẮT NHẤT, XỊN NHẤT (Sắp xếp giá giảm dần)
            ketQuaTrongKho.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else {
            // Mua thêm cho đủ bộ: Tiết kiệm tiền, lấy con RẺ NHẤT (Sắp xếp giá tăng dần)
            ketQuaTrongKho.sort((a, b) => (a.price || 0) - (b.price || 0));
        }

        for (let j = 0; j < ketQuaTrongKho.length; j++) {
            let monDoDuDinh = ketQuaTrongKho[j];

            if ((monDoDuDinh.price || 0) > nganSachConLai) continue;

            let keHangGiaSu = [...danhSachTrenKe, monDoDuDinh];
            let buildGiaSu: any = {};
            for(let item of keHangGiaSu) {
                if(item && item.category) buildGiaSu[item.category] = item;
            }

            let checkResult = isProductCompatibleWithBuild(monDoDuDinh, buildGiaSu, (key: string) => key);
            
            if (checkResult.compatible === true) {
                doGoiYTuKho.push(monDoDuDinh);
                danhSachTrenKe.push(monDoDuDinh); 
                nganSachConLai -= (monDoDuDinh.price || 0);
                break; 
            }
        }
    }
    
    const duongDanFileLuat = path.join(process.cwd(), 'AGENTS.md');
    let luatChoBot = fs.readFileSync(duongDanFileLuat, 'utf-8');

    const chuoiKeHang = JSON.stringify(danhSachTrenKe, null, 2);
    const chuoiDoTrongKho = JSON.stringify(doGoiYTuKho, null, 2);
    luatChoBot = luatChoBot.replace('{$Current_Cart}', chuoiKeHang);
    luatChoBot = luatChoBot.replace('{$Database_Items}', chuoiDoTrongKho);

    const tinNhanGuiAI = `[TIN NHẮN HIỆN TẠI CỦA KHÁCH CẦN BẠN TƯ VẤN]\n${tinNhanCuaKhach}`;

    const cauTraLoiAI = await goillm(luatChoBot, tinNhanGuiAI, lichSuChat);
    let cauTraLoiCuoiCung = cauTraLoiAI;
    if (!cauTraLoiCuoiCung || cauTraLoiCuoiCung.trim() === "") {
        cauTraLoiCuoiCung = "Dạ, em đã chọn xong các linh kiện theo yêu cầu cho anh/chị rồi ạ. Anh/chị xem trên kệ nhé!";
    }

    return {
        tinNhanBot: cauTraLoiCuoiCung,
        duLieuGoiY: doGoiYTuKho, 
        hieuLenhUI: duLieuDaPhanTich 
    };
}
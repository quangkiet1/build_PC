import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { layTop3LinhKien } from './chatbotModel'; 
import { isProductCompatibleWithBuild } from '@/app/lib/builder-utils';

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const TEN_MODEL_AI = "gemini-2.5-flash"; 


// 1. HÀM PHÂN TÍCH 
async function phanTich(tinNhanKhach: string, lichSuChat: any[]) {
    const modelThuKy = genAI.getGenerativeModel({ model: TEN_MODEL_AI, generationConfig: { responseMimeType: "application/json" } });
    let chuoiLichSu = "";
    if (lichSuChat != null) {
        for (let i = 0; i < lichSuChat.length - 1; i++) {
            let nguoiNoi = "";
            if (lichSuChat[i].role === 'user') {
                nguoiNoi = "Khách";
            } else {
                nguoiNoi = "AI";
            }
            chuoiLichSu = chuoiLichSu + nguoiNoi + ": " + lichSuChat[i].content + "\n";
        }
    }

    const cauLenhPhanTich = `Ban la cong cu boc tach. Tra ve 1 JSON co dang:
    {
      "nganSach": number hoac null,
      "nhungMonMuonDoi": [ { "loai": "storage", "tuKhoa": "4TB" }, { "loai": "cpu", "tuKhoa": "" } ]
    }
    Quy uoc 'loai' bat buoc la: cpu, motherboard, ram, gpu, storage, psu, case, cooling (VD: 'chip' la 'cpu', 'bo nho', 'o cung', 'hdd' la 'storage'). 
    
    QUAN TRỌNG: Hãy đọc [LỊCH SỬ CHAT] bên dưới để tìm 'nganSach' nếu [TIN NHẮN MỚI] không nhắc đến số tiền. 
    Neu khach muon nang cap/doi mon nao, them vao nhungMonMuonDoi. Khong giai thich.
    
    [LỊCH SỬ CHAT]
    ${chuoiLichSu}

    [TIN NHẮN MỚI]
    ${tinNhanKhach}`;
    
    try {
        const phanHoi = await modelThuKy.generateContent(cauLenhPhanTich);
        
        let locnoidung = phanHoi.response.text();
        locnoidung = locnoidung.replace(/```json/g, "");
        locnoidung = locnoidung.replace(/```/g, "");
        locnoidung = locnoidung.trim();
        
        return JSON.parse(locnoidung);
    } catch (e) { 
        console.error("Lỗi Phân Tích:", e);
        return { nganSach: null, nhungMonMuonDoi: [] }; 
    }
}


// TẠO TIN NHẮN 
async function messWithUser(tinNhanKhach: string, lichSuChat: any[], danhSachTrenKe: any[], doGoiYTuKho: any[], thieuNganSach: boolean) {
    const duongDanFileLuat = path.join(process.cwd(), 'AGENTS.md');
    let promptAgent = fs.readFileSync(duongDanFileLuat, 'utf-8');

    // Dịch Giỏ hàng
    let chuoiDangChon = "";
    for (let i = 0; i < danhSachTrenKe.length; i++) {
        let monDo = danhSachTrenKe[i];
        chuoiDangChon = chuoiDangChon + "- " + (monDo.name || "Linh kiện") + " : " + (monDo.price || 0) + " VNĐ\n";
    }
    if (chuoiDangChon === "") chuoiDangChon = "Chưa có món nào trên kệ.";

    let chuoiDeXuat = "";
    for (let i = 0; i < doGoiYTuKho.length; i++) {
        let monDo = doGoiYTuKho[i];
        chuoiDeXuat = chuoiDeXuat + "- " + (monDo.name || "Linh kiện") + " : " + (monDo.price || 0) + " VNĐ\n";
    }

    // Nếu hết tiền, KHÔNG cho AI thấy bất kỳ list đề xuất ảo nào
    if (doGoiYTuKho.length === 0) {
        chuoiDeXuat = ""; 
    }
    promptAgent = promptAgent.replace('{$Current_Cart}', chuoiDangChon);
    promptAgent = promptAgent.replace('{$Database_Items}', chuoiDeXuat);

    // Gom Lịch sử
    let chuoiLichSu = "";
    for (let i = 0; i < lichSuChat.length - 1; i++) {
        let ng = lichSuChat[i].role === 'user' ? "Khách" : "AI";
        chuoiLichSu = chuoiLichSu + ng + ": " + lichSuChat[i].content + "\n";
    }

    // Lệnh riêng khi thiếu tiền (Vì AGENTS.md đã bắt rỗng thì im lặng, nhưng cần nó hỏi tiền nếu thieuNganSach = true)
    let lenhHoiTien = "";
    if (thieuNganSach === true) {
        lenhHoiTien = "Khách hàng CHƯA CUNG CẤP NGÂN SÁCH. Hãy bỏ qua mọi format ở trên, chỉ in ra một câu duy nhất hỏi ngân sách của khách để đi chợ.";
    }

    const promptGop =`[HỆ THỐNG BÁO CÁO TÌNH TRẠNG KỆ HÀNG CỦA KHÁCH]
    - Đang có sẵn trên kệ: \n${chuoiDangChon}
    - Hệ thống vừa lấy thêm: \n${chuoiDeXuat}

    [LỆNH TỐI CAO - PHẢI TUÂN THỦ 100%]
    1. TUYỆT ĐỐI KHÔNG HỎI khách hàng đang có linh kiện gì (vì danh sách đã được hệ thống cung cấp ở ngay bên trên).
    2. KHÔNG SỬ DỤNG MARKDOWN (Tuyệt đối không dùng dấu **, *, #).
    ${lenhHoiTien}

    [LỊCH SỬ HỘI THOẠI TRƯỚC ĐÓ - CHỈ ĐỂ THAM KHẢO NGỮ CẢNH]
    ${chuoiLichSu}

    [TIN NHẮN MỚI CỦA KHÁCH]
    ${tinNhanKhach}`;

    try {
        const modelChuyenGia = genAI.getGenerativeModel({ model: TEN_MODEL_AI, systemInstruction: promptAgent });
        const phanHoiCuoi = await modelChuyenGia.generateContent(promptGop);
        let cauTraLoiCuoiCung = phanHoiCuoi.response.text();

        if (cauTraLoiCuoiCung == null || cauTraLoiCuoiCung.trim() === "") {
            return "Dạ, anh/chị xem các linh kiện trên kệ nhé!";
        }
        return cauTraLoiCuoiCung;
    } catch (error) { 
        console.log(error);
        return "Dạ, hệ thống đang bận một chút, anh/chị đợi lát nhé!"; 
    }
}

function kiemKeHangCu(keLinhKienHienTai: any, cacLoaiKhachDoi: string[]) {
    let danhSachTrenKe: any[] = [];
    let cacTheLoaiDaCo: string[] = [];
    let tongTienDaTieu = 0;

    if (keLinhKienHienTai != null) {
        let mangTam = Object.values(keLinhKienHienTai);
        for (let i = 0; i < mangTam.length; i++) {
            if (mangTam[i] != null) {
                let monDo = mangTam[i] as any;
                let theLoaiMonDo = monDo.category ? monDo.category.toLowerCase() : "";
                let biKhachDoi = false;
                for (let j = 0; j < cacLoaiKhachDoi.length; j++) {
                     if (cacLoaiKhachDoi[j] === theLoaiMonDo) biKhachDoi = true;
                }

                if (biKhachDoi === false) {
                    danhSachTrenKe.push(monDo);
                    tongTienDaTieu += (monDo.price || 0); 
                    if (theLoaiMonDo !== "") cacTheLoaiDaCo.push(theLoaiMonDo);
                }
            }
        }
    }
    return { danhSachTrenKe, cacTheLoaiDaCo, tongTienDaTieu };
}


// CHỐT DANH SÁCH CẦN MUA 
function lenDanhSachDiCho(nhungMonMuonDoi: any[], cacTheLoaiDaCo: string[], cacLoaiKhachDoi: string[]) {
    let danhSachDiCho: any[] = [];
    
    //  Mua đồ khách đòi
    for (let i = 0; i < nhungMonMuonDoi.length; i++) {
         danhSachDiCho.push(nhungMonMuonDoi[i]);
    }
    
    //  Mua bù đồ còn thiếu
    const TAT_CA_THE_LOAI = ["cpu", "motherboard", "ram", "gpu", "storage", "psu", "case", "cooling"]; 
    for (let i = 0; i < TAT_CA_THE_LOAI.length; i++) {
        let loai = TAT_CA_THE_LOAI[i];
        
        let daCo = false;
        for(let j=0; j < cacTheLoaiDaCo.length; j++) if(cacTheLoaiDaCo[j] === loai) daCo = true;

        let biDoi = false;
        for(let k=0; k < cacLoaiKhachDoi.length; k++) if(cacLoaiKhachDoi[k] === loai) biDoi = true;

        if (daCo === false && biDoi === false) {
            danhSachDiCho.push({ loai: loai, tuKhoa: "" });
        }
    }
    return danhSachDiCho;
}

// ĐI CHỢ & RÁP THỬ
async function diChoVaRapThu(danhSachDiCho: any[], danhSachTrenKe: any[], nganSachConLai: number, cacLoaiKhachDoi: string[]) {
    let doGoiYTuKho: any[] = [];
    
    for (let i = 0; i < danhSachDiCho.length; i++) {
        let monCanMua = danhSachDiCho[i];
        
        //  xem món này là nâng cấp (lấy đắt) hay mua mới (lấy rẻ)
        let laMonCanNangCap = false;
        for(let j=0; j < cacLoaiKhachDoi.length; j++) {
             if(monCanMua.loai != null && cacLoaiKhachDoi[j] === monCanMua.loai.toLowerCase()) laMonCanNangCap = true;
        }
        
        let giaMin = null;
        if (laMonCanNangCap === true) {
            giaMin = monCanMua.giaLinhKienHienTai;
        }
        let ketQuaTrongKho = await layTop3LinhKien(monCanMua.loai, null, monCanMua.tuKhoa, laMonCanNangCap ? monCanMua.giaLinhKienHienTai : null);

        if (laMonCanNangCap === true) {
            ketQuaTrongKho.sort((a, b) => (b.price || 0) - (a.price || 0)); // Rẻ đến Đắt
        } else {
            ketQuaTrongKho.sort((a, b) => (a.price || 0) - (b.price || 0)); // Đắt đến Rẻ
        }

        for (let j = 0; j < ketQuaTrongKho.length; j++) {
            let monDoDuDinh = ketQuaTrongKho[j];
            let giaTienMonDo = monDoDuDinh.price || 0;

            if (giaTienMonDo > nganSachConLai) continue; 

            let keHangGiaSu = [...danhSachTrenKe, monDoDuDinh];
            let buildGiaSu: any = {};
            for(let k = 0; k < keHangGiaSu.length; k++) {
                if(keHangGiaSu[k] && keHangGiaSu[k].category) buildGiaSu[keHangGiaSu[k].category] = keHangGiaSu[k];
            }

            let checkResult = isProductCompatibleWithBuild(monDoDuDinh, buildGiaSu, (key: string) => key);
            
            if (checkResult.compatible === true) {
                doGoiYTuKho.push(monDoDuDinh);
                danhSachTrenKe.push(monDoDuDinh); 
                nganSachConLai = nganSachConLai - giaTienMonDo; 
                break; 
            }
        }
    }
    return { doGoiYTuKho, danhSachTrenKeNganSachMoi: danhSachTrenKe };
}

export async function xuLyTinNhan(tinNhanCuaKhach: string, lichSuChat: any[], keLinhKienHienTai: any) {
    
    const duLieuPhanTich = await phanTich(tinNhanCuaKhach, lichSuChat);
    
    let nhungMonMuonDoi = duLieuPhanTich.nhungMonMuonDoi || [];
    let cacLoaiKhachDoi: string[] = [];
    for (let i = 0; i < nhungMonMuonDoi.length; i++) {
        if (nhungMonMuonDoi[i].loai) cacLoaiKhachDoi.push(nhungMonMuonDoi[i].loai.toLowerCase());
    }

    let { danhSachTrenKe, cacTheLoaiDaCo, tongTienDaTieu } = kiemKeHangCu(keLinhKienHienTai, cacLoaiKhachDoi);

    let nganSachHienTai = duLieuPhanTich.nganSach;
    let danhSachDiCho: any[] = [];
    let nganSachConLai = 0;
    let thieuNganSach = false;

    if (nganSachHienTai == null || nganSachHienTai === 0) {
        thieuNganSach = true; 
    } else {
        nganSachConLai = nganSachHienTai - tongTienDaTieu;
        danhSachDiCho = lenDanhSachDiCho(nhungMonMuonDoi, cacTheLoaiDaCo, cacLoaiKhachDoi);
    }

    let ketQuaDiCho = await diChoVaRapThu(danhSachDiCho, danhSachTrenKe, nganSachConLai, cacLoaiKhachDoi);
    let doGoiYTuKho = ketQuaDiCho.doGoiYTuKho;
    let danhSachTrenKeMoi = ketQuaDiCho.danhSachTrenKeNganSachMoi;

    let tinNhanBot = await messWithUser(tinNhanCuaKhach, lichSuChat, danhSachTrenKeMoi, doGoiYTuKho, thieuNganSach);

    return {
        tinNhanBot: tinNhanBot,
        duLieuGoiY: doGoiYTuKho, 
        hieuLenhUI: duLieuPhanTich 
    };
}
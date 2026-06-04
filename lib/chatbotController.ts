import { GoogleGenerativeAI } from "@google/generative-ai";
import { layTop3LinhKien } from './chatbotModel'; 
import { isProductCompatibleWithBuild } from '@/app/lib/builder-utils';

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const TEN_MODEL_AI = "gemini-2.5-flash";
const MODEL_DU_PHONG = "gemini-2.5-flash-lite"; // Fallback khi model chính hết quota
const TAT_CA_THE_LOAI = ["cpu", "mainboard", "ram", "gpu", "storage", "psu", "case", "cooling"];
type ChatLocale = "vi" | "en";

function formatChatPrice(value: number, locale: ChatLocale) {
    return new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
    }).format(value);
}

function chuanHoaLoaiLinhKien(loai: unknown) {
    const value = String(loai || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    if (!value) return "";
    if (value.includes("cpu") || value.includes("processor")) return "cpu";
    if (value.includes("mainboard") || value.includes("motherboard") || value.includes("bo mach") || value === "main") {
        return "mainboard";
    }
    if (value.includes("ram") || value.includes("memory")) return "ram";
    if (value.includes("gpu") || value.includes("vga") || value.includes("card do hoa")) return "gpu";
    if (value.includes("storage") || value.includes("ssd") || value.includes("hdd") || value.includes("o cung")) {
        return "storage";
    }
    if (value.includes("psu") || value.includes("nguon")) return "psu";
    if (value.includes("case") || value.includes("vo may")) return "case";
    if (value.includes("cool") || value.includes("tan nhiet") || value.includes("fan")) return "cooling";

    return value;
}

// ─── Retry helper: tự chờ và thử lại khi bị 429/503, fallback sang model dự phòng ──
async function generateWithRetry(
    model: any,
    prompt: string,
    maxRetries = 3
): Promise<string> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const res = await model.generateContent(prompt);
            return res.response.text();
        } catch (err: any) {
            const status = err?.status ?? err?.statusCode;
            const is429 = status === 429 || String(err?.message).includes('429');
            const is503 = status === 503 || String(err?.message).includes('503');

            if (is429) {
                // Kiểm tra xem có phải hết quota ngày không
                const violations: string[] = err?.errorDetails
                    ?.find((d: any) => d['@type']?.includes('QuotaFailure'))
                    ?.violations?.map((v: any) => v.quotaId) ?? [];
                const hetQuotaNgay = violations.some(v => v.includes('PerDay'));

                if (hetQuotaNgay) {
                    // Hết quota ngày → thử fallback 1 lần, không retry vô ích
                    if (attempt === 0) {
                        console.log(`[Chatbot] Quota ngày đã hết, thử ${MODEL_DU_PHONG}...`);
                        try {
                            const modelDuPhong = genAI.getGenerativeModel({ model: MODEL_DU_PHONG });
                            const resDp = await modelDuPhong.generateContent(prompt);
                            return resDp.response.text();
                        } catch (dpErr: any) {
                            console.error(`[Chatbot] Fallback ${MODEL_DU_PHONG} cũng lỗi:`, dpErr?.status);
                        }
                    }
                    // Cả 2 model đều hết quota → throw ngay, không retry tốn thời gian
                    throw err;
                }

                // Rate limit tạm thời (per-minute) → retry với backoff ngắn
                if (attempt < maxRetries - 1) {
                    let waitMs = 5000 * (attempt + 1);
                    try {
                        const retryInfo = err?.errorDetails?.find(
                            (d: any) => d['@type']?.includes('RetryInfo')
                        );
                        if (retryInfo?.retryDelay) {
                            const secs = parseFloat(retryInfo.retryDelay.replace('s', ''));
                            // Chỉ chờ tối đa 15 giây, không chờ 59 giây
                            if (!isNaN(secs)) waitMs = Math.min(Math.ceil(secs * 1000) + 500, 15000);
                        }
                    } catch {}
                    console.log(`[Chatbot] Rate limited (per-min). Retry ${attempt + 1}/${maxRetries} sau ${waitMs}ms...`);
                    await new Promise(r => setTimeout(r, waitMs));
                    continue;
                }
            }

            if (is503 && attempt < maxRetries - 1) {
                const waitMs = 4000 * (attempt + 1);
                console.log(`[Chatbot] 503 overload. Retry ${attempt + 1}/${maxRetries} sau ${waitMs}ms...`);
                await new Promise(r => setTimeout(r, waitMs));
                continue;
            }

            throw err;
        }
    }
    throw new Error("Đã thử lại tối đa nhưng vẫn thất bại");
}

// ============================================================
// 1. PHÂN TÍCH TIN NHẮN → JSON
// ============================================================
async function phanTich(tinNhanKhach: string, lichSuChat: any[]) {
    const modelThuKy = genAI.getGenerativeModel({ 
        model: TEN_MODEL_AI, 
        generationConfig: { responseMimeType: "application/json" } 
    });

    let chuoiLichSu = "";
    if (lichSuChat != null) {
        for (let i = 0; i < lichSuChat.length - 1; i++) {
            const nguoiNoi = lichSuChat[i].role === 'user' ? "Khách" : "AI";
            chuoiLichSu += nguoiNoi + ": " + lichSuChat[i].content + "\n";
        }
    }

    const cauLenhPhanTich = `Ban la cong cu boc tach thong tin tu tin nhan. Tra ve DUY NHAT 1 JSON (khong giai thich them):
    {
      "nganSach": <number hoac null>,
      "nhungMonMuonDoi": [ { "loai": "cpu", "tuKhoa": "" } ],
      "yeuCauBuildPC": <true hoac false>,
      "chiHoiTuVan": <true hoac false>
    }

    Quy uoc "loai": cpu, mainboard, ram, gpu, storage, psu, case, cooling.
    Neu khach noi motherboard/main/bo mach chu thi tra ve "mainboard".
    
    PHAN TICH NHU SAU:
    - "nganSach": doc trong [LICH SU CHAT] neu [TIN NHAN MOI] khong co so tien.
    - "nhungMonMuonDoi": khi khach muon doi/nang cap 1 mon cu the.
    - "yeuCauBuildPC" = true: khach muon AI TU DONG CHON LINH KIEN VA BUILD (vd: "build cho toi", "chon giup toi", "lap rap", "tao cau hinh").
    - "chiHoiTuVan" = true: khach chi hoi chung, khong can AI chon linh kien ngay (vd: "CPU nay co tot khong?", "so sanh 2 cai nay", "hen ho gi the").
    
    [LICH SU CHAT]
    ${chuoiLichSu}

    [TIN NHAN MOI]
    ${tinNhanKhach}`;
    
    try {
        const rawText = await generateWithRetry(modelThuKy, cauLenhPhanTich);
        const locnoidung = rawText
            .replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(locnoidung);
    } catch (e) { 
        console.error("Loi Phan Tich:", e);
        return { nganSach: null, nhungMonMuonDoi: [], yeuCauBuildPC: false, chiHoiTuVan: true }; 
    }
}


// ============================================================
// 2. TẠO TIN NHẮN CHO USER
// ============================================================
async function messWithUser(
    tinNhanKhach: string, 
    lichSuChat: any[], 
    danhSachTrenKe: any[], 
    doGoiYTuKho: any[], 
    thieuNganSach: boolean,
    chiHoiTuVan: boolean,
    locale: ChatLocale
) {
    const languageInstruction = locale === "en"
        ? "Reply in English, concise and friendly."
        : "Trả lời bằng tiếng Việt, ngắn gọn, thân thiện.";
    const promptAgent = `Ban la AI tu van PCStore, chuyen build PC va nang cap linh kien.
${languageInstruction}
Chi dua ra nhan xet dua tren [TRANG THAI KE HANG HIEN TAI CUA KHACH] va [HE THONG VUA LAY THEM LINH KIEN MOI].
Khong hoi lai nhung thong tin he thong da cung cap.
Neu cau hinh chua du linh kien vi ngan sach hoac kho hang, noi ro dang thieu mon nao va goi y tang ngan sach.`;

    // Định dạng kệ hàng hiện tại
    const chuoiDangChon = danhSachTrenKe.length > 0
        ? danhSachTrenKe.map(m => `- ${m.name || (locale === "en" ? "Component" : "Linh kiện")}: ${formatChatPrice(m.price || 0, locale)}`).join("\n")
        : (locale === "en" ? "No components selected." : "Chưa có món nào trên kệ.");

    // Định dạng linh kiện đề xuất mới
    const chuoiDeXuat = doGoiYTuKho.length > 0
        ? doGoiYTuKho.map(m => `- ${m.name || (locale === "en" ? "Component" : "Linh kiện")}: ${formatChatPrice(m.price || 0, locale)}`).join("\n")
        : "";

    // Gom lịch sử
    let chuoiLichSu = "";
    for (let i = 0; i < lichSuChat.length - 1; i++) {
        const ng = lichSuChat[i].role === 'user' ? (locale === "en" ? "User" : "Khách") : "AI";
        chuoiLichSu += ng + ": " + lichSuChat[i].content + "\n";
    }

    // Lệnh đặc biệt
    let lenhDacBiet = "";
    if (thieuNganSach && !chiHoiTuVan) {
        lenhDacBiet = `LENH DAC BIET: Khach chua cung cap ngan sach de build PC. Chi in ra DUY NHAT mot cau hoi ngan sach, khong lam gi khac.`;
    } else if (chiHoiTuVan) {
        lenhDacBiet = `LENH DAC BIET: Khach chi dang hoi tu van, KHONG can push linh kien. Tra loi chuyen mon, ngan gon.`;
    }

    const promptGop = `[TRANG THAI KE HANG HIEN TAI CUA KHACH]
${chuoiDangChon}

${chuoiDeXuat ? `[HE THONG VUA LAY THEM LINH KIEN MOI]\n${chuoiDeXuat}\n` : ""}
[LENH TOI CAO - PHAI TUAN THU 100%]
1. TUYET DOI KHONG HOI khach hang dang co linh kien gi (he thong da cung cap danh sach o tren).
2. KHONG SU DUNG MARKDOWN (khong dung **, *, #).
3. ${languageInstruction} Keep the answer to at most 3 lines unless a technical explanation is needed.
${lenhDacBiet}

[LICH SU HOI THOAI]
${chuoiLichSu}

[TIN NHAN MOI CUA KHACH]
${tinNhanKhach}`;

    try {
        const modelChuyenGia = genAI.getGenerativeModel({ 
            model: TEN_MODEL_AI, 
            systemInstruction: promptAgent 
        });
        const cauTraLoi = await generateWithRetry(modelChuyenGia, promptGop);
        if (!cauTraLoi || cauTraLoi.trim() === "") {
            return locale === "en"
                ? "Please review the recommended components."
                : "Dạ, anh/chị xem các linh kiện trên kệ nhé!";
        }
        return cauTraLoi;
    } catch (error: any) { 
        console.error("Loi messWithUser:", error);
        const status = error?.status ?? error?.statusCode;
        if (status === 429) {
            const violations: string[] = error?.errorDetails
                ?.find((d: any) => d['@type']?.includes('QuotaFailure'))
                ?.violations?.map((v: any) => v.quotaId) ?? [];
            const hetQuotaNgay = violations.some((v: string) => v.includes('PerDay'));
            if (hetQuotaNgay) {
                return locale === "en"
                    ? "The AI has reached today's free quota. Please try again tomorrow."
                    : "⚠️ AI đã dùng hết quota miễn phí cho hôm nay. Quota sẽ reset lúc 7h sáng mai (giờ VN). Anh/chị vui lòng thử lại sau nhé!";
            }
            return locale === "en"
                ? "The AI is busy. Please try again in a few seconds."
                : "Dạ, AI đang bận xử lý, anh/chị thử lại sau vài giây nhé! 🙏";
        }
        return locale === "en"
            ? "The system encountered a temporary issue. Please try again."
            : "Dạ, hệ thống gặp sự cố tạm thời, anh/chị thử lại nhé!";
    }
}


// ============================================================
// 3. KIỂM KÊ HÀNG CŨ (loại bỏ món cần đổi)
// ============================================================
function kiemKeHangCu(keLinhKienHienTai: any, cacLoaiKhachDoi: string[]) {
    const danhSachTrenKe: any[] = [];
    const cacTheLoaiDaCo: string[] = [];
    let tongTienDaTieu = 0;

    if (keLinhKienHienTai != null) {
        const mangTam = Object.values(keLinhKienHienTai);
        for (const item of mangTam) {
            if (item == null) continue;
            const monDo = item as any;
            const theLoai = monDo.category ? monDo.category.toLowerCase() : "";
            const biDoi = cacLoaiKhachDoi.includes(theLoai);

            if (!biDoi) {
                danhSachTrenKe.push(monDo);
                tongTienDaTieu += monDo.price || 0;
                if (theLoai) cacTheLoaiDaCo.push(theLoai);
            }
        }
    }
    return { danhSachTrenKe, cacTheLoaiDaCo, tongTienDaTieu };
}


// ============================================================
// 4. LẬP DANH SÁCH CẦN MUA
// ============================================================
function lenDanhSachDiCho(nhungMonMuonDoi: any[], cacTheLoaiDaCo: string[], cacLoaiKhachDoi: string[]) {
    const danhSachDiCho: any[] = [...nhungMonMuonDoi];
    
    for (const loai of TAT_CA_THE_LOAI) {
        const daCo = cacTheLoaiDaCo.includes(loai);
        const biDoi = cacLoaiKhachDoi.includes(loai);
        if (!daCo && !biDoi) {
            danhSachDiCho.push({ loai, tuKhoa: "" });
        }
    }
    return danhSachDiCho;
}


// ============================================================
// 5. ĐI CHỢ & RÁP THỬ TƯƠNG THÍCH
// ============================================================
export async function diChoVaRapThu(
    danhSachDiCho: any[], 
    danhSachTrenKe: any[], 
    nganSachConLai: number, 
    cacLoaiKhachDoi: string[]
) {
    const doGoiYTuKho: any[] = [];
    
    for (const monCanMua of danhSachDiCho) {
        const laNangCap = cacLoaiKhachDoi.includes(monCanMua.loai?.toLowerCase() || "");
        
        const ketQuaTrongKho = await layTop3LinhKien(
            monCanMua.loai, 
            null, 
            monCanMua.tuKhoa, 
            laNangCap ? monCanMua.giaLinhKienHienTai : null
        );

        // Sắp xếp: nâng cấp thì lấy đắt trước, mua mới thì lấy rẻ trước
        ketQuaTrongKho.sort((a, b) => 
            laNangCap ? (b.price || 0) - (a.price || 0) : (a.price || 0) - (b.price || 0)
        );

        for (const monDo of ketQuaTrongKho) {
            const gia = monDo.price || 0;
            if (gia > nganSachConLai) continue;

            // Kiểm tra tương thích
            const keHangGiaSu = [...danhSachTrenKe, monDo];
            const buildGiaSu: any = {};
            for (const item of keHangGiaSu) {
                if (item?.category) buildGiaSu[item.category] = item;
            }

            const checkResult = isProductCompatibleWithBuild(monDo, buildGiaSu, (key: string) => key);
            
            if (checkResult.compatible === true) {
                doGoiYTuKho.push(monDo);
                danhSachTrenKe.push(monDo);
                nganSachConLai -= gia;
                break;
            }
        }
    }
    return { doGoiYTuKho, danhSachTrenKeNganSachMoi: danhSachTrenKe };
}


// ============================================================
// MAIN EXPORT
// ============================================================
export async function xuLyTinNhan(
    tinNhanCuaKhach: string,
    lichSuChat: any[],
    keLinhKienHienTai: any,
    locale: ChatLocale = "vi"
) {
    // Kiểm tra API key trước
    if (!apiKey) {
        return {
            tinNhanBot: locale === "en"
                ? "The chatbot API key has not been configured. Please contact an administrator."
                : "⚠️ Chatbot chưa được cấu hình API Key. Vui lòng liên hệ admin.",
            duLieuGoiY: [],
            hieuLenhUI: null,
            yeuCauBuildPC: false,
            danhSachTrenKeMoi: [],
            chiHoiTuVan: true,
        };
    }

    const duLieuPhanTich = await phanTich(tinNhanCuaKhach, lichSuChat);
    
    const nhungMonMuonDoi = Array.isArray(duLieuPhanTich.nhungMonMuonDoi)
        ? duLieuPhanTich.nhungMonMuonDoi
            .map((m: any) => {
                const loai = chuanHoaLoaiLinhKien(typeof m === "string" ? m : m?.loai);
                return { ...(typeof m === "object" && m != null ? m : {}), loai };
            })
            .filter((m: any) => TAT_CA_THE_LOAI.includes(m.loai))
        : [];
    const cacLoaiKhachDoi: string[] = nhungMonMuonDoi
        .map((m: any) => m.loai?.toLowerCase())
        .filter(Boolean);

    const chiHoiTuVan = duLieuPhanTich.chiHoiTuVan === true;

    const { danhSachTrenKe, cacTheLoaiDaCo, tongTienDaTieu } = kiemKeHangCu(keLinhKienHienTai, cacLoaiKhachDoi);

    const nganSachHienTai = duLieuPhanTich.nganSach;
    const thieuNganSach = (nganSachHienTai == null || nganSachHienTai === 0);

    let doGoiYTuKho: any[] = [];
    let danhSachTrenKeMoi: any[] = [...danhSachTrenKe];

    // Chỉ đi chợ khi: có ngân sách VÀ không phải chỉ hỏi tư vấn
    if (!thieuNganSach && !chiHoiTuVan) {
        const nganSachConLai = nganSachHienTai - tongTienDaTieu;
        const danhSachDiCho = lenDanhSachDiCho(nhungMonMuonDoi, cacTheLoaiDaCo, cacLoaiKhachDoi);
        const ketQuaDiCho = await diChoVaRapThu(danhSachDiCho, danhSachTrenKe, nganSachConLai, cacLoaiKhachDoi);
        doGoiYTuKho = ketQuaDiCho.doGoiYTuKho;
        danhSachTrenKeMoi = ketQuaDiCho.danhSachTrenKeNganSachMoi;
    }

    const tinNhanBot = await messWithUser(
        tinNhanCuaKhach, lichSuChat, danhSachTrenKeMoi, doGoiYTuKho, thieuNganSach, chiHoiTuVan, locale
    );

    return {
        tinNhanBot,
        duLieuGoiY: doGoiYTuKho,
        hieuLenhUI: duLieuPhanTich,
        yeuCauBuildPC: duLieuPhanTich.yeuCauBuildPC === true && !chiHoiTuVan,
        danhSachTrenKeMoi,
        chiHoiTuVan,
    };
}
